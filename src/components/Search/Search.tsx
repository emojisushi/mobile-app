import React, {useState} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import {nh, nw} from '~/common/normalize.helper.ts';

import MagnifyingGlass from '~/assets/Icons/MagnifyingGlass.svg';

export const Search = ({
  editable,
  autoFocus,
  onSearch,
  inputRef,
}: {
  editable?: boolean;
  autoFocus?: boolean;
  onSearch: (value: string) => void;
  inputRef?: React.RefObject<TextInput>;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={styles.container}>
      <MagnifyingGlass style={styles.magnify} />
      <TextInput
        ref={inputRef}
        maxLength={30}
        onChangeText={e => onSearch(e)}
        onFocus={() => setIsFocused(!isFocused)}
        onBlur={() => setIsFocused(false)}
        editable={editable}
        scrollEnabled={false}
        multiline={false}
        placeholderTextColor="#3F3F3F"
        style={[styles.input, isFocused && styles.focused]}
        placeholder="Шукати..."
        autoFocus={autoFocus}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: nw(365),
    height: nh(40),
    backgroundColor: '#1C1C1C',
    borderRadius: nw(10),
    position: 'relative',
  },
  magnify: {
    position: 'absolute',
    top: nh(10),
    left: nw(10),
  },
  input: {
    paddingLeft: nw(35),
    lineHeight: 18,
    height: '100%',
    fontSize: nh(12),
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 10,
    color: 'white',
  },
  focused: {
    borderColor: 'yellow',
  },
});
