import { useCallback } from 'react';
import { Episode } from '../types';
import { getBlobFromUrl } from '../utils/audio';
import { getStore } from '../utils/indexdb';

export const useStorage = () => {
  const save = useCallback(async (episode: Episode) => {
    const store = await getStore();
    const existing = await store.get(episode.id);
    if (existing) return existing;
    const blob = await getBlobFromUrl(episode.audioUrl);
    console.log(blob);
    return await store.set({ id: episode.id, name: episode.name, blob });
  }, []);

  const load = useCallback(async (id: string) => {
    const store = await getStore();
    return await store.get(id);
  }, []);

  const remove = useCallback(async (id: string) => {
    const store = await getStore();
    return await store.remove(id);
  }, []);

  const getIds = useCallback(async () => {
    const store = await getStore();
    return await store.getKeys();
  }, []);

  return { save, load, remove, getIds };
};
