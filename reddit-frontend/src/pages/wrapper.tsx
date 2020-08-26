import React from 'react';
import { Box } from '@chakra-ui/core';

interface wrapperProps {
  variant?: 'small' | 'regular';
}

export const Wrapper: React.FC<wrapperProps> = ({ children, variant }) => {
  return (
    <Box
      mt={8}
      maxW={variant === 'regular' ? '800px' : '400px'}
      w="100%"
      mx="auto"
    >
      {children}
    </Box>
  );
};
