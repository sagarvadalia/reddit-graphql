import React, { useState } from 'react';
import { NextPage } from 'next';
import { Wrapper } from '../../components/wrapper';
import { Formik, Form } from 'formik';
import { Login } from '../login';
import { toErrorMap } from '../../utils/toErrorMap';
import { InputField } from '../../components/inputField';
import { Box, Button, Link, Flex } from '@chakra-ui/core';
import { useChangePasswordMutation } from '../../generated/graphql';
import { useRouter } from 'next/router';
import { createURQLClient } from '../../utils/createURQLClient';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState('');
  return (
    <div>
      <Wrapper>
        <Formik
          initialValues={{ newPassword: '' }}
          onSubmit={async (values, { setErrors }) => {
            const response = await changePassword({
              newPassword: values.newPassword,
              token,
            });

            if (response.data?.changePassword.errors) {
              const errorMap = toErrorMap(response.data.changePassword.errors);
              if ('token' in errorMap) {
                setTokenError(errorMap.token);
              }
              setErrors(errorMap);
            } else if (response.data?.changePassword.user) {
              router.push('/');
            }
            return response;
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <InputField
                name="newPassword"
                placeholder="New Password"
                label="New Password"
                type="password"
              ></InputField>
              {tokenError ? (
                <Flex>
                  <Box mr={4} style={{ color: 'red' }}>
                    {tokenError}
                  </Box>
                  <NextLink href="/forgot-password">
                    <Link>
                      <Button mt={4} type="submit" variantColor="blue">
                        Request new Token
                      </Button>
                    </Link>
                  </NextLink>
                </Flex>
              ) : null}

              <Button
                mt={4}
                isLoading={isSubmitting}
                type="submit"
                variantColor="teal"
              >
                Change Password
              </Button>
            </Form>
          )}
        </Formik>
      </Wrapper>
      token is {token}
    </div>
  );
};
ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default withUrqlClient(createURQLClient, { ssr: false })(ChangePassword);
