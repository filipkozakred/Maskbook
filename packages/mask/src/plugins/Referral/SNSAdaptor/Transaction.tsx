import { makeStyles, ActionButton, LoadingBase } from '@masknet/theme'
import { explorerResolver } from '@masknet/web3-shared-evm'
import { useChainContext } from '@masknet/web3-hooks-base'
import { Grid, Typography, Link } from '@mui/material'
import DoneIcon from '@mui/icons-material/Done'
import type { NetworkPluginID } from '@masknet/shared-base'

import { TransactionStatus, TransactionDialogInterface, ChainId } from '../types.js'
import { useI18N } from '../locales/index.js'

const useStyles = makeStyles()((theme) => ({
    confirmation: {
        padding: '45px 36px 40px',
    },
    title: {
        margin: '12px 0 8px',
        fontSize: '18px',
        lineHeight: '25px',
        color: theme.palette.text.strong,
        fontWeight: 600,
    },
    subtitle: {
        fontSize: '16px',
        lineHeight: '22px',
        color: theme.palette.text.secondary,
        textAlign: 'center',
    },
}))

export function Transaction(props: TransactionDialogInterface | undefined) {
    const t = useI18N()
    const { chainId: currentChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { classes } = useStyles()

    if (!props?.transaction) return <>{null}</>

    const { transaction } = props

    if (transaction.status === TransactionStatus.CONFIRMATION) {
        return (
            <Grid
                container
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                className={classes.confirmation}>
                <LoadingBase size={72} />
                <Typography className={classes.title} variant="h6">
                    {transaction.title}
                </Typography>
                {transaction.subtitle && <Typography className={classes.subtitle}>{transaction.subtitle}</Typography>}
            </Grid>
        )
    }
    if (transaction.status === TransactionStatus.CONFIRMED) {
        return (
            <Grid container textAlign="center" sx={{ pt: 6, pb: 3 }}>
                <Grid item xs={12} marginBottom="10px">
                    <DoneIcon sx={{ fontSize: 60 }} />
                </Grid>
                <Grid item xs={12} className={classes.title}>
                    {t.transaction_confirmed()}
                </Grid>
                <Grid item xs={12}>
                    <Link
                        href={explorerResolver.transactionLink?.(
                            currentChainId as ChainId,
                            transaction.transactionHash,
                        )}
                        fontSize="16px"
                        lineHeight="22px"
                        target="_blank">
                        {t.view_on_explorer()}
                    </Link>
                </Grid>
                <Grid item xs={12} marginTop="40px">
                    <ActionButton fullWidth size="medium" onClick={() => transaction.actionButton.onClick()}>
                        {transaction.actionButton.label}
                    </ActionButton>
                </Grid>
            </Grid>
        )
    }
    return <>{null}</>
}
