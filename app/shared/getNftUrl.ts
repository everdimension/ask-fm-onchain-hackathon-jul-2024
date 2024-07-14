// const collectionAddressBase = "0xa3915795cfb58e8e59bbc5b9723ee3661529dff0";
const collectionAddressCelo = "0x099a9f22D1bcB5A90E0B8fa0Cb0fC47350F113ea";
export function getNftUrl(tokenId: string) {
  return `https://app.zerion.io/nfts/celo/${collectionAddressCelo}:${tokenId}`;
}
