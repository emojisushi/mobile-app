import { FormValues, HouseTypeEnum, ShippingMethodEnum } from '../types';
import { CourierHighRiseBuildingSchema, CourierSchema, TakeAwaySchema } from './schemas';

 const getValidationSchema = (values: FormValues) => {
    if (
      values.houseType === HouseTypeEnum.Apartment &&
      values.shippingMethod === ShippingMethodEnum.Courier
    ) {
      return CourierHighRiseBuildingSchema;
    }
    if (values.shippingMethod === ShippingMethodEnum.Courier) {
      return CourierSchema;
    }
    return TakeAwaySchema;
  };
