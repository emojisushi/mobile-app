import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {nh, nw} from '~/common/normalize.helper.ts';
import {agent} from '~/../APIClient';
import BonusCard from './components/BonusCard.tsx';
import {Header} from '~/components';
import {useQuery} from '@tanstack/react-query';
import Spinner from 'react-native-loading-spinner-overlay/lib/index';

const BonusHistoryScreen = () => {
  const {data: history, isLoading: isHistoryLoading} = useQuery({
    queryKey: ['bonusHistory'],
    queryFn: async () => {
      const req = await agent.getBonusHistory();
      return req.data;
    },
  });
  const {data: user, isLoading: isBonusAmountLoading} = useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      const req = await agent.fetchUser();
      return req.data;
    },
  });
  return (
    <View style={styles.container}>
      <Spinner
        visible={isHistoryLoading || isBonusAmountLoading}
        textContent={'Зачекайте...'}
        textStyle={{color: 'yellow'}}
        overlayColor="rgba(0, 0, 0, 0.75)"
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{alignItems: 'center'}}>
          <Header />
          <View style={styles.headerContainer}>
            <Text style={styles.headerBalance}>
              {user?.bonus_amount} бонусів
            </Text>
            {/* <Text style={styles.headerText}>Баланс бонусів</Text> */}
          </View>
          <Text style={styles.header}>Історія бонусів</Text>
          {history?.map(el => (
            <BonusCard data={el} key={el.id} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#141414',
    alignItems: 'center',
  },
  headerContainer: {
    borderRadius: 10,
    backgroundColor: '#1C1C1C',
    borderWidth: 1,
    borderColor: '#FFE600',
    width: nw(365),
    height: nh(90),
    display: 'flex',
    alignItems: 'center',
    // alignItems: 'center'
  },
  headerBalance: {
    fontFamily: 'MontserratRegular',
    fontWeight: '800',
    fontSize: nh(42),
    color: 'green',
    textAlign: 'center',
    marginVertical: 'auto',
  },
  header: {
    fontFamily: 'MontserratRegular',
    fontWeight: '600',
    fontSize: nh(20),
    color: 'white',
    marginTop: nh(30),
    marginBottom: nh(30),
    width: nw(365),
  },
  bonusAmount: {
    color: 'green',
  },
  order: {
    width: nw(365),
    backgroundColor: '#1C1C1C',
  },
});

export default BonusHistoryScreen;
