import { ChangeEvent, useState, useCallback, useMemo, useEffect } from 'react'
import { Trans } from 'react-i18next'
import { first } from 'lodash-unified'
import BigNumber from 'bignumber.js'
import getUnixTime from 'date-fns/getUnixTime'
import formatDateTime from 'date-fns/format'
import type { Order } from 'opensea-js/lib/types'
import {
    DialogContent,
    Box,
    Checkbox,
    Card,
    CardContent,
    FormControlLabel,
    Typography,
    Link,
    DialogActions,
} from '@mui/material'
import { makeStyles, ActionButton } from '@masknet/theme'
import { InjectedDialog, PluginWalletStatusBar, ActionButtonPromise, ChainBoundary } from '@masknet/shared'
import { CrossIsolationMessages, NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useNetworkContext, useFungibleTokenWatched, useWeb3State } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { UnreviewedWarnings } from './UnreviewedWarnings.js'
import { useI18N } from '../../../../../utils/index.js'
import { DateTimePanel } from '../../../../../web3/UI/DateTimePanel.js'
import { toAsset, isWyvernSchemaName } from '../../helpers/index.js'
import { CurrencyType, rightShift, ZERO } from '@masknet/web3-shared-base'
import { SelectTokenListPanel } from './SelectTokenListPanel.js'
import { useOpenSea } from './hooks/useOpenSea.js'

const useStyles = makeStyles()((theme) => {
    return {
        content: {
            padding: 0,
            borderRadius: 0,
        },
        panel: {
            marginTop: theme.spacing(2),
            '&:first-child': {
                marginTop: 0,
            },
        },
        label: {},
        buttons: {
            width: '100%',
            margin: 0,
        },
        button: {
            flex: 1,
            height: 40,
            margin: 0,
        },
    }
})

export interface MakeOfferDialogProps {
    open: boolean
    asset?: Web3Helper.NonFungibleAssetScope<'all'>
    order?: Order
    onClose: () => void
}

export function MakeOfferDialog(props: MakeOfferDialogProps) {
    const { asset, open, onClose } = props

    const isAuction = !!asset?.auction
    const isVerified = asset?.collection?.verified ?? false
    const desktopOrder = first(asset?.orders)
    const leastPrice = desktopOrder ? new BigNumber(desktopOrder.price?.[CurrencyType.USD] ?? '0') : ZERO

    const paymentTokens = asset?.paymentTokens

    const selectedPaymentToken = first(paymentTokens)

    const { t } = useI18N()
    const { classes } = useStyles()

    const { pluginID } = useNetworkContext()
    const { account, chainId } = useChainContext()
    const opensea = useOpenSea(pluginID, chainId)
    const { Others } = useWeb3State()

    const [expirationDateTime, setExpirationDateTime] = useState(new Date())
    const [unreviewedChecked, setUnreviewedChecked] = useState(false)
    const [ToS_Checked, setToS_Checked] = useState(false)
    const [insufficientBalance, setInsufficientBalance] = useState(false)

    const { amount, token, balance, setAmount, setAddress } = useFungibleTokenWatched(
        NetworkPluginID.PLUGIN_EVM,
        selectedPaymentToken?.address,
    )

    const onMakeOffer = useCallback(async () => {
        if (!asset) return
        if (!asset.tokenId || !asset.address) return
        if (!token?.value) return
        if (!Others?.isFungibleTokenSchemaType(token.value?.schema)) return
        const schemaName = asset.contract?.schema

        await opensea?.createBuyOrder({
            asset: toAsset({
                tokenId: asset.tokenId,
                tokenAddress: asset.address,
                schemaName: isWyvernSchemaName(schemaName) ? schemaName : undefined,
            }),
            accountAddress: account,
            startAmount: Number.parseFloat(amount),
            expirationTime: !isAuction ? getUnixTime(expirationDateTime) : undefined,
            paymentTokenAddress: Others.isNativeTokenSchemaType(token.value.schema) ? undefined : token.value.address,
        })
    }, [asset, token, account, amount, expirationDateTime, isAuction, opensea, Others])

    const onConvertClick = useCallback(() => {
        if (!token?.value) return
        CrossIsolationMessages.events.swapDialogEvent.sendToLocal({
            open: true,
            traderProps: {
                defaultInputCoin: token.value,
            },
        })
    }, [token.value])

    useEffect(() => {
        setAmount('')
        setExpirationDateTime(new Date())
    }, [open])

    const validationMessage = useMemo(() => {
        setInsufficientBalance(false)
        const amount_ = rightShift(amount ?? '0', token.value?.decimals || 0)
        const balance_ = new BigNumber(balance.value ?? '0')
        if (amount_.isNaN() || amount_.isZero()) return t('plugin_collectible_enter_a_price')
        if (balance_.isZero() || amount_.isGreaterThan(balance_)) {
            setInsufficientBalance(true)
            return t('plugin_collectible_insufficient_balance')
        }
        if (!isAuction && expirationDateTime.getTime() - Date.now() <= 0)
            return t('plugin_collectible_invalid_expiration_date')
        if (!isVerified && !unreviewedChecked) return t('plugin_collectible_ensure_unreviewed_item')
        if (!ToS_Checked) return t('plugin_collectible_check_tos_document')
        if (leastPrice.isGreaterThan(amount_)) {
            return t('plugin_collectible_insufficient_offer')
        }
        return ''
    }, [amount, balance.value, expirationDateTime, isVerified, isAuction, unreviewedChecked, ToS_Checked])

    if (!asset) return null

    return (
        <InjectedDialog
            title={isAuction ? t('plugin_collectible_place_a_bid') : t('plugin_collectible_make_an_offer')}
            open={open}
            onClose={onClose}>
            <DialogContent className={classes.content}>
                <Card elevation={0} className={classes.content}>
                    <CardContent>
                        {isVerified ? null : (
                            <Box sx={{ marginBottom: 2 }}>
                                <UnreviewedWarnings />
                            </Box>
                        )}
                        <SelectTokenListPanel
                            amount={amount}
                            balance={balance.value ?? '0'}
                            token={token.value}
                            onAmountChange={setAmount}
                            onTokenChange={(x) => setAddress(x.address)}
                            tokens={paymentTokens}
                        />

                        {!isAuction ? (
                            <DateTimePanel
                                label={t('plugin_collectible_expiration_date')}
                                date={expirationDateTime}
                                min={formatDateTime(new Date(), "yyyy-MM-dd'T00:00")}
                                onChange={setExpirationDateTime}
                                className={classes.panel}
                                fullWidth
                            />
                        ) : null}
                        <FormControlLabel
                            className={classes.label}
                            control={
                                <Checkbox
                                    color="primary"
                                    checked={ToS_Checked}
                                    onChange={(ev: ChangeEvent<HTMLInputElement>) => setToS_Checked(ev.target.checked)}
                                />
                            }
                            label={
                                <Typography variant="body2">
                                    <Trans
                                        i18nKey="plugin_collectible_legal_text"
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
                        {isVerified ? null : (
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
                                        {t('plugin_collectible_approved_by_opensea')}
                                    </Typography>
                                }
                            />
                        )}
                    </CardContent>
                </Card>
            </DialogContent>
            <DialogActions style={{ padding: 0 }}>
                <PluginWalletStatusBar>
                    <ChainBoundary expectedPluginID={pluginID} expectedChainId={chainId}>
                        <Box className={classes.buttons} display="flex" alignItems="center" justifyContent="center">
                            <ActionButtonPromise
                                className={classes.button}
                                disabled={!!validationMessage}
                                size="large"
                                init={
                                    validationMessage ||
                                    t(isAuction ? 'plugin_collectible_place_bid' : 'plugin_collectible_make_offer')
                                }
                                waiting={t(
                                    isAuction ? 'plugin_collectible_place_bid' : 'plugin_collectible_make_offer',
                                )}
                                complete={t('plugin_collectible_done')}
                                failed={t('plugin_collectible_retry')}
                                executor={onMakeOffer}
                                completeOnClick={onClose}
                                failedOnClick="use executor"
                            />
                            {insufficientBalance ? (
                                <ActionButton
                                    className={classes.button}
                                    variant="contained"
                                    size="large"
                                    onClick={onConvertClick}>
                                    {t('plugin_collectible_get_more_token', { token: token.value?.symbol })}
                                </ActionButton>
                            ) : null}
                        </Box>
                    </ChainBoundary>
                </PluginWalletStatusBar>
            </DialogActions>
        </InjectedDialog>
    )
}
