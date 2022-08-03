export type ConfigType = {
  optimize: {
    prefetchEvent: string;
    prefetchDepth: number;
  };
  branding: {
    logoUrl: string;
  };
  navigator: {
    pageLimit: number;
  };
  uploader: {
    batchThreshold: number;
    maxFileDirNameLength: number;
  };
  chains: {
    protocol: string;
    nodeDomain: string;
    version: string;
    sChainName: string;
    chainId: string;
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