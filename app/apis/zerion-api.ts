const ZERION_API_URL = process.env.ZERION_API_URL;

function getHeaders() {
  return {
    "X-Request-Id": crypto.randomUUID(),
    "Zerion-Client-Type": "web",
    "Zerion-Client-Version": "v1.0.0",
    "Content-Type": "application/json",
  };
}

export interface WalletsMetaPayload {
  identifiers: string[];
}

interface Identity {
  provider: "ens" | "lens" | "ud" | "unspecified";
  address: string;
  handle: string;
}

interface WalletMeta {
  address: string;
  nft: {
    chain: string;
    contractAddress: string;
    tokenId: string;
    metadata: {
      name: string | null;
      content: {
        imagePreviewUrl?: string;
        imageUrl?: string | null;
        audioUrl?: string | null;
        videoUrl?: string | null;
        type: "video" | "image" | "audio";
      } | null;
    } | null;
  } | null;
  nftMetaInformation: {
    onboarded: boolean;
  } | null;
  identities: Identity[];
}

export interface WalletsMetaResponse {
  data: WalletMeta[] | null;
  errors?: { title: string; detail: string }[];
}

export async function getWalletsMeta(payload: WalletsMetaPayload) {
  const url = new URL("wallet/get-meta/v1", ZERION_API_URL);
  url.searchParams.set("identifiers", payload.identifiers.join(","));

  const response = await fetch(url, {
    headers: getHeaders(),
  });
  const json = await response.json();
  return json as WalletsMetaResponse;
}
