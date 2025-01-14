import { Suspense } from 'react'
import { StyledEngineProvider, Theme } from '@mui/material'
import { Web3ContextProvider } from '@masknet/web3-hooks-base'
import { I18NextProviderHMR, SharedContextProvider } from '@masknet/shared'
import { MaskThemeProvider } from '@masknet/theme'
import { ErrorBoundary, ErrorBoundaryBuildInfoContext, useValueRef } from '@masknet/shared-base-ui'
import { getSiteType, i18NextInstance, NetworkPluginID } from '@masknet/shared-base'
import { buildInfoMarkdown } from './utils/BuildInfoMarkdown.js'
import { activatedSocialNetworkUI } from './social-network/index.js'
import { isFacebook } from './social-network-adaptor/facebook.com/base.js'
import { pluginIDSettings } from './../shared/legacy-settings/settings.js'
import { getBackgroundColor } from './utils/index.js'
import { isTwitter } from './social-network-adaptor/twitter.com/base.js'

const identity = (jsx: React.ReactNode) => jsx as JSX.Element
function compose(init: React.ReactNode, ...f: Array<(children: React.ReactNode) => JSX.Element>) {
    // eslint-disable-next-line unicorn/no-array-reduce
    return f.reduceRight((prev, curr) => curr(prev), <>{init}</>)
}

function useMaskIconPalette(theme: Theme) {
    const backgroundColor = getBackgroundColor(document.body)
    const isDark = theme.palette.mode === 'dark'
    const isDarker = backgroundColor === 'rgb(0,0,0)'

    return isDark ? (!isDarker && isTwitter(activatedSocialNetworkUI) ? 'dim' : 'dark') : 'light'
}
export interface MaskUIRootProps extends React.PropsWithChildren<{}> {
    kind: 'page' | 'sns'
    useTheme(): Theme
    fallback?: React.ReactNode
}

export function MaskUIRoot({ children, kind, useTheme, fallback }: MaskUIRootProps) {
    const site = getSiteType()
    const pluginIDs = useValueRef(pluginIDSettings)

    return compose(
        children,
        (jsx) => <Suspense fallback={null} children={jsx} />,
        (jsx) => <ErrorBoundaryBuildInfoContext.Provider value={buildInfoMarkdown} children={jsx} />,
        (jsx) => <ErrorBoundary children={jsx} />,
        (jsx) => (
            <Web3ContextProvider
                value={{ pluginID: site ? pluginIDs[site] : NetworkPluginID.PLUGIN_EVM }}
                children={jsx}
            />
        ),
        (jsx) => <I18NextProviderHMR i18n={i18NextInstance} children={jsx} />,
        kind === 'page' ? (jsx) => <StyledEngineProvider injectFirst children={jsx} /> : identity,
        (jsx) => (
            <MaskThemeProvider
                useMaskIconPalette={useMaskIconPalette}
                CustomSnackbarOffsetY={isFacebook(activatedSocialNetworkUI) ? 80 : undefined}
                useTheme={useTheme}
                children={jsx}
            />
        ),
        (jsx) => <SharedContextProvider>{jsx}</SharedContextProvider>,
        (jsx) => <Suspense fallback={fallback ?? null} children={jsx} />,
    )
}
