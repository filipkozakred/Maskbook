import { defineSocialNetworkUI } from '../../social-network/index.js'
import { mirrorBase } from './base.js'

defineSocialNetworkUI({
    ...mirrorBase,
    load: () => import('./ui-provider.js'),
    hotModuleReload(callback) {
        if (import.meta.webpackHot) {
            import.meta.webpackHot.accept('./ui-provider.ts', async () => {
                callback((await import('./ui-provider.js')).default)
            })
        }
    },
})
