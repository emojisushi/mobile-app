import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {nh, nw} from '~/common/normalize.helper.ts';
import {fuzzySearch} from '~/common/utils/fuzzySearch';
import {Search} from '../Search/Search';
import Caret from '~/assets/Icons/Caret.svg';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type TAutocompleteItem = {
  searchText: string;
  id: number;
  name: string;
};

type TAutocompleteProps = {
  placeholder?: string;
  noResultsText?: string;
  typeMoreText?: string;
  minLength?: number;
  onChange: (value: number | null) => void;
  value: string | number | null;
  error?: string | null;
  data?: TAutocompleteItem[];
  duplicates?: boolean;
};

const AutocompleteComponent = ({
  placeholder = '',
  noResultsText = 'Нічого не знайдено',
  typeMoreText = 'Введіть ще символи',
  minLength = 3,
  onChange,
  value = null,
  error = null,
  data = [],
  duplicates = true,
}: TAutocompleteProps) => {
  const [searchText, setSearchText] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const searchRef = useRef<TextInput>(null);

  useEffect(() => {
    if (value == null || data.length === 0) {
      return;
    }

    const selected = data.find(el => el.id == value);

    if (!selected) {
      onChange(null);
      return;
    }

    if (selected.name !== searchText) {
      setDisplayText(selected.name);
    }
    setConfirmed(true);
  }, [value, data]);

  const filteredData = useMemo(() => {
    const results = fuzzySearch(data, searchText, el => el.searchText, {
      maxAllowedModifications: 2,
      caseSensitive: false,
    }).slice(0, 25);

    if (duplicates) {
      return results;
    }

    return results.filter(
      (item, index, self) =>
        index === self.findIndex(a => a.name === item.name),
    );
  }, [searchText, data, duplicates]);

  const handleSelect = (item: TAutocompleteItem) => {
    setConfirmed(true);
    setDisplayText(item.name);
    setSearchText('');
    setShowDropdown(false);
    Keyboard.dismiss();
    onChange(item.id);
  };

  const handleChangeText = (text: string) => {
    setConfirmed(false);
    setSearchText(text);
  };

  const handleOpen = () => {
    setSearchText('');
    setShowDropdown(true);
  };

  const handleClose = () => {
    setShowDropdown(false);
    setSearchText('');
    if (!confirmed) {
      setDisplayText('');
      onChange(null);
    }
  };

  const handleModalShow = useCallback(() => {
    setTimeout(() => {
      searchRef.current?.focus();
    }, 50);
  }, []);

  const trimmed = searchText.trim();
  const showResults = filteredData.length > 0 && trimmed.length >= minLength;
  const showHint = trimmed.length < minLength;
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={handleOpen}
        style={[styles.input, !!error && styles.inputError]}>
        <Text
          style={[styles.inputText, {color: displayText ? 'white' : '#616161'}]}
          numberOfLines={3}>
          {displayText || placeholder}
        </Text>
      </Pressable>

      <Modal
        visible={showDropdown}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
        onShow={handleModalShow}>
        <Pressable
          style={[styles.modalOverlay, {paddingTop: insets.top}]}
          onPress={handleClose}>
          <Pressable style={styles.container} onPress={() => {}}>
            {/* <Pressable style={styles.hideBtn} onPress={handleClose}>
              <Caret
                style={styles.caret}
                width="21"
                height="21"
                color="black"
              />
            </Pressable> */}

            <View style={styles.searchContainer}>
              <Pressable style={styles.hideBtn} onPress={handleClose}>
                <Caret
                  style={styles.caret}
                  width="21"
                  height="21"
                  color="black"
                />
              </Pressable>
              <Search
                onSearch={handleChangeText}
                autoFocus={false}
                inputRef={searchRef}
              />
            </View>

            {showHint ? (
              <View style={styles.noResultSearch}>
                <Text style={styles.noResultText}>{typeMoreText}</Text>
              </View>
            ) : showResults ? (
              <ScrollView
                keyboardShouldPersistTaps="handled"
                style={styles.list}>
                {filteredData.map(item => (
                  <Pressable
                    key={String(item.id)}
                    style={({pressed}) => [
                      styles.dropdownItem,
                      pressed && styles.dropdownItemPressed,
                    ]}
                    onPress={() => handleSelect(item)}>
                    <Text style={styles.dropdownText}>{item.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noResultSearch}>
                <Text style={styles.noResultText}>{noResultsText}</Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {!!error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

export const Autocomplete = memo(AutocompleteComponent);

const styles = StyleSheet.create({
  wrapper: {
    width: nw(250),
  },
  inputText: {
    color: 'white',
    fontFamily: 'MontserratRegular',
    fontSize: nh(14),
  },
  input: {
    height: nh(47),
    backgroundColor: '#272727',
    borderRadius: 10,
    paddingHorizontal: nw(10),
    color: 'white',
    fontFamily: 'MontserratRegular',
    fontSize: nh(14),
    display: 'flex',
    justifyContent: 'center',
  },

  inputError: {
    borderWidth: 1,
    borderColor: 'rgb(205, 56, 56)',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  container: {
    flex: 1,
    backgroundColor: '#141414',
  },

  searchContainer: {
    backgroundColor: '#171717',
    height: nh(100),
    paddingTop: nh(47),
    alignItems: 'center',
    justifyContent: 'center',
  },

  list: {
    borderRadius: 10,
  },

  dropdownItem: {
    paddingVertical: nh(12),
    paddingHorizontal: nw(15),
    borderBottomWidth: 1,
    borderBottomColor: '#272727',
  },

  dropdownItemPressed: {
    backgroundColor: '#272727',
  },

  dropdownText: {
    color: 'white',
    fontFamily: 'MontserratRegular',
    fontSize: nh(14),
  },

  noResultSearch: {
    marginTop: nh(100),
    alignItems: 'center',
  },

  noResultText: {
    color: '#727272',
    fontSize: nh(14),
    fontFamily: 'MontserratRegular',
    fontWeight: '500',
    width: nw(200),
    textAlign: 'center',
    marginTop: nh(15),
  },

  errorContainer: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    backgroundColor: 'rgb(205, 56, 56)',
    position: 'absolute',
    right: 0,
    top: nh(47),
  },

  errorText: {
    color: 'white',
    fontFamily: 'MontserratRegular',
    fontSize: nh(12),
    fontWeight: '500',
  },
  caret: {
    transform: [{rotate: '90deg'}],
  },
  hideBtn: {
    position: 'absolute',
    top: nw(15),
    left: nw(13),
    width: nw(31),
    height: nw(31),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFE600',
    borderRadius: 5,
    zIndex: 100,
  },
});
