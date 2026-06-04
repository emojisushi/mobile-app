import React from 'react';
import {StyleSheet, View} from 'react-native';
import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {Navigation} from './src/components/navigation/Navigation';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

import ClosedRestaurant from './src/components/ClosedRestaurantModal/ClosedRestaurant.tsx';
import * as Sentry from '@sentry/react-native';
import ErrorScreen from './src/components/ErrorScreen/ErrorScreen.tsx';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import {agent} from './APIClient.tsx';
import OldAppVersion from '~/components/OldAppVersion/OldAppVersion.tsx';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import {enableScreens} from 'react-native-screens';
enableScreens(true);
const linking = {
  prefixes: ['emojisushi://'],
  config: {
    screens: {
      HomeNavigation: {
        screens: {
          PaymentStatusScreen: {
            path: 'payment',
            parse: {
              orderId: (orderId: string) => orderId,
              paymentUrl: (paymentUrl: string) => paymentUrl,
              order_id: (order_id: string) => order_id,
              wait_time: (wait_time: string) => +wait_time,
            },
          },
        },
      },
    },
  },
};
const AppTheme = {
  dark: true,
  colors: {
    primary: '#FFE600',
    background: '#141414',
    card: '#171717',
    text: '#FFFFFF',
    border: '#272727',
    notification: '#FFE600',
  },
};
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10,
    },
  },
});
Sentry.init({});
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});
function App() {
  return (
    <Sentry.ErrorBoundary
      onError={(error, componentStack) =>
        agent.axiosClient.post('/log', {
          // @ts-ignore
          error: error.message,
          stack: componentStack,
        })
      }
      fallback={({resetError}) => <ErrorScreen resetError={resetError} />}>
      <GestureHandlerRootView>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer linking={linking as never} theme={AppTheme}>
            <BottomSheetModalProvider>
              <View style={styles.container}>
                <OldAppVersion>
                  <SafeAreaProvider initialMetrics={initialWindowMetrics}>
                    <Navigation />
                  </SafeAreaProvider>
                  <ClosedRestaurant />
                </OldAppVersion>
              </View>
            </BottomSheetModalProvider>
          </NavigationContainer>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </Sentry.ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#141414',
    flex: 1,
  },
  bottomSheetContent: {
    padding: 20,
    backgroundColor: '#fff',
  },
});

export default Sentry.wrap(App);
