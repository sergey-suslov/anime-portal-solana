import { useCallback, useEffect, useState } from 'react';

const TEST_GIFS = [
  'https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp',
  'https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g',
  'https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g',
  'https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp',
];

export const useGifs = (walletAddress: string | null) => {
  const [gifList, setGifList] = useState<string[]>([]);

  useEffect(() => {
    if (!walletAddress || gifList.length > 0) {
      return;
    }
    setGifList(TEST_GIFS);
  }, [walletAddress]);
  const addGiff = useCallback((gifUrl: string) => {
    setGifList((list) => [gifUrl, ...list]);
  }, []);
  return { gifList, addGiff };
};
