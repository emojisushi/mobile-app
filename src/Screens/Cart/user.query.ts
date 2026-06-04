import {agent} from '../../../APIClient.tsx';

export const userQuery = {
  queryKey: ['userData'],
  queryFn: async () => {
    const data = await agent.fetchUser();
    return data.data;
  },
  retry: false,
  // onSuccess: async fetchedUser => {
  //   setLogged(true);
  //   if (!fetchedUser) return;
  //   setValue('email', fetchedUser?.email);
  //   setValue('phone', fetchedUser?.phone ?? '');
  //   setValue('name', fetchedUser?.name ?? '');
  // },
  // onError: () => {
  //   setLogged(false);
  // },
};
