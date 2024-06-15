import { useEffect, useState } from 'react';
import './App.css';
import { useSearch } from './hooks';

function App() {
  const search = useSearch();
  const [channels, setChannels] = useState<any[]>([]);
  const [episodes, setEpisodes] = useState<any[]>([]);

  useEffect(() => {
    search('űrkutatás magyarul').then(({ channels, episodes }) => {
      setChannels(channels);
      setEpisodes(episodes);
    });
  }, [search]);

  return (
    <div className="App">
      <main>
        <ul>
          {channels.map(channel => (
            <li key={channel.id}>
              <img src={channel.image} />
              <div>{channel.name}</div>
              <div>
                <a href={channel.feedUrl} target="_blank">
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
        <ul>
          {episodes.map(episode => (
            <li key={episode.id}>
              <img src={episode.image} />
              <div>
                {episode.channelName} - {episode.name}
              </div>
              <div>{episode.releaseDate}</div>
              <audio controls>
                <source src={episode.audio} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
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
