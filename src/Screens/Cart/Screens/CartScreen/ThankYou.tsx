import React, {useEffect} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Header} from '~/components';
import Success from '~/assets/Icons/Success.svg';
import {nh, nw} from '~/common/normalize.helper.ts';
import {useRoute} from '@react-navigation/native';
import {formatMinutes} from './utils/formatMinutes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CART_STORAGE_KEY, cartQuery} from '../../cart.query';
import store from '~/stores/store';
import {useQueryClient} from '@tanstack/react-query';

const ThankYou = ({navigation}: {navigation: any}) => {
  const route = useRoute();
  const queryClient = useQueryClient();

  useEffect(() => {
    const clearCart = async () => {
      await AsyncStorage.removeItem(CART_STORAGE_KEY + `_${store.city}`);
      await queryClient.resetQueries(cartQuery(store.city).queryKey);
      await queryClient.invalidateQueries(['userData']);
    };
    clearCart();
  }, []);

  const {order_id, online_order, wait_time} = route.params as {
    order_id: number;
    online_order: boolean;
    wait_time: number;
  };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.wrapper}>
        <View style={styles.textWrapper}>
          <View>
            <Text style={[styles.whiteText, styles.bigText]}>
              Ваше замовлення #{order_id} успішно прийнято та відправлено в
              роботу!
            </Text>
            {wait_time && (
              <Text style={[styles.whiteText, styles.bigText]}>
                Приблизний час очікування: {formatMinutes(wait_time)} хвилин
              </Text>
            )}
          </View>
          <Success width={nw(100)} height={nh(100)} color={'yellow'} />
          <View>
            <Text style={[styles.whiteText, {width: nw(300)}]}>
              Найближчим часом Вам зателефонує менеджер для підтвердження
              замовлення. Потім замовлення буде підготовлено та надіслано на
              вказану Вами адресу.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate('Home')}>
            <Text style={styles.btnText}>Повернутися на головний екран</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#141414',
  },
  wrapper: {
    marginTop: nh(110),
  },
  textWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  whiteText: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(15),
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
  },
  bigText: {
    fontSize: nh(17),
    fontWeight: '700',
  },
  btn: {
    marginTop: nh(15),
    backgroundColor: '#FFE600',
    width: nw(340),
    height: nh(47),
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: 'black',
    fontFamily: 'MontserratRegular',
    fontSize: nh(15),
    fontWeight: '700',
  },
});
export default ThankYou;
