import { useChainContext } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { LoadingBase, makeStyles, MaskColorVar } from '@masknet/theme'
import { Card, CardContent, Tabs, Tab, Typography, Paper, Button, Stack } from '@mui/material'
import { useState } from 'react'
import { useI18N } from '../../../utils/i18n-next-ui.js'
import { useFetchPools } from '../hooks/usePool.js'
import type { Investable } from '../types.js'
import { InvestmentsView } from './InvestmentsView.js'
import { PoolView } from './PoolView.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        fontFamily: 'Muli,Helvetica,-apple-system,system-ui,"sans-serif"',
        width: '100%',
        boxShadow: 'none',
        padding: 0,
    },
    content: {
        width: '100%',
        height: 'var(--contentHeight)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        padding: '0 !important',
    },
    tabs: {
        borderTop: `solid 1px ${theme.palette.divider}`,
        borderBottom: `solid 1px ${theme.palette.divider}`,
        backgroundColor: '#1b1b21',
    },
    tab: {
        fontFamily: 'inherit',
        color: 'white',
    },
    reload: {
        backgroundColor: theme.palette.maskColor.dark,
        '&:hover': {
            backgroundColor: theme.palette.maskColor.dark,
        },
        color: 'white',
        width: 254,
    },
}))

interface PoolViewProps {
    address: string
    category: string
    chainId: number
}

export function FurucomboView(props: PoolViewProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [tabIndex, setTabIndex] = useState(0)
    const { chainId: currentChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const { value, loading, error, retry } = useFetchPools()

    if (loading)
        return (
            <Stack sx={{ alignItems: 'center' }}>
                <LoadingBase />
            </Stack>
        )

    if (error || !value)
        return (
            <Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography align="center" color={MaskColorVar.errorPlugin}>
                    {t('plugin_furucombo_load_failed')}
                </Typography>
                <Button className={classes.reload} onClick={retry}>
                    {t('plugin_furucombo_reload')}
                </Button>
            </Stack>
        )

    const { investables = [] } = value

    const investable = investables.find(
        (investable: Investable) =>
            isSameAddress(investable.address, props.address) && investable.category === props.category,
    )

    if (!investable)
        return (
            <Typography align="center" color="error">
                {t('plugin_furucombo_pool_not_found')}
            </Typography>
        )

    return (
        <>
            <Card className={classes.root} elevation={0}>
                <CardContent className={classes.content}>
                    <Tabs
                        value={tabIndex}
                        className={classes.tabs}
                        variant="fullWidth"
                        indicatorColor="primary"
                        textColor="primary"
                        onChange={(_, newValue: number) => setTabIndex(newValue)}>
                        <Tab value={0} className={classes.tab} key={0} label={t('plugin_furucombo_tab_pool')} />,
                        <Tab value={1} className={classes.tab} key={1} label={t('plugin_furucombo_tab_investments')} />,
                    </Tabs>
                    <Paper>
                        {tabIndex === 0 ? <PoolView investable={investable} /> : null}
                        {tabIndex === 1 ? <InvestmentsView investables={investables} /> : null}
                    </Paper>
                </CardContent>
            </Card>
        </>
    )
}
