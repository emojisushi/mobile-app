import HomeScreen from '~/Screens/Home/Screens/HomeScreen/HomeScreen.tsx';
import {createStackNavigator} from '@react-navigation/stack';
import ProductModal from '~/Screens/Home/Screens/Modals/ProductModal.tsx';
import SearchModal from '~/Screens/Home/Screens/Modals/SearchModal.tsx';
import ThankYou from '~/Screens/Cart/Screens/CartScreen/ThankYou.tsx';
import {PaymentStatusScreen} from '../Cart/Screens/PaymentScreen/PaymentStatusScreen';

type ScreenProps = {
  Home: undefined;
  ProductModal: undefined;
  SearchModal: undefined;
  ThankYou: undefined;
  PaymentStatusScreen: {paymentUrl: string; orderId: number};
};
const HomeNavigation = () => {
  const Stack = createStackNavigator<ScreenProps>();
  const stackOptions = {
    headerShown: false,
  };

  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="PaymentStatusScreen" component={PaymentStatusScreen} options={{headerShown: false}}/>
      <Stack.Group screenOptions={stackOptions}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ThankYou" component={ThankYou} />
      </Stack.Group>
      <Stack.Group
        screenOptions={{
          presentation: 'card',
          headerShown: false,
          animationTypeForReplace: 'push',
        }}>
        <Stack.Screen name="ProductModal" component={ProductModal} />
        <Stack.Screen name="SearchModal" component={SearchModal} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default HomeNavigation;
