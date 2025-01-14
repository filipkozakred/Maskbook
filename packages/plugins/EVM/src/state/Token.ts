import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { TokenState, TokenStorage } from '@masknet/web3-state'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, formatEthereumAddress, isValidAddress, SchemaType } from '@masknet/web3-shared-evm'

export class Token extends TokenState<ChainId, SchemaType> {
    constructor(
        context: Plugin.Shared.SharedContext,
        subscriptions: {
            account?: Subscription<string>
        },
    ) {
        const defaultValue: TokenStorage<ChainId, SchemaType> = {
            fungibleTokenList: {},
            nonFungibleTokenList: {},
            fungibleTokenBlockedBy: {},
            nonFungibleTokenBlockedBy: {},
        }
        super(context, defaultValue, subscriptions, {
            isValidAddress,
            isSameAddress,
            formatAddress: formatEthereumAddress,
        })
    }
}
