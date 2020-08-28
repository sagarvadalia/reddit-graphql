import React from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Button,
  Box,
} from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import { Formik, Form } from 'formik';
import { Wrapper } from './wrapper';
import { InputField } from './inputField';
import { useMutation } from 'urql';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { createURQLClient } from '../utils/createURQLClient';

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

            <Button
              mt={4}
              isLoading={isSubmitting}
              type="submit"
              variantColor="teal"
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};
export default withUrqlClient(createURQLClient)(Login);
