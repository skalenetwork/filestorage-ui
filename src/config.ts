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
    prefetchEvent: 'dirLoad',
    prefetchDepth: Infinity
  },
  branding: {
    logoUrl: "/logo.png"
  },
  navigator: {
    pageLimit: 10
  },
  uploader: {
    batchThreshold: 5,
    maxFileDirNameLength: 255
  },
  chains: [
    {
      protocol: "https",
      nodeDomain: "staging-v2.skalenodes.com",
      version: "v1",
      sChainName: "roasted-thankful-unukalhai",
      chainId: "0x1dc0981d"
    }
  ]
}