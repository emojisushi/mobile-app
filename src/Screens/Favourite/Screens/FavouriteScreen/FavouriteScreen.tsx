import React from 'react';
import {FlatList, Image, StyleSheet, Text, View} from 'react-native';
import {nh, nw} from '~/common/normalize.helper.ts';
import {Header, ProductCard} from '~/components';
import {useQuery} from '@tanstack/react-query';
import {wishlistQuery} from '~/Screens/Favourite/wishlist.query.ts';
import {Product} from '~/models/Product.ts';
import {
  DEFAULT_PRODUCT_LIMIT,
  productsQuery,
} from '~/Screens/Home/products.query.ts';

import NoResult from '~/assets/Icons/NoResultSearch.png';
import store from '~/stores/store.ts';
import {observer} from 'mobx-react-lite';

const FavouriteScreen = observer(({navigation}: {navigation: any}) => {
  const {data: wishlists, isLoading: isWishlistLoading} = useQuery(
    wishlistQuery(store.city),
  );
  const {data: productQueryRes, isLoading: isProductsLoading} = useQuery(
    productsQuery({
      category_slug: 'menu',
      limit: DEFAULT_PRODUCT_LIMIT,
    }),
  );
  const idsWishlist = Object.keys(wishlists || {});
  const items = (productQueryRes?.data || []).filter(item =>
    idsWishlist.includes(String(item.id)),
);
  const wishlist = items.map(item => new Product(item));

  return (
    <View style={styles.container}>
      <Header />
      {wishlist.length === 0 ? (
        <View style={styles.noResultContainer}>
          <Image
            source={NoResult}
            style={{width: nw(200), height: nh(200), tintColor: '#393939'}}
            resizeMode="contain"
          />
          <Text style={[styles.noResultText]}>
            Вибрані товари не знайдено
          </Text>
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={<Text style={styles.text}>Вибране</Text>}
          data={wishlist}
          renderItem={({item}) => (
            <ProductCard
              navigation={navigation}
              wishlists={wishlists}
              product={item}
            />
          )}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#141414',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  grid: {
    display: 'flex',
    paddingBottom: nh(120),
    width: nw(365),
    alignItems: 'center',
  },
  containerScroll: {},
  text: {
    color: 'white',
    fontFamily: 'MontserratRegular',
    fontWeight: '600',
    fontSize: nh(20),
    lineHeight: nw(24),
    marginBottom: nh(15),
    marginTop: nh(30),
    width: nw(365),
  },
  noResultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultText: {
    color: '#727272',
    fontSize: nh(14),
    fontFamily: 'MontserratRegular',
    fontWeight: '500',
    width: nw(200),
    textAlign: 'center',
  },
});

export default FavouriteScreen;
