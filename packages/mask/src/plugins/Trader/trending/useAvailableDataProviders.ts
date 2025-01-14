import { useAsync } from 'react-use'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { PluginTraderRPC } from '../messages.js'
import type { TagType } from '../types/index.js'
import type { DataProvider } from '@masknet/public-api'
import type { AsyncState } from 'react-use/lib/useAsyncFn'

export function useAvailableDataProviders(type?: TagType, keyword?: string): AsyncState<DataProvider[]> {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    return useAsync(async () => {
        return PluginTraderRPC.getAvailableDataProviders(chainId, type, keyword)
    }, [chainId, type, keyword])
}
