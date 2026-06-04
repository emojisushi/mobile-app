import {agent} from '../../../APIClient.tsx';

export const appAllowedVersion = {
  queryKey: ['appAllowedVersion'],
  queryFn: async () => {
    const res = await agent.getAppAllowedVersion();
    return res.data;
  },
};
