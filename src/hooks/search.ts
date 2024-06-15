import { useCallback } from 'react';

export const useSearch = () => {
  const lang = 'hu_hu';

  return useCallback(async (term: string) => {
    const channels = await fetch(
      'https://itunes.apple.com/search?' + new URLSearchParams({ term, entity: 'podcast', lang })
    )
      .then(result => result.json())
      .then(({ results }: { resultCount: 1; results: any[] }) => {
        //console.log(results);
        return results.map(({ collectionId, collectionName, artworkUrl100, feedUrl }) => ({
          id: collectionId,
          name: collectionName,
          image: artworkUrl100,
          feedUrl
        }));
      });

    const episodes = await fetch(
      'https://itunes.apple.com/search?' + new URLSearchParams({ term, entity: 'podcastEpisode', lang, sort: 'recent' })
    )
      .then(result => result.json())
      .then(({ results }: { resultCount: 1; results: any[] }) => {
        //console.log(results);
        return results.map(({ trackId, collectionName, trackName, releaseDate, artworkUrl160, episodeUrl }) => ({
          id: trackId,
          channelName: collectionName,
          name: trackName,
          image: artworkUrl160,
          releaseDate,
          audio: episodeUrl
        }));
      });

    return { channels, episodes };
  }, []);
};
