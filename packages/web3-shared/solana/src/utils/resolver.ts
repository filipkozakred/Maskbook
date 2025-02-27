import {
    createChainResolver,
    createExplorerResolver,
    createNetworkResolver,
    createProviderResolver,
} from '@masknet/web3-shared-base'
import { CHAIN_DESCRIPTORS, NETWORK_DESCRIPTORS, PROVIDER_DESCRIPTORS } from '../constants/index.js'

export const chainResolver = createChainResolver(CHAIN_DESCRIPTORS)
export const explorerResolver = createExplorerResolver(CHAIN_DESCRIPTORS, {
    nonFungibleTokenPathname: '/address/:address',
})
export const networkResolver = createNetworkResolver(NETWORK_DESCRIPTORS)
export const providerResolver = createProviderResolver(PROVIDER_DESCRIPTORS)
