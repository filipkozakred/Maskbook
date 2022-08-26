import { PluginRuntime } from '../runtime/runtime.js'
import { BasicHostHooks, PluginRunner } from '../runtime/runner.js'
import { getURL } from '../utils/url.js'
import { addPeerDependencies } from '../peer-dependencies/index.js'
import { AsyncCall, AsyncGeneratorCall } from 'async-call-rpc/full'
import { serializer } from '@masknet/shared-base'
import { isManifest } from '../utils/manifest.js'
import type { ExportAllBinding } from '@masknet/compartment'

export interface BackgroundHostHooks extends BasicHostHooks {}
export interface BackgroundInstance {
    id: string
    isLocal: boolean
    runtime: PluginRuntime
    backupHandler?: Function
}
export class BackgroundPluginHost extends PluginRunner<BackgroundHostHooks, BackgroundInstance> {
    constructor(
        hooks: BackgroundHostHooks,
        allowLocalOverrides: boolean,
        signal: AbortSignal = new AbortController().signal,
    ) {
        super(hooks, allowLocalOverrides, signal)
    }

    protected async HostStartPlugin(id: string, isLocal: boolean, signal: AbortSignal): Promise<BackgroundInstance> {
        const manifest = await this.hooks.fetchManifest(id, isLocal)
        if (!isManifest(manifest)) throw new TypeError(`${id} does not have a valid manifest.`)

        const runtime = new PluginRuntime(id, {}, signal)
        addPeerDependencies(runtime)
        // TODO: provide impl for @masknet/plugin/utils/open (openWindow)
        // TODO: provide impl for @masknet/plugin/worker (taggedStorage, addBackupHandler)

        const { background, rpc, rpcGenerator } = manifest.entries || {}
        if (background) await runtime.imports(getURL(id, background, isLocal))

        const instance: BackgroundInstance = {
            id,
            isLocal,
            runtime,
        }
        await this.startRPC(instance, rpc, rpcGenerator)
        return instance
    }

    private async startRPC(instance: BackgroundInstance, rpc: string | undefined, rpcGenerator: string | undefined) {
        if (!rpc && !rpcGenerator) return
        const { id, isLocal, runtime } = instance

        const rpcReExports: ExportAllBinding[] = []
        if (rpc) rpcReExports.push({ exportAllFrom: getURL(id, rpc, isLocal), as: 'worker' })
        if (rpcGenerator) rpcReExports.push({ exportAllFrom: getURL(id, rpcGenerator, isLocal), as: 'workerGenerator' })
        runtime.addReExportModule('@masknet/plugin/utils/rpc', ...rpcReExports)

        // TODO: abort rpc when the signal is aborted
        const rpcReExport = await runtime.imports('@masknet/plugin/utils/rpc')
        if (rpc) {
            AsyncCall(rpcReExport.worker, {
                channel: this.hooks.createRpcChannel(id, this.signal),
                serializer,
                log: true,
                thenable: false,
            })
        }
        if (rpcGenerator) {
            AsyncGeneratorCall(rpcReExport.workerGenerator, {
                channel: this.hooks.createRpcGeneratorChannel(id, this.signal),
                serializer,
                log: true,
                thenable: false,
            })
        }
    }
}
