import { ChangeEvent, useState, useCallback, useMemo } from 'react'
import { Trans } from 'react-i18next'
import {
    DialogContent,
    Box,
    Checkbox,
    Card,
    CardContent,
    CardActions,
    FormControlLabel,
    Typography,
    Link,
} from '@mui/material'
import { makeStyles, ActionButton } from '@masknet/theme'
import type { Order } from 'opensea-js/lib/types'
import { InjectedDialog, ActionButtonPromise } from '@masknet/shared'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { isGreaterThan } from '@masknet/web3-shared-base'
import { useChainContext, useNetworkContext, useFungibleTokenWatched } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { UnreviewedWarnings } from './UnreviewedWarnings.js'
import { useI18N } from '../../../../../utils/index.js'
import { WalletConnectedBoundary } from '../../../../../web3/UI/WalletConnectedBoundary.js'
import { CheckoutOrder } from './CheckoutOrder.js'
import { useOpenSea } from './hooks/useOpenSea.js'

const useStyles = makeStyles()((theme) => {
    return {
        content: {
            padding: 0,
        },
        footer: {
            display: 'flex',
            justifyContent: 'flex-end',
            padding: theme.spacing(0, 2, 2),
        },
        label: {},
        buttons: {
            width: '100%',
            margin: `0 ${theme.spacing(-0.5)}`,
        },
        button: {
            flex: 1,
            margin: `${theme.spacing(1.5)} ${theme.spacing(0.5)} 0`,
        },
    }
})

export interface CheckoutDialogProps {
    asset?: Web3Helper.NonFungibleAssetScope<'all'>
    order?: Order
    open: boolean
    onClose: () => void
}

export function CheckoutDialog(props: CheckoutDialogProps) {
    const { asset, order, open, onClose } = props
    const isVerified = asset?.collection?.verified ?? false
    const { t } = useI18N()
    const { classes } = useStyles()
    const { pluginID } = useNetworkContext()
    const { account, chainId } = useChainContext()
    const opensea = useOpenSea(pluginID, chainId)
    const [unreviewedChecked, setUnreviewedChecked] = useState(false)
    const [ToS_Checked, setToS_Checked] = useState(false)
    const [insufficientBalance, setInsufficientBalance] = useState(false)
    const { token, balance } = useFungibleTokenWatched(pluginID, order?.paymentToken ?? '')
    const onCheckout = useCallback(async () => {
        if (!asset?.tokenId || !asset.address) return
        if (!order || !opensea) return

        await opensea.fulfillOrder({
            order,
            accountAddress: account,
            recipientAddress: account,
        })
    }, [account, asset, order, opensea])

    const onConvertClick = useCallback(() => {
        if (!token?.value) return
        CrossIsolationMessages.events.swapDialogEvent.sendToLocal({
            open: true,
            traderProps: {
                defaultInputCoin: token.value,
            },
        })
    }, [token.value])

    const validationMessage = useMemo(() => {
        if (isGreaterThan(order?.basePrice ?? 0, balance.value ?? 0)) {
            setInsufficientBalance(true)
            return t('plugin_collectible_insufficient_balance')
        }
        if (!isVerified && !unreviewedChecked) return t('plugin_collectible_ensure_unreviewed_item')
        if (!isVerified && !ToS_Checked) return t('plugin_collectible_check_tos_document')
        return ''
    }, [isVerified, unreviewedChecked, ToS_Checked, order])

    return (
        <InjectedDialog title={t('plugin_collectible_checkout')} open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <Card elevation={0}>
                    <CardContent>
                        {isVerified ? null : (
                            <Box sx={{ marginBottom: 2 }}>
                                <UnreviewedWarnings />
                            </Box>
                        )}
                        <Box sx={{ padding: 2 }}>
                            <CheckoutOrder />
                            {isVerified ? null : (
                                <>
                                    <FormControlLabel
                                        className={classes.label}
                                        control={
                                            <Checkbox
                                                color="primary"
                                                checked={unreviewedChecked}
                                                onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                                                    setUnreviewedChecked(ev.target.checked)
                                                }
                                            />
                                        }
                                        label={
                                            <Typography variant="body2">
                                                {t('plugin_collectible_approved_tips')}
                                            </Typography>
                                        }
                                    />
                                    <FormControlLabel
                                        className={classes.label}
                                        control={
                                            <Checkbox
                                                color="primary"
                                                checked={ToS_Checked}
                                                onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                                                    setToS_Checked(ev.target.checked)
                                                }
                                            />
                                        }
                                        label={
                                            <Typography variant="body2">
                                                <Trans
                                                    i18nKey="plugin_collectible_agree_terms"
                                                    components={{
                                                        terms: (
                                                            <Link
                                                                color="primary"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                href="https://opensea.io/tos"
                                                            />
                                                        ),
                                                    }}
                                                />
                                            </Typography>
                                        }
                                    />
                                </>
                            )}
                        </Box>
                    </CardContent>
                    <CardActions className={classes.footer}>
                        <WalletConnectedBoundary>
                            <Box className={classes.buttons} display="flex" alignItems="center" justifyContent="center">
                                <ActionButtonPromise
                                    className={classes.button}
                                    disabled={!!validationMessage}
                                    size="large"
                                    init={validationMessage || t('plugin_collectible_checkout')}
                                    waiting={t('plugin_collectible_checkout')}
                                    complete={t('plugin_collectible_done')}
                                    failed={t('plugin_collectible_retry')}
                                    executor={onCheckout}
                                    completeOnClick={onClose}
                                    failedOnClick="use executor"
                                />
                                {insufficientBalance ? (
                                    <ActionButton className={classes.button} size="large" onClick={onConvertClick}>
                                        {t('plugin_collectible_get_more_token', { token: token.value?.symbol })}
                                    </ActionButton>
                                ) : null}
                            </Box>
                        </WalletConnectedBoundary>
                    </CardActions>
                </Card>
            </DialogContent>
        </InjectedDialog>
    )
}
