import {createEmojisushiAgent} from '~/api';
import {clearToken, getToken} from '~/common/token/token';

//https://api.emojisushi.com.ua/api
//https://stage-api.emojisushi.com.ua/api
//http://192.168.100.19:8080/api
export const agent = createEmojisushiAgent({
  service: 'http://192.168.100.19:8080/api',
});

agent.axiosClient.interceptors.request.use(async config => {
  const token = await getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
agent.axiosClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 406) {
      await clearToken();
    }
    return Promise.reject(error);
  },
);
