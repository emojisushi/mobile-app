import React from 'react';
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import {version} from '../../../package.json';
import Spinner from 'react-native-loading-spinner-overlay/lib';
import {useQuery} from '@tanstack/react-query';
import {appAllowedVersion} from '~/common/queries/appAllowedVersion.query';

type Props = {
  children?: React.ReactNode;
};

const OldAppVersion = ({children}: Props) => {
  const {data, isLoading} = useQuery(appAllowedVersion);
  const latestVersion =
    (Platform.OS === 'ios' ? data?.ios : data?.android) ?? '';
  const link =
    (Platform.OS === 'ios' ? data?.ios_link : data?.android_link) ?? '';
  const isOutdated = latestVersion
    ? version.localeCompare(latestVersion, undefined, {
        numeric: true,
        sensitivity: 'base',
      }) < 0
    : false;
  if (isLoading)
    {return (
      <Spinner
        visible={isLoading}
        textContent={'Зачекайте...'}
        textStyle={{color: 'yellow'}}
        overlayColor="rgba(0, 0, 0, 0.75)"
      />
    );}

  if (isOutdated)
    {return (
      <View style={styles.container}>
        <Text style={styles.title}>Ваша версія додатку застаріла</Text>
        <Text style={styles.version}>Версія: {version}</Text>
        <Text style={styles.instruction}>
          Будь ласка, оновіть додаток до останньої версії.
        </Text>
        {link && (
          <Pressable
            style={styles.button}
            onPress={() => {
              Linking.openURL(link);
            }}>
            <Text style={styles.buttonText}>Оновити</Text>
          </Pressable>
        )}
      </View>
    );}

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#141414',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#FFFFFF',
  },
  version: {
    marginBottom: 10,
    color: 'gray',
  },
  instruction: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFFFFF',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#FFE600',
    borderRadius: 6,
  },
  buttonText: {
    fontWeight: '600',
    color: 'black',
  },
});
export default OldAppVersion;
