import type { Plugin } from '@masknet/plugin-infra'
import { Trans } from 'react-i18next'
import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { Icons } from '@masknet/icons'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/shared-base'
import VCentDialog from './TweetDialog.js'
import { base } from '../base.js'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    PostInspector: Component,
    ApplicationEntries: [
        {
            ApplicationEntryID: base.ID,
            category: 'dapp',
            description: <Trans i18nKey="plugin_valuables_description" />,
            name: <Trans i18nKey="plugin_valuables_name" />,
            marketListSortingPriority: 10,
            tutorialLink: 'https://realmasknetwork.notion.site/27424923ee454a4a9b0ed16fc5cb93d0',
            icon: <Icons.Valuables size={36} variant="dark" />,
        },
    ],
    wrapperProps: {
        icon: (
            <Icons.Valuables
                size={24}
                style={{ filter: 'drop-shadow(0px 6px 12px rgba(0, 0, 0, 0.2))' }}
                variant="dark"
            />
        ),
        title: <Trans i18nKey="plugin_valuables_name" />,
    },
}

export default sns

function Component() {
    const tweetAddress = usePostInfoDetails.snsID()

    if (!tweetAddress) return null

    return (
        <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM, chainId: ChainId.Mainnet }}>
            <VCentDialog tweetAddress={tweetAddress} />
        </Web3ContextProvider>
    )
}
