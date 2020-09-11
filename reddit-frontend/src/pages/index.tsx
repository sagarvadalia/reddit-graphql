import { withUrqlClient } from 'next-urql';
import { Navbar } from '../components/Navbar';
import { createURQLClient } from '../utils/createURQLClient';
import { usePostsQuery } from '../generated/graphql';
import Layout from '../components/Layout';
import { Link } from '@chakra-ui/core';
import NextLink from 'next/link';

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <Layout>
      <NextLink href="/create-post">
        <Link>Create Post</Link>
      </NextLink>

      <br />
      {!data ? (
        <div>loading...</div>
      ) : (
        data.posts.map((p) => <div key={p.id}>{p.title}</div>)
      )}
    </Layout>
  );
};

export default withUrqlClient(createURQLClient, { ssr: true })(Index);
