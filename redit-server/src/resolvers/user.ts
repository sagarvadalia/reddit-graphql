import { EntityManager } from '@mikro-orm/postgresql';
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
import { MyContext } from 'types';
import { User } from '../entities/User';
import { validateRegister } from '../utils/validateRegister';
import { COOKIE_NAME } from './../constants';
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
  @Mutation(() => Boolean)
  async forgotPassword(@Arg('email') email: string, @Ctx() {}: MyContext) {
    return true;
    // const user = await em.findOne(User, {email})
  }
  // checks if user is stored in session
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext) {
    console.log('session', req.session);
    // not logged in
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }
  // mutation that takes in an options object with username and password keys
  //registers a new user if username length is greater than 2
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }
    // hashes password with argon2
    const hashedPassword = await argon2.hash(options.password);
    // const user = em.create(User, {
    //   username: options.username,
    //   password: hashedPassword,
    // });
    let user;
    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: options.username,
          password: hashedPassword,
          email: options.email,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');
      user = result[0];
      await em.persistAndFlush(user);
      // console.log('failed here?');
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
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(
      User,
      usernameOrEmail.includes('@')
        ? {
            email: usernameOrEmail,
          }
        : { username: usernameOrEmail }
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
