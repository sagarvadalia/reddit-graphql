import { MikroORM } from '@mikro-orm/core';
import { __prod__, COOKIE_NAME } from './constants';
// import { Post } from './entities/post';
import 'reflect-metadata';
import mikroOrmConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
// import { MyContext } from 'types';
import cors from 'cors';
const RedisStore = connectRedis(session);
const redisClient = redis.createClient();

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  orm.getMigrator().up(); //migrates whenever there are diffs between migrations
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
        client: redisClient,
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
    context: ({ req, res }) => ({ em: orm.em, req, res }), //passes this context to all resolvers
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
