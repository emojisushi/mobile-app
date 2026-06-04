import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Platform} from 'react-native';
import * as yup from 'yup';

import Swiper from '../components/Swiper.tsx';
import {
  Input,
  Counter,
  Header,
  BackButton,
  DropDown,
  CheckBox,
  isClosed,
} from '~/components';

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {spotsQuery} from '~/Screens/Cart/spots.query.ts';

import Truck from '~/assets/Icons/Truck.svg';
import Package from '~/assets/Icons/Package.svg';
import Card from '~/assets/Icons/CreditCard.svg';
import Cash from '~/assets/Icons/Money.svg';
import Caret from '~/assets/Icons/Caret.svg';
import ForkKnife from '~/assets/Icons/ForkKnife.svg';

import {shippingQuery} from '~/Screens/Cart/shipping.query.ts';
import {paymentQuery} from '~/Screens/Cart/payment.query.ts';
import store from '~/stores/store.ts';
import {observer} from 'mobx-react-lite';
import {CART_STORAGE_KEY, cartQuery} from '~/Screens/Cart/cart.query.ts';
import {Controller, set, useForm, useWatch} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {isValidUkrainianPhone} from '../../../utils.ts';
import {agent} from '~/../APIClient.tsx';
import {IDistrict, PaymentMethodCodeEnum} from '~/api';
import {cityQuery} from '~/components/Header/city.query.ts';
import {bonusOptionsQuery} from '~/common/queries/bonusOptions.query.ts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import {nh, nw} from '~/common/normalize.helper.ts';

import axios, {AxiosError} from 'axios';
import {getToken} from '~/common/token/token.ts';
import {checkoutQuery} from '~/Screens/Cart/checkout.query.ts';
import {productsQuery} from '~/Screens/Home/products.query.ts';
import {Autocomplete} from '~/components/Autocomplete/Autocomplete.tsx';
import {addressesQuery} from '~/Screens/Cart/addresses.query.ts';
import {formatMinutes} from '../utils/formatMinutes.ts';
import {appConfig} from '~/config/app.ts';
import {PhoneVerification} from '../../../../../components/PhoneVerification/PhoneVerification.tsx';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CommonActions} from '@react-navigation/native';

enum HouseTypeEnum {
  Apartment = 'high_rise_building',
  House = 'private_house',
}
enum PaymentMethodEnum {
  Cash = 'cash',
  Card = 'card',
  Online = 'wayforpay',
}
enum ShippingMethodEnum {
  Courier = 'courier',
  Takeaway = 'takeaway',
}

type FormValues = {
  shippingMethod: ShippingMethodEnum;
  paymentMethod: PaymentMethodEnum;
  spotId?: number | undefined;
  name: string;
  phone: string;
  email: string;
  houseType: string;
  house: string;
  floor: string;
  street: string;
  apartment: string;
  entrance: string;
  comment: string;
  sticks: number;
  change: string;
  bonusesToUse: string | null;
  dontCall: boolean;
};
const validationRequired = 'Заповніть це поле';

const getDistrictDefaultSpot = (district: IDistrict) => {
  //@ts-ignore
  return district.spot;
};

const Checkout = observer(({navigation}: {navigation: any}) => {
  const {data: spotsRes} = useQuery(spotsQuery);
  const {data: checkoutRes} = useQuery(checkoutQuery);
  const {data: cityRes} = useQuery(cityQuery);
  const {data: bonusOptions} = useQuery(bonusOptionsQuery);
  const {data: addresses} = useQuery(addressesQuery(store.city));
  const [logged, setLogged] = useState(false);
  const [phoneConfirmed, setPhoneConfirmed] = useState(false);
  const {data: productQueryRes, isLoading: isProductsLoading} = useQuery(
    productsQuery({
      category_slug: 'menu',
    }),
  );
  const [unavailableCategories, setUnavailableCategories] = useState<number[]>(
    [],
  );
  const [unavailableProducts, setUnavailableProducts] = useState<number[]>([]);
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      const data = await agent.fetchUser();
      return data.data;
    },
    retry: false,
    onSuccess: async fetchedUser => {
      setLogged(true);
      if (!fetchedUser) {
        return;
      }
      setValue('email', fetchedUser?.email);
      setValue('phone', fetchedUser?.phone ?? '');
      setValue('name', [fetchedUser?.name, fetchedUser?.surname].filter(Boolean).join(' ') ?? '');
      setValue('street', fetchedUser?.street ?? '');
      setValue('houseType', fetchedUser?.house_type ?? '');
      setValue('house', fetchedUser?.house ?? '');
      setValue('floor', fetchedUser?.floor ?? '');
      setValue('apartment', fetchedUser?.apartment ?? '');
      setValue('entrance', fetchedUser?.entrance ?? '');
    },
    onError: () => {
      setLogged(false);
    },
  });
  useEffect(() => {
    if (user) {
      setLogged(true);
    }
  }, [user]);
  const {data: cartRes} = useQuery(cartQuery(store.city));
  const {data: shippingRes} = useQuery(shippingQuery);
  const {data: paymentRes} = useQuery(paymentQuery);
  const shippings = (shippingRes?.data || []).map(ship => ship);
  const shippingIcons = [Package, Truck];
  const shippingObj = shippings.map((item, index) => ({
    value: item.code,
    name: item.name,
    icon: shippingIcons[index],
  }));

  const paymentIcons = [Cash, Card, Card];
  const payments = (paymentRes?.data || []).map(item => item);
  const paymentObj = payments.map((item, index) => ({
    value: item.code,
    name: item.name,
    icon: paymentIcons[index],
  }));

  const cities = (cityRes || []).map(city => city);
  const city = cities.find(c => c.slug === store.city);

  const spots =
    checkoutRes?.spots.filter(spot => spot.city?.slug === city?.slug) || [];

  const districts = city?.districts || [];

  const apart = [
    {value: HouseTypeEnum.House, name: 'Приватний будинок'},
    {value: HouseTypeEnum.Apartment, name: 'Апартаменти'},
  ];

  const ids = Object.keys(cartRes || []);

  const total = ids.reduce((acc, id) => {
    return acc + cartRes?.[id].count * cartRes?.[id].price;
  }, 0);
  interface ValidationContext {
    user?: {
      bonus_amount: number;
    };
  }
  const TakeAwaySchema = yup.object({
    phone: yup
      .string()
      .required(validationRequired)
      .test(
        'is possible phone number',
        () => 'Телефон повинен бути у форматі +380xxxxxxxxx',
        isValidUkrainianPhone,
      ),
    spotId: yup.number().required(validationRequired),
    bonusesToUse: yup
      .string()
      .nullable()
      .test('max-bonus', 'Недостатньо бонусів', function (value) {
        const {user} = (this.options?.context as ValidationContext) ?? null;
        const max = (user?.bonus_amount ?? 0) / 100;
        if (user === null || user === undefined) {
          return true;
        }
        if (value === null || value === undefined) {
          return true;
        }
        return +value <= max && +value >= 0;
      }),
  });
  const CourierSchema = yup.object({
    phone: yup
      .string()
      .required(validationRequired)
      .test(
        'is possible phone number',
        () => 'Телефон повинен бути у форматі +380xxxxxxxxx',
        isValidUkrainianPhone,
      ),
    street: yup.string().required(validationRequired),
    house: yup.string().required(validationRequired),
    bonusesToUse: yup
      .string()
      .nullable()
      .test('max-bonus', 'Недостатньо бонусів', function (value) {
        const {user} = (this.options?.context as ValidationContext) ?? null;
        const max = (user?.bonus_amount ?? 0) / 100;
        if (user === null || user === undefined) {
          return true;
        }
        if (value === null || value === undefined) {
          return true;
        }
        return +value <= max && +value >= 0;
      }),
  });
  const CourierHighRiseBuildingSchema = yup.object({
    phone: yup
      .string()
      .required(validationRequired)
      .test(
        'is possible phone number',
        () => 'Телефон повинен бути у форматі +380xxxxxxxxx',
        isValidUkrainianPhone,
      ),
    street: yup.string().required(validationRequired),
    house: yup.string().required(validationRequired),
    apartment: yup.string().required(validationRequired),
    entrance: yup.string().required(validationRequired),
    floor: yup.string().required(validationRequired),
    bonusesToUse: yup
      .string()
      .nullable()
      .test('max-bonus', 'Недостатньо бонусів', function (value) {
        const {user} = (this.options?.context as ValidationContext) ?? null;
        const max = (user?.bonus_amount ?? 0) / 100;
        if (user === null || user === undefined) {
          return true;
        }
        if (value === null || value === undefined) {
          return true;
        }
        return +value <= max && +value >= 0;
      }),
  });
  const InitialValue: FormValues = {
    shippingMethod: ShippingMethodEnum.Takeaway,
    spotId: spots.length === 1 ? spots[0].id : undefined,
    paymentMethod: PaymentMethodEnum.Cash,
    name: [user?.name, user?.surname].filter(Boolean).join(' ') ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    houseType: user?.house_type ?? HouseTypeEnum.House,
    house: user?.house ?? '',
    floor: user?.floor ?? '',
    street: user?.street ?? '',
    apartment: user?.apartment ?? '',
    entrance: user?.entrance ?? '',
    comment: '',
    sticks: 0,
    change: '',
    bonusesToUse: null,
    dontCall: false,
  };
  const getValidationSchema = (values: FormValues) => {
    if (
      values.houseType === HouseTypeEnum.Apartment &&
      values.shippingMethod === ShippingMethodEnum.Courier
    ) {
      return CourierHighRiseBuildingSchema;
    }
    if (values.shippingMethod === ShippingMethodEnum.Courier) {
      return CourierSchema;
    }
    return TakeAwaySchema;
  };
  const [validationSchema, setValidationSchema] = useState<
    | typeof TakeAwaySchema
    | typeof CourierSchema
    | typeof CourierHighRiseBuildingSchema
  >(getValidationSchema(InitialValue));

  const onChangeSwiperShippingSchema = (value: string) => {
    setValidationSchema(
      getValidationSchema({
        ...InitialValue,
        shippingMethod:
          ShippingMethodEnum.Takeaway === value
            ? ShippingMethodEnum.Takeaway
            : ShippingMethodEnum.Courier,
      }),
    );
  };

  const onChangeSwiperApartmentShippingSchema = (value: string) => {
    setValidationSchema(
      getValidationSchema({
        ...InitialValue,
        shippingMethod:
          ShippingMethodEnum.Takeaway === value
            ? ShippingMethodEnum.Takeaway
            : ShippingMethodEnum.Courier,
        houseType:
          HouseTypeEnum.House === value
            ? HouseTypeEnum.House
            : HouseTypeEnum.Apartment,
      }),
    );
  };
  const {
    handleSubmit,
    control,
    formState: {errors},
    setError,
    setValue,
    watch,
    trigger,
    clearErrors,
  } = useForm<FormValues>({
    defaultValues: InitialValue,
    resolver: yupResolver<FormValues>(
      // @ts-ignore
      validationSchema,
    ),
    context: {user},
  });

  const bonusesToUse = useWatch({control, name: 'bonusesToUse'});
  const shippingMethod = useWatch({control, name: 'shippingMethod'});
  const paymentMethod = useWatch({control, name: 'paymentMethod'});
  const houseType = useWatch({control, name: 'houseType'});
  const spotId = useWatch({control, name: 'spotId'});
  const currentAddress = useWatch({control, name: 'street'});
  const houseNumber = useWatch({control, name: 'house'});

  const addressesMemo = useMemo(() => {
    if (!addresses?.addresses) {
      return [];
    }
    return addresses.addresses.map(el => ({
      id: el.id,
      name: `${el.name_ua}, ${el.suburb_ua}`,
      searchText:
        el.name_ua == el.name_ru
          ? `${el.name_ua} ${el.suburb_ua}`
          : `${el.name_ua} ${el.name_ru} ${el.suburb_ua}`,
      spotName: el.spot_name,
      min_amount: el.min_amount,
      delivery_price: el.delivery_price,
      min: el.min,
      unavailable_categories: el.unavailable_categories,
      unavailable_products: el.unavailable_products,
      recommended_products: el.recommended_products,
      wait_minutes: el.wait_minutes_delivery,
    }));
  }, [addresses?.addresses]);

  const selectedAddress = useMemo(() => {
    return addressesMemo?.find(a => a.id === +currentAddress) ?? null;
  }, [currentAddress, addresses]);

  useEffect(() => {
    if (!addresses?.addresses || !selectedAddress?.name) {
      return;
    }
    if (!houseNumber) {
      return;
    }

    const matchingAddresses = addresses.addresses.filter(
      addr => `${addr.name_ua}, ${addr.suburb_ua}` === selectedAddress.name,
    );
    if (matchingAddresses.length === 0) {
      return;
    }

    const matchedAddress = matchingAddresses?.find(addr =>
      addr.buildings?.some(
        b => b.toLowerCase().trim() === houseNumber.toLowerCase().trim(),
      ),
    );

    const defaultAddress =
      matchingAddresses?.find(addr => addr.buildings.length === 0) ??
      matchingAddresses[0];

    const resolvedAddress = matchedAddress ?? defaultAddress;
    setValue('street', resolvedAddress.id.toString(), {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [selectedAddress, houseNumber, addresses]);

  const deliveryFee = useMemo(() => {
    if (!selectedAddress) {
      return 0;
    }
    if (total < selectedAddress.min_amount) {
      return selectedAddress.delivery_price;
    }
    return 0;
  }, [selectedAddress, total]);

  useEffect(() => {
    if (!cartRes || Object.keys(cartRes).length < 1) {
      if (!orderSubmitted.current) {
        navigation.navigate('CartScreen');
      }
    }
  }, [cartRes, navigation]);
  useEffect(() => {
    if (shippingMethod === ShippingMethodEnum.Takeaway) {
      const spot = spots.find(s => s.id === spotId);
      setUnavailableCategories(
        spot?.unavailable_categories?.map(c => c.id) ?? [],
      );
      setUnavailableProducts(spot?.unavailable_products ?? []);
    } else {
      setUnavailableCategories(selectedAddress?.unavailable_categories ?? []);
      setUnavailableProducts(selectedAddress?.unavailable_products ?? []);
    }
  }, [shippingMethod, spotId, selectedAddress]);

  const unavailableItems = useMemo(() => {
    return ids
      .filter(id => {
        const item = cartRes?.[id];
        if (!item) {
          return false;
        }
        const hasUnavailableProduct = unavailableProducts.includes(+id);
        //@ts-expect-error
        const hasUnavailableCategory = productQueryRes?.data
          .find(p => p.id === +id)
          .categories?.some(cat => unavailableCategories.includes(cat.id));
        return hasUnavailableProduct || hasUnavailableCategory;
      })
      .map(id => productQueryRes?.data.find(p => p.id === +id)?.name ?? id);
  }, [cartRes, unavailableProducts, unavailableCategories]);
  const items = ids.map(id => ({
    id: id,
    variant_id: undefined,
    quantity: +cartRes[id].count,
  }));
  const getSelectedDistrict = (id: number | undefined) => {
    const selected = districts.find(d => d.id === id);

    if (!selected) {
      return null;
    }
    return selected?.name;
  };
  const getSelectedSpot = (id: number | undefined) => {
    const selected = spots.find(d => d.id === id);
    if (!selected) {
      return null;
    }
    return selected?.name;
  };
  const orderSubmitted = useRef(false);
  const {mutate: orderMutation, isLoading: isSending} = useMutation({
    mutationFn: async (data: FormValues) => {
      const {
        phone,
        floor,
        name,
        street,
        sticks,
        shippingMethod,
        spotId,
        house,
        paymentMethod,
        change,
        comment,
        entrance,
        email,
        apartment,
        bonusesToUse,
        dontCall,
      } = data;
      const [firstname, lastname] = name.split(' ');
      let address;
      let addressDetails;
      address = street;
      addressDetails = [
        ['Будинок', house],
        ['Квартира', apartment],
        ["Під'їзд", entrance],
        ['Поверх', floor],
      ]
        .filter(([label, value]) => !!value)
        .map(([label, value]) => `${label}: ${value}`)
        .join(', ');

      const paymentId = payments?.find(p => p.code === paymentMethod);
      const shippingId = shippings.find(s => s.code === shippingMethod);

      const resultantSpotId =
        shippingMethod === ShippingMethodEnum.Takeaway
          ? spotId
          : city?.spots[0]?.id;

      let _comment = comment;
      if (paymentId?.code === PaymentMethodEnum.Online && dontCall) {
        _comment = 'Не передзвонювати| ' + comment;
      }
      const response = await agent.placeOrderV2({
        phone,
        email,
        firstname,
        lastname,

        address,
        payment_method_id: paymentId!.id,
        shipping_method_id: shippingId!.id,
        spot_id: resultantSpotId!,
        address_details: addressDetails,
        house_type: houseType,
        house: house,
        floor: floor,
        apartment: apartment,
        entrance: entrance,

        change,
        comment: _comment + ` |Мобільне замовлення ${Platform.OS}| `,
        cart: {items},
        sticks: +sticks,
        ...(bonusesToUse != null && {bonuses_to_use: +bonusesToUse}),

        mobile: true,
      });
      return response.data;
    },
    onSuccess: async data => {
      orderSubmitted.current = true;
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'CartScreen'}],
        }),
      );


      const paymentUrl = data?.res?.url;
      const wayforpayOrder = data?.wayforpay_order;

      if (paymentUrl) {
        const deepLink = 'emojisushi://payment';
        // Linking.openURL(paymentUrl);
        // InAppBrowser.open(paymentUrl, {showTitle: true, showInRecents: true, enableBarCollapsing: true, enableDefaultShare: false});
        navigation.navigate('PaymentStatusScreen', {
          wait_time: currentWaitTime,
          orderId: wayforpayOrder,
          paymentUrl,
        });
        if (!(await InAppBrowser.isAvailable())) {
          Linking.openURL(paymentUrl);
          return;
        }
        const result = await InAppBrowser.openAuth(paymentUrl, deepLink, {
          showTitle: false,
          enableUrlBarHiding: true,
          enableDefaultShare: false,
          showInRecents: true,
        });
        if (result.type === 'success' && result.url) {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'PaymentStatusScreen',
                params: {
                  wait_time: currentWaitTime,
                  orderId: wayforpayOrder,
                  paymentUrl,
                },
              },
            ],
          });
        }

        // openBrowser(paymentUrl);

        return;
      } else if (paymentMethod === PaymentMethodEnum.Online) {
        return;
      }
      const order_id = data?.poster_order?.incoming_order_id;

      //   navigation.goBack();
      navigation.navigate('ThankYou', {
        order_id,
        wait_time: currentWaitTime,
      });
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
            switch (key) {
              case 'firstname': {
                setError('name', {
                  message: fieldErrors[key][0],
                });
                break;
              }
              default: {
                setError(key as keyof FormValues, {
                  message: fieldErrors[key][0],
                });
              }
            }
          });
          if (fieldErrors[0].includes('заклад')) {
            setError('spotId', {
              message: fieldErrors[0] as any as string,
            });
          }
        }
      } else {
        throw new Error(`Unknown error ${e}`);
      }
    },
  });
  const onSubmit = async (data: FormValues) => {
    if (paymentMethod === PaymentMethodEnum.Online && !phoneConfirmed) {
      setError('dontCall', {
        type: 'manual',
        message: 'Підтвердіть телефон перед оформленням',
      });

      return;
    }
    if (bonusesToUse && +bonusesToUse > 0) {
      if (total * 0.5 < +bonusesToUse) {
        setError('bonusesToUse', {
          type: 'manual',
          message:
            'Не можна використати більше бонусів, ніж 50% від суми замовлення',
        });
        return;
      }
    }
    orderMutation(data);
  };

  const bonusAmount = useMemo(() => {
    if (!bonusOptions) {
      return;
    }
    const rate = bonusOptions.bonus_rate;
    const max = bonusOptions.max_bonus;
    const b = bonusOptions.get_bonus_from_used_bonus;
    let dif = 0;
    if (!b) {
      dif = +(bonusesToUse ?? 0);
    }
    const amount = (total - dif) * rate;
    return Math.floor(amount);
  }, [bonusOptions, bonusesToUse]);
  let currentSpot = spotsRes?.find(el => el.id === spotId);
  let currentWaitTime =
    shippingMethod === ShippingMethodEnum.Takeaway
      ? currentSpot?.wait_minutes_spot
      : selectedAddress?.wait_minutes;

  const onlinePaymentClosed = isClosed({
    start: appConfig.onlinePaymentHours[0],
    end: appConfig.onlinePaymentHours[1],
  });

  const filteredPaymentMethods = paymentObj.filter(option => {
    const isOnline = option.value === PaymentMethodEnum.Online;

    if (isOnline) {
      return (
        shippingMethod === ShippingMethodEnum.Courier && !onlinePaymentClosed
      );
    }

    return true;
  });
  useEffect(() => {
    if (
      paymentMethod === PaymentMethodEnum.Online &&
      shippingMethod !== ShippingMethodEnum.Courier
    ) {
      setValue('paymentMethod', PaymentMethodEnum.Cash);
    }
  }, [shippingMethod]);
  const insets = useSafeAreaInsets();
  return (
    <View>
      <Spinner
        visible={isSending || isLoading}
        textContent={'Зачекайте...'}
        textStyle={{color: 'yellow'}}
        overlayColor="rgba(0, 0, 0, 0.75)"
      />
      <Header showBackButton navigation={navigation} dropdownVisible={false} />

      <View style={[styles.container, {paddingBottom: insets.bottom + nh(90)}]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.header}>Оформлення замовлення</Text>
          <View style={styles.textWrapper}>
            <View style={styles.circle}>
              <Text style={{color: 'black', lineHeight: nh(17)}}>1</Text>
            </View>
            <Text style={[styles.greyText, {marginLeft: nw(15)}]}>
              Введіть дані
            </Text>
          </View>
          <Controller
            name="shippingMethod"
            control={control}
            render={({field: {onChange, value}}) => (
              <View style={{marginTop: nh(15)}}>
                <Swiper
                  options={shippingObj}
                  value={value}
                  onValueChange={value => {
                    onChangeSwiperShippingSchema(value);
                    onChange(value);
                  }}
                />
              </View>
            )}
          />

          {shippingMethod === ShippingMethodEnum.Courier ? (
            <View>
              <Controller
                name="houseType"
                control={control}
                render={({field: {onChange, value}}) => (
                  <View style={{marginTop: nh(15), marginBottom: nh(15)}}>
                    <Swiper
                      options={apart}
                      value={value}
                      onValueChange={v => {
                        onChangeSwiperApartmentShippingSchema(v);
                        onChange(v);
                      }}
                    />
                  </View>
                )}
              />

              <View style={styles.houseInputs}>
                <Controller
                  name="street"
                  control={control}
                  render={({field: {onChange, value}}) => (
                    <View style={{width: nw(250), zIndex: 6}}>
                      <Autocomplete
                        placeholder="Вулиця"
                        noResultsText="Адресу не знайдено"
                        typeMoreText="Введіть ще символи"
                        data={addressesMemo}
                        value={value}
                        onChange={onChange}
                        error={errors.street?.message}
                        duplicates={false}
                      />
                    </View>
                  )}
                />

                <Controller
                  name="house"
                  control={control}
                  render={({field: {onChange, value}}) => (
                    <View
                      style={{
                        width: nw(105),
                        marginLeft: nw(10),
                        zIndex: 6,
                      }}>
                      <Input
                        placeholder={'Будинок'}
                        inputMode={'text'}
                        onChangeText={v => onChange(v)}
                        value={value}
                        error={errors.house?.message}
                      />
                    </View>
                  )}
                />
              </View>
              {shippingMethod === ShippingMethodEnum.Courier &&
                selectedAddress &&
                (total < selectedAddress.min ||
                  (selectedAddress.min_amount > 0 && deliveryFee !== 0)) && (
                  <View style={styles.deliveryInfoContainer}>
                    {total < selectedAddress.min && (
                      <Text style={styles.deliveryInfoWarning}>
                        Доставка доступна від {selectedAddress.min} ₴
                      </Text>
                    )}

                    {selectedAddress.min_amount > 0 && deliveryFee !== 0 && (
                      <Text style={styles.deliveryInfoText}>
                        Безкоштовна доставка від {selectedAddress.min_amount} ₴
                      </Text>
                    )}
                  </View>
                )}
              {houseType === HouseTypeEnum.Apartment && (
                <View style={styles.apartmentInputs}>
                  <Controller
                    name="apartment"
                    control={control}
                    render={({field: {onChange, value}}) => (
                      <View style={{width: nw(114), zIndex: 5}}>
                        <Input
                          placeholder={'Квартира'}
                          inputMode={'text'}
                          onChangeText={v => onChange(v)}
                          value={value}
                          error={errors.apartment?.message}
                        />
                      </View>
                    )}
                  />
                  <Controller
                    name="entrance"
                    control={control}
                    render={({field: {onChange, value}}) => (
                      <View style={{width: nw(115), zIndex: 5}}>
                        <Input
                          placeholder={"Під'їзд"}
                          inputMode={'text'}
                          value={value}
                          onChangeText={v => onChange(v)}
                          error={errors.entrance?.message}
                        />
                      </View>
                    )}
                  />
                  <Controller
                    name="floor"
                    control={control}
                    render={({field: {onChange, value}}) => (
                      <View style={{width: nw(115), zIndex: 5}}>
                        <Input
                          placeholder={'Поверх'}
                          inputMode={'numeric'}
                          value={value}
                          onChangeText={v => onChange(v)}
                          error={errors.floor?.message}
                        />
                      </View>
                    )}
                  />
                </View>
              )}
            </View>
          ) : (
            spots.length !== 1 && (
              <Controller
                name="spotId"
                control={control}
                render={({field: {onChange, value}}) => (
                  <View
                    style={[
                      styles.dropDownContainer,
                      //   spotError ? styles.errorFocus : null,
                      {marginTop: nh(15), zIndex: 5},
                    ]}>
                    <DropDown
                      value={value}
                      placeholder={
                        <Text style={styles.whiteText}>
                          Оберіть найближчий заклад
                        </Text>
                      }
                      options={spots}
                      onChange={s => onChange(s)}
                      snapPoints={'30'}
                      error={errors.spotId?.message}>
                      <View style={styles.inputContainer}>
                        <Text style={styles.selectOption}>
                          {getSelectedSpot(value) ? (
                            <Text style={styles.whiteText}>
                              {getSelectedSpot(value)}
                            </Text>
                          ) : (
                            'Оберіть найближчий заклад'
                          )}
                        </Text>
                        <Caret color="#727272" width="15" />
                      </View>
                    </DropDown>
                  </View>
                )}
              />
            )
          )}
          <Controller
            name="name"
            control={control}
            render={({field: {onChange, value}}) => (
              <View style={[styles.inputWrapper, {marginTop: nh(15)}]}>
                <Input
                  placeholder="Ім'я"
                  inputMode="text"
                  value={value}
                  onChangeText={v => onChange(v)}
                  error={errors.name?.message}
                />
              </View>
            )}
          />

          {/* <Controller
            name="email"
            control={control}
            render={({field: {onChange, value}}) => (
              <View style={styles.inputWrapper}>
                <Input
                  placeholder="Email"
                  inputMode="email"
                  value={value}
                  onChangeText={v => onChange(v)}
                  error={errors.email?.message}
                  editable={!logged}
                />
              </View>
            )}
          /> */}
          <Controller
            name="phone"
            control={control}
            render={({field: {onChange, value}}) => (
              <View style={[styles.inputWrapper, {zIndex: 5}]}>
                <Input
                  placeholder="Телефон"
                  inputMode="tel"
                  value={value}
                  onChangeText={v => {
                    onChange(v);
                    if (errors.phone) {
                      clearErrors('phone');
                    }
                  }}
                  error={errors.phone?.message}
                />
              </View>
            )}
          />
          <Controller
            name="comment"
            control={control}
            render={({field: {onChange, value}}) => (
              <View style={styles.inputWrapper}>
                <Input
                  placeholder="Коментар до замовлення"
                  inputMode="text"
                  value={value}
                  onChangeText={v => onChange(v)}
                />
              </View>
            )}
          />
          {!!bonusOptions?.bonus_enabled && (
            <Controller
              name="bonusesToUse"
              control={control}
              render={({field: {onChange, value}}) => (
                <View style={styles.inputWrapper}>
                  <Input
                    placeholder={
                      logged
                        ? `Бонуси для використання (баланс: ${
                            (user?.bonus_amount ?? 0) / 100
                          } ₴)`
                        : 'Бонуси (тільки для зареєстрованих користувачів)'
                    }
                    inputMode="numeric"
                    value={value?.toString() ?? ''}
                    onChangeText={v => onChange(v)}
                    editable={logged}
                    error={errors.bonusesToUse?.message}
                  />
                </View>
              )}
            />
          )}

          <View style={styles.textWrapper}>
            <View style={styles.circle}>
              <Text style={{color: 'black', lineHeight: nh(17)}}>2</Text>
            </View>
            <Text style={[styles.greyText, {marginLeft: nw(15)}]}>
              Спосіб оплати
            </Text>
          </View>
          <Controller
            name="paymentMethod"
            control={control}
            render={({field: {onChange, value}}) => (
              <Swiper
                value={value}
                onValueChange={onChange}
                options={filteredPaymentMethods}
              />
            )}
          />

          <Controller
            name="change"
            control={control}
            render={({field: {onChange, value}}) => (
              <View style={[styles.inputWrapper, {marginTop: nh(15)}]}>
                {paymentMethod === 'cash' && (
                  <Input
                    placeholder="Приготувати здачу з"
                    inputMode="text"
                    value={value}
                    onChangeText={v => onChange(v)}
                  />
                )}
              </View>
            )}
          />
          <Controller
            name="sticks"
            control={control}
            render={({field: {onChange, value}}) => (
              <View style={styles.personCountWrapper}>
                <ForkKnife
                  width={nw(32)}
                  height={nw(32)}
                  style={styles.forkKnife}
                  color="white"
                />
                <Text style={styles.personText}>Кількість персон?</Text>
                <View style={{marginLeft: nw(45)}}>
                  <Counter
                    count={Number(value)}
                    onHandleAdd={() => onChange(Number(value) + 1)}
                    onHandleMinus={() =>
                      onChange(Math.max(Number(value) - 1, 0))
                    }
                  />
                </View>
              </View>
            )}
          />
          {paymentMethod === PaymentMethodEnum.Online && (
            <PhoneVerification
              control={control}
              phone={watch('phone')}
              city_slug={store.city}
              enabled={paymentMethod === PaymentMethodEnum.Online}
              trigger={trigger}
              onPhoneConfirmedChange={setPhoneConfirmed}
              error={errors.dontCall?.message}
            />
          )}
          <Text
            style={[
              styles.whiteText,
              {
                fontSize: nh(16),
                fontWeight: '500',
                marginTop: nh(30),
                marginBottom: nh(10),
              },
            ]}>
            Сума замовлення
          </Text>
          <View style={styles.verticalBar} />
          <View style={styles.priceWrapper}>
            <Text style={styles.whiteText}>Сума замовлення</Text>
            <Text style={styles.whiteText}>{total} ₴</Text>
          </View>
          {shippingMethod === ShippingMethodEnum.Courier && (
            <View style={styles.priceWrapper}>
              <Text style={styles.whiteText}>Доставка</Text>
              <Text style={styles.whiteText}>
                {deliveryFee === 0 ? 'Безкоштовно' : `${deliveryFee} ₴`}
              </Text>
            </View>
          )}
          {+(bonusesToUse ?? 0) > 0 && (
            <View style={styles.priceWrapper}>
              <Text style={styles.whiteText}>
                Використано {Number(bonusesToUse).toFixed(2)} ₴ бонусів
              </Text>
              <Text style={styles.whiteText}>
                -{Number(bonusesToUse).toFixed(2)} ₴
              </Text>
            </View>
          )}
          <View style={styles.priceWrapper}>
            <Text style={styles.whiteText}>До оплати</Text>
            <Text style={styles.whiteText}>
              {(total + deliveryFee - +(bonusesToUse ?? 0)).toFixed(2)} ₴{' '}
            </Text>
          </View>
          {!!currentWaitTime && (
            <View style={styles.priceWrapper}>
              <Text style={styles.whiteText}>Приблизний час очікування:</Text>
              <Text style={styles.whiteText}>
                {`${formatMinutes(currentWaitTime)}`}
              </Text>
            </View>
          )}
          {/* {logged && !!bonusAmount && !!bonusOptions?.bonus_enabled && (
            <View style={styles.priceWrapper}>
              <Text style={styles.whiteText}>
                Буде отримано {(bonusAmount ?? 0) / 100} ₴ бонусів
              </Text>
            </View>
          )} */}

          {unavailableItems.length > 0 ? (
            <View style={styles.unavailableContainer}>
              <Text style={styles.unavailableTitle}>
                Наступні позиції тимчасово недоступні:
              </Text>
              {unavailableItems.map(name => (
                <Text key={name} style={styles.unavailableItem}>
                  — {name}
                </Text>
              ))}
            </View>
          ) : shippingMethod === ShippingMethodEnum.Courier &&
            selectedAddress &&
            total < selectedAddress.min ? (
            <View style={styles.unavailableContainer}>
              <Text style={styles.unavailableTitle}>
                Мінімальна сума замовлення для доставки: {selectedAddress.min} ₴
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.orderBtn}
              onPress={() => {
                handleSubmit(onSubmit, errors => {})();
              }}>
              <Text style={styles.blackText}>Замовити</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: '#141414',
  },
  scrollView: {
    display: 'flex',
    alignItems: 'center',
  },
  houseInputs: {
    display: 'flex',
    flexDirection: 'row',
    width: nw(365),
  },
  errorFocus: {
    borderWidth: 1,
    borderColor: 'red',
  },
  apartmentInputs: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: nh(15),
    gap: 10,
  },
  header: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(20),
    fontWeight: '600',
    lineHeight: 23,
    color: 'white',
    width: nw(365),
    marginBottom: nh(15),
    marginTop: nh(30),
  },
  verticalBar: {
    height: nh(1),
    backgroundColor: '#202020',
    width: nw(390),
  },
  productWrapper: {
    marginBottom: nh(15),
  },
  whiteText: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(14),
    fontWeight: '400',
    lineHeight: 17,
    color: 'white',
  },
  personCountWrapper: {
    backgroundColor: '#1C1C1C',
    width: nw(365),
    height: nh(65),
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  buttonMinus: {
    width: nw(35),
    height: nw(35),
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPlus: {
    width: nw(35),
    height: nw(35),
    borderRadius: 35,
    backgroundColor: '#2A2A2A',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  forkKnife: {
    marginLeft: nw(15),
  },
  personText: {
    marginLeft: nw(15),
    color: 'white',
    fontSize: nh(14),
    fontFamily: 'MontserratRegular',
    lineHeight: 17,
    fontWeight: '400',
  },
  blackText: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(14),
    fontWeight: '700',
    lineHeight: 17,
    color: 'black',
  },
  greyText: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(14),
    fontWeight: '400',
    lineHeight: 17,
    color: '#616161',
  },
  circle: {
    width: nw(20),
    height: nw(20),
    backgroundColor: '#FFE600',
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: nh(14),
  },
  textWrapper: {
    width: nw(365),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: nh(15),
    marginBottom: nh(10),
  },
  inputWrapper: {
    marginBottom: nh(15),
    width: nw(365),
  },
  priceWrapper: {
    width: nw(365),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: nh(15),
    marginBottom: nh(15),
  },
  orderBtn: {
    width: nw(365),
    height: nh(50),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFE600',
    borderRadius: 10,
    marginBottom: nh(150),
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  selectOption: {
    color: '#616161',
    fontFamily: 'MontserratRegular',
    fontSize: nh(14),
    lineHeight: 17,
    fontWeight: '400',
  },
  dropDownContainer: {
    width: nw(365),
    height: nh(47),
    borderRadius: 10,
    backgroundColor: '#272727',
    paddingLeft: nw(10),
    paddingRight: nw(10),
  },
  unavailableContainer: {
    width: nw(365),
    backgroundColor: '#2A0A0A',
    borderRadius: 10,
    padding: nw(15),
    borderWidth: 1,
    borderColor: 'rgb(205, 56, 56)',
    marginBottom: nh(150),
  },
  unavailableTitle: {
    color: 'rgb(205, 56, 56)',
    fontSize: nh(14),
    fontWeight: '600',
    marginBottom: nh(8),
  },
  unavailableItem: {
    color: 'white',
    fontSize: nh(13),
    marginTop: nh(4),
  },
  deliveryInfoContainer: {
    width: nw(365),
    marginTop: nh(8),
    marginBottom: nh(5),
    gap: 4,
  },
  deliveryInfoText: {
    fontSize: nh(14),
    color: '#616161',
  },
  deliveryInfoWarning: {
    fontSize: nh(14),
    fontWeight: '600',
    color: 'rgb(205, 56, 56)',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSide: {
    width: nw(50),
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
});

export default Checkout;
