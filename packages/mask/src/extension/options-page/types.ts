import type { NextIDPlatform, NetworkPluginID } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'

type CollectionKey = `${string}_${string}`
/**
 * Keys are in the format of `${collection.id}_${collection.id}`
 */
export interface CollectionKeys {
    NFTs: CollectionKey[]
    Donations: CollectionKey[]
    Footprints: CollectionKey[]
    Feeds: CollectionKey[]
}
export interface WalletsCollection {
    NFTs?: WalletTypes[]
    donations?: WalletTypes[]
    footprints?: WalletTypes[]
}

export interface CollectionTypes {
    platform: NetworkPluginID
    address: string // take id as address if collection is a poap
    key: string // address + tokenId as unique key of NFT, id as unique key of poap
    tokenId?: string
    iconURL?: string
    hidden?: boolean
    name?: string
    chainId?: ChainId
}
export interface WalletTypes {
    address: string
    platform?: NetworkPluginID
    updateTime?: string
    collections?: CollectionTypes[]
}

export interface Patch {
    unListedCollections: Record<string, CollectionKeys>
    hiddenAddresses: WalletsCollection
}
export interface KVType {
    persona: string
    proofs: Proof[]
}
export interface Proof {
    platform: NextIDPlatform
    identity: string
    content?: Record<string, Patch>
}

export interface CollectibleGridProps {
    columns?: number
    gap?: string | number
}
