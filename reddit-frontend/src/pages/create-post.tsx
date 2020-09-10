import { Box, Button, Flex } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import React from 'react';
import { toErrorMap } from '../utils/toErrorMap';
import { InputField } from './inputField';
import { Login } from './login';
import { Wrapper } from './wrapper';
import { useRouter } from 'next/router';
import { useCreatePostMutation } from '../generated/graphql';
import { createURQLClient } from '../utils/createURQLClient';
import { withUrqlClient } from 'next-urql';

const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [, createPost] = useCreatePostMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ title: '', text: '' }}
        onSubmit={async (values) => {
          await createPost({ input: values });
          router.push('/');
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="title"
              placeholder="title"
              label="title"
            ></InputField>
            <Box mt={4}>
              <InputField
                textArea
                name="text"
                placeholder="text..."
                label="Body"
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
                Create Post
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};
export default withUrqlClient(createURQLClient)(CreatePost);
