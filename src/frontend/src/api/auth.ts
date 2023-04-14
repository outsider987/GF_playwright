// import { cleanTokenStorage, setTokenStorage } from '~/utils/storage';
// // import { LoginInitial } from '~/pages/Home/Member';
// // import { RegisterInitial } from '~/pages/Home/Member/Register';
// import { APIResponse, privateApi, publicApi } from './base';

// const subPath = 'auth';
// const useAuthApi = () => {
//   const authApi = publicApi(subPath);
//   const privateAuthApi = privateApi(subPath);

//   const POST_REGISTER = async (userDate: typeof RegisterInitial) => {
//     const resp = await authApi.post<APIResponse>('register', {
//       ...userDate,
//     });
//     if (resp.data.data) setTokenStorage(resp.data.data);

//     return resp;
//   };

//   const POST_LOGIN = async (userDate: typeof LoginInitial) => {
//     const resp = await authApi.post<APIResponse>('login', {
//       ...userDate,
//     });
//     if (resp.data.data) setTokenStorage(resp.data.data);

//     return resp;
//   };

//   const GET_REFRESH = async () => {
//     const resp = await privateAuthApi.get<APIResponse<{ accessToken: string; refreshToken: string }>>('refresh', {
//       withCredentials: true,
//     });

//     return resp;
//   };

//   const GET_TokenTest = async () => {
//     const resp = await privateAuthApi.get('test');
//     return resp;
//   };

//   const GET_LOGOUT = async () => {
//     const resp = await authApi.get('logout', {
//       withCredentials: true,
//     });

//     if (resp.data.status) cleanTokenStorage();
//     return resp;
//   };

//   // const GET_USER = async () => {
//   //   const resp = await (
//   //     await fetch(`${process.env.API_URL}/auth/login/success`, {
//   //       method: 'get',
//   //       credentials: 'include',
//   //     })
//   //   ).json();
//   //   console.log(resp);
//   //   if (resp.data) setTokenStorage(resp.data);
//   //   return resp;
//   // };
//   const GET_USER = async () => {
//     const resp = await authApi.get('login/success', {
//       withCredentials: true,
//     });
//     if (resp.data.data) setTokenStorage(resp.data.data);
//     return resp;
//   };

//   return { POST_REGISTER, GET_REFRESH, POST_LOGIN, GET_TokenTest, GET_USER, GET_LOGOUT };
// };

// export default useAuthApi;
