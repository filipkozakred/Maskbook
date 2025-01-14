import { useAsyncFn } from 'react-use'
import { useChainContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { toFixed } from '@masknet/web3-shared-base'
import { encodeContractTransaction, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { useCryptoArtAI_Contract } from './useCryptoArtAI_Contract.js'

export function usePlaceBidCallback(is24Auction: boolean, editionNumber: string) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { artistAcceptingBidsV2_contract, cANFTMarket_contract } = useCryptoArtAI_Contract(chainId)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)

    return useAsyncFn(
        async (priceInWei: number) => {
            if (!connection) return
            if (!is24Auction && !artistAcceptingBidsV2_contract) return
            if (is24Auction && !cANFTMarket_contract) return

            // estimate gas and compose transaction
            const config = {
                from: account,
                value: toFixed(priceInWei),
            }
            const tx = is24Auction
                ? await encodeContractTransaction(
                      artistAcceptingBidsV2_contract!,
                      artistAcceptingBidsV2_contract!.methods.placeBid(editionNumber),
                      config,
                  )
                : await encodeContractTransaction(
                      cANFTMarket_contract!,
                      cANFTMarket_contract!.methods.placeBid(editionNumber, ZERO_ADDRESS),
                      config,
                  )
            return connection.sendTransaction(tx)
        },
        [account, chainId, is24Auction, editionNumber, artistAcceptingBidsV2_contract, cANFTMarket_contract],
    )
}
