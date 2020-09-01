import argon2 from 'argon2';
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { MyContext } from 'types';
import { v4 } from 'uuid';
import { User } from '../entities/User';
import { validateRegister } from '../utils/validateRegister';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from './../constants';
import { sendEmail } from './../utils/sendEmail';
import { UsernamePasswordInput } from './UsernamePasswordInput';

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}
@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'length must be at least 3 characters',
          },
        ],
      };
    }
    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return { errors: [{ field: 'token', message: 'token is not valid' }] };
    }
    const userIdNum = parseInt(userId);
    const user = await User.findOne(userIdNum);
    if (!user) {
      return { errors: [{ field: 'token', message: 'user no longer exists' }] };
    }

    await User.update(
      { id: userIdNum },
      { password: await argon2.hash(newPassword) }
    );

    await redis.del(key);
    //log in user after updated password
    req.session.userId = user.id;
    return { user };
  }
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext
  ) {
    //find a user with inputted email
    const user = await User.findOne({ where: { email } });
    //creates a unique random token

    if (!user) {
      //email not in db
      return true;
    } else {
      const token = v4();
      // set a token in redis valid for three days
      await redis.set(
        FORGET_PASSWORD_PREFIX + token,
        user.id,
        'ex',
        1000 * 60 * 60 * 24 * 3
      );
      sendEmail(
        email,
        `<a href = "http://localhost:3000/change-password/${token}">Reset Password</a>`
      );
      return true;
    }
  }
  // checks if user is stored in session
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    // console.log('session', req.session);
    // not logged in
    if (!req.session.userId) {
      return null;
    }

    return User.findOne(req.session.userId);
  }
  // mutation that takes in an options object with username and password keys
  //registers a new user if username length is greater than 2
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);

    if (errors) {
      return { errors };
    }
    // hashes password with argon2
    const hashedPassword = await argon2.hash(options.password);

    let user;
    try {
      // User.create({}).save() == code below (done for learning querybuilder)
      const results = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          email: options.email,
          password: hashedPassword,
        })
        .returning('*')
        .execute();

      user = results.raw[0];
    } catch (error) {
      if (error?.code === '23505') {
        //duplicate username errors
        return {
          errors: [{ field: 'username', message: 'username already exists' }],
        };
      }
      console.error(error.message);
    }
    // stores user in session cookies

    req.session.userId = user.id;
    return { user };
  }
  //takes in an object for the options arg with a username and password key value pair
  //checks if user is in db
  //if so logs in user
  //if failed returns a Field Error
  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes('@')
        ? {
            where: { email: usernameOrEmail },
          }
        : { where: { username: usernameOrEmail } }
    );
    if (!user) {
      return {
        errors: [
          {
            field: 'usernameOrEmail',
            message: 'that user does not exist',
          },
        ],
      };
    }
    // validates user
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'invalid password',
          },
        ],
      };
    }
    // stores user in session cookies
    req.session.userId = user.id;
    return { user };
  }
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
