import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { useSearch } from './hooks';
import { useStorage } from './hooks/storage';
import { Episode } from './types';
import Test from './Test';

let audio: HTMLAudioElement;

function App() {
  const search = useSearch();
  const [channels, setChannels] = useState<any[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [rate, setRate] = useState(1);
  const [time, setTime] = useState<number>(0);
  const [duration, setDuration] = useState<number | null>(null);

  const { save, load, remove, getIds } = useStorage();

  useEffect(() => {
    search('sokolébresztő').then(({ channels, episodes }) => {
      setChannels(channels);
      setEpisodes(episodes);
    });
  }, [search]);

  useEffect(() => {
    getIds().then(setDownloadedIds);
  }, [getIds]);

  useEffect(() => {
    if (audio) audio.playbackRate = rate;
  }, [rate]);

  useEffect(() => {
    if (time) audio.currentTime = time;
  }, [time]);

  const saveEpisode = useCallback(
    async (episode: Episode) => {
      await save(episode);
      await getIds().then(setDownloadedIds);
    },
    [save, getIds]
  );
  const loadEpisode = useCallback(
    async (id: string) => {
      if (audio && !audio.paused) audio.pause();
      const episodeFile = await load(id);
      console.log(episodeFile);
      audio = new Audio(URL.createObjectURL(episodeFile.blob));
      (window as any).audio = audio;
      audio.addEventListener('canplaythrough', () => {
        if (audio.paused) {
          setDuration(audio.duration);
          audio.play();
          setPlayingId(id);
        }
      });
    },
    [load]
  );
  const stop = useCallback(() => {
    audio.pause();
    setPlayingId(null);
    setTime(0);
    setDuration(null);
  }, []);
  const removeEpisode = useCallback(
    async (id: string) => {
      await remove(id);
      await getIds().then(setDownloadedIds);
    },
    [remove, getIds]
  );
  const handleRateChange = useCallback((evt: any) => {
    const value = Number.isFinite(parseFloat(evt.target.value)) ? parseFloat(evt.target.value) : 1;
    setRate(value);
  }, []);
  const handleTimeChange = useCallback((evt: any) => {
    const value = Number.isFinite(parseFloat(evt.target.value)) ? parseFloat(evt.target.value) : 0;
    setTime(value);
  }, []);

  return (
    <div className="App">
      <header>
        <Test />
        {playingId && (
          <div>
            <span>{rate}</span>
            <input type="range" min={0} max={2} step={0.1} value={rate} onChange={handleRateChange} />
          </div>
        )}
        {duration && (
          <div>
            <span>
              {time} / {duration}
              {<input type="range" min={0} max={duration} step={1} value={time} onChange={handleTimeChange} />}
            </span>
          </div>
        )}
      </header>

      <main>
        <hr />
        <h1>Search</h1>
        <h2>Channels</h2>
        <ul>
          {channels.map(channel => (
            <li key={channel.id}>
              <img src={channel.image} alt="channel" />
              <div>{channel.name}</div>
              <div>
                <a href={channel.feedUrl} target="_blank" rel="noreferrer">
                  Feed URL
                </a>
              </div>
              <br />
              <br />
              <br />
            </li>
          ))}
        </ul>
        <hr />
        <h2>Episodes</h2>
        <ul>
          {episodes.map(episode => (
            <li key={episode.id}>
              <img src={episode.image} alt="episode" />
              <div>
                {episode.channelName} - {episode.name}
              </div>
              <div>{episode.releaseDate}</div>
              <audio controls>
                <source src={episode.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <div>
                <button
                  onClick={() => {
                    downloadedIds.includes(episode.id) ? removeEpisode(episode.id) : saveEpisode(episode);
                  }}
                >
                  {downloadedIds.includes(episode.id) ? 'Remove' : 'Download'}
                </button>
                {downloadedIds.includes(episode.id) && (
                  <button onClick={() => (playingId === episode.id ? stop() : loadEpisode(episode.id))}>
                    {playingId === episode.id ? 'Pause' : 'Play'} downloaded
                  </button>
                )}
              </div>

              <br />
              <br />
              <br />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default App;
