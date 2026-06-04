import {AxiosRequestConfig} from 'axios';

export type IMeta = {
  total: number;
  offset?: number;
  limit?: number;
};

export type IFile = {
  content_type: string;
  created_at: string;
  description: null | string;
  disk_name: string;
  extension: string;
  field: string;
  file_name: string;
  file_size: number;
  id: number;
  path: string;
  sort_order: number;
  title: null | string;
  updated_at: string;
};

export type Nullable<Type> = Type | null;

export type ICategory = {
  id: number;
  name: string;
  slug: string;
  code: string;
  meta_title: string;
  meta_description: string;
  sort_order: number;
  google_product_category_id: null | number;
  inherit_property_groups: boolean;
  inherit_review_categories: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  parent_id: number | null;
  nest_left: number;
  nest_right: number;
  nest_depth: number;
  description: string;
  description_short: string;
  poster_id: number;
  published: boolean;
  hide_categories_in_spot: ISpot[];
  image: IFile | null;
};

export type IOption = {
  value: string;
  poster_id: string;
};

export type IProperty = {
  id: number;
  name: string;
  slug: string;
  type: string;
  unit: Nullable<string>;
  options: IOption[];
  created_at: Nullable<string>;
  updated_at: Nullable<string>;
  deleted_at: Nullable<string>;
  poster_id: number;
};

export type IPropertyValue = {
  id: number;
  product_id: number;
  variant_id: Nullable<number>;
  property_id: number;
  value: boolean;
  index_value: string;
  created_at: Nullable<string>;
  updated_at: Nullable<string>;
  property: IProperty;
};

export type IVariant = {
  id: number;
  product_id: number;
  user_defined_id: Nullable<number>;
  image_set_id: Nullable<number>;
  stock: Nullable<number>;
  reviews_rating: Nullable<string>;
  name: string;
  weight: Nullable<number>;
  length: Nullable<number>;
  width: Nullable<number>;
  height: Nullable<number>;
  published: boolean;
  sales_count: number;
  allow_out_of_stock_purchases: boolean;
  created_at: Nullable<string>;
  updated_at: Nullable<string>;
  deleted_at: Nullable<string>;
  mpn: Nullable<string>;
  gtin: Nullable<string>;
  description_short: Nullable<string>;
  description: Nullable<string>;
  poster_id: Nullable<number>;
  hashid: string;
  product: IProduct;
  prices: IPrice[];
  property_values: IPropertyValue[];
  additional_prices: IPrice[];
};

export type IImage = {
  id: number;
  disk_name: string;
  file_name: string;
  file_size: number;
  content_type: string;
  title: Nullable<string>;
  description: Nullable<string>;
  field: string;
  sort_order: number;
  created_at: Nullable<string>;
  updated_at: Nullable<string>;
  path: string;
  extension: string;
};

export type IImageSet = {
  id: number;
  name: string;
  product_id: number;
  is_main_set: 0 | 1;
  created_at: Nullable<string>;
  updated_at: Nullable<string>;
  images: IImage[];
};

export type IProduct = {
  id: number;
  brand_id: Nullable<number>;
  user_defined_id: Nullable<string>;
  name: string;
  slug: string;
  description_short: Nullable<string>;
  description: Nullable<string>;
  meta_title: Nullable<string>;
  meta_description: Nullable<string>;
  meta_keywords: Nullable<string>;
  additional_descriptions: Nullable<any[]>; //jsonable
  additional_properties: Nullable<any[]>; // jsonable
  is_favorite_: boolean;
  weight: Nullable<number>;
  width: Nullable<number>;
  height: Nullable<number>;
  length: Nullable<number>;
  quantity_default: Nullable<number>;
  quantity_min: Nullable<number>;
  quantity_max: Nullable<number>;
  stock: Nullable<number>;
  reviews_rating: Nullable<string>;
  links: Nullable<any[]>; // jsonable
  inventory_management_method: 'single' | 'variant';
  allow_out_of_stock_purchases: boolean;
  stackable: boolean;
  shippable: boolean;
  price_includes: boolean;
  group_by_property_id: Nullable<number>;
  published: boolean;
  sales_count: number;
  created_at: Nullable<string>;
  updated_at: Nullable<string>;
  deleted_at: Nullable<string>;
  mpn: Nullable<string>;
  gtin: Nullable<string>;
  embeds: Nullable<any[]>; //jsonable
  is_virtual: boolean;
  file_expires_after_days: Nullable<number>;
  file_max_download_count: Nullable<number>;
  file_session_required: boolean;
  poster_id: Nullable<number>;
  poster_type: Nullable<string>;
  hash_id: string;
  variants: IVariant[];
  property_values: IPropertyValue[];
  image_sets: IImageSet[];
  additional_prices: IPrice[];
  prices: IPrice[];
  categories: ICategory[];
  hide_products_in_spot: ISpot[];
};

export type IFilter = {
  id: number;
  name: string;
  slug: string;
  type: string;
  unit: Nullable<string>;
  options: any[];
  created_at: Nullable<string>;
  updated_at: Nullable<string>;
  deleted_at: Nullable<string>;
  poster_id: number;
  pivot: {
    property_group_id: number;
    property_id: number;
    use_for_variants: 0 | 1;
    filter_type: string;
    sort_order: Nullable<number>;
  };
};

export type IGetCategoriesParams = {
  offset?: number;
  limit?: number;
};

export type SortKey =
  | 'default'
  | 'bestseller'
  | 'ratings'
  | 'latest'
  | 'price_low'
  | 'price_high'
  | 'oldest';

export type IGetProductsParams = {
  filter?: string;
  category_slug?: string;
  search?: string;
  sort?: SortKey | null;
  offset?: number;
  limit?: number;
  wishlist_id?: number;
  wishlist?: boolean;
};

export type IGetCategoriesRes = {
  data: ICategory[];
  meta: {
    total: number;
    offset: Nullable<number>;
    limit: Nullable<number>;
  };
};

export type IGetProductsRes = {
  data: IProduct[];
  total: number;
  sort_options: string[];
  filters: IFilter[];
};

export type IGetCatalogRes = {
  categories: ICategory[];
  products: IProduct[];
  banners: Banner[];
  wishlists: IWishlist[];
  sort_options: string[];
};

export type IGetCheckoutFormRes = {
  payment_methods: IPaymentMethod[];
  shipping_methods: IShippingMethod[];
  spots: ISpot[];
};

export type ICartProduct = {
  quantity: number;
  product: IProduct;
  id: number;
  variant?: IVariant;
  product_id: number;
  variant_id?: number;
  price: Record<string, number>;
  price_formatted: null | string;
};

export type IGetCartRes = {
  data: ICartProduct[];
  total: string;
  totalQuantity: number;
};

export type IPaymentMethod = {
  id: number;
  name: string;
  code: string;
  description: null | string;
  instructions: null | string;
  payment_provider: string;
  sort_order: number;
  fee_label: null | string;
  fee_percentage: null | number;
  pdf_partial: null | string;
};

export type IGetPaymentMethodsRes = {
  data: IPaymentMethod[];
  meta: {
    total: number;
  };
};

export type IWishlistItem = {
  id: number;
  wishlist_id: number;
  product_id: number;
  variant_id: null | number;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export type IWishlist = {
  id: number;
  name: string;
  session_id: string;
  customer_id: null | number;
  created_at: string;
  updated_at: string;
  shipping_method_id: null | number;
  spot_id: null | number; // todo: remove this field from database, we don't need it anymore, session already knows about right spot_id
  items: IWishlistItem[];
  shipping_method: null | IShippingMethod;
};

export type IGetWishlistRes = IWishlist[];

export type ICurrency = {
  id: number;
  code: string;
  symbol: string;
  rate: number;
  decimals: number;
};

export type IPrice = {
  id: number;
  price: number;
  price_formatted: string;
  currency: ICurrency;
  category: Nullable<{
    sort_order: number;
    code: string;
  }>;
};

export type IShippingMethod = {
  id: number;
  name: string;
  description: string;
  sort_order: number;
  guaranteed_delivery_days: null | number;
  price_includes_tax: boolean;
  code: string;
  price_formatted: string | null;
  prices: IPrice[];
};

export type IGetShippingMethodsRes = {
  data: IShippingMethod[];
  meta: {
    total: number;
  };
};

export enum ShippingMethodCodeEnum {
  Takeaway = 'takeaway',
  Courier = 'courier',
}

export enum PaymentMethodCodeEnum {
  Cash = 'cash',
}

export type Banner = {
  id: number;
  image: IFile;
  image_small: IFile;
  is_active: boolean;
  product?: IProduct;
};

export type IGetBannersRes = {
  data: Banner[];
};

export type IRainLabUser = {
  id: number;
  name: Nullable<string>;
  email: string;
  permissions: Nullable<string>;
  is_activated: boolean;
  activated_at: Nullable<string>;
  last_login: Nullable<string>;
  created_at: Nullable<string>;
  updated_at: Nullable<string>;
  username: Nullable<string>;
  surname: Nullable<string>;
  deleted_at: Nullable<string>;
  last_seen: Nullable<string>;
  is_guest: 0 | 1;
  is_superuser: 0 | 1;
  created_ip_address: Nullable<string>;
  last_ip_address: Nullable<string>;
};

type IState = {
  id: number;
  name: string;
  code: string;
  country: ICountry;
};

type ICountry = {
  id: number;
  is_enabled: 0 | 1;
  name: string;
  code: string;
  is_pinned: 0 | 1;
  calling_code: string;
};

export type IAddress = {
  id: number;
  name: string;
  lines: string;
  zip: string;
  city: string;
  country: ICountry;
  company: Nullable<string>;
  state_id: Nullable<IState>;
  country_id: number;
  details: Nullable<string>;
};

export type IOrderCurrency = {
  id: number;
  code: string;
  symbol: string;
  rate: number;
  decimals: number;
  format: string;
  sort_order: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  rounding: unknown; // todo: check type
};

export type IOrderProduct = {
  id: number;
  order_id: number;
  product_id: number;
  variant_id: Nullable<number>;
  name: string;
  variant_name: Nullable<string>;
  description: Nullable<string>;
  quantity: number;
  price_pre_taxes: number;
  price_taxes: number;
  price_post_taxes: number;
  total_pre_taxes: number;
  total_taxes: number;
  total_post_taxes: number;
  tax_factor: number;
  weight: Nullable<number>;
  width: Nullable<number>;
  length: Nullable<number>;
  height: Nullable<number>;
  total_weight: Nullable<number>;
  stackable: boolean;
  shippable: boolean;
  property_values: Nullable<any[]>; // jsonable
  property_description: Nullable<any[]>; //  jsonable
  service_options: Nullable<any[]>; // jsonable
  custom_field_values: any[]; // jsonable
  brand: Nullable<any[]>;
  taxes: any[]; // jsonable
  item: IProduct & {
    price: IPrice;
  };
  created_at: Nullable<string>;
  updated_at: Nullable<string>;
  deleted_at: Nullable<string>;
  product: IProduct;
};

enum ORDER_STATES {
  NEW = 1,
  IN_PROGRESS = 2,
  DISPUTED = 3,
  CANCELLED = 4,
  COMPLETE = 5,
}

export type IOrder = {
  id: number;
  session_id: Nullable<string>;
  order_number: Nullable<number>;
  invoice_number: Nullable<string>;
  currency: IOrderCurrency;
  payment_state: string;
  order_state_id: ORDER_STATES;
  shipping_address_same_as_billing: Nullable<boolean>;
  billing_address: Nullable<IAddress>;
  shipping_address: Nullable<IAddress>;
  custom_fields: any[]; //jsonable
  shipping: null | {
    method: IShippingMethod; // todo: extend this type
    preTaxes: number;
    taxes: number;
    total: number;
    appliedDiscount: unknown; // todo: check type
  };
  taxes: any[]; // jsonable
  payment: {
    method: IPaymentMethod;
    preTaxes: number;
    taxes: number;
    total: number;
  };
  discounts: any[]; // jsonable
  payment_method_id: Nullable<number>;
  payment_id: Nullable<string>;
  payment_hash: Nullable<string>;
  total_shipping_pre_taxes: Nullable<number>;
  total_shipping_taxes: Nullable<number>;
  total_shipping_post_taxes: Nullable<number>;
  total_payment_pre_taxes: Nullable<number>;
  total_payment_taxes: Nullable<number>;
  total_payment_post_taxes: Nullable<number>;
  total_product_pre_taxes: Nullable<number>;
  total_product_taxes: Nullable<number>;
  total_product_post_taxes: Nullable<number>;
  total_taxes: Nullable<number>;
  total_pre_payment: Nullable<number>;
  total_pre_taxes: Nullable<number>;
  total_post_taxes: Nullable<number>;
  tracking_number: Nullable<string>;
  tracking_url: Nullable<string>;
  is_virtual: 0 | 1;
  credit_card_last4_digits: Nullable<number>;
  card_holder_name: Nullable<string>;
  card_type: Nullable<string>;
  lang: string;
  total_weight: Nullable<number>;
  customer_notes: Nullable<string>;
  admin_notes: Nullable<string>;
  payment_transaction_id: Nullable<string>;
  ip_address: Nullable<string>;
  customer_id: Nullable<number>;
  paid_at: Nullable<string>;
  delete_at: Nullable<string>;
  updated_at: Nullable<string>;
  shipped_at: Nullable<string>;
  spot_id: Nullable<number>;
  customer_payment_method_id: Nullable<number>;
  products: IOrderProduct[];
  order_state: IOrderState;
};

export type IOrderState = {
  id: number;
  name: string;
  description: string;
  color: string;
  sort_order: number;
  flag: string;
  created_at: Nullable<string>;
  updated_at: Nullable<string>;
  deleted_at: Nullable<string>;
};

export type ICustomer = {
  firstname: string;
  lastname: string;
  is_guest: boolean;
  default_shipping_address_id: number | null;
  default_billing_address_id: number | null;
  addresses: IAddress[];
  orders: IOrder[];
};

export type IUser = IRainLabUser & {
  offline_mall_customer_group_id: number | null;
  phone: string | null;
  customer: ICustomer | null;
  is_call_center_admin: boolean;
  bonus_amount: number;
  street: string | null;
  house_type: string | null;
  house: string | null;
  floor: string | null;
  apartment: string | null;
  entrance: string | null;
};

export type RegisterResData = {
  data: {
    expires: string;
    token: string;
    user: IUser;
  };
};

export type LoginResData = {
  data: {
    user: IUser;
    expires: string;
    token: string;
  };
};

export type IFetchUserResData = IUser;
export type unavailable_category = {
  id: number;
};

export type ISpot = {
  id: number;
  name: string;
  bot_id: number;
  chat_id: number;
  code: string;
  phones: string;
  address: string;
  published: number;
  created_at: string;
  updated_at: string;
  poster_id: number;
  html_content: string;
  google_map_url: string;
  slug: string;
  cover: null | string;
  photos: IFile[];
  city: ICity | null;
  frontend_url: string;
  is_main: boolean;
  district: IDistrict;
  temporarily_unavailable: boolean;
  unavailable_categories: unavailable_category[];
  unavailable_products: number[];
  wait_minutes_spot: number;
};

export type IDistrict = {
  id: number;
  name: string;
  spots: ISpot[];
  city: ICity;
  temporarily_unavailable: boolean;
};

export type ICity = {
  name: string;
  id: number;
  slug: string;
  spots: ISpot[];
  frontend_url: string;
  google_map_url: string;
  phones: string | null;
  html_content: string;
  districts: IDistrict[];
  temporarily_unavailable: boolean;
};

export type IGetCitiesParams = {
  includeSpots?: boolean;
  includeDistricts?: boolean;
  offset?: number;
  limit?: number;
};

export type IGetCitiesRes = {
  data: ICity[];
  meta: IMeta;
};

export type IGetSpotsRes = {
  data: ISpot[];
  meta: IMeta;
};

export type AxiosAuthRefreshRequestConfig = AxiosRequestConfig & {
  skipAuthRefresh?: boolean;
};

export type IProductHistoryItem = {
  product_id: string;
  product_sum: number;
  num: number;
};

export type IOrderHistory = {
  transaction_id: number;
  order_id: number;
  status: boolean;
  user_id: number;
  pay_type: number;
  products: IProductHistoryItem[];
  sum: number;
  date_start_new: string;
  address: string;
};

export type IGetOrderHistoryRes = IOrderHistory[];

export type IBonusHistory = {
  id: number;
  order_id: number;
  user_id: number;
  use_bonus_amount: number;
  receive_bonus_amount: number;
  created_at: string;
  updated_at: string;
};

export type IGetBonusHistoryRes = IBonusHistory[];

export type IGetBonusOptionsRes = {
  bonus_enabled: boolean;
  bonus_rate: number;
  max_bonus: number;
  get_bonus_from_used_bonus: boolean;
};

export type IGetAppAllowedVersionsRes = {
  android: string;
  ios: string;
  android_link: string;
  ios_link: string;
};

export type IGetContacts = {
  instagram_display_text: string;
  instagram_app: string;
  instagram_web: string;
  telegram_display_text: string;
  telegram_app: string;
  telegram_web: string;
};

export type IAddressAutocomplete = {
  buildings: string[];
  delivery_price: number;
  id: number;
  min: number;
  min_amount: number;
  name_ru: string;
  name_ua: string;
  recommended_products: number[];
  spot_name: string;
  suburb_ru: string;
  suburb_ua: string;
  unavailable_categories: number[];
  unavailable_products: number[];
  wait_minutes_delivery: number;
};

export type IGetAddressesRes = {
  addresses: IAddressAutocomplete[];
};

export type IGetOrderStatusRes = {
  status: number;
  online_payment_id: string;
  poster_id: string;
};

export type IGetPhoneRes = {
  confirmed: boolean;
};
