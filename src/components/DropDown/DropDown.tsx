import React, {ReactNode, useCallback, useRef, useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, View, BackHandler} from 'react-native';
import {nh, nw} from '~/common/normalize.helper.ts';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {observer} from 'mobx-react-lite';

type OptionProps = {
  id: number;
  name: string;
  slug?: string;
  temporarily_unavailable?: boolean;
};

export const DropDown = observer(
  ({
    value,
    placeholder,
    options,
    onChange,
    error,
    children,
    snapPoints,
  }: {
    value?: string | number;
    placeholder: ReactNode;
    options: OptionProps[];
    onChange: (value: string | number | undefined) => void;
    error?: string;
    children: ReactNode;
    snapPoints: string;
  }) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const [isOpen, setIsOpen] = useState(false);

    const openBottomSheet = useCallback(() => {
      bottomSheetModalRef.current?.present();
    }, []);

    const handleOptionPress = (option: OptionProps) => {
      onChange(option.id);
      bottomSheetModalRef.current?.dismiss();
    };

    useEffect(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (isOpen) {
            bottomSheetModalRef.current?.dismiss();
            return true;
          }
          return false;
        },
      );
      return () => subscription.remove();
    }, [isOpen]);

    return (
      <Pressable onPress={openBottomSheet}>
        {children}
        <BottomSheetModal
          ref={bottomSheetModalRef}
          snapPoints={[snapPoints]}
          backgroundStyle={styles.bottom}
          handleIndicatorStyle={styles.indicator}
          style={styles.modal}
          onChange={index => setIsOpen(index >= 0)}
          onDismiss={() => setIsOpen(false)}
        >
          <View style={styles.bottomSheetContent}>
            <View style={styles.placeholder}>{placeholder}</View>
            {options.map(option => (
              <Pressable
                key={option.id}
                onPress={() => handleOptionPress(option)}
                style={styles.textWrapper}
                disabled={!!option.temporarily_unavailable ?? false}>
                <Text
                  style={[
                    styles.cityText,
                    value === option.id && styles.selectedOption,
                    option.temporarily_unavailable && styles.temporarilySpot,
                  ]}>
                  {option.name}
                </Text>
                {option.temporarily_unavailable ? (
                  <Text style={styles.temporarily}>Тимчасово недоступно</Text>
                ) : null}
              </Pressable>
            ))}
          </View>
        </BottomSheetModal>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  dropDownContent: {
    width: nw(365),
    backgroundColor: 'transparent',
  },
  whiteText: {
    color: 'white',
  },
  textWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  temporarilySpot: {
    color: 'grey',
  },
  bottomSheetContent: {
    backgroundColor: '#1C1C1C',
    height: nh(190),
    paddingLeft: nw(15),
    width: nw(365),
    borderRadius: 10,
  },
  temporarily: {
    color: 'orange',
    fontWeight: '600',
    fontSize: nh(12),
    fontFamily: 'MontserratRegular',
  },
  cityText: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(15),
    fontWeight: '400',
    lineHeight: 18,
    color: 'white',
    marginBottom: nh(10),
  },
  modal: {
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: nh(20),
    marginTop: nh(15),
    color: 'white',
  },
  bottom: {
    backgroundColor: 'transparent',
    borderRadius: 15,
  },
  indicator: {
    backgroundColor: 'transparent',
  },
  errorContainer: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    backgroundColor: 'rgb(205, 56, 56)',
    position: 'absolute',
    right: 0,
    top: 45,
  },
  errorText: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(12),
    color: 'white',
    fontWeight: '500',
  },
  selectedOption: {
    color: 'yellow',
  },
});
