import { getGifList, sendGiff, likeGiff } from '@client/src/service/wallet';
import { useCallback, useEffect, useState } from 'react';

export const useGifs = () => {
  const [gifList, setGifList] = useState<
    { gifLink: string; userAddress: string, id: number, likes: number }[] | null
  >([]);
  const fetchGifs = useCallback(async () => {
    const gifs = await getGifList();
    console.log('Gifs', gifs);
    setGifList(gifs);
  }, []);
  useEffect(() => {
    fetchGifs();
  }, [fetchGifs]);
  const addGiff = useCallback(
    async (gifUrl: string) => {
      await sendGiff(gifUrl);
      fetchGifs();
    },
    [fetchGifs]
  );
  const like = useCallback(
    async (gifId: number) => {
      await likeGiff(gifId);
      fetchGifs();
    },
    [fetchGifs]
  );
  return { gifList, addGiff, fetchGifs, like };
};
