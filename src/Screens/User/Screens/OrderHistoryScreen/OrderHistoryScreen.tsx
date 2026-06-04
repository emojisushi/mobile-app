import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {nh, nw} from '~/common/normalize.helper.ts';

import OrderCard from './components/OrderCard.tsx';
import {Header} from '~/components';
import {agent} from '~/../APIClient.tsx';
import {useQuery} from '@tanstack/react-query';
import Spinner from 'react-native-loading-spinner-overlay/lib/index';

const OrderHistoryScreen = ({navigation}: {navigation: any}) => {
  const [visibleCount, setVisibleCount] = useState(10);

  const {data: history, isLoading: isHistoryLoading} = useQuery({
    queryKey: ['orderHistory'],
    queryFn: async () => {
      const req = await agent.getOrderHistory();
      return req.data;
    },
    placeholderData: [],
    staleTime: 0,
  });

  return (
    <View style={styles.container}>
      <Header
        showBackButton={true}
        navigation={navigation}
        dropdownVisible={false}
      />
      <FlatList
        data={history?.slice(0, visibleCount) ?? []}
        keyExtractor={order => order.transaction_id?.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}
        onEndReached={() => setVisibleCount(prev => prev + 5)}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <Text style={styles.header}>Історія замовлень</Text>
        }
        ListEmptyComponent={
          isHistoryLoading ? (
            <ActivityIndicator
              size="large"
              color="#FFE600"
              style={{marginTop: nh(40)}}
            />
          ) : (
            <Text style={styles.emptyText}>Замовлень немає</Text>
          )
        }
        renderItem={({item: order}) => (
          <OrderCard key={order.transaction_id} order={order} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#141414',
    display: 'flex',
    alignItems: 'center',
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
  order: {
    width: nw(365),
    backgroundColor: '#1C1C1C',
  },
  scrollView: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  emptyText: {
    color: '#616161',
    fontSize: nh(14),
    marginTop: nh(20),
    fontFamily: 'MontserratRegular',
    textAlign: 'center',
  },
});

export default OrderHistoryScreen;
