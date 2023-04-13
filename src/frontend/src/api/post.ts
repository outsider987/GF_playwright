import { APIResponse, publicApi } from './base';

export const PostDatasType = {
  id: '60d21b4667d0d8992e610c85',
  createdAt: '2023-01-02T00:00:00.000Z',
  title: 'pellentesque volutpat dui maecenas',
  published: false,
  author_id: 2,
  body: 'Sed ante. Vivamus tortor. Duis mattis egestas metus.',
};
export const PostMarvelType = {
  id: 100,
  comic_name: 'A-Force (2016)',
  active_years: '(2016)',
  issue_title: 'A-Force (2016) #5',
  publish_date: 'May 04, 2016',
  issue_description: '"Rage',
  penciler: ' Rage Against The Dying Of The Light"" STARTS NOW! When a massive dragon attacks a small coastal town',
  writer: ' SHE-HULK',
  cover_artist: ' CAPTAIN MARVEL',
  Imprint: ' MEDUSA',
  Format: ' DAZZLER',
  Rating: ' NICO MINORU',
  Price: 0,
};

const subPath = 'post';
const usePostsApi = () => {
  const configApi = publicApi(subPath, false);

  const GET_POSTS = async (dto) => {
    const resp = await configApi.get<APIResponse<typeof PostMarvelType[]>>('', {
      params: { searchText: dto.queryKey[0] },
    });
    return resp.data.data;
  };

  return { GET_POSTS };
};

export default usePostsApi;
