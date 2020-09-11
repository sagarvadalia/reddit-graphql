import React from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Button,
  Box,
  Flex,
  Link,
} from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import { Formik, Form } from 'formik';
import { Wrapper } from '../components/wrapper';
import { InputField } from '../components/inputField';
import { useMutation } from 'urql';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { createURQLClient } from '../utils/createURQLClient';
import NextLink from 'next/link';

export const Login: React.FC<{}> = ({}) => {
  const [, Login] = useLoginMutation();
  const router = useRouter();
  return (
    <Wrapper>
      <Formik
        initialValues={{ usernameOrEmail: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          // console.log(register(values));
          const response = await Login(values);
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            router.push('/');
          }
          return response;
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="usernameOrEmail"
              placeholder="usernameOrEmail"
              label="UsernameOrEmail"
            ></InputField>
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>

            <Flex>
              <Button
                mt={4}
                mr={8}
                isLoading={isSubmitting}
                type="submit"
                variantColor="teal"
              >
                Login
              </Button>
              <NextLink href="/forgot-password">
                <Link>
                  <Button mt={4} type="submit" variantColor="blue">
                    Forgot Password
                  </Button>
                </Link>
              </NextLink>
            </Flex>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};
export default withUrqlClient(createURQLClient)(Login);
