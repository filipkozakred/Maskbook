import { compact } from 'lodash-unified'
import type { Plugin } from '@masknet/plugin-infra'
import { SocialIdentity, SocialAddress, SocialAddressType } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { IdentityServiceState } from '@masknet/web3-state'
import { isValidAddress } from '@masknet/web3-shared-solana'
import { SolanaRPC } from '../messages.js'

const SOL_RE = /\S{1,256}\.sol\b/

function getSolanaAddress(bio: string) {
    const addressMatched = bio.match(/\b\w{32,44}\b/)
    const address = addressMatched?.[0]
    if (address && !address.startsWith('0x') && isValidAddress(address)) return address
    return
}

function getSolanaDomain(nickname: string, bio: string) {
    const [matched] = nickname.match(SOL_RE) ?? bio.match(SOL_RE) ?? []
    return matched
}

function getSolanaDomainAddress(domain: string) {
    if (!domain) return
    return SolanaRPC.lookup(domain)
}

export class IdentityService extends IdentityServiceState {
    constructor(protected context: Plugin.Shared.SharedContext) {
        super()
    }

    protected override async getFromRemote(identity: SocialIdentity) {
        const { bio = '', nickname = '' } = identity
        const address = getSolanaAddress(bio)
        const domain = getSolanaDomain(nickname, bio)
        const domainAddress = domain ? await getSolanaDomainAddress(domain) : undefined

        return compact<SocialAddress<NetworkPluginID.PLUGIN_SOLANA>>([
            address
                ? {
                      pluginID: NetworkPluginID.PLUGIN_SOLANA,
                      type: SocialAddressType.Address,
                      label: '',
                      address,
                  }
                : undefined,
            domainAddress
                ? {
                      pluginID: NetworkPluginID.PLUGIN_SOLANA,
                      type: SocialAddressType.SOL,
                      label: domain ?? domainAddress,
                      address: domainAddress,
                  }
                : undefined,
        ])
    }
}
