import type { Transaction } from '@solana/web3.js'
import Wallet from '@project-serum/sol-wallet-adapter'
import type { ChainId } from '@masknet/web3-shared-solana'
import type { Provider } from '../types'
import { BaseProvider } from './Base'

export class SolanaProvider extends BaseProvider implements Provider {
    private wallet: Wallet | null = null

    private get solanaProvider() {
        if (!this.wallet) throw new Error('No connection.')
        return this.wallet
    }

    private set solanaProvider(newWallet: Wallet) {
        this.wallet = newWallet
    }

    constructor(private providerURL = 'https://www.sollet.io') {
        super()
    }

    override get account() {
        return this?.wallet?.publicKey?.toBase58() ?? ''
    }

    override async signMessage(dataToSign: string) {
        const data = new TextEncoder().encode(dataToSign)
        const { signature } = await this.solanaProvider.sign(data, 'uft8')
        return signature.toString('utf8')
    }

    override signTransaction(transaction: Transaction) {
        return this.solanaProvider.signTransaction(transaction)
    }

    override signTransactions(transactions: Transaction[]) {
        return this.solanaProvider.signAllTransactions(transactions)
    }

    override async connect(chainId: ChainId) {
        this.solanaProvider = new Wallet(this.providerURL, '')
        await this.solanaProvider.connect()
        return {
            chainId,
            account: this.solanaProvider.publicKey?.toBase58() ?? '',
        }
    }

    override async disconnect() {
        await this.solanaProvider.disconnect()

        // clean the internal wallet
        this.wallet = null
    }
}