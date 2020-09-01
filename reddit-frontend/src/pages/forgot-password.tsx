import React, { useState } from 'react';
import { Wrapper } from './wrapper';
import { Formik, Form } from 'formik';
import { Login } from './login';
import { toErrorMap } from '../utils/toErrorMap';
import { InputField } from './inputField';
import { Box, Flex, Button, Link } from '@chakra-ui/core';
import NextLink from 'next/link';
import { withUrqlClient } from 'next-urql';
import { createURQLClient } from '../utils/createURQLClient';
import { useForgotPasswordMutation } from '../generated/graphql';

const ForgotPassword: React.FC<{}> = ({}) => {
  const [, forgotPassword] = useForgotPasswordMutation();
  const [complete, setComplete] = useState(false);
  return (
    <Wrapper>
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values) => {
          await forgotPassword(values);
          setComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>We sent an email to the inputted email address</Box>
          ) : (
            <Form>
              <InputField
                name="email"
                placeholder="email"
                label="Enter Email Address Here"
                type="email"
              ></InputField>

              <Flex>
                <Button
                  mt={4}
                  mr={8}
                  isLoading={isSubmitting}
                  type="submit"
                  variantColor="teal"
                >
                  Forgot Password
                </Button>
              </Flex>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};
export default withUrqlClient(createURQLClient)(ForgotPassword);
