import React, {useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {useRoute} from '@react-navigation/native';
import {orderStatusQuery} from '../orderStatus.query';
import {Header} from '~/components/Header/Header';
import InAppBrowser from 'react-native-inappbrowser-reborn';

enum OrderStatusEnum {
  WAITING = 1,
  PAID = 2,
  PENDING = 3,
  EXPIRED = 4,
  CANCELLED = 5,
  REFUND = 6,
}

export const PaymentStatusScreen = ({navigation}: {navigation: any}) => {
  const route = useRoute();
  const {orderId, paymentUrl, order_id, wait_time} = route.params as {
    orderId: number;
    paymentUrl?: string;
    order_id?: string;
    wait_time?: number;
  };

  const {data, failureCount} = useQuery({
    ...orderStatusQuery(String(orderId)),
    networkMode: 'always',
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    enabled: !!orderId,
  });

  useEffect(() => {
    if (orderId && data?.status === OrderStatusEnum.PAID) {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'ThankYou' as never,
            params: {
              order_id: orderId,
              online_order: true,
              wait_time,
            } as never,
          },
        ],
      });
    }
    // if (data?.status && data?.status !== OrderStatusEnum.WAITING) {
    //   InAppBrowser.close();
    // }
  }, [data, data?.status, navigation, orderId, wait_time]);

  const renderStatus = () => {
    switch (data?.status) {
      case OrderStatusEnum.WAITING:
        return (
          <View style={{alignItems: 'center'}}>
            <ActivityIndicator size="large" color="#FFE600" />
            <Text style={{marginTop: 10, color: 'white'}}>
              Будь ласка, здійсніть оплату, щоб підтвердити своє замовлення.
            </Text>
            {paymentUrl && (
              <TouchableOpacity
                onPress={async () => {
                  const deepLink = 'emojisushi://payment';
                  if (!(await InAppBrowser.isAvailable())) {
                    Linking.openURL(paymentUrl);
                    return;
                  }
                  const result = await InAppBrowser.openAuth(
                    paymentUrl,
                    deepLink,
                    {
                      showTitle: false,
                      enableUrlBarHiding: true,
                      enableDefaultShare: false,
                      showInRecents: true,
                    },
                  );
                  if (result.type === 'success' && result.url) {
                    navigation.navigate('PaymentStatusScreen', {
                      orderId: orderId,
                      paymentUrl,
                    });
                  }
                }}
                style={{
                  marginTop: 20,
                  backgroundColor: '#FFE600',
                  padding: 12,
                  borderRadius: 10,
                }}>
                <Text style={{color: 'black', fontWeight: 'bold'}}>
                  Повернутися до оплати
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      case OrderStatusEnum.PENDING:
        return (
          <View style={{alignItems: 'center'}}>
            <ActivityIndicator size="large" color="#FFE600" />
            <Text style={{marginTop: 10, color: 'white'}}>
              Ми отримали ваше замовлення і чекаємо на підтвердження від
              платіжного провайдера. Це може зайняти кілька хвилин.
            </Text>
          </View>
        );

      case OrderStatusEnum.CANCELLED:
      case OrderStatusEnum.EXPIRED:
        return (
          <View style={{alignItems: 'center'}}>
            <Text style={{color: 'white', fontSize: 16}}>
              Це замовлення втратило чинність, оскільки оплата не була здійснена
              вчасно або платіжний провайдер не зміг здійснити оплату.
              Перевірте, чи вірно було вказано реквізити картки, також перевірте
              інтернет ліміт та розмістіть нове замовлення, якщо ви все ще
              бажаєте продовжити.
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('Cart', {screen: 'Checkout'})}
              style={{
                marginTop: 20,
                backgroundColor: '#FFE600',
                padding: 12,
                borderRadius: 10,
              }}>
              <Text style={{color: 'black', fontWeight: 'bold'}}>
                Спробувати ще раз
              </Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return (
          <Text style={{color: 'white'}}>Перевірка статусу замовлення...</Text>
        );
    }
  };

  return (
    <View style={{height: '100%', backgroundColor: '#141414'}}>
      <Header
        dropdownVisible={false}
        showBackButton={true}
        navigation={navigation}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: '#141414',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {failureCount > 3 ? (
          <Text style={{color: 'white'}}>Замовлення не знайдено</Text>
        ) : (
          <>
            <Text style={{color: 'white', marginBottom: 20, fontSize: 18}}>
              Замовлення #{orderId}
            </Text>
            {renderStatus()}
          </>
        )}
      </View>
    </View>
  );
};
