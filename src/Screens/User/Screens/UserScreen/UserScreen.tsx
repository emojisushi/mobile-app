import React, {useCallback, useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {nh, nw} from '~/common/normalize.helper.ts';

import ProfileScreen from '../ProfileScreen/ProfileScreen.tsx';

import UserCircle from '~/assets/Icons/UserCircle.svg';
import Caret from '~/assets/Icons/Caret.svg';
import ClockCounter from '~/assets/Icons/ClockCounterClockwise.svg';
import Phone from '~/assets/Icons/Phone.svg';
import CreditCard from '~/assets/Icons/CreditCard.svg';
import Coins from '~/assets/Icons/Coins.svg';
import {Header, UserOption} from '~/components';
import {observer} from 'mobx-react-lite';
import {agent} from '~/../APIClient.tsx';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import Spinner from 'react-native-loading-spinner-overlay/lib/index';
import {clearToken} from '~/common/token/token.ts';
import {bonusOptionsQuery} from '~/common/queries/bonusOptions.query.ts';

const UserScreen = observer(({navigation}: {navigation: any}) => {
  const queryClient = useQueryClient();
  const [logged, setLogged] = useState(false);
  const {data: bonusOptions} = useQuery(bonusOptionsQuery);
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      setLogged(false);

      const d = await agent.fetchUser();
      return d.data;
    },
    retry: false,
    refetchOnWindowFocus: true,
    onSuccess: () => setLogged(true),
    onError: () => setLogged(false),
  });
  useEffect(() => {
    if (user) {
      setLogged(true);
    }
  }, [user]);
  const signOut = async () => {
    setLogged(false);
    await clearToken();
    queryClient.invalidateQueries(['userData']);
  };
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await queryClient.refetchQueries();
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);
  return (
    <ScrollView
      contentContainerStyle={{flexGrow: 1}}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.container}>
        <Spinner
          visible={isLoading || refreshing}
          textContent={'Зачекайте...'}
          textStyle={{color: 'yellow'}}
          overlayColor="rgba(0, 0, 0, 0.75)"
        />
        <Header />
        {logged || refreshing ? (
          <>
            <View style={styles.horizontalLine} />
            <View style={styles.profileContainerColumn}>
              <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                <View style={styles.profileContainer}>
                  <View style={styles.profileTextUserWrapper}>
                    <View style={styles.userCircle}>
                      <UserCircle color="#727272" />
                    </View>
                    <View style={styles.profileTextWrapper}>
                      <Text style={styles.profileText}>Ваш профіль</Text>
                      <Text style={styles.gmail}>{user?.phone}</Text>
                    </View>
                  </View>
                  <Caret
                    style={styles.caret}
                    width="15"
                    height="15"
                    color="#FFE600"
                  />
                </View>
              </TouchableOpacity>
              <View style={styles.loggedInBtnWrapper}>
                <TouchableOpacity style={styles.signUpBtn} onPress={signOut}>
                  <Text style={styles.signUpBtnText}>Вийти</Text>
                </TouchableOpacity>
                {!!bonusOptions?.bonus_enabled && (
                  <TouchableOpacity
                    style={styles.signInBtn}
                    // onPress={() => navigation.navigate('BonusHistory')}
                  >
                    <Text style={styles.signInBtnText}>
                      Бонуси: {(user?.bonus_amount ?? 0) / 100} ₴
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.withoutAccount}>
            <View style={styles.withoutAccountWrapper}>
              <View style={styles.userCircle}>
                <UserCircle color="#727272" />
              </View>
              <Text style={styles.signInText}>Увійдіть в акаунт</Text>
              <Text style={styles.descriptionText}></Text>
              <View style={styles.btnWrapper}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('SignUp')}
                  style={styles.signUpBtn}>
                  <Text style={styles.signUpBtnText}>Реєстрація</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('SignIn')}
                  style={styles.signInBtn}>
                  <Text style={styles.signInBtnText}>Увійти</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        {logged && (
          <>
            <View style={styles.horizontalLine} />
            <TouchableOpacity
              onPress={() => navigation.navigate('OrderHistory')}>
              <UserOption
                title="Історія замовлень"
                svgIcon={<ClockCounter color="#727272" />}
              />
            </TouchableOpacity>
          </>
        )}
        {/* <TouchableOpacity onPress={() => navigation.navigate('BonusHistory')}>
        <UserOption
          title="Історія бонусів"
          svgIcon={<ClockCounter color="#727272" />}
        />
      </TouchableOpacity> */}
        {/* <TouchableOpacity onPress={() => navigation.navigate('SavedAddresses')}>
        <UserOption
          title="Збережені адреси"
          svgIcon={<Truck color="#727272" />}
        />
      </TouchableOpacity> */}

        <View style={styles.horizontalLine} />

        <TouchableOpacity onPress={() => navigation.navigate('Contacts')}>
          <UserOption title="Контакти" svgIcon={<Phone color="#727272" />} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('DeliveryAndPayment')}>
          <UserOption
            title="Доставка і оплата"
            svgIcon={<CreditCard color="#727272" />}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('RefundRules')}>
          <UserOption
            title="Правила повернення коштів"
            svgIcon={<Coins color="#727272" />}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#171717',
  },
  withoutAccount: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  withoutAccountWrapper: {
    display: 'flex',
    height: nh(217),
    justifyContent: 'center',
    alignItems: 'center',
    width: nw(365),
  },
  profileContainer: {
    width: '100%',
    height: nh(78),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: nw(13),
  },
  profileContainerColumn: {
    width: '100%',
    //height: nh(152),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    // marginLeft: nw(13),
  },
  userCircle: {
    backgroundColor: '#1C1C1C',
    width: nw(72),
    height: nh(72),
    borderRadius: 36,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gmail: {
    fontFamily: 'MontserratRegular',
    fontWeight: '400',
    fontSize: nh(13),
    lineHeight: 24,
    color: '#757575',
  },
  profileText: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(15),
    fontWeight: '400',
    lineHeight: 18,
    color: 'white',
  },
  profileTextUserWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileTextWrapper: {
    marginLeft: nw(15),
  },
  caret: {
    transform: [{rotate: '-90deg'}],
    marginRight: nw(25),
  },
  horizontalLine: {
    height: nh(1),
    width: '100%',
    backgroundColor: '#202020',
  },
  signInText: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(15),
    lineHeight: 18,
    fontWeight: '500',
    color: 'white',
    marginTop: nh(15),
  },
  descriptionText: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(12),
    lineHeight: 14,
    fontWeight: '400',
    color: 'white',
    textAlign: 'center',
    marginTop: nh(5),
  },
  signInBtn: {
    width: nw(175),
    height: nh(37),
    borderRadius: 10,
    color: 'black',
    backgroundColor: '#FFE600',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpBtn: {
    width: nw(175),
    height: nh(37),
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFE600',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: nh(15),
  },
  signUpBtnText: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(14),
    fontWeight: '500',
    lineHeight: 17,
    color: 'white',
  },
  signInBtnText: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(14),
    fontWeight: '500',
    lineHeight: 17,
    color: 'black',
  },
  btnWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: nh(15),
    marginBottom: nh(15),
  },
  loggedInBtnWrapper: {
    width: nw(360),
    display: 'flex',
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
});

export default UserScreen;
