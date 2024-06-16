export type Channel = {
  id: string;
  name: string;
  creatorName: string;
  imageUrl: string;
  feedUrl: string;
  episodeCount: number;
}

export type Episode = {
  id: string;
  name: string;
  channelId: string;
  channelName: string;
  releaseDate: string;
  duration: number;
  imageUrl: string;
  audioUrl: string;
  description: string;
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
