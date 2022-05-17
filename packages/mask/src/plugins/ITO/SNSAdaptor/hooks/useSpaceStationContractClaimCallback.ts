import { useSpaceStationContract } from './useSpaceStationContract'
import { useSpaceStationGalaxyConstants, TransactionStateType, TransactionEventType } from '@masknet/web3-shared-evm'
import { useCallback } from 'react'
import type { CampaignInfo } from '../../types'
import type { SpaceStationGalaxy } from '@masknet/web3-contracts/types/SpaceStationGalaxy'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { useAccount, useChainId, useWeb3Connection } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { getAccountClaimSignature, mutationParticipate } from '../../Worker/apis/spaceStationGalaxy'
import { useTransactionState } from '@masknet/plugin-infra/web3-evm'

export function useSpaceStationContractClaimCallback(campaignInfo: CampaignInfo) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { CONTRACT_ADDRESS } = useSpaceStationGalaxyConstants(chainId)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const spaceStationContract = useSpaceStationContract(chainId)
    const [claimState, setClaimState] = useTransactionState()

    const claimCallback = useCallback(async () => {
        if (!CONTRACT_ADDRESS || !spaceStationContract || !campaignInfo || !connection) {
            setClaimState({ type: TransactionStateType.UNKNOWN })
            return
        }

        // start waiting for provider to confirm tx
        setClaimState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        let useSignature = ''
        try {
            useSignature = await connection.signMessage(
                `${campaignInfo.name}

${campaignInfo.description}`,
                account,
            )
        } catch (error) {
            setClaimState({
                type: TransactionStateType.FAILED,
                error: new Error('Not allowed to claim.'),
            })
        }

        const { allow, signature, verifyIDs, nftCoreAddress, powahs } = await getAccountClaimSignature(
            useSignature,
            account,
            campaignInfo.chain,
            campaignInfo.id,
        )

        if (!allow) {
            setClaimState({
                type: TransactionStateType.FAILED,
                error: new Error('Not allowed to claim.'),
            })
        }
        const params = [campaignInfo.id, nftCoreAddress, verifyIDs[0], powahs[0], signature] as Parameters<
            SpaceStationGalaxy['methods']['claim']
        >
        // estimate gas and compose transaction
        const config = {
            from: account,
            gas: await spaceStationContract.methods
                .claim(...params)
                .estimateGas({ from: account })
                .catch((error) => {
                    setClaimState({ type: TransactionStateType.FAILED, error })
                    throw error
                }),
        }
        return new Promise<void>(async (resolve, reject) => {
            spaceStationContract.methods
                .claim(...params)
                .send(config as NonPayableTx)
                .on(TransactionEventType.TRANSACTION_HASH, async (hash) => {
                    const participated = await mutationParticipate(
                        useSignature,
                        account,
                        campaignInfo.chain,
                        campaignInfo.id,
                        hash,
                        verifyIDs,
                    )

                    if (!participated) {
                        setClaimState({
                            type: TransactionStateType.FAILED,
                            error: new Error('Failed to claim'),
                        })
                    }
                })
                .on(TransactionEventType.RECEIPT, (receipt) => {
                    setClaimState({
                        type: TransactionStateType.CONFIRMED,
                        no: 0,
                        receipt,
                    })
                    resolve()
                })
                .on(TransactionEventType.CONFIRMATION, (no, receipt) => {
                    setClaimState({
                        type: TransactionStateType.CONFIRMED,
                        no,
                        receipt,
                    })
                    resolve()
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setClaimState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [account, campaignInfo, CONTRACT_ADDRESS, spaceStationContract])

    const resetCallback = useCallback(() => {}, [setClaimState])

    return [claimState, claimCallback, resetCallback] as const
}