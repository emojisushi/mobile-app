import {agent} from '../../../APIClient.tsx';

export const addressesQuery = (city_slug: string) => ({
  queryKey: ['addresses', city_slug],
  queryFn: async () => {
    const res = await agent.getAddresses({city_slug});
    return res.data;
  },
});
