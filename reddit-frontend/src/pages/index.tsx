import { withUrqlClient } from 'next-urql';
import { Navbar } from '../components/Navbar';
import { createURQLClient } from '../utils/createURQLClient';
import { usePostsQuery } from '../generated/graphql';

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <>
      <Navbar />
      <div>Hello World</div>
      <br />
      {!data ? null : data.posts.map((p) => <div key={p.id}>{p.title}</div>)}
    </>
  );
};

export default withUrqlClient(createURQLClient, { ssr: true })(Index);
