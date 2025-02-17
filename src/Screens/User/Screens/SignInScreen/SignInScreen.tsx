import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {nh, nw} from '~/common/normalize.helper.ts';

import PasswordInput from '~/Screens/User/components/PasswordInput/PasswordInput.tsx';
import {Header, Input} from '~/components';

const SignInScreen = ({navigation}: {navigation: any}) => {
  return (
    <View style={styles.container}>
      {/*<Header />*/}
      {/*<Text style={styles.header}>Вход в аккаунт</Text>*/}
      {/*<View>*/}
      {/*  <Input placeholder={'Email'} inputMode={'email'} />*/}
      {/*  <View style={styles.password}>*/}
      {/*    <PasswordInput />*/}
      {/*  </View>*/}
      {/*</View>*/}
      {/*<View style={styles.textRight}>*/}
      {/*  <Text*/}
      {/*    onPress={() => navigation.navigate('ResetPassword')}*/}
      {/*    style={styles.forgotPass}>*/}
      {/*    Забыли пароль?*/}
      {/*  </Text>*/}
      {/*</View>*/}

      {/*<TouchableOpacity style={styles.signInBtn}>*/}
      {/*  <Text style={styles.btnText}>Войти</Text>*/}
      {/*</TouchableOpacity>*/}
      {/*<View style={styles.textRight}>*/}
      {/*  <Text style={styles.yellowText}>*/}
      {/*    Нет аккаунта?{' '}*/}
      {/*    <Text*/}
      {/*      style={styles.forgotPass}*/}
      {/*      onPress={() => navigation.navigate('SignUp')}>*/}
      {/*      Регистрация*/}
      {/*    </Text>*/}
      {/*  </Text>*/}
      {/*</View>*/}
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
