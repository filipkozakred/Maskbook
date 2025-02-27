import { useTraderConstants, ChainId, isNativeTokenAddress, SchemaType } from '@masknet/web3-shared-evm'
import { PluginTraderRPC } from '../../messages.js'
import { SwapBancorRequest, TradeStrategy } from '../../types/index.js'
import { useSlippageTolerance } from './useSlippageTolerance.js'
import { FungibleToken, leftShift } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useDoubleBlockBeatRetry } from '@masknet/web3-hooks-base'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'

export function useTrade(
    strategy: TradeStrategy,
    inputAmountWei: string,
    outputAmountWei: string,
    inputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
    outputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
    temporarySlippage?: number,
): AsyncStateRetry<SwapBancorRequest | null> {
    const slippageSetting = useSlippageTolerance()
    const slippage = temporarySlippage || slippageSetting
    const { chainId, account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { BANCOR_ETH_ADDRESS } = useTraderConstants(chainId)

    const inputAmount = leftShift(inputAmountWei, inputToken?.decimals).toFixed()
    const outputAmount = leftShift(outputAmountWei, outputToken?.decimals).toFixed()
    const isExactIn = strategy === TradeStrategy.ExactIn

    return useDoubleBlockBeatRetry(
        NetworkPluginID.PLUGIN_EVM,
        async () => {
            if (!inputToken || !outputToken) return null
            if (inputAmountWei === '0' && isExactIn) return null
            if (outputAmountWei === '0' && !isExactIn) return null
            if (![ChainId.Mainnet, ChainId.Ropsten].includes(chainId)) return null

            const fromToken = isNativeTokenAddress(inputToken.address)
                ? { ...inputToken, address: BANCOR_ETH_ADDRESS ?? '' }
                : inputToken

            const toToken = isNativeTokenAddress(outputToken.address)
                ? { ...outputToken, address: BANCOR_ETH_ADDRESS ?? '' }
                : outputToken

            return PluginTraderRPC.swapBancor({
                strategy,
                fromToken,
                toToken,
                fromAmount: isExactIn ? inputAmount : void 0,
                toAmount: isExactIn ? void 0 : outputAmount,
                slippage,
                user: account,
                chainId: chainId as ChainId.Mainnet | ChainId.Ropsten,
                minimumReceived: '',
            })
        },
        [
            strategy,
            inputAmountWei,
            outputAmountWei,
            inputToken?.address,
            outputToken?.address,
            slippage,
            account,
            chainId,
        ],
    )
}
