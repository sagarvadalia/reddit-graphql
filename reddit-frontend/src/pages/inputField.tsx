import React, { InputHTMLAttributes } from 'react';
import { useField } from 'formik';
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Textarea,
} from '@chakra-ui/core';

type inputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;

  name: string;
  textArea?: boolean;
};

export const InputField: React.FC<inputFieldProps> = ({
  label,
  textArea,
  size: _,
  ...props
}) => {
  let InputOrTextArea = Input;
  if (textArea) {
    InputOrTextArea = Textarea;
  }

  const [field, { error }] = useField(props);
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <InputOrTextArea
        {...field}
        {...props}
        id={field.name}
        placeholder={props.placeholder}
      />
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};
