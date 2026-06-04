import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {nh, nw} from '~/common/normalize.helper.ts';

import {Header, Category, Banner, Search, ProductCard} from '~/components';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  productsQuery,
  DEFAULT_PRODUCT_LIMIT,
} from '~/Screens/Home/products.query.ts';
import {Product} from '~/models/Product.ts';
import {categoriesQuery} from '~/Screens/Category/categories.query.ts';
import {IProduct} from '~/api';
import {wishlistQuery} from '~/Screens/Favourite/wishlist.query.ts';
import {observer} from 'mobx-react-lite';
import store from '~/stores/store.ts';
import {bannerQuery} from '~/components/Banner/banner.query.ts';
import Spinner from 'react-native-loading-spinner-overlay';
import {
  CART_STORAGE_KEY,
  cartQuery,
  removeOldProducts,
} from '~/Screens/Cart/cart.query.ts';

const HomeScreen = observer(({navigation}: {navigation: any}) => {
  const [visibleCount, setVisibleCount] = useState(5);

  const queryClient = useQueryClient();
  store.changeNavigation(navigation);
  const {data: wishlists, isLoading: isWishlistLoading} = useQuery(
    wishlistQuery(store.city),
  );

  const {data: cartQueryRes} = useQuery(cartQuery(store.city));
  const {data: categoryQueryRes, isLoading: isCategoryLoading} = useQuery({
    ...categoriesQuery(),
  });
  const {data: bannerRes} = useQuery(bannerQuery);
  const banners = (bannerRes?.data || []).map(banner => banner);

  const {data: productQueryRes, isLoading: isProductsLoading} = useQuery(
    productsQuery({
      category_slug: 'menu',
      limit: DEFAULT_PRODUCT_LIMIT,
    }),
  );
  const cartIds = Object.keys(cartQueryRes || {});
  const {mutate: removeOldProductsMutation} = useMutation({
    mutationFn: ({ids, city}: {ids: string[]; city: string}) =>
      removeOldProducts({ids, city}),
    onSuccess: (data, variables) =>
      queryClient.invalidateQueries(cartQuery(variables.city)),
  });

  useEffect(() => {
    if (cartIds.length > 0) {
      const existProductsIds = (productQueryRes?.data || []).map(item =>
        String(item.id),
      );

      const notExistProducts = cartIds.filter(
        cartId => !existProductsIds.includes(cartId),
      );
      if (notExistProducts.length > 0) {
        removeOldProductsMutation({ids: notExistProducts, city: store.city});
      }
    }
  }, [productQueryRes]);

  const belongsToCategory = (product: IProduct) => {
    return !!product.categories
      .filter(category =>
        store.city === 'chorno' ? category.slug !== 'pitsa' : true,
      )
      .find(category => category.slug === store.categorySlug);
  };

  const categoryItems = (productQueryRes?.data || []).filter(belongsToCategory);

  const items = categoryItems.map(item => new Product(item));

  const selectedCategory = (categoryQueryRes?.data || []).find(category => {
    return category.slug === store.categorySlug;
  });
  const isLoading = isWishlistLoading || isCategoryLoading || isProductsLoading;
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await queryClient.refetchQueries();
    } finally {
      setRefreshing(false);
    }
  }, []);
  return (
    <View style={styles.container}>
      <Spinner
        visible={isLoading || refreshing}
        textContent={'Зачекайте...'}
        textStyle={{color: 'yellow'}}
        overlayColor="rgba(0, 0, 0, 0.75)"
      />
      <Header />
      <View style={styles.productsWrapper}>
        <FlatList
          ListHeaderComponent={
            <View>
              {banners.length > 0 && <Banner navigation={navigation} />}
              <View style={styles.searchWrapper}>
                <Pressable onPress={() => navigation.navigate('SearchModal')}>
                  <View pointerEvents="none">
                    <Search onSearch={() => ''} editable={false} />
                  </View>
                </Pressable>
              </View>
              <Category />
              <Text style={styles.product}>{selectedCategory?.name}</Text>
            </View>
          }
          data={items?.slice(0, visibleCount) ?? []}
          onEndReached={() => setVisibleCount(prev => prev + 5)}
          keyExtractor={item => String(item.id)}
          renderItem={({item}) => (
            <ProductCard
              navigation={navigation}
              wishlists={wishlists}
              product={item}
            />
          )}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#141414',
    flex: 1,
  },
  grid: {
    display: 'flex',
    paddingBottom: nh(120),
    width: nw(365),
    alignItems: 'center',
  },
  scrollContent: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: nh(20),
  },
  product: {
    fontFamily: 'MontserratRegular',
    color: 'white',
    fontWeight: '600',
    fontSize: nh(20),
    lineHeight: 24,
    marginBottom: nh(15),
    width: nw(365),
  },
  searchWrapper: {
    marginTop: nh(25),
    marginBottom: nh(20),
  },
  productsWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
});

export default HomeScreen;
