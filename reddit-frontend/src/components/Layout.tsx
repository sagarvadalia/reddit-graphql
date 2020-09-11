import React from 'react';
import { Wrapper } from './wrapper';
import { Navbar } from './Navbar';

interface LayoutProps {
  variant?: 'small' | 'regular';
}

const Layout: React.FC<LayoutProps> = ({ variant }) => {
  return (
    <Wrapper variant={variant}>
      <Navbar />
    </Wrapper>
  );
};
export default Layout;
