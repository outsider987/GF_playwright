import { APIResponse, publicApi } from './base';

export const PostDatasType = {
  id: '60d21b4667d0d8992e610c85',
  image: 'https://img.dummyapi.io/photo-1564694202779-bc908c327862.jpg',
  likes: 43,
  tags: ['animal', 'dog', 'golden retriever'],
  text: 'adult Labrador retriever',
  publishDate: '2020-05-24T14:53:17.598Z',
  owner: {
    id: '60d0fe4f5311236168a109ca',
    title: 'ms',
    firstName: 'Sara',
    lastName: 'Andersen',
    picture: 'https://randomuser.me/api/portraits/women/58.jpg',
  },
};

const subPath = 'post';
const useRandPostsApi = () => {
  const postApi = publicApi(subPath);

  const GET_POSTS = async ({ pageParam = 1 }) => {
    const resp = await postApi.get<APIResponse<typeof PostDatasType>>('https://dummyapi.io/data/v1/post?limit=10', {
      headers: {
        'Content-Type': 'application/json',
        'app-id': '637e288874c675dfd68d88e1',
      },
      params: { page: pageParam },
    });
    return resp.data.data;
  };

  return { GET_POSTS };
};

export default useRandPostsApi;
