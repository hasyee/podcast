export const getBlobFromUrl = async (url: string) => {
  const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(url);
  const response = await fetch(proxyUrl, { redirect: 'follow' });
  return await response.blob();
};
