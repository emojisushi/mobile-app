import {agent} from '../../../APIClient.tsx';

export const phoneStatusQuery = (phone: string) => ({
  queryKey: ['phone', phone],
  queryFn: async () => {
    const res = await agent.getPhoneStatus({phone});
    return res.data;
  },
});

export const phoneStatusQueryLogin = (phone: string) => ({
  queryKey: ['phone-status-login', phone],
  queryFn: async () => {
    const res = await agent.getPhoneStatus({phone});
    return res.data;
  },
});
