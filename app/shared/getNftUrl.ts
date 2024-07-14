const collectionAddress = "0xa3915795cfb58e8e59bbc5b9723ee3661529dff0";

export function getNftUrl(tokenId: string) {
  return `https://app.zerion.io/nfts/base/${collectionAddress}:${tokenId}`;
}
