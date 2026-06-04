import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {nw} from '~/common/normalize.helper.ts';
import Caret from '~/assets/Icons/Caret.svg';

export const BackButton = ({navigation}: {navigation: any}) => {
  return (
    <Pressable style={[styles.hideBtn]} onPress={() => navigation.goBack()}>
      <Caret style={styles.caret} width="21" height="21" color="black" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  caret: {
    transform: [{rotate: '90deg'}],
  },
  hideBtn: {
    width: nw(31),
    height: nw(31),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFE600',
    borderRadius: 5,
  },
});
