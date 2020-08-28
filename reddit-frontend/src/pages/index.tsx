import { withUrqlClient } from 'next-urql';
import { Navbar } from '../components/Navbar';
import { createURQLClient } from '../utils/createURQLClient';

const Index = () => (
  <>
    <Navbar />
    <div>Hello World</div>{' '}
  </>
);

export default withUrqlClient(createURQLClient)(Index);
