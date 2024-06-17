import moment from 'moment';
import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { useSearch, useSearchResult } from './hooks';
import { useStorage } from './hooks/storage';
import { Episode } from './types';
import CustomAppShell from '../src/components/CustomAppShell';
import {
  Box,
  Card,
  Group,
  Title,
  Image,
  Button,
  Text,
  Grid,
  Container,
  Menu,
  MenuTarget,
  MenuDropdown,
  MenuLabel,
  MenuItem,
  ActionIcon,
  Slider
} from '@mantine/core';
import { IconDotsVertical } from '@tabler/icons-react';

function App() {
  const search = useSearch();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [{ set: setSearchResults }, searchResult] = useSearchResult();
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [rate, setRate] = useState(1);
  const [time, setTime] = useState<number>(0);
  const [duration, setDuration] = useState<number | null>(null);

  const { save, load, remove, getIds } = useStorage();

  useEffect(() => {
    search('parallaxis').then(setSearchResults);
  }, [search, setSearchResults]);

  useEffect(() => {
    getIds().then(setDownloadedIds);
  }, [getIds]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate]);

  useEffect(() => {
    if (time && audioRef.current) audioRef.current.currentTime = time;
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
      if (audioRef.current && !audioRef.current?.paused) audioRef.current.pause();
      const episodeFile = await load(id);
      audioRef.current = new Audio(URL.createObjectURL(episodeFile.blob));
      audioRef.current.addEventListener('canplaythrough', () => {
        if (audioRef.current?.paused) {
          (window as any).audio = audioRef.current;
          setDuration(audioRef.current?.duration);
          audioRef.current?.play();
          setPlayingId(id);
        }
      });
    },
    [load]
  );
  const stop = useCallback(() => {
    audioRef.current?.pause();
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
  const handleRateChange = useCallback((newValue: any) => {
    const value = Number.isFinite(parseFloat(newValue)) ? parseFloat(newValue) : 1;
    setRate(value);
  }, []);
  const handleTimeChange = useCallback((evt: any) => {
    const value = Number.isFinite(parseFloat(evt.target.value)) ? parseFloat(evt.target.value) : 0;
    setTime(value);
  }, []);

  return (
    <CustomAppShell>
      <Container>
        <div className="App">
          <header>
            {playingId && (
              <div>
                <span>Speed {rate}x</span>
                <Slider min={0} max={2} step={0.1} value={rate} onChange={handleRateChange} />
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

          <Box>
            <Title mb={'md'} order={2}>
              Channels
            </Title>

            <Group>
              {searchResult.channels.map(channel => (
                <Card key={channel.id} shadow="sm" padding="lg" radius="md" withBorder>
                  <Card.Section>
                    <Image w={220} src={channel.imageUrl} fit="contain" alt="Norway" />
                  </Card.Section>

                  <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={500}>{channel.name}</Text>
                  </Group>

                  <Text size="sm" c="dimmed">
                    From: {channel.creatorName}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Episodes: {channel.episodeCount}
                  </Text>

                  <Button component="a" target="_blank" href={channel.feedUrl} fullWidth mt="md" radius="md">
                    Feed URL
                  </Button>
                </Card>
              ))}
            </Group>
          </Box>

          <Box>
            <Title mt={'md'} order={2}>
              Episodes
            </Title>

            <Grid mt="md">
              {searchResult.episodes.map(episode => {
                const duration = moment.duration(episode.duration, 'seconds');
                return (
                  <Grid.Col key={episode.id} span={{ base: 12, sm: 6, lg: 4 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                      <Card.Section pos={'relative'}>
                        <Image src={episode.imageUrl} fit="contain" alt="Norway" />
                        <Group justify="end" mt={'md'} pos={'absolute'} top="0" right={16}>
                          <Menu>
                            <MenuTarget>
                              <ActionIcon variant="default" p={5} size="compact-md">
                                <IconDotsVertical size={16} />
                              </ActionIcon>
                            </MenuTarget>
                            <MenuDropdown>
                              <MenuLabel>Download actions</MenuLabel>
                              <MenuItem
                                onClick={() => {
                                  downloadedIds.includes(episode.id) ? removeEpisode(episode.id) : saveEpisode(episode);
                                }}
                              >
                                {downloadedIds.includes(episode.id) ? 'Remove' : 'Download'}
                              </MenuItem>
                              {downloadedIds.includes(episode.id) && (
                                <>
                                  {' '}
                                  <MenuLabel>Play actions</MenuLabel>
                                  <MenuItem
                                    onClick={() => (playingId === episode.id ? stop() : loadEpisode(episode.id))}
                                  >
                                    {playingId === episode.id ? 'Pause' : 'Play'} downloaded
                                  </MenuItem>
                                </>
                              )}
                            </MenuDropdown>
                          </Menu>
                        </Group>
                      </Card.Section>

                      <Group justify="space-between" mt="md" mb="xs">
                        <Text fw={500} lineClamp={3}>
                          {episode.channelName} - {episode.name}
                        </Text>
                      </Group>

                      <Text size="sm" c="dimmed">
                        Release date: {episode.releaseDate}
                      </Text>
                      <Text size="sm" c="dimmed">
                        Duration: {duration.hours()}:{duration.minutes()}:{duration.seconds()}
                      </Text>

                      <Text mt={'sm'} size="sm" truncate="end" title={episode.description}>
                        {episode.description}
                      </Text>

                      <Group mt="md">
                        <audio controls style={{ width: '100%' }}>
                          <source src={episode.audioUrl} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </Group>
                    </Card>
                  </Grid.Col>
                );
              })}
            </Grid>
          </Box>
        </div>
      </Container>
    </CustomAppShell>
  );
}

export default App;
