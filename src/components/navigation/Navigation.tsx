import React, {useCallback} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {RouteProp} from '@react-navigation/core/src/types.tsx';
import {nh} from '~/common/normalize.helper.ts';

import TabBarIcon from '~/components/TabBarIcon/TabBarIcon.tsx';
import FavouriteScreen from '~/Screens/Favourite/Screens/FavouriteScreen/FavouriteScreen.tsx';
import CategoryScreen from '~/Screens/Category/Screens/CategoryScreen/CategoryScreen.tsx';

import StackNavigation from '~/Screens/User/StackNavigation.tsx';
import CartNavigation from '~/Screens/Cart/CartNavigation.tsx';
import HomeNavigation from '~/Screens/Home/HomeNavigation.tsx';

type RootTabParams = {
  HomeNavigation: undefined;
  Favourite: undefined;
  Cart: undefined;
  Category: undefined;
  User: undefined;
};

const Tab = createBottomTabNavigator<RootTabParams>();

export const Navigation = () => {
  const getOptions = useCallback(
    ({
      route,
      navigation,
    }: {
      route: RouteProp<{
        Favourite: any;
        HomeNavigation: any;
        Cart: any;
        Category: any;
        User: any;
      }>;
      navigation: any | undefined;
    }) => ({
      // eslint-disable-next-line react/no-unstable-nested-components
      tabBarIcon: ({focused}: {focused: boolean}) => {
        return (
          <TabBarIcon
            routeName={route.name}
            focused={focused}
            navigation={navigation}
          />
        );
      },
      header: () => {
        return false;
      },
      tabBarHideOnKeyboard: true,
      tabBarShowLabel: false,
      tabBarStyle: {
        height: nh(80),
        backgroundColor: '#171717',
      },
      contentStyle: {backgroundColor: '#141414'},
    }),
    [],
  );
  return (
    <Tab.Navigator screenOptions={getOptions} initialRouteName="HomeNavigation">
      <Tab.Screen name="Favourite" component={FavouriteScreen} />
      <Tab.Screen
        name="Cart"
        options={{unmountOnBlur: true}}
        component={CartNavigation}
      />
      <Tab.Screen name="HomeNavigation" component={HomeNavigation} />
      <Tab.Screen name="Category" component={CategoryScreen} />
      <Tab.Screen name="User" component={StackNavigation}/>
    </Tab.Navigator>
  );
};
