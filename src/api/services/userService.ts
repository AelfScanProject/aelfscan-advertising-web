import apiClient from '../apiClient';

import { UserInfo, UserToken } from '#/entity';

export interface SignInReq {
  username: string;
  password: string;
  grant_type?: 'password';
  scope?: 'AElfScanServer';
  client_id?: 'AElfScanServer_App';
}

export interface SignUpReq extends SignInReq {
  email: string;
}
export type SignInRes = UserToken & { user: UserInfo };

export enum UserApi {
  SignIn = '/connect/token',
  SignUp = '/auth/signup',
  Logout = '/auth/logout',
  Refresh = '/auth/refresh',
  User = '/user',
}

// Promise.resolve({
//   user: DEFAULT_USER,
//   accessToken: faker.string.uuid(),
//   refreshToken: faker.string.uuid(),
// } as SignInRes);

const signin = (data: SignInReq) => {
  const formData = new URLSearchParams();
  formData.append('username', data.username);
  formData.append('password', data.password);
  formData.append('grant_type', 'password');
  formData.append('scope', 'AElfScanServer');
  formData.append('client_id', 'AElfScanServer_App');
  return apiClient.post<SignInRes>({
    url: UserApi.SignIn,
    data: formData.toString(),
    baseURL: '/',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

const signup = (data: SignUpReq) => apiClient.post<SignInRes>({ url: UserApi.SignUp, data });
const logout = () => apiClient.get({ url: UserApi.Logout });
const findById = (id: string) => apiClient.get<UserInfo[]>({ url: `${UserApi.User}/${id}` });

export default {
  signin,
  signup,
  findById,
  logout,
};
