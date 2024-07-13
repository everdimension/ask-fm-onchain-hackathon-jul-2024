import { useQuery } from "@tanstack/react-query";
import { createWeb3Modal, defaultConfig, Web3Modal } from "@web3modal/ethers";
import { Eip1193Provider } from "ethers";
import { useEffect, useState, useSyncExternalStore } from "react";
import invariant from "tiny-invariant";
// import invariant from "tiny-invariant";

// const WALLETCONNECT_PROJECT_ID = process.env.WALLETCONNECT_PROJECT_ID;
// invariant(WALLETCONNECT_PROJECT_ID, "WALLETCONNECT_PROJECT_ID is required");

function createModal(projectId: string) {
  // 2. Set chains
  const mainnet = {
    chainId: 1,
    name: "Ethereum",
    currency: "ETH",
    explorerUrl: "https://etherscan.io",
    rpcUrl: "https://cloudflare-eth.com",
  };

  // 3. Create your application's metadata object
  const metadata = {
    name: "AskF",
    description: "Anonymously ask questions to ETH Addresses",
    url: "https://mywebsite.com", // url must match your domain & subdomain
    icons: ["https://avatars.mywebsite.com/"],
  };

  // 4. Create Ethers config
  const ethersConfig = defaultConfig({
    /*Required*/
    metadata,

    /*Optional*/
    enableEIP6963: true, // true by default
    enableInjected: true, // true by default
    // enableCoinbase: true, // true by default
    // rpcUrl: "...", // used for the Coinbase SDK
    // defaultChainId: 1, // used for the Coinbase SDK
  });

  // 5. Create a Web3Modal instance
  const modal = createWeb3Modal({
    ethersConfig,
    chains: [mainnet],
    projectId,
    enableAnalytics: true, // Optional - defaults to your Cloud configuration
    enableOnramp: true, // Optional - false as default
  });
  return modal;
}

// console.log({ modal });
declare global {
  interface Window {
    ENV?: { [key: string]: string | undefined };
  }
}

export function useAppkitModal() {
  return useQuery({
    queryKey: ["walletConnectModal"],
    staleTime: Infinity,
    queryFn: async () => {
      if (typeof window === "undefined") {
        return;
      }
      const projectId = window.ENV?.WALLETCONNECT_PROJECT_ID;
      invariant(projectId, "WALLETCONNECT_PROJECT_ID is not defined");
      return createModal(projectId);
    },
  });
}

// function subscribe(listener: () => void) {}
interface ModalState {
  provider: Eip1193Provider | null;
  address: string | null;
}
function getSnapshot(modal: Web3Modal): ModalState {
  return {
    provider: modal.getWalletProvider() || null,
    address: modal.getAddress() || null,
  };
}
const defaultState: ModalState = {
  provider: null,
  address: null,
};

export function useModalState(modal: Web3Modal | undefined) {
  const [state, setState] = useState<ModalState>(defaultState);
  useEffect(() => {
    if (!modal) {
      return;
    }
    setState(getSnapshot(modal));
    return modal.subscribeProvider(() => {
      setState(getSnapshot(modal));
    });
  }, [modal]);
  return state;
}

export function ConnectButton() {
  const { data: modal } = useAppkitModal();

  return (
    <div>
      <button
        onClick={() => {
          modal?.open();
        }}
      >
        connect
      </button>
    </div>
  );
}
