import React from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Header, BackButton, Counter} from '~/components';
import {nh, nw} from '~/common/normalize.helper.ts';

import Heart from '~/assets/Icons/Heart.svg';
import {Product} from '~/models/Product.ts';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  addItem,
  CART_STORAGE_KEY,
  cartQuery,
} from '~/Screens/Cart/cart.query.ts';
import {
  addToWishlist,
  WISHLIST_STORAGE_KEY,
  wishlistQuery,
} from '~/Screens/Favourite/wishlist.query.ts';

import NullImage from '~/assets/Logo.svg';
import store from '~/stores/store.ts';
import {observer} from 'mobx-react-lite';
import {
  DEFAULT_PRODUCT_LIMIT,
  productsQuery,
} from '~/Screens/Home/products.query.ts';
import {IProduct} from '~/api';

const ProductModal = observer(
  ({route, navigation}: {route: any; navigation: any}) => {
    const {data: itemRes} = useQuery(
      productsQuery({
        category_slug: 'menu',
        limit: DEFAULT_PRODUCT_LIMIT,
      }),
    );
    const queryClient = useQueryClient();
    const id = route.params.product || [];
    const item: IProduct | undefined = (itemRes?.data || []).find(
      i => i.id === id,
    );
    if (!item) {
      throw new Error('undefined product');
    }
    const product = new Product(item);

    const {data: wishlists} = useQuery(wishlistQuery(store.city));

    const {data: cart} = useQuery(cartQuery(store.city));
    const {mutate: cartMutation} = useMutation({
      mutationFn: ({count, price}: {count: number; price: number}) =>
        addItem(product.id, count, price, store.city),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [CART_STORAGE_KEY, store.city],
        });
      },
    });
    const price = product?.getOldPrice(undefined)?.price_formatted;
    const discountPrice = product?.getNewPrice(undefined)?.price_formatted;

    const count = cart?.[product.id]?.count || 0;

    const storagePrice = product?.getNewPrice(undefined)?.price;
    const onHandleAdd = () => {
      cartMutation({
        count: count + 1,
        price: storagePrice ? storagePrice / 100 : 0,
      });
    };
    const onHandleMinus = () => {
      cartMutation({
        count: Math.max(count - 1, 0),
        price: storagePrice ? storagePrice / 100 : 0,
      });
    };
    const {mutate: addWishlist} = useMutation({
      mutationFn: ({id}: {id: number}) => addToWishlist(id, store.city),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [WISHLIST_STORAGE_KEY, store.city],
        });
      },
    });
    const wishIds = Object.keys(wishlists || {});
    const favourite = wishIds.includes(String(product.id));

    const handleFavouriteButton = () => {
      addWishlist({
        id: product.id,
      });
    };

    return (
      <View style={[styles.container]}>
        {/* <Header dropdownVisible={false} /> */}
        <Header showBackButton={true} navigation={navigation} dropdownVisible={false} headerVisible={false} />
        <View style={styles.container}>
          <View style={styles.productContainer}>
            {product.mainImage ? (
              <Image source={{uri: product.mainImage}} style={styles.image} />
            ) : (
              <NullImage width={nw(265)} height={nh(171)} opacity={0.2} />
            )}
            <View style={styles.heartTitleWrapper}>
              <View style={styles.titleWrapper}>
                <Text style={styles.productTitle}>{product.name}</Text>
                <Text style={styles.weightText}>{product.weight}г</Text>
              </View>
              <Pressable
                style={styles.heartBtn}
                onPress={handleFavouriteButton}>
                <Heart width={nw(20)} color={favourite ? 'yellow' : 'white'} />
              </Pressable>
            </View>
            <View
              style={[
                styles.horizontalBar,
                {marginTop: nh(15), marginBottom: nh(15)},
              ]}
            />
            <View style={styles.priceWrapper}>
              <Text style={styles.price}>
                {discountPrice ? discountPrice : price}
              </Text>
              <Text style={styles.discountPrice}>
                {discountPrice ? price : ''}
              </Text>
            </View>
            <View
              style={[
                styles.horizontalBar,
                {marginTop: nh(15), marginBottom: nh(15)},
              ]}
            />
            <Text style={styles.whiteText}>
              {product.ingredients.length === 0 ? '' : 'Інгредієнти'}
            </Text>
            <FlatList
              style={{marginTop: nh(10), height: nh(160)}}
              data={product.ingredients}
              renderItem={ingredient => (
                <View style={styles.dotWrapper}>
                  <View style={styles.dot} />
                  <Text style={styles.ingredientsText}>{ingredient.item}</Text>
                </View>
              )}
              keyExtractor={ingredient => ingredient}
            />
            {count > 0 ? (
              <View style={{marginTop: nh(30)}}>
                <Counter
                  onHandleMinus={onHandleMinus}
                  onHandleAdd={onHandleAdd}
                  count={count}
                />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => onHandleAdd()}>
                <Text style={styles.blackText}>Купити зараз</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#141414',
    width: '100%',
    height: '100%',
  },
  image: {
    width: nw(265),
    height: nh(171),
    objectFit: 'contain',
  },
  productContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  productTitle: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(16),
    color: 'white',
    fontWeight: '500',
  },
  weightText: {
    fontFamily: 'MontserratRegular',
    fontSize: nh(14),
    color: '#727272',
    fontWeight: '400',
    marginLeft: nw(10),
    lineHeight: 17,
  },
  titleWrapper: {
    display: 'flex',
    flexDirection: 'row',
  },
  heartTitleWrapper: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: nh(34),
    justifyContent: 'space-between',
    width: nw(365),
    alignItems: 'center',
  },
  heartBtn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 30,
    width: nw(35),
    height: nw(35),
  },
  horizontalBar: {
    width: '100%',
    height: nh(1),
    backgroundColor: '#202020',
  },
  priceWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: nw(365),
  },
  dotWrapper: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: nw(15),
  },
  dot: {
    backgroundColor: 'white',
    width: nw(3),
    height: nw(3),
    borderRadius: 10,
  },
  price: {
    fontSize: nh(18),
    fontWeight: '600',
    lineHeight: 18,
    color: 'white',
  },
  discountPrice: {
    fontSize: nh(14),
    color: '#727272',
    fontWeight: '600',
    lineHeight: 15,
    marginLeft: nw(5),
    textDecorationLine: 'line-through',
  },
  whiteText: {
    fontSize: nh(15),
    fontFamily: 'MontserratRegular',
    color: 'white',
    width: nw(365),
  },
  ingredientsText: {
    fontSize: nh(14),
    fontFamily: 'MontserratRegular',
    color: 'white',
    width: nw(365),
    marginLeft: nw(5),
  },
  addBtn: {
    width: nw(365),
    height: nh(44),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'yellow',
    borderRadius: 10,
    marginTop: nh(30),
  },
  blackText: {
    color: 'black',
    fontFamily: 'MontserratRegular',
    fontSize: nh(14),
    fontWeight: '600',
  },
});

export default ProductModal;
