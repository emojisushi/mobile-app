import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {nh, nw} from '../../../normalize.helper.ts';

import Counter from '../Counter/Counter.tsx';

import Heart from '../../assets/Icons/Heart.svg';
import {Product} from '../../models/Product.ts';
import {IGetWishlistRes} from '@layerok/emojisushi-js-sdk';
import {useAddToWishlist} from '../../common/hooks/use-add-to-wishlist.ts';
import Logo from '../../assets/Logo.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

export const CART_STORAGE_KEY = 'cart';
export const CART_QUERY_KEY = ['cart'];
export const cartQuery = {
  queryKey: CART_QUERY_KEY,
  queryFn: () => getItems(),
};
export const getItems = async (): Promise<Record<string, any>> => {
  const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

export const addItem = async (id: number, count: number, price: number) => {
  const currentCart = await getItems();
  if (count === 0) {
    const {[id]: _, ...remainingCart} = currentCart;
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(remainingCart));
  } else {
    const updatedCart = {...currentCart, [id]: {count: count, price: price}};
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
  }

  return await getItems();
};
const ProductCard = ({
  product,
  wishlists,
}: {
  product: Product;
  wishlists?: IGetWishlistRes;
}) => {
  const queryClient = useQueryClient();
  const {data: cart} = useQuery(cartQuery);
  const count = cart?.[product.id]?.['count'] || 0;
  const {mutate} = useMutation({
    mutationFn: ({count, price}: {count: number; price: number}) =>
      addItem(product.id, count, price),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: CART_QUERY_KEY});
    },
  });
  const favourite = product?.isInWishlists(wishlists || []);

  // todo: wishlist client-side

  const {mutate: addToWishlist} = useAddToWishlist();
  const price = product?.getOldPrice(undefined)?.price_formatted;
  const discountPrice = product?.getNewPrice(undefined)?.price_formatted;

  const storagePrice = product?.getNewPrice(undefined)?.price;
  const onHandleAdd = () => {
    mutate({count: count + 1, price: storagePrice ? storagePrice / 100 : 0});
  };
  const onHandleMinus = () => {
    mutate({
      count: Math.max(count - 1, 0),
      price: storagePrice ? storagePrice / 100 : 0,
    });
  };

  const handleFavouriteButton = () => {
    addToWishlist({
      product_id: product.id,
      quantity: 1,
    });
  };
  const descriptionThreeWords = (str: string | null) => {
    if (str === '' || str === null) {
      return false;
    }
    const words: string[] = str.split(',').map(word => word.trim());
    let result: string[] = words.slice(0, 3);
    if (words.length > 3) {
      return result.join(', ') + '...';
    }
    return result.join(', ');
  };
  return (
    <View style={styles.wrapper}>
      <Text style={styles.weight}>{product.weight} г</Text>
      <Pressable onPress={handleFavouriteButton} style={styles.heartContainer}>
        <Heart width="14" height="12" color={favourite ? 'yellow' : 'white'} />
      </Pressable>

      <View style={styles.imageDescriptionWrapper}>
        {product.mainImage !== undefined ? (
          <Image style={styles.image} source={{uri: product?.mainImage}} />
        ) : (
          <Logo style={styles.svg} fillOpacity={0.1} />
        )}
        <View style={styles.textWrapper}>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.description}>
            {descriptionThreeWords(product.descriptionShort)}
          </Text>
        </View>
      </View>
      <View style={styles.priceAndButtonContainer}>
        <View style={styles.priceContainer}>
          <Text style={styles.discountPrice}>{discountPrice ? price : ''}</Text>
          <Text style={styles.price}>
            {discountPrice ? discountPrice : price}
          </Text>
        </View>
        <Counter
          onHandleMinus={onHandleMinus}
          onHandleAdd={onHandleAdd}
          count={count}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#1C1C1C',
    width: nw(365),
    height: nh(150),
    borderRadius: nw(10),
    position: 'relative',
    marginBottom: nh(15),
    display: 'flex',
  },
  image: {
    width: nw(111),
    height: nh(68),
    marginTop: nh(20),
    marginLeft: nw(15),
    objectFit: 'contain',
  },
  svg: {
    width: nw(111),
    height: nh(68),
    marginTop: nh(20),
    marginLeft: nw(15),
  },
  imageDescriptionWrapper: {
    display: 'flex',
    flexDirection: 'row',
  },
  textWrapper: {
    marginTop: nh(20),
    marginLeft: nw(15),
  },
  weight: {
    position: 'absolute',
    backgroundColor: '#141414CC',
    opacity: 80,
    padding: nw(5),
    borderRadius: 10,
    zIndex: 1,
    marginLeft: nw(5),
    marginTop: nh(5),
    height: nh(25),
    fontSize: 12,
    color: 'white',
  },
  heartContainer: {
    width: nw(30),
    height: nh(30),
    position: 'absolute',
    backgroundColor: '#141414CC',
    opacity: 80,
    borderRadius: 20,
    zIndex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: nh(5),
    left: nw(105),
  },
  title: {
    color: 'white',
    fontFamily: 'MontserratRegular',
    fontWeight: '400',
    lineHeight: 17,
    fontSize: 14,
    width: nw(200),
  },
  description: {
    fontSize: 12,
    fontFamily: 'MontserratRegular',
    fontWeight: '300',
    overflow: 'hidden',
    color: '#838383',
    width: nw(190),
    height: nh(32),
  },
  button: {
    width: nw(35),
    height: nh(35),
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceAndButtonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: nh(17),
    marginLeft: nw(15),
    marginRight: nw(10),
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    color: 'white',
  },
  discountPrice: {
    fontSize: 12,
    color: '#727272',
    fontWeight: '600',
    lineHeight: 15,
    marginLeft: nw(5),
    textDecorationLine: 'line-through',
  },
});

export default ProductCard;
