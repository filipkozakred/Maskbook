import type { NetworkPluginID } from '@masknet/shared-base'
import { ZERO, FungibleToken } from '@masknet/web3-shared-base'
import { ChainId, SchemaType, isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { DialogContent } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { InjectedDialog, InjectedDialogProps } from '@masknet/shared'
import { useI18N } from '../../../utils/index.js'
import { RemindDialog } from './RemindDialog.js'
import { ShareDialog } from './ShareDialog.js'
import { SwapDialog, SwapDialogProps } from './SwapDialog.js'
import { UnlockDialog } from './UnlockDialog.js'
import { useChainContext } from '@masknet/web3-hooks-base'

export enum SwapStatus {
    Remind = 0,
    Swap = 1,
    Share = 2,
    Unlock = 3,
}
const useStyles = makeStyles()((theme) => ({
    content: {
        display: 'flex',
        flexDirection: 'column',
    },
    paper: {
        maxWidth: 544,
        backgroundImage: 'none',
    },
}))

interface SwapGuideProps
    extends Pick<SwapDialogProps, 'exchangeTokens' | 'payload'>,
        Omit<InjectedDialogProps, 'onClose'> {
    status: SwapStatus
    shareSuccessText: string | undefined
    total_remaining: BigNumber
    isBuyer: boolean
    retryPayload: () => void
    onClose: () => void
    onUpdate: (status: SwapStatus) => void
}

export function SwapGuide(props: SwapGuideProps) {
    const { t } = useI18N()
    const {
        status,
        payload,
        exchangeTokens,
        isBuyer,
        open,
        retryPayload,
        shareSuccessText,
        total_remaining,
        onUpdate,
        onClose,
    } = props
    const [isPending, startTransition] = useTransition()
    const onCloseShareDialog = useCallback(() => {
        startTransition(() => {
            onClose()
            retryPayload()
        })
    }, [retryPayload, startTransition, onClose])
    const { classes } = useStyles()
    const maxSwapAmount = useMemo(() => BigNumber.min(payload.limit, total_remaining), [payload.limit, total_remaining])
    const initAmount = ZERO
    const [tokenAmount, setTokenAmount] = useState<BigNumber>(initAmount)
    const [actualSwapAmount, setActualSwapAmount] = useState<BigNumber.Value>(0)
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const SwapTitle: Record<SwapStatus, string> = {
        [SwapStatus.Remind]: t('plugin_ito_dialog_swap_reminder_title'),
        [SwapStatus.Unlock]: t('plugin_ito_dialog_swap_unlock_title'),
        [SwapStatus.Swap]: t('plugin_ito_dialog_swap_title', { token: payload.token.symbol }),
        [SwapStatus.Share]: t('plugin_ito_dialog_swap_share_title'),
    }

    const closeDialog = useCallback(() => {
        setTokenAmount(initAmount)
        return status === SwapStatus.Share ? onCloseShareDialog() : onClose()
    }, [status, initAmount, onCloseShareDialog, onClose, setTokenAmount])

    useEffect(() => {
        onUpdate(isBuyer ? SwapStatus.Share : SwapStatus.Remind)
    }, [account, isBuyer, chainId, payload.chain_id])

    return (
        <InjectedDialog
            classes={{ paper: classes.paper, dialogContent: classes.paper }}
            open={open}
            title={SwapTitle[status]}
            onClose={closeDialog}
            maxWidth={SwapStatus.Swap || status === SwapStatus.Unlock ? 'xs' : 'sm'}>
            <DialogContent className={classes.content} classes={{ root: classes.content }}>
                {(() => {
                    switch (status) {
                        case SwapStatus.Remind:
                            return <RemindDialog token={payload.token} chainId={chainId} setStatus={onUpdate} />
                        case SwapStatus.Unlock:
                            return (
                                <UnlockDialog
                                    tokens={
                                        payload.exchange_tokens.filter(
                                            (x) => !isNativeTokenAddress(x.address),
                                        ) as Array<FungibleToken<ChainId, SchemaType.ERC20>>
                                    }
                                />
                            )
                        case SwapStatus.Swap:
                            return (
                                <SwapDialog
                                    account={account}
                                    initAmount={initAmount}
                                    tokenAmount={tokenAmount}
                                    maxSwapAmount={maxSwapAmount}
                                    setTokenAmount={setTokenAmount}
                                    setActualSwapAmount={setActualSwapAmount}
                                    payload={payload}
                                    token={payload.token}
                                    exchangeTokens={exchangeTokens}
                                    setStatus={onUpdate}
                                    chainId={chainId}
                                />
                            )
                        case SwapStatus.Share:
                            return (
                                <ShareDialog
                                    shareSuccessText={shareSuccessText}
                                    poolName={payload.message}
                                    token={payload.token}
                                    actualSwapAmount={actualSwapAmount}
                                    onClose={onCloseShareDialog}
                                />
                            )
                        default:
                            return null
                    }
                })()}
            </DialogContent>
        </InjectedDialog>
    )
}
