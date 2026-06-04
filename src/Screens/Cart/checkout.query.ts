import {agent} from '../../../APIClient.tsx';

export const checkoutQuery = {
  queryKey: ['checkout'],
  queryFn: async () => {
    const res = await agent.getCheckoutForm();
    return res.data;
  },
};
