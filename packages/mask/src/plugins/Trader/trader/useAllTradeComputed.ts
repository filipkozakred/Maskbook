import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { FungibleToken, multipliedBy, pow10 } from '@masknet/web3-shared-base'
import { useTrade as useNativeTokenTrade } from './native/useTrade.js'
import { useTradeComputed as useNativeTokenTradeComputed } from './native/useTradeComputed.js'
import { SwapOOData, TagType, TradeInfo, TradeStrategy } from '../types/index.js'
import { useV3Trade as useUniswapV3Trade } from './uniswap/useTrade.js'
import { useTradeComputed as useUniswapTradeComputed } from './uniswap/useTradeComputed.js'
import { useTradeGasLimit as useUniswapTradeGasLimit } from './uniswap/useTradeGasLimit.js'
import { useUniswapV2Like } from './uniswap/useUniswapV2Like.js'
import { useTrade as useZrxTrade } from './0x/useTrade.js'
import { useTradeComputed as useZrxTradeComputed } from './0x/useTradeComputed.js'
import { useTradeGasLimit as useZrxTradeGasLimit } from './0x/useTradeGasLimit.js'
import { useTrade as useBalancerTrade } from './balancer/useTrade.js'
import { useTradeComputed as useBalancerTradeComputed } from './balancer/useTradeComputed.js'
import { useTradeGasLimit as useBalancerTradeGasLimit } from './balancer/useTradeGasLimit.js'
import { useTrade as useDODOTrade } from './dodo/useTrade.js'
import { useTradeComputed as useDODOTradeComputed } from './dodo/useTradeComputed.js'
import { useTradeGasLimit as useDODOTradeGasLimit } from './dodo/useTradeGasLimit.js'
import { useTrade as useBancorTrade } from './bancor/useTrade.js'
import { useTradeComputed as useBancorTradeComputed } from './bancor/useTradeComputed.js'
import { useTradeGasLimit as useBancorTradeGasLimit } from './bancor/useTradeGasLimit.js'
import { useTradeComputed as useOpenOceanTradeComputed } from './openocean/useTradeComputed.js'
import { useTrade as useOpenOceanTrade } from './openocean/useTrade.js'
import { useTradeGasLimit as useOpenOceanTradeGasLimit } from './openocean/useTradeGasLimit.js'
import { TradeProvider } from '@masknet/public-api'
import { useAvailableTraderProviders } from '../trending/useAvailableTraderProviders.js'
import { useNativeTradeGasLimit } from './useNativeTradeGasLimit.js'
import type { TradeComputed } from '../types/index.js'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useChainContext } from '@masknet/web3-hooks-base'

export function useAllTradeComputed(
    inputAmount: string,
    inputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
    outputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
    temporarySlippage?: number,
): TradeInfo[] {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const inputTokenProduct = pow10(inputToken?.decimals ?? 0)
    const inputAmount_ = multipliedBy(inputAmount || '0', inputTokenProduct)
        .integerValue()
        .toFixed()
    const { value: tradeProviders = EMPTY_LIST } = useAvailableTraderProviders(TagType.CASH, 'MASK', chainId)

    // NATIVE-WNATIVE pair
    const nativeToken_ = useNativeTokenTrade(inputToken, outputToken)
    const nativeToken = useNativeTokenTradeComputed(
        nativeToken_.value ?? false,
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        inputToken,
        outputToken,
    )

    const nativeTradeGasLimit = useNativeTradeGasLimit(nativeToken, chainId)

    // uniswap-v2
    const {
        trader_: uniswapV2_,
        trader: uniswapV2,
        traderEstimateGas: uniswapV2EstimateGas,
    } = useUniswapV2Like(tradeProviders, TradeProvider.UNISWAP_V2, inputAmount_, inputToken, outputToken)

    // sushi swap
    const {
        trader_: sushiSwap_,
        trader: sushiSwap,
        traderEstimateGas: sushiSwapEstimateGas,
    } = useUniswapV2Like(tradeProviders, TradeProvider.SUSHISWAP, inputAmount_, inputToken, outputToken)

    // quick swap
    const {
        trader_: quickSwap_,
        trader: quickSwap,
        traderEstimateGas: quickSwapEstimateGas,
    } = useUniswapV2Like(tradeProviders, TradeProvider.QUICKSWAP, inputAmount_, inputToken, outputToken)

    // pancake swap
    const {
        trader_: pancakeSwap_,
        trader: pancakeSwap,
        traderEstimateGas: pancakeSwapEstimateGas,
    } = useUniswapV2Like(tradeProviders, TradeProvider.PANCAKESWAP, inputAmount_, inputToken, outputToken)

    // uniswap-v3 like providers
    const uniswapV3_ = useUniswapV3Trade(
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        tradeProviders.some((x) => x === TradeProvider.UNISWAP_V3) ? inputToken : undefined,
        tradeProviders.some((x) => x === TradeProvider.UNISWAP_V3) ? outputToken : undefined,
    )
    const uniswapV3 = useUniswapTradeComputed(uniswapV3_.value, inputToken, outputToken, temporarySlippage)
    const uniswapV3SwapEstimateGas = useUniswapTradeGasLimit(uniswapV3, TradeProvider.UNISWAP_V3)

    // zrx
    const zrx_ = useZrxTrade(
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        tradeProviders.some((x) => x === TradeProvider.ZRX) ? inputToken : undefined,
        tradeProviders.some((x) => x === TradeProvider.ZRX) ? outputToken : undefined,
    )
    const zrx = useZrxTradeComputed(zrx_.value ?? null, TradeStrategy.ExactIn, inputToken, outputToken)
    const zrxSwapEstimateGas = useZrxTradeGasLimit(zrx)

    // balancer
    const balancer_ = useBalancerTrade(
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        tradeProviders.some((x) => x === TradeProvider.BALANCER) ? inputToken : undefined,
        tradeProviders.some((x) => x === TradeProvider.BALANCER) ? outputToken : undefined,
    )
    const balancer = useBalancerTradeComputed(
        balancer_.value ?? null,
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        inputToken,
        outputToken,
    )
    const balancerSwapEstimateGas = useBalancerTradeGasLimit(balancer)

    // dodo
    const dodo_ = useDODOTrade(
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        tradeProviders.some((x) => x === TradeProvider.DODO) ? inputToken : undefined,
        tradeProviders.some((x) => x === TradeProvider.DODO) ? outputToken : undefined,
        temporarySlippage,
    )
    const dodo = useDODOTradeComputed(dodo_.value ?? null, TradeStrategy.ExactIn, inputToken, outputToken)
    const dodoSwapEstimateGas = useDODOTradeGasLimit(dodo)

    // bancor
    const bancor_ = useBancorTrade(
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        tradeProviders.some((x) => x === TradeProvider.BANCOR) ? inputToken : undefined,
        tradeProviders.some((x) => x === TradeProvider.BANCOR) ? outputToken : undefined,
        temporarySlippage,
    )
    const bancor = useBancorTradeComputed(bancor_.value ?? null, TradeStrategy.ExactIn, inputToken, outputToken)
    const bancorSwapEstimateGas = useBancorTradeGasLimit(bancor)

    // traderjoe
    const {
        trader_: traderJoe_,
        trader: traderJoe,
        traderEstimateGas: traderJoeEstimateGas,
    } = useUniswapV2Like(tradeProviders, TradeProvider.TRADERJOE, inputAmount_, inputToken, outputToken)

    // pangolindex
    const {
        trader_: pangolindex_,
        trader: pangolindex,
        traderEstimateGas: pangolinEstimateGas,
    } = useUniswapV2Like(tradeProviders, TradeProvider.PANGOLIN, inputAmount_, inputToken, outputToken)

    // openocean
    const openocean_ = useOpenOceanTrade(
        TradeStrategy.ExactIn,
        inputAmount_,
        '0',
        inputToken,
        outputToken,
        temporarySlippage,
    )
    const openocean = useOpenOceanTradeComputed(
        openocean_.value ?? null,
        TradeStrategy.ExactIn,
        inputToken,
        outputToken,
    )
    const openoceanSwapEstimateGas = useOpenOceanTradeGasLimit(openocean as TradeComputed<SwapOOData> | null)

    // trisolaris
    const {
        trader_: trisolaris_,
        trader: trisolaris,
        traderEstimateGas: trisolarisEstimateGas,
    } = useUniswapV2Like(tradeProviders, TradeProvider.TRISOLARIS, inputAmount_, inputToken, outputToken)

    // WannaSwap
    const {
        trader_: wannaswap_,
        trader: wannaswap,
        traderEstimateGas: wannaSwapEstimateGas,
    } = useUniswapV2Like(tradeProviders, TradeProvider.WANNASWAP, inputAmount_, inputToken, outputToken)

    // Venom Swap
    const {
        trader_: venomswap_,
        trader: venomswap,
        traderEstimateGas: venomswapEstimateGas,
    } = useUniswapV2Like(tradeProviders, TradeProvider.VENOMSWAP, inputAmount_, inputToken, outputToken)

    // Open Swap
    const {
        trader_: openswap_,
        trader: openswap,
        traderEstimateGas: openswapEstimateGas,
    } = useUniswapV2Like(tradeProviders, TradeProvider.OPENSWAP, inputAmount_, inputToken, outputToken)

    // Defi Kingdoms
    const {
        trader_: defikingdoms_,
        trader: defikingdoms,
        traderEstimateGas: defikingdomsEstimateGas,
    } = useUniswapV2Like(tradeProviders, TradeProvider.DEFIKINGDOMS, inputAmount_, inputToken, outputToken)

    // Mdex
    const {
        trader_: mdex_,
        trader: mdex,
        traderEstimateGas: mdexEstimateGas,
    } = useUniswapV2Like(tradeProviders, TradeProvider.MDEX, inputAmount_, inputToken, outputToken)

    // Arthswap
    const {
        trader_: arthswap_,
        trader: arthswap,
        traderEstimateGas: arthswapEstimateGas,
    } = useUniswapV2Like(tradeProviders, TradeProvider.ARTHSWAP, inputAmount_, inputToken, outputToken)

    // Versa Finance
    const {
        trader_: versa_,
        trader: versa,
        traderEstimateGas: versaEstimateGas,
    } = useUniswapV2Like(tradeProviders, TradeProvider.VERSA, inputAmount_, inputToken, outputToken)

    // Astar Exchange
    const {
        trader_: astarexchange_,
        trader: astarexchange,
        traderEstimateGas: astarexchangeEstimateGas,
    } = useUniswapV2Like(tradeProviders, TradeProvider.ASTAREXCHANGE, inputAmount_, inputToken, outputToken)

    // Yumi Swap
    const {
        trader_: yumiswap_,
        trader: yumiswap,
        traderEstimateGas: yumiswapEstimateGas,
    } = useUniswapV2Like(tradeProviders, TradeProvider.YUMISWAP, inputAmount_, inputToken, outputToken)

    const allTradeResult = [
        { provider: TradeProvider.UNISWAP_V2, ...uniswapV2_, value: uniswapV2, gas: uniswapV2EstimateGas },
        { provider: TradeProvider.SUSHISWAP, ...sushiSwap_, value: sushiSwap, gas: sushiSwapEstimateGas },
        { provider: TradeProvider.QUICKSWAP, ...quickSwap_, value: quickSwap, gas: quickSwapEstimateGas },
        { provider: TradeProvider.PANCAKESWAP, ...pancakeSwap_, value: pancakeSwap, gas: pancakeSwapEstimateGas },
        { provider: TradeProvider.UNISWAP_V3, ...uniswapV3_, value: uniswapV3, gas: uniswapV3SwapEstimateGas },
        { provider: TradeProvider.ZRX, ...zrx_, value: zrx, gas: zrxSwapEstimateGas },
        { provider: TradeProvider.BALANCER, ...balancer_, value: balancer, gas: balancerSwapEstimateGas },
        { provider: TradeProvider.DODO, ...dodo_, value: dodo, gas: dodoSwapEstimateGas },
        { provider: TradeProvider.BANCOR, ...bancor_, value: bancor, gas: bancorSwapEstimateGas },
        { provider: TradeProvider.TRADERJOE, ...traderJoe_, value: traderJoe, gas: traderJoeEstimateGas },
        { provider: TradeProvider.PANGOLIN, ...pangolindex_, value: pangolindex, gas: pangolinEstimateGas },
        { provider: TradeProvider.OPENOCEAN, ...openocean_, value: openocean, gas: openoceanSwapEstimateGas },
        { provider: TradeProvider.WANNASWAP, ...wannaswap_, value: wannaswap, gas: wannaSwapEstimateGas },
        { provider: TradeProvider.TRISOLARIS, ...trisolaris_, value: trisolaris, gas: trisolarisEstimateGas },
        { provider: TradeProvider.VENOMSWAP, ...venomswap_, value: venomswap, gas: venomswapEstimateGas },
        { provider: TradeProvider.OPENSWAP, ...openswap_, value: openswap, gas: openswapEstimateGas },
        { provider: TradeProvider.MDEX, ...mdex_, value: mdex, gas: mdexEstimateGas },
        { provider: TradeProvider.ARTHSWAP, ...arthswap_, value: arthswap, gas: arthswapEstimateGas },
        { provider: TradeProvider.VERSA, ...versa_, value: versa, gas: versaEstimateGas },
        {
            provider: TradeProvider.ASTAREXCHANGE,
            ...astarexchange_,
            value: astarexchange,
            gas: astarexchangeEstimateGas,
        },
        {
            provider: TradeProvider.YUMISWAP,
            ...yumiswap_,
            value: yumiswap,
            gas: yumiswapEstimateGas,
        },
    ]

    return nativeToken_.value
        ? tradeProviders.map((item) => ({
              provider: item,
              ...nativeToken_,
              value: nativeToken,
              gas: nativeTradeGasLimit,
          }))
        : allTradeResult.filter((item) => tradeProviders.some((provider) => item.provider === provider))
}
