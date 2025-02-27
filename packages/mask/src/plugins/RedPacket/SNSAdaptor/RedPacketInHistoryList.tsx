import { MouseEvent, useCallback, useState, useMemo } from 'react'
import { useAsync } from 'react-use'
import { Interface } from '@ethersproject/abi'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { Box, ListItem, Typography, Popper, useMediaQuery, Theme } from '@mui/material'
import { makeStyles, ActionButton } from '@masknet/theme'
import { TokenIcon } from '@masknet/shared'
import { ChainId, SchemaType, useRedPacketConstants } from '@masknet/web3-shared-evm'
import REDPACKET_ABI from '@masknet/web3-contracts/abis/HappyRedPacketV4.json'
import intervalToDuration from 'date-fns/intervalToDuration'
import nextDay from 'date-fns/nextDay'
import { Translate, useI18N } from '../locales/index.js'
import { dateTimeFormat } from '../../ITO/assets/formatDate.js'
import { StyledLinearProgress } from '../../ITO/SNSAdaptor/StyledLinearProgress.js'
import { RedPacketJSONPayload, RedPacketJSONPayloadFromChain, RedPacketStatus } from '../types.js'
import { useAvailabilityComputed } from './hooks/useAvailabilityComputed.js'
import { useRefundCallback } from './hooks/useRefundCallback.js'
import { useChainContext, useFungibleToken, useWeb3Connection } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { formatBalance, FungibleToken, isSameAddress } from '@masknet/web3-shared-base'

const interFace = new Interface(REDPACKET_ABI)

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        message: {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            [smallQuery]: {
                whiteSpace: 'normal',
            },
        },
        strong: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        span: {
            maxWidth: 350,
            display: 'inline-flex',
        },
        root: {
            borderRadius: 10,
            border: `solid 1px ${theme.palette.divider}`,
            marginBottom: theme.spacing(1.5),
            position: 'static !important' as any,
            height: 'auto !important',
            padding: theme.spacing(2),
            [smallQuery]: {
                padding: theme.spacing(2, 1.5),
            },
        },
        box: {
            display: 'flex',
            width: '100%',
        },
        content: {
            transform: 'translateY(-4px)',
            width: '100%',
            paddingLeft: theme.spacing(2),
            [smallQuery]: {
                paddingLeft: theme.spacing(1.5),
                width: 'auto',
            },
        },
        section: {
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing(2),
            [smallQuery]: {
                flexWrap: 'wrap',
            },
        },
        div: {
            maxWidth: 350,
        },
        icon: {
            width: 27,
            height: 27,
        },
        title: {
            fontWeight: 500,
            fontSize: 16,
        },
        info: {
            color: theme.palette.mode === 'light' ? '#5B7083' : '#c3cbd2',
            [smallQuery]: {
                fontSize: 13,
            },
        },
        actionButton: {
            height: 26,
            background: theme.palette.mode === 'light' ? '#000' : '#fff',
            color: theme.palette.mode === 'light' ? '#fff' : '#000',
            minHeight: 'auto',
            [smallQuery]: {
                marginTop: theme.spacing(1),
            },
            '&:hover': {
                background: theme.palette.mode === 'light' ? '#000' : '#fff',
                color: theme.palette.mode === 'light' ? '#fff' : '#000',
                opacity: 0.8,
            },
        },
        footer: {
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginTop: theme.spacing(2),
        },
        footerInfo: {
            fontSize: 15,
            color: theme.palette.mode === 'light' ? '#5B7083' : '#c3cbd2',
            '& strong': {
                color: theme.palette.text.primary,
            },
        },
        popper: {
            overflow: 'visible',
            backgroundColor: theme.palette.mode === 'light' ? 'rgba(15, 20, 25, 1)' : '#fff',
            transform: 'translate(134px, 66px)',
            borderRadius: 8,
            width: 328,
            padding: 10,
        },
        arrow: {
            position: 'absolute',
            top: -12,
            right: 40,
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: `6px solid ${theme.palette.mode === 'light' ? 'rgba(15, 20, 25, 1)' : '#fff'}`,
            transform: 'translateY(6px)',
        },
        popperText: {
            cursor: 'default',
            color: theme.palette.mode === 'light' ? '#fff' : 'rgba(15, 20, 25, 1)',
            fontSize: 12,
        },
        disabledButton: {
            color: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.26)' : 'rgba(255, 255, 255, 0.3)',
            boxShadow: 'none',
            backgroundColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
            cursor: 'default',
            '&:hover': {
                backgroundColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
                color: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.26)' : 'rgba(255, 255, 255, 0.3)',
            },
        },
        fullWidthBox: {
            width: '100%',
        },
    }
})

export interface RedPacketInHistoryListProps {
    history: RedPacketJSONPayload | RedPacketJSONPayloadFromChain
    onSelect: (payload: RedPacketJSONPayload) => void
}
export function RedPacketInHistoryList(props: RedPacketInHistoryListProps) {
    const { history, onSelect } = props
    const t = useI18N()
    const { classes } = useStyles()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const { HAPPY_RED_PACKET_ADDRESS_V4 } = useRedPacketConstants(chainId)
    const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

    const { value: receipt } = useAsync(async () => {
        const result = await connection?.getTransactionReceipt(history.txid)
        if (!result) return null

        const log = result.logs.find((log) => isSameAddress(log.address, HAPPY_RED_PACKET_ADDRESS_V4))
        if (!log) return null

        type CreationSuccessEventParams = {
            id: string
            creation_time: BigNumber
        }
        const eventParams = interFace.decodeEventLog(
            'CreationSuccess',
            log.data,
            log.topics,
        ) as unknown as CreationSuccessEventParams

        return {
            rpid: eventParams.id,
            creation_time: eventParams.creation_time.toNumber() * 1000,
        }
    }, [connection, history.txid, HAPPY_RED_PACKET_ADDRESS_V4])

    const rpid = receipt?.rpid ?? ''
    const creation_time = receipt?.creation_time ?? 0

    const patchedHistory: RedPacketJSONPayload | RedPacketJSONPayloadFromChain = useMemo(
        () => ({ ...props.history, rpid }),
        [props.history, rpid],
    )
    const {
        value: availability,
        computed: { canRefund, canSend, listOfStatus, isPasswordValid },
        retry: revalidateAvailability,
    } = useAvailabilityComputed(account, { ...patchedHistory, creation_time })

    const claimerNumber = availability ? Number(availability.claimed) : 0
    const total_remaining = availability?.balance

    const [{ loading: isRefunding }, refunded, refundCallback] = useRefundCallback(
        patchedHistory.contract_version,
        account,
        rpid,
    )
    const tokenAddress =
        (patchedHistory as RedPacketJSONPayload).token?.address ??
        (patchedHistory as RedPacketJSONPayloadFromChain).token_address

    const { value: tokenDetailed } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, tokenAddress ?? '')

    const historyToken = {
        ...(tokenDetailed ?? (patchedHistory as RedPacketJSONPayload).token),
        address: tokenAddress,
    } as FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>

    const onSendOrRefund = useCallback(async () => {
        if (canRefund) {
            await refundCallback()
            revalidateAvailability()
        }
        if (canSend) onSelect({ ...patchedHistory, token: historyToken })
    }, [onSelect, refundCallback, canRefund, canSend, patchedHistory, historyToken])

    // #region password lost tips
    const [anchorEl, setAnchorEl] = useState<(EventTarget & HTMLButtonElement) | null>(null)
    const openPopper = Boolean(anchorEl)
    // #endregion

    // #region refund time
    const refundDuration =
        canSend && !isPasswordValid ? intervalToDuration({ start: Date.now(), end: nextDay(creation_time, 1) }) : null
    const formatRefundDuration = `${refundDuration?.hours}h ${refundDuration?.minutes}m`
    // #endregion

    return !rpid ? null : (
        <ListItem className={classes.root}>
            <Box className={classes.box}>
                <TokenIcon
                    className={classes.icon}
                    address={historyToken?.address ?? ''}
                    name={historyToken?.name}
                    logoURL={historyToken?.logoURL}
                />
                <Box className={classes.content}>
                    <section className={classes.section}>
                        <div className={classes.div}>
                            <div className={classes.fullWidthBox}>
                                <Typography variant="body1" className={classNames(classes.title, classes.message)}>
                                    {patchedHistory.sender.message === ''
                                        ? t.best_wishes()
                                        : patchedHistory.sender.message}
                                </Typography>
                            </div>
                            <Typography variant="body1" className={classNames(classes.info, classes.message)}>
                                {t.history_duration({
                                    startTime: dateTimeFormat(new Date(creation_time)),
                                    endTime: dateTimeFormat(new Date(creation_time + patchedHistory.duration), false),
                                })}
                            </Typography>
                            <Typography variant="body1" className={classNames(classes.info, classes.message)}>
                                {t.history_total_amount({
                                    amount: formatBalance(patchedHistory.total, historyToken?.decimals, 6),
                                    symbol: historyToken?.symbol,
                                })}
                            </Typography>
                            <Typography variant="body1" className={classNames(classes.info, classes.message)}>
                                {t.history_split_mode({
                                    mode: patchedHistory.is_random ? t.random() : t.average(),
                                })}
                            </Typography>
                        </div>
                        {canRefund || canSend || listOfStatus.includes(RedPacketStatus.empty) || refunded ? (
                            <>
                                <ActionButton
                                    loading={isRefunding}
                                    fullWidth={isSmall}
                                    onClick={canSend && !isPasswordValid ? () => undefined : onSendOrRefund}
                                    onMouseEnter={(event: MouseEvent<HTMLButtonElement>) => {
                                        canSend && !isPasswordValid ? setAnchorEl(event.currentTarget) : undefined
                                    }}
                                    onMouseLeave={() => {
                                        canSend && !isPasswordValid ? setAnchorEl(null) : undefined
                                    }}
                                    disabled={listOfStatus.includes(RedPacketStatus.empty) || refunded || isRefunding}
                                    className={classNames(
                                        classes.actionButton,
                                        canSend && !isPasswordValid ? classes.disabledButton : '',
                                    )}
                                    size="large">
                                    {canSend
                                        ? t.send()
                                        : refunded
                                        ? t.refund()
                                        : isRefunding
                                        ? t.refunding()
                                        : listOfStatus.includes(RedPacketStatus.empty)
                                        ? t.empty()
                                        : t.refund()}
                                </ActionButton>
                                <Popper
                                    className={classes.popper}
                                    id="popper"
                                    open={openPopper}
                                    anchorEl={anchorEl}
                                    transition
                                    disablePortal>
                                    <Typography className={classes.popperText}>
                                        {t.data_broken({ duration: formatRefundDuration })}
                                    </Typography>
                                    <div className={classes.arrow} />
                                </Popper>
                            </>
                        ) : null}
                    </section>
                    <StyledLinearProgress
                        variant="determinate"
                        value={100 * (1 - Number(total_remaining) / Number(patchedHistory.total))}
                    />
                    <section className={classes.footer}>
                        <Typography variant="body1" className={classes.footerInfo}>
                            <Translate.history_claimed
                                components={{
                                    strong: <strong />,
                                }}
                                values={{
                                    claimedShares: String(claimerNumber),
                                    shares: String(patchedHistory.shares),
                                }}
                            />
                        </Typography>
                        <Typography variant="body1" className={classes.footerInfo}>
                            <Translate.history_total_claimed_amount
                                components={{
                                    strong: <strong className={classes.strong} />,
                                    span: <span className={classes.span} />,
                                }}
                                values={{
                                    amount: formatBalance(patchedHistory.total, historyToken?.decimals, 6),
                                    claimedAmount: formatBalance(
                                        new BigNumber(patchedHistory.total).minus(total_remaining ?? 0),
                                        historyToken?.decimals,
                                        6,
                                    ),
                                    symbol: historyToken?.symbol,
                                }}
                            />
                        </Typography>
                    </section>
                </Box>
            </Box>
        </ListItem>
    )
}
