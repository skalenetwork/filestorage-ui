const env = import.meta.env;

//@ts-ignore
const PRESETS = window.SKLUI_PRESETS;

export type ConfigType = {
  optimize: {
    prefetchEvent: string; // placeholder
    prefetchDepth: number; // (0,Infinity)
  };
  branding: {
    logoUrl: string; // path relative too /public
    logoText: string;
  };
  navigator: {
    pageLimit: number; // max items on navigator page
  };
  uploader: {
    batchThreshold: number; // max items where upload marked as batch
    maxFileDirNameLength: number; // max characters count of directory name
  };
  chains: {
    protocol: string; // http or https
    nodeDomain: string; // node host FQDN
    version: string; // chain version 
    sChainName: string; // chain name
    chainId: string; // chain ID
  }[]
}

export default <ConfigType>{
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
  chains: [
    {
      protocol: env.FS_CHAIN_PROTOCOL,
      nodeDomain: env.FS_CHAIN_NODE_DOMAIN,
      version: env.FS_CHAIN_VERSION,
      sChainName: env.FS_CHAIN_NAME,
      chainId: env.FS_CHAIN_ID
    },
    ...(PRESETS.chains || [])
  ]
}