import { SocialNetworkEnum } from '@masknet/encryption'
import type { SocialNetwork } from '../../social-network/types.js'
import { EnhanceableSite } from '@masknet/shared-base'

const origins = ['https://mirror.xyz/*']
export const mirrorBase: SocialNetwork.Base = {
    networkIdentifier: EnhanceableSite.Mirror,
    encryptionNetwork: SocialNetworkEnum.Unknown,
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.host.endsWith(EnhanceableSite.Mirror)
    },
}
