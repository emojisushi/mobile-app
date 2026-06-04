import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import UserScreen from './Screens/UserScreen/UserScreen.tsx';
import ContactsScreen from './Screens/ContactsScreen/ContactsScreen.tsx';
import SignInScreen from './Screens/SignInScreen/SignInScreen.tsx';
import SignUpScreen from './Screens/SignUpScreen/SignUpScreen.tsx';
import ResetPasswordScreen from './Screens/ResetPasswordScreen/ResetPasswordScreen.tsx';
import BonusHistoryScreen from './Screens/BonusHistoryScreen/BonusHistoryScreen.tsx';
import SavedAddressesScreen from './Screens/SavedAddressesScreen/SavedAddressesScreen.tsx';
import DeliveryAndPayment from './Screens/DeliveryAndPayment/DeliveryAndPayment.tsx';
import RefundRules from './Screens/RefundRules/RefundRules.tsx';
import UpdatePasswordScreen from './Screens/UpdatePasswordScreen/UpdatePasswordScreen.tsx';
import ProfileScreen from './Screens/ProfileScreen/ProfileScreen.tsx';
import OrderHistoryScreen from './Screens/OrderHistoryScreen/OrderHistoryScreen.tsx';
import SignInWithPhoneScreen from './Screens/SignInWithPhoneScreen/SignInWithPhoneScreen.tsx';

type ScreenProps = {
  Profile: undefined;
  OrderHistory: undefined;
  BonusHistory: undefined;
  UserScreen: undefined;
  SavedAddresses: undefined;
  DeliveryAndPayment: undefined;
  RefundRules: undefined;
  Contacts: undefined;
  SignIn: undefined;
  SignInWithPhone: undefined;
  SignUp: undefined;
  ResetPassword: undefined;
  UpdatePassword: undefined;
};

const Stack = createStackNavigator<ScreenProps>();

const StackNavigation = () => {
  const stackOptions = {
    headerShown: false,
    animationEnabled: true,
    freezeOnBlur: true,
  };

  return (
    <Stack.Navigator screenOptions={stackOptions} initialRouteName="UserScreen">
      <Stack.Screen name="UserScreen" component={UserScreen} />
      <Stack.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen
        name="BonusHistory"
        component={BonusHistoryScreen}
        options={{
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen
        name="SavedAddresses"
        component={SavedAddressesScreen}
        options={{
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen
        name="DeliveryAndPayment"
        component={DeliveryAndPayment}
        options={{
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen
        name="RefundRules"
        component={RefundRules}
        options={{
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen
        name="SignInWithPhone"
        component={SignInWithPhoneScreen}
        options={{
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
      <Stack.Screen
        name="UpdatePassword"
        component={UpdatePasswordScreen}
        options={{
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigation;
