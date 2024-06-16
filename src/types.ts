export type Episode = {
  id: string;
  name: string;
  channelName: string;
  releaseDate: string;
  image: string;
  audioUrl: string;
};

export type EpisodeFile = {
  id: string;
  name: string;
  blob: Blob;
};

export type PlayingState = {
  episodeId: string | null;
  duration: number | null;
  sleepAt: number | null;
};

export type Settings = {
  play: {
    rate: number;
    sleepScheduler: {
      defaultDuration: number;
    };
    autoPlayNext: boolean;
  };
  downloads: {
    autoDownloadQueuedEpisodes: boolean;
  };
};
