import { QueryOptions } from '@tanstack/react-query';
import { agent } from '~/../APIClient';
import { IGetOrderStatusRes } from '~/api/types';

export const orderStatusQuery = (
  order_id: string
): QueryOptions<IGetOrderStatusRes> => ({
  queryKey: ['orderStatus', order_id],
  queryFn: async ({ signal }) => {
    let response = (
      await agent.getOrderStatus(
        { order_id },
        {
          signal,
        }
      )
    ).data;
    return response;
  },
});
