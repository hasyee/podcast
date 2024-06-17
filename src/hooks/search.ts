import { useCallback } from 'react';
import { Channel, Episode } from '../types';

export const useSearch = () => {
  const lang = 'hu_hu';

  return useCallback(async (term: string): Promise<{ channels: Channel[]; episodes: Episode[] }> => {
    const channels = await fetch(
      'https://itunes.apple.com/search?' + new URLSearchParams({ term, entity: 'podcast', lang })
    )
      .then(result => result.json())
      .then(({ results }: { resultCount: 1; results: any[] }) => {
        return results.map(({ collectionId, collectionName, artistName, artworkUrl600, feedUrl, trackCount }) => ({
          id: 'itunes:' + collectionId,
          name: collectionName,
          creatorName: artistName,
          imageUrl: artworkUrl600,
          feedUrl,
          episodeCount: trackCount
        }));
      });

    const episodes = await fetch(
      'https://itunes.apple.com/search?' + new URLSearchParams({ term, entity: 'podcastEpisode', lang, sort: 'recent' })
    )
      .then(result => result.json())
      .then(({ results }: { resultCount: 1; results: any[] }) => {
        console.log(results);
        return results.map(
          ({
            trackId,
            collectionId,
            collectionName,
            trackName,
            releaseDate,
            artworkUrl600,
            episodeUrl,
            trackTimeMillis,
            description
          }) => ({
            id: 'itunes:' + trackId.toString(),
            channelId: 'itunes:' + collectionId.toString(),
            channelName: collectionName,
            name: trackName,
            imageUrl: artworkUrl600,
            duration: trackTimeMillis / 1000,
            releaseDate,
            audioUrl: episodeUrl,
            description
          })
        );
      });

    return { channels, episodes };
  }, []);
};
