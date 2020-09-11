import React from 'react';
import { Wrapper, WrapperVariant } from './wrapper';
import { Navbar } from './Navbar';

interface LayoutProps {
  variant?: WrapperVariant;
}

const Layout: React.FC<LayoutProps> = ({ children, variant }) => {
  return (
    <>
      <Navbar />
      <Wrapper variant={variant}>{children}</Wrapper>{' '}
    </>
  );
};
export default Layout;
