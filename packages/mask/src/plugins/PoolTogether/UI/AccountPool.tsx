import { TokenIcon } from '@masknet/shared'
import { DarkColor } from '@masknet/theme/base'
import { leftShift } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { Grid, Link, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { useI18N } from '../../../utils/index.js'
import { useManagePoolURL } from '../hooks/usePoolURL.js'
import type { AccountPool as Pool } from '../types.js'
import { calculateNextPrize, calculateOdds, calculateSecondsRemaining } from '../utils.js'
import { CountdownView } from './CountdownView.js'
import { NetworkView } from './NetworkView.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#341762',
        textAlign: 'center',
        borderRadius: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    token: {
        padding: theme.spacing(1, 2),
        borderRight: '#290b5a dashed',
        margin: 'auto',
    },
    tokenIcon: {
        backgroundColor: 'transparent',
        display: 'flex',
        margin: 'auto',
        justifyContent: 'center',
    },
    info: {
        padding: theme.spacing(1, 2),
        justifyContent: 'space-between',
        textAlign: 'justify',
    },
    prize: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        margin: 'auto 0',
        width: 'auto',
    },
    trophy: {
        margin: 'auto',
    },
    prizeAmount: {
        margin: 'auto',
        marginRight: theme.spacing(0.5),
        textAlign: 'center',
    },
    in: {
        margin: 'auto',
        marginRight: theme.spacing(0.5),
    },
    manage: {
        cursor: 'pointer',
        color: '#3ef3d4',
        textDecoration: 'none',
        fontSize: '0.6rem',
        marginRight: theme.spacing(0.5),
        '&:last-child': {
            marginRight: 0,
        },
        maxHeight: theme.spacing(1),
        '&:hover': {
            color: '#ffffff',
        },
    },
    countdownDigit: {
        backgroundColor: 'transparent',
        color: DarkColor.textSecondary,
    },
    countdownSeparator: {
        color: DarkColor.textSecondary,
    },
    odds: {
        fontSize: '0.6rem',
    },
    item: {
        width: 'auto',
    },
    footer: {
        display: 'block',
        alignSelf: 'flex-end',
        textAlign: 'end',
    },
}))

interface AccountPoolProps {
    accountPool: Pool
}

export function AccountPool(props: AccountPoolProps) {
    const { accountPool } = props
    const token = accountPool.pool.tokens.underlyingToken

    const { t } = useI18N()
    const { classes } = useStyles()
    const poolURL = useManagePoolURL(accountPool.pool)
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const balance = leftShift(
        accountPool.account.ticketBalance,
        Number.parseInt(accountPool.pool.tokens.ticket.decimals, 10),
    )
    const formattedBalance = balance.toFixed(6)

    const odds = calculateOdds(
        Number.parseFloat(formattedBalance),
        Number.parseFloat(accountPool.pool.tokens.ticket.totalSupply),
        Number.parseInt(accountPool.pool.config.numberOfWinners, 10),
    )

    return (
        <Grid container direction="row" className={classes.root}>
            <Grid container direction="column" item xs={3} className={classes.token}>
                <Grid item className={classes.tokenIcon}>
                    <TokenIcon address={token.address} name={token.symbol} />
                </Grid>
                <Grid item>
                    <Typography color={DarkColor.textSecondary} variant="subtitle1" fontWeight="fontWeightBold">
                        {token.symbol}
                    </Typography>
                </Grid>
            </Grid>
            <Grid container flexWrap="nowrap" item xs={9} className={classes.info}>
                <Grid item className={classes.item}>
                    <Typography color={DarkColor.textSecondary} variant="h5" fontWeight="fontWeightBold">
                        {formattedBalance}
                    </Typography>
                    <Typography className={classes.odds} color={DarkColor.textSecondary} variant="subtitle2">
                        {t('plugin_pooltogether_winning_odds')}
                    </Typography>
                    <Typography className={classes.odds} color={DarkColor.textSecondary} variant="subtitle2">
                        {odds
                            ? t('plugin_pooltogether_short_odds_value', {
                                  value: odds,
                              })
                            : 'n/a'}
                    </Typography>
                </Grid>
                <Grid container direction="column" item className={classes.item}>
                    <Grid item className={classes.prize}>
                        <Icons.PoolTogether className={classes.trophy} />
                        <Typography
                            className={classes.prizeAmount}
                            color={DarkColor.textSecondary}
                            variant="subtitle2"
                            fontWeight="fontWeightBold">
                            {calculateNextPrize(accountPool.pool)}
                        </Typography>
                        <Typography
                            className={classes.in}
                            color={DarkColor.textSecondary}
                            variant="subtitle2"
                            fontWeight="fontWeightBold">
                            {t('plugin_pooltogether_in')}
                        </Typography>
                        <CountdownView
                            secondsRemaining={calculateSecondsRemaining(accountPool.pool)}
                            msgOnEnd={t('plugin_pooltogether_pool_ended')}
                            classes={{ digit: classes.countdownDigit, separator: classes.countdownSeparator }}
                        />
                    </Grid>
                    <Grid item className={classes.footer}>
                        <NetworkView chainId={chainId} />
                        <Link className={classes.manage} target="_blank" rel="noopener noreferrer" href={poolURL}>
                            <Typography variant="subtitle2">{t('plugin_pooltogether_manage')}</Typography>
                        </Link>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}
