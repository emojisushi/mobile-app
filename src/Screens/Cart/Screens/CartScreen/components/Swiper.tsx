import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {nh, nw} from '~/common/normalize.helper.ts';
import {SvgProps} from 'react-native-svg';

type Option = {
  name: string;
  value: string;
  icon?: React.FC<SvgProps>;
};

const CONTAINER_WIDTH = nw(365);
const ITEM_MARGIN = nw(10);

const Swiper = ({
  options,
  value,
  onValueChange,
}: {
  options: Option[];
  value: string | number;
  onValueChange: (value: string) => void;
}) => {
  const handlePress = (option: Option) => {
    onValueChange(option.value);
  };

  const itemWidth = (CONTAINER_WIDTH - ITEM_MARGIN * options.length) / options.length;

  return (
    <View style={styles.container}>
      {options.map(option => (
        <Pressable
          key={option.name}
          onPress={() => handlePress(option)}
          style={[
            styles.textWrapper,
            {width: itemWidth},
            option.value === value ? styles.active : null,
          ]}>
          {option.icon && (
            <option.icon
              width={nw(15)}
              height={nh(15)}
              color={value === option.value ? 'black' : 'white'}
            />
          )}
          <Text
            style={[
              value === option.value ? styles.blackText : styles.whiteText,
              option.icon ? {marginLeft: nw(15)} : {marginLeft: 0},
            ]}
          >
            {option.name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: nw(365),
    height: nh(50),
    backgroundColor: '#1C1C1C',
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  active: {
    backgroundColor: '#FFE600',
  },
  textWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: nw(170),
    height: nh(40),
    borderRadius: 10,
    justifyContent: 'center',
    marginLeft: nw(5),
    marginRight: nw(5),
  },
  whiteText: {
    color: 'white',
    fontFamily: 'MontserratRegular',
    fontSize: nh(14),
    fontWeight: '500',
    marginLeft: nw(15),
  },
  blackText: {
    color: 'black',
    fontFamily: 'MontserratRegular',
    fontSize: nh(14),
    fontWeight: '500',
    marginLeft: nw(15),
  },
});

export default Swiper;
