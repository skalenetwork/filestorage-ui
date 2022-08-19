const env = import.meta.env;
console.log(env);

export type ConfigType = {
  optimize: {
    prefetchEvent: string; // placeholder
    prefetchDepth: number; // (0,Infinity)
  };
  branding: {
    logoUrl: string; // path relative too /public
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
    prefetchEvent: env.FS_OPTIMIZE_PREFETCH_EVENT,
    prefetchDepth: Number(env.FS_OPTIMIZE_PREFETCH_DEPTH)
  },
  branding: {
    logoUrl: env.FS_BRANDING_LOGO_URL
  },
  navigator: {
    pageLimit: Number(env.FS_NAVIGATOR_PAGE_LIMIT)
  },
  uploader: {
    batchThreshold: Number(env.FS_UPLOADER_BATCH_THRESHOLD),
    maxFileDirNameLength: Number(env.FS_MAX_FILE_DIR_NAME_LENGTH)
  },
  chains: [
    {
      protocol: env.FS_CHAIN_PROTOCOL,
      nodeDomain: env.FS_CHAIN_NODE_DOMAIN,
      version: env.FS_CHAIN_VERSION,
      sChainName: env.FS_CHAIN_NAME,
      chainId: env.FS_CHAIN_ID
    }
  ]
}