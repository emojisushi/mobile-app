import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {nh, nw} from '~/common/normalize.helper.ts';
import Spinner from 'react-native-loading-spinner-overlay';

import PasswordInput from '~/Screens/User/components/PasswordInput/PasswordInput.tsx';
import {Header, Input} from '~/components';

import {Controller, useForm, useWatch} from 'react-hook-form';
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';

import {agent} from '~/../APIClient.tsx';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {setToken} from '~/common/token/token';
import {isValidUkrainianPhone} from '~/Screens/Cart/utils';

const validationRequired = 'Заповніть це поле';
const LoginSchema = yup.object({
  phone: yup
    .string()
    .required(validationRequired)
    .test(
      'is possible phone number',
      () => 'Телефон повинен бути у форматі +380xxxxxxxxx',
      isValidUkrainianPhone,
    ),
  password: yup.string().min(8).max(255).required(validationRequired),
});
type FormValues = {
  phone: string;
  password: string;
};
const InitialValue: FormValues = {
  phone: '',
  password: '',
};

const SignInScreen = ({navigation}: {navigation: any}) => {
  const queryClient = useQueryClient();
  const {
    handleSubmit,
    control,
    formState: {errors},
    setError,
  } = useForm({
    defaultValues: InitialValue,
    resolver: yupResolver<FormValues>(
      // @ts-ignore
      LoginSchema,
    ),
  });
  const {mutate: loginMutation, isLoading} = useMutation({
    mutationFn: async (data: FormValues) => {
      const {phone, password} = data;
      return await agent.login({
        phone,
        password,
      });
    },
    onSuccess: async data => {
      queryClient.invalidateQueries(['userData']);
      const {token} = data.data.data;
      await setToken(token);
      navigation.goBack();
    },
    onError: e => {
      if (axios.isAxiosError(e)) {
        let error = e as AxiosError<{
          message: string;
          errors?: Record<string, string[]>;
        }>;
        const code = error.response?.status;
        if (code === 422) {
          setError('password', {
            message: 'Неверное имя пользователя или пароль',
          });
        }
      } else {
        throw new Error(`Unknown error ${e}`);
      }
    },
  });
  const onSubmit = async (data: FormValues) => {
    loginMutation(data);
  };
  return (
    <View style={styles.container}>
      <Spinner
        visible={isLoading}
        textContent={'Зачекайте...'}
        textStyle={{color: 'yellow'}}
        overlayColor="rgba(0, 0, 0, 0.75)"
      />
      <Header
        dropdownVisible={false}
        navigation={navigation}
        showBackButton={true}
      />
      <Text style={styles.header}>Вхід в аккаунт</Text>
      <View>
        {/* <Input placeholder={'Phone'} inputMode={'tel'} /> */}
        <Controller
          name="phone"
          control={control}
          render={({field: {onChange, value}}) => (
            <Input
              placeholder="Телефон"
              inputMode="tel"
              value={value}
              onChangeText={v => onChange(v)}
              error={errors.phone?.message}
            />
          )}
        />
        <View style={styles.password}>
          {/* <PasswordInput placeholder='Пароль' value='' /> */}
          <Controller
            name="password"
            control={control}
            render={({field: {onChange, value}}) => (
              <PasswordInput
                placeholder="Пароль"
                value={value}
                onChangeText={v => onChange(v)}
                error={errors.password?.message}
              />
            )}
          />
        </View>
      </View>
      <View style={styles.textRight}>
        <Text
          onPress={() => navigation.replace('SignInWithPhone')}
          style={styles.forgotPass}>
          Вхід через СМС
        </Text>
      </View>

      <TouchableOpacity
        style={styles.signInBtn}
        onPress={handleSubmit(
          // @ts-ignore
          onSubmit,
        )}>
        <Text style={styles.btnText}>Вхід</Text>
      </TouchableOpacity>
      <View style={styles.textRight}>
        <Text style={styles.yellowText}>
          Не маєте аккаунту?{' '}
          <Text
            style={styles.forgotPass}
            onPress={() => navigation.navigate('SignUp')}>
            Реєстрація
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#141414',
    display: 'flex',
    alignItems: 'center',
  },
  header: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(20),
    lineHeight: 24,
    fontWeight: '600',
    color: 'white',
    marginTop: nh(30),
    marginBottom: nw(30),
  },
  password: {
    marginTop: nh(15),
  },
  forgotPass: {
    fontSize: nh(12),
    fontWeight: '400',
    lineHeight: 14,
    fontFamily: 'MontserratRegular',
    color: 'yellow',
    textDecorationLine: 'underline',
  },
  textRight: {
    display: 'flex',
    alignItems: 'flex-end',
    width: nw(365),
    marginTop: nh(10),
  },
  signInBtn: {
    width: nw(365),
    height: nh(47),
    backgroundColor: '#FFE600',
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: nh(15),
  },
  btnText: {
    color: 'black',
    fontFamily: 'MontserratRegular',
    fontSize: nh(15),
    fontWeight: '500',
  },
  yellowText: {
    fontSize: nh(12),
    fontWeight: '400',
    lineHeight: 14,
    fontFamily: 'MontserratRegular',
    color: 'yellow',
  },
});

export default SignInScreen;
