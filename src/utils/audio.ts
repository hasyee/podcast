export const getBlobFromUrl = async (url: string) => {
  const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(url);
  const response = await fetch(proxyUrl, { mode: 'no-cors', redirect: 'follow' });
  console.log(response);
  return await response.blob();
};
