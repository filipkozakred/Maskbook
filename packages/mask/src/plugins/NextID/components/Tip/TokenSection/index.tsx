import { useFungibleTokenBalance } from '@masknet/plugin-infra/web3'
import { usePickToken } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { isNativeTokenAddress } from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { FC, useCallback, useMemo } from 'react'
import { TokenAmountPanel } from '../../../../../web3/UI/TokenAmountPanel'
import { TargetChainIdContext, useTip } from '../../../../Tips/contexts'
import { useGasConfig } from '../../../../Trader/SNSAdaptor/trader/hooks/useGasConfig'

const GAS_LIMIT = 21000
export const TokenSection: FC = () => {
    const { token, setToken, amount, setAmount, isSending } = useTip()
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    // balance
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useFungibleTokenBalance(
        NetworkPluginID.PLUGIN_EVM,
        token?.address || '',
        { chainId },
    )
    const gasConfig = useGasConfig(chainId)
    const maxAmount = useMemo(() => {
        if (!isNativeTokenAddress(token?.address)) return tokenBalance
        const gasPrice = gasConfig.gasPrice ?? '1'
        const gasFee = new BigNumber(gasPrice).times(GAS_LIMIT)
        return new BigNumber(tokenBalance).minus(gasFee).toFixed()
    }, [token?.address, tokenBalance, gasConfig.gasPrice])
    const pickToken = usePickToken()
    const onSelectTokenChipClick = useCallback(async () => {
        const picked = await pickToken({
            chainId,
            disableNativeToken: false,
            selectedTokens: token ? [token.address] : [],
        })
        if (picked) {
            setToken(picked)
        }
    }, [pickToken, token?.address, chainId])
    // #endregion
    return (
        <TokenAmountPanel
            label=""
            token={token}
            amount={amount}
            maxAmount={maxAmount}
            onAmountChange={setAmount}
            balance={tokenBalance}
            InputProps={{
                disabled: isSending,
            }}
            SelectTokenChip={{
                loading: loadingTokenBalance,
                ChipProps: {
                    onClick: onSelectTokenChipClick,
                },
            }}
        />
    )
}
