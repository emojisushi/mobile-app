import React, {useEffect} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import EmptyCart from '~/assets/Icons/EmptyCart.png';
import {nh, nw} from '~/common/normalize.helper.ts';
import {ProductCartCard, Header, isClosed} from '~/components';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  DEFAULT_PRODUCT_LIMIT,
  productsQuery,
} from '~/Screens/Home/products.query.ts';
import {Product} from '~/models/Product.ts';
import {cartQuery} from '~/Screens/Cart/cart.query.ts';
import {appConfig} from '~/config/app.ts';
import store from '~/stores/store.ts';
import {observer} from 'mobx-react-lite';

const CartScreen = observer(({navigation}: {navigation: any}) => {
  const {data: cartItems} = useQuery(cartQuery(store.city));

  const {data: productQueryRes} = useQuery(
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
    <View style={styles.container}>
      <Header />
      {ids.length > 0 ? (
        <View>
          <Text style={[styles.cartTitle, styles.titleMargin]}>Кошик</Text>
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
            <Text style={styles.checkoutText}>
              Оформити замовлення | {sum} ₴
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.emptyCart}>
          <Image
            source={EmptyCart}
            style={{width: nw(200), height: nh(200), tintColor: '#393939'}}
            resizeMode="contain"
          />
          <Text style={styles.emptyCartText}>Ваш кошик порожній :(</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#141414',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
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
    flex: 1,
  },
  emptyCartText: {
    color: '#727272',
    fontSize: nh(14),
    fontFamily: 'MontserratRegular',
    fontWeight: '500',
    width: nw(200),
    textAlign: 'center',
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
