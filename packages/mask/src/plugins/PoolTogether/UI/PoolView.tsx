import { useCallback, useEffect, useState } from 'react'
import { first } from 'lodash-unified'
import { Typography, Grid, Button } from '@mui/material'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { TokenIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { useFungibleToken, useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { usePoolURL } from '../hooks/usePoolURL.js'
import type { Pool } from '../types.js'
import { CountdownView } from './CountdownView.js'
import { PluginPoolTogetherMessages } from '../messages.js'
import { calculateNextPrize, calculateSecondsRemaining, getPrizePeriod } from '../utils.js'
import { NetworkView } from './NetworkView.js'
import { useI18N } from '../../../utils/index.js'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(1, 2),
        alignItems: 'stretch',
        backgroundColor: '#341762',
        margin: theme.spacing(1, 0),
        borderRadius: theme.spacing(1),
        '&:hover': {
            backgroundColor: '#43286e',
        },
        fontSize: 14,
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
    },
    icon: {
        width: theme.spacing(4),
        height: theme.spacing(4),
        marginRight: theme.spacing(1),
        backgroundColor: 'transparent',
    },
    progress: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
    },
    refresh: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        fontSize: 15,
    },
    metaTitle: {
        marginBottom: theme.spacing(1),
        justifyContent: 'inherit',
        alignItems: 'center',
    },
    metaFooter: {
        justifyContent: 'inherit',
        alignItems: 'center',
    },
    metaTextPrize: {
        color: '#55f1d7',
        margin: theme.spacing(0, 1),
        backgroundColor: 'rgba(53, 230, 208, 0.2)',
        borderRadius: theme.spacing(1),
        padding: theme.spacing(0, 0.5),
    },
    metaPrize: {
        marginTop: theme.spacing(1),
        padding: theme.spacing(1),
        borderRadius: theme.spacing(1),
        backgroundColor: '#290B5A',
        justifyContent: 'center',
        maxWidth: '50%',
    },
    metaDeposit: {
        marginTop: theme.spacing(1),
        padding: theme.spacing(0, 1),
        justifyContent: 'center',
        maxWidth: '50%',
    },
    prize: {
        background:
            'linear-gradient(40deg,#ff9304,#ff04ea 10%,#9b4beb 20%,#0e8dd6 30%,#0bc6df 40%,#07d464 50%,#dfd105 60%,#ff04ab 78%,#8933eb 90%,#3b89ff)',
        '-webkit-background-clip': 'text',
        color: 'transparent',
        animation: '$rainbow_animation 6s linear infinite',
        backgroundSize: '600% 600%',
        fontSize: '1.2rem',
        '@media (min-width:600px)': {
            fontSize: '2rem',
        },
    },
    countdown: {
        alignSelf: 'center',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
    },
    deposit: {
        backgroundColor: '#3ef3d4',
        color: '#4c249f',
        marginTop: theme.spacing(0.5),
    },
    info: {
        marginTop: theme.spacing(0.5),
        justifyContent: 'space-between',
    },
    apr: {
        color: '#bdb3d2',
        display: 'flex',
        alignItems: 'center',
    },
    poolIcon: {
        backgroundColor: 'transparent !important',
        marginRight: `${theme.spacing(0.5)} !important`,
        width: 13,
        height: 13,
    },
    viewPool: {
        cursor: 'pointer',
        color: '#3ef3d4',
        textDecoration: 'none',
        marginRight: theme.spacing(0.5),
        '&:last-child': {
            marginRight: 0,
        },
        maxHeight: theme.spacing(1),
        '&:hover': {
            color: '#ffffff',
        },
    },
}))

interface PoolProps {
    pool: Pool
}

export function PoolView(props: PoolProps) {
    const { pool } = props
    const { classes } = useStyles()
    const { t } = useI18N()

    const poolURL = usePoolURL(pool)
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const [prize, setPrize] = useState('TBD')
    const [period, setPeriod] = useState('Custom Period')
    const { pluginID } = useNetworkContext()

    // #region pool token
    const {
        value: token,
        loading: loadingToken,
        retry: retryToken,
        error: errorToken,
    } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, pool.tokens.underlyingToken.address)
    // #endregion

    // #region process data
    const prizePeriodSeconds = Number.parseInt(pool.config.prizePeriodSeconds, 10)
    useEffect(() => {
        setPrize(calculateNextPrize(pool))
        setPeriod(getPrizePeriod(t, prizePeriodSeconds))
    }, [pool])
    // #endregion

    // #region the deposit dialog
    const { setDialog: openDepositDialog } = useRemoteControlledDialog(PluginPoolTogetherMessages.DepositDialogUpdated)

    const onDeposit = useCallback(() => {
        if (!pool || !token) return
        openDepositDialog({
            open: true,
            pool,
            token,
        })
    }, [pool, token, openDepositDialog])
    // #endregion

    if (loadingToken) {
        return (
            <div className={classes.root}>
                <LoadingBase className={classes.progress} color="primary" size={15} />
            </div>
        )
    }

    if (errorToken) {
        return (
            <div className={classes.root}>
                <Icons.Refresh
                    className={classes.refresh}
                    color="primary"
                    style={{ fill: '#1C68F3' }}
                    onClick={retryToken}
                />
            </div>
        )
    }

    if (!token) {
        return (
            <Typography className={classes.prize} variant="h5" fontWeight="fontWeightBold">
                {t('plugin_pooltogether_token_not_found')}
            </Typography>
        )
    }
    const tokenFaucet = first(pool.tokenFaucets)
    const tokenFaucetDripToken = first(pool.tokens.tokenFaucetDripTokens)

    return (
        <Grid container direction="row" className={classes.root}>
            <Grid item container direction="column" className={classes.metaPrize}>
                <Grid container item className={classes.metaTitle}>
                    <Grid item>
                        <TokenIcon address={token.address} name={token.symbol} className={classes.icon} />
                    </Grid>
                    <Grid item>
                        <Typography className={classes.prize} variant="h4" fontWeight="fontWeightBold">
                            {prize}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container item xs={3} className={classes.metaFooter}>
                    <Grid item className={classes.metaTextPrize}>
                        <Typography fontSize={10} variant="subtitle2">
                            {t('plugin_pooltogether_prize', { period })}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <NetworkView chainId={chainId} />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item container direction="column" className={classes.metaDeposit}>
                <Grid item className={classes.countdown}>
                    <CountdownView
                        secondsRemaining={calculateSecondsRemaining(pool)}
                        msgOnEnd={t('plugin_pooltogether_pool_ended')}
                    />
                </Grid>
                <Grid item>
                    {pluginID === NetworkPluginID.PLUGIN_EVM && account ? (
                        <Button className={classes.deposit} fullWidth size="small" onClick={onDeposit}>
                            {t('plugin_pooltogether_deposit', { token: token.symbol ?? '' })}
                        </Button>
                    ) : null}
                </Grid>
                <Grid container item className={classes.info}>
                    <Grid item>
                        {tokenFaucet && tokenFaucetDripToken ? (
                            <Typography className={classes.apr} fontSize="0.7rem" variant="subtitle2">
                                <TokenIcon
                                    address={tokenFaucetDripToken.address}
                                    name={tokenFaucetDripToken.symbol}
                                    className={classes.poolIcon}
                                />
                                {t('plugin_pooltogether_apr', {
                                    apr: tokenFaucet.apr?.toFixed(2) ?? 0,
                                    token: tokenFaucetDripToken.symbol,
                                })}
                            </Typography>
                        ) : null}
                    </Grid>
                    <Grid item>
                        <a className={classes.viewPool} target="_blank" rel="noopener noreferrer" href={poolURL}>
                            <Typography fontSize="0.7rem" variant="subtitle2">
                                {t('plugin_pooltogether_view_pool')}
                            </Typography>
                        </a>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}
