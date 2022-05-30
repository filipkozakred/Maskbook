import { injectedOperaProvider } from '@masknet/injected-script'
import { ProviderType } from '@masknet/web3-shared-evm'
import type { EVM_Provider } from '../types'
import { BaseInjectedProvider } from './BaseInjected'

export class OperaProvider extends BaseInjectedProvider implements EVM_Provider {
    constructor() {
        super(ProviderType.Opera, injectedOperaProvider)
    }
}
