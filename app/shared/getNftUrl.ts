const collectionAddress = "0x1af2a6e086392470727246217bb44f4b8efb8557";

export function getNftUrl(tokenId: string) {
  return `https://app.zerion.io/nfts/base/${collectionAddress}:${tokenId}`;
}
