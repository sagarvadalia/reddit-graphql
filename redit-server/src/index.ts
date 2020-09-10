import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
// import { MyContext } from 'types';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
// import { Post } from './entities/post';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { COOKIE_NAME, __prod__ } from './constants';
import { Post } from './entities/Post';
import { User } from './entities/User';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';

const main = async () => {
  const conn = await createConnection({
    type: 'postgres',
    database: 'redditDb',

    logging: true,
    synchronize: true,
    entities: [Post, User],
  });
  // await Post.delete({});
  // await User.delete({});
  const RedisStore = connectRedis(session);
  const redis = new Redis();

  const app = express();
  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true, //
    })
  );
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true, //reduces pings to redis
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true, //cannot view on console
        secure: __prod__, //only works in https
        sameSite: 'lax', //csrf,
      },
      secret: 'hiddenKey',
      saveUninitialized: false,
      resave: false,
    })
  );
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res, redis }), //passes this context to all resolvers
  });
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });
  //listens on port 4000
  app.listen(4000, () => {
    console.log('server started on 4000');
  });
};
main().catch((err) => {
  console.error(err);
});
