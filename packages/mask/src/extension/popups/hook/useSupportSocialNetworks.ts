import { useAsync } from 'react-use'
import Service from '../../service'
import type { EnhanceableSite } from '@masknet/shared-base'

export const useSupportSocialNetworks = () => {
    return useAsync(async () => {
        const sites = await Service.SocialNetwork.getSupportedSites({ isSocialNetwork: true })
        return sites.map((x) => x.networkIdentifier as EnhanceableSite)
    }, [])
}
