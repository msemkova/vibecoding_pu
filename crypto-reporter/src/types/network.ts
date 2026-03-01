export type Network = 'ethereum' | 'bitcoin' | 'tron' | 'arbitrum'

export type NetworkConfig = {
  name: string
  chainId?: number
  explorerUrl: string
  apiBaseUrl: string
  addressRegex: RegExp
  requiresApiKey: boolean
}
