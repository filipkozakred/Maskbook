import { useMemo } from 'react'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { resolveIPFS_URL } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import type { User, NonFungibleContract, OwnerERC721TokenInfo } from '../types.js'
import { useNonFungibleAssets } from '@masknet/web3-hooks-base'

export function useNFTs(user: User | undefined) {
    const { value: assets = EMPTY_LIST, loading: state } = useNonFungibleAssets(NetworkPluginID.PLUGIN_EVM)
    return useMemo(() => {
        const tempNFTs: Record<string, NonFungibleContract> = {}
        if (assets?.length) {
            for (const NFT of assets) {
                if (NFT.chainId !== ChainId.Mainnet) continue
                const glbSupport = NFT.metadata?.imageURL?.endsWith('.glb') ?? false
                if (NFT.metadata?.imageURL) {
                    NFT.metadata.imageURL = resolveIPFS_URL(NFT.metadata.imageURL)
                }
                const tokens: Record<string, OwnerERC721TokenInfo> = {
                    ...tempNFTs[NFT.address]?.tokens,
                    [NFT.tokenId]: { ...NFT, tokenId: NFT.tokenId, glbSupport },
                }
                tempNFTs[NFT.address] = {
                    name: (NFT.collection?.name || NFT.contract?.name) ?? '',
                    contract: NFT.address,
                    icon: (NFT.collection?.iconURL || NFT.metadata?.imageURL) ?? '',
                    tokens,
                    chainId: NFT.chainId,
                }
            }
        }
        const nfts = Object.values(tempNFTs).map((v) => ({ ...v, tokens: Object.values(v.tokens) }))
        return { nfts, state }
    }, [JSON.stringify(user), JSON.stringify(assets), state])
}
