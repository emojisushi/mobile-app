import {yupResolver} from '@hookform/resolvers/yup';
import React, {useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {nh, nw} from '~/common/normalize.helper.ts';
import * as yup from 'yup';

import {Header, Input} from '~/components';
import {useMutation} from '@tanstack/react-query';
import {agent} from '~/../APIClient';
import axios, {AxiosError} from 'axios';
import Spinner from 'react-native-loading-spinner-overlay/lib';

const validationRequired = 'Заповніть це поле';
const ResetSchema = yup.object({
  email: yup.string().email().min(6).max(255).required(validationRequired),
});
type FormValues = {
  email: string;
};
const InitialValue: FormValues = {
  email: '',
};
const ResetPasswordScreen = ({navigation}: {navigation: any}) => {
  const [isSent, setIsSent] = useState(false);
  const {mutate: resetMutation, isLoading} = useMutation({
    mutationFn: async (data: FormValues) => {
      const {email} = data;
      return await agent.restorePassword({
        email: email,
        redirect_url: '',
      });
    },
    onSuccess: () => {
      setIsSent(true);
    },
    onError: e => {
      setIsSent(false);
      if (axios.isAxiosError(e)) {
        let error = e as AxiosError<{
          message: string;
          errors?: Record<string, string[]>;
        }>;
        const fieldErrors = error.response?.data.message;
        if (fieldErrors) {
          setError('email', {
            message: fieldErrors,
          });
        }
      } else {
        throw new Error(`Unknown error ${e}`);
      }
    },
  });
  const {
    handleSubmit,
    control,
    formState: {errors},
    setError,
  } = useForm({
    defaultValues: InitialValue,
    resolver: yupResolver<FormValues>(ResetSchema),
  });
  const onSubmit = (data: FormValues) => {
    resetMutation(data);
  };
  return (
    <View style={styles.container}>
      <Spinner
        visible={isLoading}
        textContent={'Зачекайте...'}
        textStyle={{color: 'yellow'}}
        overlayColor="rgba(0, 0, 0, 0.75)"
      />
      <Header dropdownVisible={false} navigation={navigation} showBackButton={true} />
      <Text style={styles.header}>Відновлення пароля</Text>
      <View style={styles.inputTextWrapper}>
        <Controller
          name="email"
          control={control}
          render={({field: {onChange, value}}) => (
            <Input
              placeholder="Email"
              inputMode="text"
              value={value}
              onChangeText={v => onChange(v)}
              error={errors.email?.message}
            />
          )}
        />
      </View>
      {isSent && (
        <Text style={styles.checkEmailText}>
          Будь ласка перевірте Вашу пошту. Ми надіслали Вам лист, що містить
          посилання для відновлення пароля
        </Text>
      )}

      {!isSent && (
        <>
          <Text style={styles.emailText}>
            Введіть Ваш E-mail для якого необхідно скинути пароль
          </Text>
          <TouchableOpacity style={styles.btn} onPress={handleSubmit(onSubmit)}>
            <Text style={styles.btnText}>Відправити</Text>
          </TouchableOpacity>
        </>
      )}
      {isSent && (
        <TouchableOpacity
          style={styles.textWrapper}
          onPress={handleSubmit(onSubmit)}>
          <Text style={styles.yellowText}>
            Не прийшов код? <Text style={styles.link}>Відправити ще</Text>
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#141414',
    alignItems: 'center',
  },
  header: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(20),
    lineHeight: 24,
    color: 'white',
    marginTop: nh(30),
    marginBottom: nh(30),
  },
  inputTextWrapper: {
    marginBottom: nh(15),
    width: '100%',
    paddingHorizontal: nw(12),
  },
  emailText: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(12),
    lineHeight: 14,
    fontWeight: '400',
    color: 'white',
    marginTop: nh(10),
    marginBottom: nh(20),
    width: nw(365),
  },
  checkEmailText: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(12),
    lineHeight: 14,
    fontWeight: '400',
    color: 'green',
    width: nw(365),
  },
  btn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: nw(365),
    height: nh(47),
    borderRadius: 10,
    backgroundColor: '#FFE600',
  },
  btnText: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(15),
    lineHeight: 18,
    fontWeight: '500',
    color: 'black',
  },
  yellowText: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(12),
    lineHeight: 14,
    fontWeight: '400',
    color: '#FFE600',
  },
  link: {
    textDecorationLine: 'underline',
  },
  textWrapper: {
    display: 'flex',
    alignItems: 'flex-end',
    marginTop: nh(10),
    width: nw(365),
  },
});

export default ResetPasswordScreen;
