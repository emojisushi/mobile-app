import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Header, BackButton} from '~/components';
import WebView from 'react-native-webview';
import {useQuery} from '@tanstack/react-query';
import store from '~/stores/store.ts';
import {nh, nw} from '~/common/normalize.helper.ts';
import {observer} from 'mobx-react-lite';
import {cityQuery} from '~/components/Header/city.query.ts';

const DeliveryAndPayment = observer(({navigation}: {navigation: any}) => {
  const {data: cityRes} = useQuery(cityQuery);

  const city = (cityRes || []).find(city => city.slug === store.city);
  return (
    <View style={styles.container}>
      <Header showBackButton={true} navigation={navigation} />
      <View style={styles.map}>
        <Text style={styles.text}>Доставка і оплата</Text>
        {city !== undefined && (
          <View style={{width: nw(365), height: nh(365)}}>
            <WebView
              source={{uri: city?.google_map_url ? city.google_map_url : ''}}
            />
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#141414',
  },
  map: {
    display: 'flex',
    alignItems: 'center',
    marginTop: nh(30),
  },
  text: {
    color: 'white',
    fontFamily: 'MontserratRegular',
    fontSize: nh(20),
    fontWeight: '600',
    width: nw(365),
    marginBottom: nh(15),
  },
});

export default DeliveryAndPayment;
