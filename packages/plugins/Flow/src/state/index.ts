import type { Plugin } from '@masknet/plugin-infra'
import { AddressBook } from './AddressBook'
import { Asset } from './Asset'
import { Provider } from './Provider'
import { Protocol } from './Protocol'
import { Settings } from './Settings'
import { TokenList } from './TokenList'
import { Transaction } from './Transaction'
import { Wallet } from './Wallet'
import { Utils } from './Utils'
import type { FlowWeb3State } from './Protocol/types'

export function createWeb3State(context: Plugin.Shared.SharedContext): FlowWeb3State {
    const Provider_ = new Provider(context)
    return {
        AddressBook: new AddressBook(context, {
            chainId: Provider_.chainId,
        }),
        Asset: new Asset(),
        Settings: new Settings(context),
        TokenList: new TokenList(context, {
            chainId: Provider_.chainId,
        }),
        Transaction: new Transaction(context, {
            chainId: Provider_.chainId,
            account: Provider_.account,
        }),
        Provider: Provider_,
        Protocol: new Protocol(context, {
            chainId: Provider_.chainId,
            account: Provider_.account,
            providerType: Provider_.providerType,
        }),
        Wallet: new Wallet(context),
        Utils: new Utils(),
    }
}
