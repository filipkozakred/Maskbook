import { Plugin, usePostInfoDetails } from '@masknet/plugin-infra'
import { base } from '../base'
import ENSDialog from './ENSDialog'
import ENSCard from './ENSCard'
import { PLUGIN_ID } from '../constants'

const isENS = (x: string): boolean => /^https:\/\/app.ens.domains\/name\/[\S\s]{3,}.eth\/details$/.test(x)

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal, context) {},
    CompositionDialogEntry: {
        label: 'ENS',
        dialog: ENSDialog,
    },
    PostInspector: function Component(): JSX.Element | null {
        const links = usePostInfoDetails.mentionedLinks()
        const link = links.find(isENS)
        if (!link) return null
        return <ENSCard url={link} />
    },
    ProfileTabs: [
        {
            ID: `${PLUGIN_ID}_tabContent`,
            label: 'ENS',
            priority: 10,
            UI: {
                TabContent: (identity) => (
                    <ENSCard
                        url="kk"
                        identity={{
                            userId: identity?.identity?.identifier?.userId,
                            bio: identity?.identity?.bio,
                            nickname: identity?.identity?.nickname,
                        }}
                    />
                ),
            },
        },
    ],
}

export default sns