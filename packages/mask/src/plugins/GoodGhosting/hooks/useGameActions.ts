import { TransactionEventType, TransactionStateType } from '@masknet/web3-shared-evm'
import { useGoodGhostingContract } from '../contracts/useGoodGhostingContract.js'
import type { GoodGhostingInfo } from '../types.js'
import { getPlayerStatus, PlayerStatus } from '../utils.js'
import type { TransactionReceipt } from 'web3-core'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'

export function useJoinGame(info: GoodGhostingInfo) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const contract = useGoodGhostingContract(chainId, info.contractAddress)
    const canJoinGame =
        (!info.currentPlayer || info.currentPlayer.canRejoin) &&
        info.currentSegment === 0 &&
        info.numberOfPlayers <= info.maxPlayersCount

    return {
        canJoinGame,
        joinGame: async () => {
            if (!contract) return
            const gasEstimate = await contract.methods.joinGame().estimateGas({
                from: account,
            })

            let txHash = ''
            return new Promise<void>(async (resolve, reject) => {
                contract.methods
                    .joinGame()
                    .send({
                        from: account,
                        gas: gasEstimate,
                    })
                    .on(TransactionEventType.TRANSACTION_HASH, (hash) => (txHash = hash))
                    .on(TransactionEventType.CONFIRMATION, (_no, receipt: TransactionReceipt) => {
                        if (receipt.status) {
                            resolve()
                        } else {
                            reject({
                                gameActionStatus: TransactionStateType.CONFIRMED,
                                ...receipt,
                            })
                        }
                    })
                    .on(TransactionEventType.ERROR, (error) => {
                        reject({
                            gameActionStatus: TransactionStateType.FAILED,
                            transactionHash: txHash,
                        })
                    })
            })
        },
    }
}

export function useMakeDeposit(info: GoodGhostingInfo) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const contract = useGoodGhostingContract(chainId, info.contractAddress)

    const status = getPlayerStatus(info, info.currentPlayer)
    const canMakeDeposit =
        info.currentPlayer &&
        info.currentSegment > 0 &&
        info.currentSegment < info.lastSegment &&
        status === PlayerStatus.Waiting

    return {
        canMakeDeposit,
        async makeDeposit() {
            if (!contract) return
            const gasEstimate = await contract.methods.makeDeposit().estimateGas({
                from: account,
            })

            let txHash = ''
            return new Promise<void>(async (resolve, reject) => {
                contract.methods
                    .makeDeposit()
                    .send({ from: account, gas: gasEstimate })
                    .on(TransactionEventType.TRANSACTION_HASH, (hash) => (txHash = hash))
                    .on(TransactionEventType.CONFIRMATION, (_no, receipt: TransactionReceipt) => {
                        if (receipt.status) {
                            resolve()
                        } else {
                            reject({ gameActionStatus: TransactionStateType.CONFIRMED, ...receipt })
                        }
                    })
                    .on(TransactionEventType.ERROR, () => {
                        reject({
                            gameActionStatus: TransactionStateType.FAILED,
                            transactionHash: txHash,
                        })
                    })
            })
        },
    }
}

export function useWithdraw(info: GoodGhostingInfo) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const contract = useGoodGhostingContract(chainId, info.contractAddress)

    const canWithdraw = info.currentPlayer && !info.currentPlayer.withdrawn && info.gameHasEnded

    return {
        canWithdraw,
        async withdraw() {
            if (!contract) return
            const gasEstimate = await contract.methods.withdraw().estimateGas({
                from: account,
            })
            let txHash = ''
            return new Promise<void>(async (resolve, reject) => {
                contract.methods
                    .withdraw()
                    .send({ from: account, gas: gasEstimate })
                    .on(TransactionEventType.TRANSACTION_HASH, (hash) => (txHash = hash))
                    .on(TransactionEventType.CONFIRMATION, (_no, receipt: TransactionReceipt) => {
                        if (receipt.status) {
                            resolve()
                        } else {
                            reject({ gameActionStatus: TransactionStateType.CONFIRMED, ...receipt })
                        }
                    })
                    .on(TransactionEventType.ERROR, () => {
                        reject({
                            gameActionStatus: TransactionStateType.FAILED,
                            transactionHash: txHash,
                        })
                    })
            })
        },
    }
}

export function useEarlyWithdraw(info: GoodGhostingInfo) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const contract = useGoodGhostingContract(chainId, info.contractAddress)

    const canEarlyWithdraw =
        info.currentPlayer && !info.currentPlayer.withdrawn && info.currentSegment < info.lastSegment

    return {
        canEarlyWithdraw,
        async earlyWithdraw() {
            if (!contract) return
            const gasEstimate = await contract.methods.earlyWithdraw().estimateGas({
                from: account,
            })
            let txHash = ''
            return new Promise<void>(async (resolve, reject) => {
                contract.methods
                    .earlyWithdraw()
                    .send({ from: account, gas: gasEstimate })
                    .on(TransactionEventType.TRANSACTION_HASH, (hash) => (txHash = hash))
                    .on(TransactionEventType.CONFIRMATION, (_no, receipt: TransactionReceipt) => {
                        if (receipt.status) {
                            resolve()
                        } else {
                            reject({ gameActionStatus: TransactionStateType.CONFIRMED, ...receipt })
                        }
                    })
                    .on(TransactionEventType.ERROR, () => {
                        reject({
                            gameActionStatus: TransactionStateType.FAILED,
                            transactionHash: txHash,
                        })
                    })
            })
        },
    }
}
