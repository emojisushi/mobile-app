import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import EmptyCart from '../../../../assets/Icons/EmptyCart.svg';
import {nh, nw} from '../../../../../normalize.helper.ts';
import ProductCartCard from '../../../../components/ProductCartCard/ProductCartCard.tsx';
import Header from '../../../../components/Header/Header.tsx';
import {useQuery} from '@tanstack/react-query';
import {
  DEFAULT_PRODUCT_LIMIT,
  productsQuery,
} from '../../../Home/products.query.ts';
import {Product} from '../../../../models/Product.ts';
import {cartQuery} from '../../cart.query.ts';
import {appConfig} from '../../../../config/app.ts';
import {isClosed} from '../../../../components/ClosedRestaurantModal/ClosedRestaurant.tsx';
import * as Sentry from '@sentry/react-native';

const CartScreen = ({navigation}: {navigation: any}) => {
  const {data: cartItems} = useQuery(cartQuery);

  const {data: productQueryRes, isLoading: isProductsLoading} = useQuery(
    productsQuery({
      category_slug: 'menu',
      limit: DEFAULT_PRODUCT_LIMIT,
    }),
  );

  const closed = isClosed({
    start: appConfig.workingHours[0],
    end: appConfig.workingHours[1],
  });

  const ids = Object.keys(cartItems || {});
  const cart = (productQueryRes?.data || []).filter(item =>
    ids.includes(String(item.id)),
  );
  const cartProducts = cart.map(product => new Product(product));

  const sum = ids.reduce((acc, id) => {
    return acc + cartItems?.[id]?.price * cartItems?.[id].count;
  }, 0);

  return (
    <Sentry.ErrorBoundary
      fallback={() => {
        return <Text>An error occurred!</Text>;
      }}
      showDialog={true}>
      <View style={styles.container}>
        <Header />
        <Pressable
          style={{backgroundColor: 'black', width: 100, height: 100}}
          onPress={() => {
            throw new Error('ccart');
          }}></Pressable>
        {ids.length > 0 ? (
          <View>
            <Text style={[styles.cartTitle, styles.titleMargin]}>Корзина</Text>
            <View
              style={[
                styles.productsWrapper,
                {height: ids.length === 1 ? nh(155) : nh(330)},
              ]}>
              <ScrollView>
                {cartProducts.map(item => (
                  <View key={item.id}>
                    <ProductCartCard item={item} />
                  </View>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              disabled={closed}
              onPress={() => navigation.navigate('Checkout')}
              style={[
                styles.orderButton,
                closed ? {backgroundColor: 'grey'} : '',
              ]}>
              <Text style={styles.checkoutText}>Оформить заказ | {sum} ₴</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyCart}>
            <EmptyCart />
            <Text style={styles.emptyCartText}>Ваша корзина пуста :(</Text>
          </View>
        )}
      </View>
    </Sentry.ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#141414',
    height: '100%',
  },
  cartTitle: {
    fontFamily: 'MontserratRegular',
    fontWeight: '600',
    fontSize: nh(20),
    lineHeight: 24,
    color: 'white',
  },
  titleMargin: {
    marginTop: nh(30),
    marginLeft: nw(13),
    marginBottom: nh(15),
  },
  emptyCart: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  emptyCartText: {
    color: '#727272',
    fontSize: nh(16),
    fontFamily: 'MontserratRegular',
    fontWeight: '500',
  },
  productsWrapper: {
    marginLeft: nw(13),
  },
  orderButton: {
    backgroundColor: '#FFE600',
    width: nw(365),
    height: nh(50),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: nh(15),
    marginLeft: nw(13),
  },
  checkoutText: {
    fontFamily: 'Montserrat',
    fontWeight: '600',
    fontSize: nh(14),
    lineHeight: 17,
    color: 'black',
  },
});

export default CartScreen;
