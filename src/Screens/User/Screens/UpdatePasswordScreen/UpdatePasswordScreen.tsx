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
const UpdatePasswordSchema = yup.object({
  password_old: yup.string().min(8).required(validationRequired),
  password: yup.string().min(8).required(validationRequired),
  password_confirmation: yup.string().min(8).required(validationRequired),
});
type FormValues = {
  password_old: string;
  password: string;
  password_confirmation: string;
};
const InitialValue: FormValues = {
  password_old: '',
  password: '',
  password_confirmation: '',
};
const UpdatePasswordScreen = ({navigation}: {navigation: any}) => {
  const [isSent, setIsSent] = useState(false);
  const {mutate: updatePasswordMutation, isLoading} = useMutation({
    mutationFn: async (data: FormValues) => {
      const {password_old, password, password_confirmation} = data;
      return await agent.updateUserPassword({
        password_old,
        password,
        password_confirmation,
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
          errors?: Record<string, string>;
        }>;
        const fieldErrors = error.response?.data.errors;
        if (fieldErrors) {
          Object.keys(fieldErrors).forEach(key => {
            setError(key as keyof FormValues, {
              message: fieldErrors[key],
            });
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
    resolver: yupResolver<FormValues>(UpdatePasswordSchema),
  });
  const onSubmit = (data: FormValues) => {
    updatePasswordMutation(data);
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
      <Text style={styles.header}>Змінити пароль</Text>
      <View style={styles.inputTextWrapper}>
        <Controller
          name="password_old"
          control={control}
          render={({field: {onChange, value}}) => (
            <Input
              placeholder="Старий пароль"
              inputMode="text"
              value={value}
              onChangeText={v => onChange(v)}
              error={errors.password_old?.message}
            />
          )}
        />
      </View>
      <View style={styles.inputTextWrapper}>
        <Controller
          name="password"
          control={control}
          render={({field: {onChange, value}}) => (
            <Input
              placeholder="Новий пароль"
              inputMode="text"
              value={value}
              onChangeText={v => onChange(v)}
              error={errors.password?.message}
            />
          )}
        />
      </View>
      <View style={styles.inputTextWrapper}>
        <Controller
          name="password_confirmation"
          control={control}
          render={({field: {onChange, value}}) => (
            <Input
              placeholder="Підтвердження пароля"
              inputMode="text"
              value={value}
              onChangeText={v => onChange(v)}
              error={errors.password_confirmation?.message}
            />
          )}
        />
      </View>

      {!isSent && (
        <>
          <TouchableOpacity style={styles.btn} onPress={handleSubmit(onSubmit)}>
            <Text style={styles.btnText}>Змінити пароль</Text>
          </TouchableOpacity>
        </>
      )}
      {isSent && (
        <Text style={styles.greenText}>
            Пароль було змінено
        </Text>
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
  greenText: {
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

export default UpdatePasswordScreen;
