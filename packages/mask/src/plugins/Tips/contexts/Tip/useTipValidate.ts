import { useMemo } from 'react'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useNetworkContext, useFungibleTokenBalance } from '@masknet/web3-hooks-base'
import { isGreaterThan, isLessThanOrEqualTo, rightShift } from '@masknet/web3-shared-base'
import { useI18N } from '../../locales/index.js'
import { TipsType, ValidationTuple } from '../../types'
import type { TipContextOptions } from './TipContext.js'

type TipValidateOptions = Pick<
    TipContextOptions,
    'tipType' | 'amount' | 'token' | 'nonFungibleTokenId' | 'nonFungibleTokenAddress'
>

export function useTipValidate({
    tipType,
    amount,
    token,
    nonFungibleTokenId: tokenId,
    nonFungibleTokenAddress: tokenAddress,
}: TipValidateOptions): ValidationTuple {
    const { account, chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const { value: balance = '0' } = useFungibleTokenBalance(pluginID, token?.address, { chainId, account })
    const t = useI18N()

    const result: ValidationTuple = useMemo(() => {
        if (tipType === TipsType.Tokens) {
            if (!amount || isLessThanOrEqualTo(amount, 0)) return [false]
            if (isGreaterThan(rightShift(amount, token?.decimals), balance))
                return [false, t.token_insufficient_balance()]
        } else if (pluginID === NetworkPluginID.PLUGIN_EVM) {
            if (!tokenId || !tokenAddress) return [false]
        } else if (pluginID === NetworkPluginID.PLUGIN_SOLANA && !tokenAddress) {
            return [false]
        }
        return [true]
    }, [tipType, amount, token?.decimals, balance, pluginID, tokenId, tokenAddress, t])

    return result
}
