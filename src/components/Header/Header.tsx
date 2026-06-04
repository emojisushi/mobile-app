import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {nh, nw} from '~/common/normalize.helper.ts';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import Logo from '~/assets/Logo.svg';
import MapPin from '~/assets/Icons/MapPinMapPin.svg';
import Caret from '~/assets/Icons/Caret.svg';
import {DropDown} from '~/components';
import {BackButton} from '~/components';

import {useQuery} from '@tanstack/react-query';
import store from '~/stores/store.ts';
import {cityQuery} from './city.query.ts';
import {observer} from 'mobx-react-lite';

type HeaderProps = {
  dropdownVisible?: boolean;
  headerVisible?: boolean;
  navigation?: any;
  showBackButton?: boolean;
};

export const Header = observer(
  ({
    dropdownVisible = true,
    headerVisible = true,
    navigation,
    showBackButton = false,
  }: HeaderProps) => {
    const insets = useSafeAreaInsets();
    const topInset = insets.top;
    const {data: citiesRes} = useQuery(cityQuery);
    const cities = (citiesRes || []).map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    }));
    const onChange = (value: number | string | undefined) => {
      const city = cities.find(c => c.id === value);
      if (city) {
        store.changeCity(city.slug);
      }
    };
    const selected = cities.find(c => c.slug === store.city);

    return (
      <View style={[styles.container, {height: nh(61) + topInset, paddingTop: topInset}]}>
        <View style={styles.inner}>
          <View style={styles.leftSide}>
            {showBackButton && navigation && (
              <BackButton navigation={navigation} />
            )}
          </View>

          {headerVisible && (
            <Logo style={styles.logo} width={nw(73)} height={nh(31)} />
          )}

          <View style={styles.rightSide}>
            {dropdownVisible ? (
              <DropDown
                snapPoints={'29%'}
                options={cities}
                onChange={onChange}
                value={selected?.id}
                placeholder={
                  <>
                    <Text style={[styles.chooseText, {marginRight: nw(10)}]}>
                      Оберіть місто
                    </Text>
                    <MapPin color="white" />
                  </>
                }>
                <View style={styles.cityContainer}>
                  <MapPin color="white" />
                  <Text style={styles.whiteText} numberOfLines={1}>
                    {selected?.name}
                  </Text>
                  <Caret color="white" />
                </View>
              </DropDown>
            ) : (
              <View style={styles.cityContainer} />
            )}
          </View>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#171717',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inner: {
    height: nh(61),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  leftSide: {
    width: nw(90),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSide: {
    flex: 1,
    alignItems: 'flex-end',
  },
  logo: {
    position: 'absolute',
    left: '50%',
    transform: [{translateX: -nw(36.5)}],
  },
  whiteText: {
    color: 'white',
    marginRight: nw(5),
    marginLeft: nw(3),
    fontSize: nh(14),
  },
  cityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: nw(12),
    minWidth: nw(30),
  },
  chooseText: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(16),
    fontWeight: '500',
    lineHeight: 19,
    color: 'white',
    paddingBottom: nh(10),
  },
});
