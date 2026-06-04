import React, {useEffect} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {Controller, useForm} from 'react-hook-form';
import Spinner from 'react-native-loading-spinner-overlay/lib';
import {agent} from '~/../APIClient';
import {nh, nw} from '~/common/normalize.helper.ts';
import * as yup from 'yup';
import {Header, Input} from '~/components';
import {yupResolver} from '@hookform/resolvers/yup';
import axios, {AxiosError} from 'axios';

// const validationRequired = 'Заповніть це поле';
const UserInfoSchema = yup.object({
  name: yup.string().nullable(),
  surname: yup.string().nullable(),
  email: yup.string().email().nullable(),
  phone: yup.string().min(6),
});

type FormValues = {
  name: string;
  surname: string;
  email: string;
  phone: string;
};

const InitialValue: FormValues = {
  name: '',
  surname: '',
  email: '',
  phone: '',
};

const ProfileScreen = ({navigation}: {navigation: any}) => {
  const queryClient = useQueryClient();

  const {
    handleSubmit,
    control,
    formState: {errors},
    setValue,
    setError,
  } = useForm({
    defaultValues: InitialValue,
    resolver: yupResolver<FormValues>(
      // @ts-ignore
      UserInfoSchema,
    ),
  });

  const {data: user, isLoading} = useQuery({
    queryKey: ['userData'],
    queryFn: async () => (await agent.fetchUser()).data,
  });

  const {mutate: updateUser, isLoading: isSaving} = useMutation({
    mutationFn: (data: FormValues) => agent.updateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['userData']);
    },
    onError: e => {
      if (axios.isAxiosError(e)) {
        const error = e as AxiosError<{
          message: string;
          errors?: Record<string, string[]>;
        }>;
        const fieldErrors = error.response?.data.errors;
        if (fieldErrors) {
          Object.keys(fieldErrors).forEach(key => {
            if (key === 'phone') {
              setError('phone', {message: fieldErrors[key][0]});
            }
          });
        }
      } else {
        throw new Error(`Unknown error ${e}`);
      }
    },
  });

  useEffect(() => {
    setValue('name', user?.name ?? '');
    setValue('surname', user?.surname ?? '');
    setValue('email', user?.email ?? '');
    setValue('phone', user?.phone ?? '');
  }, [setValue, user]);

  const onSubmit = (data: FormValues) => updateUser(data);

  return (
    <View style={styles.container}>
      <Spinner
        visible={isLoading || isSaving}
        textContent={'Зачекайте...'}
        textStyle={{color: 'yellow'}}
        overlayColor="rgba(0, 0, 0, 0.75)"
      />
      <Header
        dropdownVisible={false}
        navigation={navigation}
        showBackButton={true}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Профіль</Text>
        <View style={styles.inputsWrapper}>
          <View style={styles.inputTextWrapper}>
            <Text style={styles.inputLabel}>Ім'я</Text>
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
          </View>
          <View style={styles.inputTextWrapper}>
            <Text style={styles.inputLabel}>Прізвище</Text>
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
          </View>
          <View style={styles.inputTextWrapper}>
            <Text style={styles.inputLabel}>Email</Text>
            <Controller
              name="email"
              control={control}
              render={({field: {onChange, value}}) => (
                <Input
                  placeholder="Email"
                  inputMode="text"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                  editable
                />
              )}
            />
          </View>
          <View style={styles.inputTextWrapper}>
            <Text style={styles.inputLabel}>Телефон</Text>
            <Controller
              name="phone"
              control={control}
              render={({field: {onChange, value}}) => (
                <Input
                  editable={false}
                  placeholder="Телефон"
                  inputMode="tel"
                  value={value}
                  onChangeText={onChange}
                  error={errors.phone?.message}
                />
              )}
            />
          </View>
          {/* <TouchableOpacity
            style={styles.btnChangePass}
            onPress={() => navigation.navigate('UpdatePassword')}>
            <Text style={styles.changePassText}>Змінити пароль</Text>
          </TouchableOpacity> */}
        </View>
        <View style={styles.spacer} />
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSubmit(onSubmit)}>
          <Text style={styles.btnText}>Зберегти</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: nh(100),
  },
  header: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(20),
    lineHeight: 24,
    fontWeight: '600',
    color: 'white',
    marginTop: nh(30),
    marginBottom: nh(15),
    textAlign: 'center',
  },
  inputsWrapper: {
    alignItems: 'center',
    width: nw(365),
  },
  inputTextWrapper: {
    marginBottom: nh(15),
    width: '100%',
  },
  inputLabel: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(14),
    fontWeight: '400',
    lineHeight: 17,
    color: '#616161',
    marginBottom: nh(7),
  },
  btnChangePass: {
    width: nw(365),
    height: nh(44),
    borderRadius: 10,
    backgroundColor: '#FFE60099',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePassText: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(14),
    fontWeight: '500',
    color: 'black',
  },
  footer: {
    backgroundColor: '#171717',
    width: '100%',
    height: nh(80),
    position: 'absolute',
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
    width: nw(345),
    height: nh(44),
    backgroundColor: '#FFE600',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(14),
    lineHeight: 17,
    fontWeight: '500',
    color: 'black',
  },
  spacer: {
    height: nh(80),
  },
});

export default ProfileScreen;
