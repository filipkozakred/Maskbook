import { useState } from 'react'
import { useAsync } from 'react-use'
import type { GasOptionConfig, ChainId } from '@masknet/web3-shared-evm'
import { GasOptionType, toFixed } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useGasOptions, useWeb3State } from '@masknet/web3-hooks-base'

// TODO: support multiple chain
export function useGasConfig(chainId: ChainId) {
    const [gasConfig, setGasConfig] = useState<GasOptionConfig | undefined>()
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const isEIP1559 = Others?.chainResolver.isSupport(chainId, 'EIP1559')

    const { value: gasOptions_ } = useGasOptions(NetworkPluginID.PLUGIN_EVM)
    const { value: gasPrice } = useAsync(async () => {
        try {
            const maxFeePerGas = toFixed(gasOptions_?.[GasOptionType.NORMAL]?.suggestedMaxFeePerGas ?? 0, 0)
            const maxPriorityFeePerGas = toFixed(
                gasOptions_?.[GasOptionType.NORMAL]?.suggestedMaxPriorityFeePerGas ?? 0,
                0,
            )

            setGasConfig(
                isEIP1559
                    ? {
                          maxFeePerGas,
                          maxPriorityFeePerGas,
                      }
                    : {
                          gasPrice: maxFeePerGas,
                      },
            )
            return maxFeePerGas
        } catch (err) {
            setGasConfig(undefined)
            return
        }
    }, [chainId, gasOptions_])

    return { gasPrice, gasConfig, setGasConfig }
}
