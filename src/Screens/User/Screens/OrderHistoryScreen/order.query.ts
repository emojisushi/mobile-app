import {agent} from '~/../APIClient';

export const orderQuery = (order_id: string) => ({
  queryKey: ['orders', order_id],
  queryFn: async () => {
    const res = await agent.getOrder({order_id});
    return res.data;
  },
});
