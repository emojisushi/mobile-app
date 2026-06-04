import {StyleSheet, View} from 'react-native';
import {nh, nw} from '~/common/normalize.helper.ts';
import HomeButtonSvg from '~/assets/Icons/home.svg';
import React from 'react';

const HomeButton: React.FC = () => {
  return (
    <View style={[styles.container, styles.shadowProp, styles.margin]}>
      <HomeButtonSvg style={styles.img} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: nw(60),
    height: nw(60),
    backgroundColor: '#FFE600',
    borderRadius: nw(60),
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    width: nw(20),
    height: nw(20),
  },
  shadowProp: {
    shadowColor: '#FFE60080',
    // elevation: 7,
  },
  margin: {
    marginBottom: nh(50),
  },
});
export default HomeButton;
