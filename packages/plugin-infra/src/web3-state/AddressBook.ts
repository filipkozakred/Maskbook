import { uniqBy } from 'lodash-unified'
import type { Subscription } from 'use-subscription'
import { mapSubscription, mergeSubscription, StorageItem } from '@masknet/shared-base'
import type { Plugin } from '../types'
import type { Web3Plugin } from '../web3-types'

export class AddressBookState<ChainId extends number, AddressBook extends Record<ChainId, string[]>>
    implements Web3Plugin.ObjectCapabilities.AddressBookState<ChainId>
{
    protected storage: StorageItem<AddressBook> = null!
    public addressBook?: Subscription<string[]>

    constructor(
        protected context: Plugin.Shared.SharedContext,
        protected defaultValue: AddressBook,
        protected subscriptions: {
            chainId?: Subscription<ChainId>
        },
        protected options: {
            isValidAddress(a: string): boolean
            isSameAddress(a: string, b: string): boolean
            formatAddress(a: string): string
        },
    ) {
        const { storage } = this.context.createKVStorage('persistent', {
            value: defaultValue,
        })
        this.storage = storage.value

        if (this.subscriptions.chainId) {
            this.addressBook = mapSubscription(
                mergeSubscription<[ChainId, AddressBook]>(this.subscriptions.chainId, this.storage.subscription),
                ([chainId, addressBook]) => addressBook[chainId],
            )
        }
    }

    async addAddress(chainId: ChainId, address: string) {
        if (!this.options.isValidAddress(address)) throw new Error(`Invalid address: ${address}`)
        const all = this.storage.value
        await this.storage.setValue({
            ...all,
            [chainId]: uniqBy([...all[chainId], this.options.formatAddress(address)], (x) => x.toLowerCase()),
        })
    }
    async removeAddress(chainId: ChainId, address: string) {
        if (!this.options.isValidAddress(address)) throw new Error(`Invalid address: ${address}`)
        const all = this.storage.value
        await this.storage.setValue({
            ...all,
            [chainId]: all[chainId].filter((x) => this.options.isSameAddress(x, address)),
        })
    }
}