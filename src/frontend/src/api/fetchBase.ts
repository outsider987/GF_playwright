import { cleanTokenStorage, getTokenStorage, setTokenStorage } from '~/utils/storage';
import { store } from '~/store';
import { setAlertDialog } from '~/store/global';

export interface APIEorrorResponse<T = any> {
  error?: T;
  message?: string;
  status?: boolean;
}

const apiConfig = {
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
  params: {},
};

const factorResponse = async (res: Response) => {
  try {
    if (res.status === 401) {
      const storedToken = getTokenStorage();
      const rs = await fetch(`${process.env.API_URL}/auth/refresh`, {
        headers: {
          authorization: `Bearer ${storedToken.refreshToken}`,
        },
        method: 'POST',
        body: JSON.stringify({ refresh_token: storedToken.refresh_token }),
      });
      const errorData = await rs.json();
      if (rs.status === 401) {
        checkErrorCdoe(errorData, rs.status);
        cleanTokenStorage();
        return errorData;
      } else {
        //   ;
        setTokenStorage(errorData);
        console.log(res.url);
      }
    }
    return { ...(await res.json()) };
  } catch (error) {
    store.dispatch(setAlertDialog({ show: true, msg: `unexpect error code:${res.status}`, title: 'Error' }));
  }
};

export const publicApi = (subPath: string = '', isDummyData?: boolean) => {
  const baseURL = isDummyData ? 'https://dummyapi.io/data/v1/' : `${process.env.API_URL}/${subPath}/`;
  const instance = {
    get: (url: string, settings: typeof apiConfig = apiConfig, method: string = 'GET') =>
      fetch(`${baseURL}${url}`, { headers: settings.headers, method: 'GET' })
        .then((response) => (response.ok ? response.json() : factorResponse(response)))
        .then((data) => data)
        .catch((res) => res),
    post: (url: string, body: any, settings: typeof apiConfig = apiConfig) =>
      fetch(`${baseURL}${url}`, { headers: settings.headers, method: 'POST', body: JSON.stringify(body) })
        .then((response) => (response.ok ? response.json() : factorResponse(response)))
        .then((data) => data)
        .catch((res) => res),
    delete: (url: string, settings: typeof apiConfig = apiConfig) =>
      fetch(`${baseURL}${url}`, { headers: settings.headers, method: 'DELEDTE' }).then((response) => response.json()),
    patch: (url: string, body: any, settings: typeof apiConfig = apiConfig) =>
      fetch(`${baseURL}${url}`, { headers: settings.headers, method: 'PATCH', body: JSON.stringify(body) })
        .then((response) => (response.ok ? response.json() : factorResponse(response)))
        .then((data) => data)
        .catch((res) => res),
    put: (url: string, body: any, settings: typeof apiConfig = apiConfig) =>
      fetch(`${baseURL}${url}`, { headers: settings.headers, method: 'PUT', body: JSON.stringify(body) })
        .then((response) => (response.ok ? response.json() : factorResponse(response)))
        .then((data) => data)
        .catch((res) => res),
  };
  return instance;
};

export const privateApi = (subPath: string = '', isDummyData?: boolean) => {
  const baseURL = isDummyData ? 'https://dummyapi.io/data/v1/' : `${process.env.API_URL}/${subPath}/`;
  const instance = {
    get: (url: string, settings: typeof apiConfig = apiConfig, method: string = 'GET') =>
      fetch(`${baseURL}${url}`, { headers: settings.headers, method: 'GET' })
        .then((response) => (response.ok ? response.json() : factorResponse(response)))
        .then((data) => data)
        .catch((res) => res),
    post: (url: string, body: any, settings: typeof apiConfig = apiConfig) =>
      fetch(`${baseURL}${url}`, { headers: settings.headers, method: 'POST', body: JSON.stringify(body) })
        .then((response) => (response.ok ? response.json() : factorResponse(response)))
        .then((data) => data)
        .catch((res) => res),
    delete: (url: string, settings: typeof apiConfig = apiConfig) =>
      fetch(`${baseURL}${url}`, { headers: settings.headers, method: 'DELEDTE' }).then((response) => response.json()),
    patch: (url: string, body: any, settings: typeof apiConfig = apiConfig) =>
      fetch(`${baseURL}${url}`, { headers: settings.headers, method: 'PATCH', body: JSON.stringify(body) })
        .then((response) => (response.ok ? response.json() : factorResponse(response)))
        .then((data) => data)
        .catch((res) => res),
    put: (url: string, body: any, settings: typeof apiConfig = apiConfig) =>
      fetch(`${baseURL}${url}`, { headers: settings.headers, method: 'PUT', body: JSON.stringify(body) })
        .then((response) => (response.ok ? response.json() : factorResponse(response)))
        .then((data) => data)
        .catch((res) => res),
  };
  return instance;
};

async function checkErrorCdoe(errorData: APIEorrorResponse, httpErrorCode?: number) {
  if (httpErrorCode === 400) {
    store.dispatch(setAlertDialog({ show: true, msg: JSON.stringify({ code: httpErrorCode }), title: 'Error' }));
    return;
  }

  switch (errorData.status) {
    case false:
      store.dispatch(setAlertDialog({ show: true, msg: JSON.stringify(errorData.error), title: 'Error' }));
      break;

    case true:
      break;

    default:
      break;
  }
}
