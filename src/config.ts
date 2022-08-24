const env = import.meta.env;

//@ts-ignore
const PRESETS: ConfigType = window.SKLUI_PRESETS;

export type ConfigType = {
  optimize: {
    prefetchEvent: string; // placeholder (ignore)
    prefetchDepth: number; // (0, Infinity) directory depth to prefetch during navigation
  };
  branding: {
    logoUrl: string; // URL to logo image
    logoText: string; // Optional text placed next to logo
    greetingText: string;
  };
  navigator: {
    pageLimit: number; // max items per navigator page
  };
  uploader: {
    batchThreshold: number; // max items where upload is marked as batch
    maxFileDirNameLength: number; // max characters count of directory name
  };
  keys: {
    infuraId?: string;
    fortmaticKey?: string;
  },
  chains: {
    default?: boolean; // option to set as default
    protocol: string; // http or https
    nodeDomain: string; // node host FQDN
    version: string; // chain version
    sChainName: string; // chain name
    chainId: string; // chain ID
  }[]
}

// pulling in chains from env and presets

let presetChains = PRESETS.chains || [];
let defaultChainIndex = presetChains.findIndex(chain => chain.default);
let defaultChain;

if (defaultChainIndex >= 0) {
  [defaultChain] = presetChains.splice(defaultChainIndex, 1);
} else {
  defaultChain = {
    protocol: env.FS_CHAIN_PROTOCOL,
    nodeDomain: env.FS_CHAIN_NODE_DOMAIN,
    version: env.FS_CHAIN_VERSION,
    sChainName: env.FS_CHAIN_NAME,
    chainId: env.FS_CHAIN_ID
  }
}

console.log(defaultChain, presetChains);

const finalConfig = {
  optimize: {
    ...PRESETS.optimize
  },
  branding: {
    ...PRESETS.branding
  },
  navigator: {
    ...PRESETS.navigator
  },
  uploader: {
    ...PRESETS.uploader
  },
  keys: {
    infuraId: env.FS_INFURA_ID,
    fortmaticKey: env.FS_FORTMATIC_KEY
  },
  chains: [
    {
      ...defaultChain
    },
    ...presetChains
  ]
} as ConfigType;

export default finalConfig;