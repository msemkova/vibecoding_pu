import { Network } from '@/types/network'
import { BlockchainAdapter } from './types'
import { EtherscanV2Adapter } from './etherscan-v2'
import { BlockstreamAdapter } from './blockstream'
import { TronScanAdapter } from './tronscan'

export class AdapterFactory {
  static create(network: Network): BlockchainAdapter {
    switch (network) {
      case 'ethereum':
        return new EtherscanV2Adapter('ethereum')
      case 'arbitrum':
        return new EtherscanV2Adapter('arbitrum')
      case 'bitcoin':
        return new BlockstreamAdapter()
      case 'tron':
        return new TronScanAdapter()
      default:
        throw new Error(`Unsupported network: ${network}`)
    }
  }
}
