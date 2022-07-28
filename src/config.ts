export type ConfigType = {
  branding: {
    logoUrl: string;
  };
  navigator: {
    pageLimit: number;
  };
  uploader: {
    batchThreshold: number;
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
  branding: {
    logoUrl: "/logo.png"
  },
  navigator: {
    pageLimit: 10
  },
  uploader: {
    batchThreshold: 5
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