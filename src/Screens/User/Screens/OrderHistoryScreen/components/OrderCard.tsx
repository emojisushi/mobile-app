import React, {useState} from 'react';
import {ActivityIndicator, Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {nh, nw} from '~/common/normalize.helper.ts';

import Caret from '~/assets/Icons/Caret.svg';
import {IOrderHistory} from '~/api/types';
import {
  DEFAULT_PRODUCT_LIMIT,
  productsQuery,
} from '~/Screens/Home/products.query';
import {useQuery} from '@tanstack/react-query';
import {Product} from '~/models/Product';
import {orderQuery} from '../order.query';

const OrderCard = ({order}: {order: IOrderHistory}) => {
  const {data: productQueryRes} = useQuery(
    productsQuery({
      category_slug: 'menu',
      limit: DEFAULT_PRODUCT_LIMIT,
    }),
  );
  const [isOpen, setIsOpen] = useState(false);

  const {data: orderData, isLoading: isOrderLoading} = useQuery({
    ...orderQuery(order?.transaction_id?.toString()),
    enabled: isOpen,
  });
  const ids = orderData?.products?.map(p => p.product_id);
  const filteredProducts = (productQueryRes?.data || []).filter(item =>
    ids?.includes(item.user_defined_id ?? ''),
  );

  const items = filteredProducts.map(item => {
    const product = new Product(item);

    const orderItem = orderData?.products?.find(
      p => p.product_id === item.user_defined_id,
    );
    return {
      product,
      quantity: Number(orderItem?.num || 0).toFixed(0),
      price: (
        (orderItem?.product_sum || 0) / 100 / (orderItem?.num || 1) || 0
      ).toFixed(2),
    };
  });
  return (
    <View style={styles.order}>
      <Pressable onPress={() => setIsOpen(!isOpen)} style={styles.cardHeader}>
        <View>
          <Text style={styles.greyText}>№ {order.transaction_id}</Text>
          <Text style={styles.whiteText}>
            {new Date(Number(order.date_start_new)).toLocaleString('uk-UA')}
          </Text>
        </View>

        {/* <Text style={styles.yellowText}>Замовлення</Text> */}

        <Caret
          width="21"
          height="21"
          color="#727272"
          style={isOpen && styles.caretOpened}
        />
      </Pressable>

      {isOpen && (
        <View style={styles.orderContent}>
          {isOrderLoading ? (
            <ActivityIndicator
              size="large"
              color="#FFE600"
            />
          ) : (
            <>
              <View style={styles.orderInfo}>
                {orderData?.address && (
                  <View style={styles.orderInfoTextWrapper}>
                    <Text style={styles.greyText}>Адреса доставки</Text>
                    <View style={styles.textWrap}>
                      <Text style={styles.whiteText}>{orderData?.address}</Text>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.horizontalBar} />

              <View style={styles.orderStatus}>
                <Text style={styles.whiteText}>Статус замовлення</Text>
                <Text style={[styles.yellowText, styles.font]}>Виконано</Text>
              </View>

              <View style={styles.horizontalBar} />

              {items?.map(product => (
                <View key={product.product.id} style={styles.productCard}>
                  <View style={styles.imageTextWrapper}>
                    <Image
                      style={styles.image}
                      source={{uri: product?.product.mainImage}}
                    />
                    <View style={styles.textWrapper}>
                      <Text style={styles.whiteText}>
                        {product.product.name}
                      </Text>
                      <Text style={styles.whiteText}>
                        {product.product.weight} г
                      </Text>
                    </View>
                  </View>

                  <View style={styles.orderInfoTextWrapper}>
                    <Text style={styles.greyText}>Ціна за шт</Text>
                    <Text style={styles.smallPrice}>{product.price} ₴</Text>
                  </View>

                  <View style={styles.orderInfoTextWrapper}>
                    <Text style={styles.greyText}>
                      Разом ({product.quantity} шт)
                    </Text>
                    <Text style={styles.smallPrice}>
                      {(
                        Number(product.price) * Number(product.quantity)
                      ).toFixed(2)}{' '}
                      ₴
                    </Text>
                  </View>

                  <View style={styles.horizontalBar} />
                </View>
              ))}

              <View style={styles.orderInfoTextWrapper}>
                <Text style={[styles.greyText, styles.font]}>
                  Сумма замовлення
                </Text>
                <Text style={styles.bigPrice}>
                  {(order.sum / 100).toFixed(2)} ₴
                </Text>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  order: {
    width: nw(365),
    backgroundColor: '#1C1C1C',
    borderRadius: 10,
    marginBottom: nh(15),
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    height: nh(61),
    width: nw(335),
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  greyText: {
    color: '#616161',
    fontSize: nh(14),
    fontFamily: 'MontserratRegular',
    fontWeight: '400',
    lineHeight: 17,
  },
  whiteText: {
    color: 'white',
    fontSize: nh(14),
    fontFamily: 'MontserratRegular',
    fontWeight: '400',
    lineHeight: 17,
  },
  yellowText: {
    color: '#FFE600',
    fontSize: nh(14),
    fontFamily: 'MontserratRegular',
    fontWeight: '400',
    lineHeight: 17,
  },
  caretOpened: {transform: [{rotate: '180deg'}]},
  redText: {
    color: '#CD3838',
    fontSize: nh(14),
    fontFamily: 'MontserratRegular',
    fontWeight: '400',
    lineHeight: 17,
  },
  horizontalBar: {
    height: 1,
    backgroundColor: '#2D2D2D',
    marginBottom: nh(12),
    marginTop: nh(12),
    width: nw(335),
  },
  orderContent: {
    width: nw(365),
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: '#1C1C1C',
    display: 'flex',
    alignItems: 'center',
  },
  orderInfo: {width: nw(335)},
  orderInfoTextWrapper: {
    width: nw(335),
    marginBottom: nh(10),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textWrap: {width: nw(150), display: 'flex', alignItems: 'flex-end'},
  orderStatus: {display: 'flex', alignItems: 'center'},
  productCard: {width: nw(335)},
  imageTextWrapper: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: nh(10),
  },
  image: {
    width: nw(80),
    height: nh(52),
    resizeMode: 'cover',
  },
  textWrapper: {
    marginLeft: nw(15),
    display: 'flex',
    justifyContent: 'space-between',
  },
  smallPrice: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(14),
    fontWeight: '700',
    lineHeight: 17,
    color: 'white',
  },
  bigPrice: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(16),
    fontWeight: '700',
    lineHeight: 19,
    color: 'white',
  },
  font: {fontSize: nh(16)},
  loadingWrapper: {
    paddingVertical: nh(20),
    alignItems: 'center',
    width: nw(335),
  },
});

export default OrderCard;
