import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { useERC20TokenContract } from './useERC20TokenContract.js'

export function useERC20TokenTotalSupply(address?: string) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const erc20TokenContract = useERC20TokenContract(chainId, address)
    return useAsyncRetry(async () => {
        if (!erc20TokenContract) return
        return erc20TokenContract?.methods.totalSupply().call()
    }, [chainId, erc20TokenContract])
}
