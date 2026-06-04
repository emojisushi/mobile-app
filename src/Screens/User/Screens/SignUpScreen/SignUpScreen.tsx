import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {nh, nw} from '~/common/normalize.helper.ts';
import PasswordInput from '~/Screens/User/components/PasswordInput/PasswordInput.tsx';

import {Header, Input, CheckBox} from '~/components';

import {Controller, useForm} from 'react-hook-form';
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';
import axios, {AxiosError} from 'axios';

import {agent} from '~/../APIClient.tsx';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import Spinner from 'react-native-loading-spinner-overlay/lib';
import {setToken} from '~/common/token/token';
import {isValidUkrainianPhone} from '~/Screens/Cart/utils';
import {PhoneVerification} from '~/components/PhoneVerification/PhoneVerification.tsx';
import store from '~/stores/store';

const validationRequired = 'Заповніть це поле';
const RegisterSchema = yup.object({
  //   name: yup.string().min(2).required(validationRequired),
  //   surname: yup.string().min(2).required(validationRequired),
  phone: yup
    .string()
    .required(validationRequired)
    .test(
      'is possible phone number',
      () => 'Телефон повинен бути у форматі +380xxxxxxxxx',
      isValidUkrainianPhone,
    ),
  password: yup.string().min(8).max(255).required(validationRequired),
  agree: yup.boolean().isTrue(validationRequired),
});
type FormValues = {
  name: string;
  surname: string;
  phone: string;
  password: string;
  agree: boolean;
};
const InitialValue: FormValues = {
  name: '',
  surname: '',
  phone: '',
  password: '',
  agree: false,
};

const SignUpScreen = ({navigation}: {navigation: any}) => {
  const {
    handleSubmit,
    control,
    watch,
    trigger,
    formState: {errors},
    setError,
  } = useForm({
    defaultValues: InitialValue,
    resolver: yupResolver<FormValues>(
      // @ts-ignore
      RegisterSchema,
    ),
  });
  const queryClient = useQueryClient();
  const [phoneConfirmed, setPhoneConfirmed] = useState(false);

  const {mutate: registerMutation, isLoading} = useMutation({
    mutationFn: async (data: FormValues) => {
      const {phone, password, name, surname, agree} = data;
      return await agent.register({
        phone,
        password,
        password_confirmation: password,
        name,
        surname,
        activate: true,
        auto_login: true,
        agree,
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
        const fieldErrors = error.response?.data.errors;
        if (fieldErrors) {
          Object.keys(fieldErrors).forEach(key => {
            if (key === 'phone') {
              setError('phone', {
                message: fieldErrors[key][0],
              });
            }
          });
        }
      } else {
        throw new Error(`Unknown error ${e}`);
      }
    },
  });
  const onSubmit = async (data: FormValues) => {
    if (!phoneConfirmed) {
      setError('phone', {
        message: 'Підтвердіть номер телефону',
      });
      return;
    }
    registerMutation(data);
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
      <Text style={styles.header}>Реєстрація</Text>
      <View>
        {/* <View style={styles.inputMargin}>
          <Controller
            name="name"
            control={control}
            render={({field: {onChange, value}}) => (
              <Input
                placeholder="Ім'я"
                inputMode="text"
                value={value}
                onChangeText={v => onChange(v)}
                error={errors.name?.message}
              />
            )}
          />
          {/* <Input placeholder={'Имя'} inputMode={'text'} />
        </View> */}
        {/* <View style={styles.inputMargin}>
          <Controller
            name="surname"
            control={control}
            render={({field: {onChange, value}}) => (
              <Input
                placeholder="Прізвище"
                inputMode="text"
                value={value}
                onChangeText={v => onChange(v)}
                error={errors.surname?.message}
              />
            )}
          />
          {/* <Input placeholder={'Фамилия'} inputMode={'text'} />
        </View> */}
        <View style={styles.inputMargin}>
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
          {/* <Input placeholder={'Email'} inputMode={'email'} /> */}
        </View>
        <View style={styles.inputMargin}>
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
          {/* <PasswordInput /> */}
        </View>
        <View style={styles.inputMargin}>
          <PhoneVerification
            control={control}
            phone={watch('phone')}
            city_slug={store.city}
            enabled={true}
            trigger={trigger}
            onPhoneConfirmedChange={setPhoneConfirmed}
            checkboxEnabled={false}
            error={errors.phone?.message}
          />
        </View>
        <Controller
          name="agree"
          control={control}
          render={({field: {onChange, value}}) => (
            <View style={styles.agreementWrapper}>
              <CheckBox active={value} onChange={onChange} />
              <Text style={styles.agreementText}>
                Я погоджуюся з умовами використання та обробки моїх персональних
                даних
              </Text>
              {errors.agree?.message && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errors.agree?.message}</Text>
                </View>
              )}
            </View>
          )}
        />
        {/* <CheckBox /> */}

        <TouchableOpacity style={styles.btn} onPress={handleSubmit(onSubmit)}>
          <Text style={styles.btnText}>Реєстрація</Text>
        </TouchableOpacity>
        <View style={styles.textWrapper}>
          <Text style={styles.yellowText}>
            У вас вже є аккаунт?
            <Text
              onPress={() => navigation.navigate('SignIn')}
              style={styles.link}>
              Увійти
            </Text>
          </Text>
        </View>
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
    color: 'white',
    fontFamily: 'MontserratRegular',
    fontSize: nh(20),
    lineHeight: 24,
    fontWeight: '600',
    marginTop: nh(30),
    marginBottom: nh(30),
  },
  inputMargin: {
    marginBottom: nh(15),
  },
  check: {
    width: nw(50),
  },
  btn: {
    width: nw(365),
    height: nh(47),
    borderRadius: 10,
    backgroundColor: '#FFE600',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: nh(20),
  },
  btnText: {
    fontFamily: 'MontserratRegular',
    fontWeight: '500',
    fontSize: nh(15),
    color: 'black',
  },
  yellowText: {
    fontFamily: 'MontserratRegular',
    fontWeight: '400',
    fontSize: nh(12),
    color: '#FFE600',
  },
  link: {
    textDecorationLine: 'underline',
  },
  textWrapper: {
    display: 'flex',
    alignItems: 'flex-end',
    marginTop: nh(10),
  },
  agreementText: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(11),
    fontWeight: '400',
    color: 'white',
    width: nw(266),
    height: nh(30),
    marginLeft: nw(10),
  },
  agreementWrapper: {
    display: 'flex',
    flexDirection: 'row',
  },
  errorContainer: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    backgroundColor: 'rgb(205, 56, 56)',
    position: 'absolute',
    right: 0,
    top: 20,
  },
  errorText: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(12),
    color: 'white',
    fontWeight: '500',
  },
});

export default SignUpScreen;
