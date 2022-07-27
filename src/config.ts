export type ConfigType = {
  logoUrl: "/logo.png",
  chains: {
    protocol: string;
    nodeDomain: string;
    version: string;
    sChainName: string;
    chainId: string;
  }[]
}

export default <ConfigType>{
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