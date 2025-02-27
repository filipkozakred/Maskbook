import { useEffect } from 'react'
import { File } from 'react-feather'
import { useNavigate, useLocation } from 'react-router-dom'
import urlcat from 'urlcat'
import { formatFileSize } from '@dimensiondev/kit'
import { Button, Grid, Typography } from '@mui/material'
import { openWindow } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import formatDateTime from 'date-fns/format'
import { useExchange } from '../hooks/Exchange.js'
import { useI18N } from '../../locales/i18n_generated.js'
import { FileRouter } from '../../constants.js'
import type { FileInfo } from '../../types.js'
import { FileName } from './FileName.js'
import { resolveGatewayAPI } from '../../helpers.js'

const useStyles = makeStyles()({
    container: {
        height: 250,
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        alignItems: 'center',
        userSelect: 'none',
        paddingTop: 18,
        paddingBottom: 18,
    },
    meta: {
        lineHeight: 1.71,
        color: '#5D6F88',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    change: {
        fontSize: 14,
        margin: '0 auto',
        display: 'flex',
        padding: '0 60px',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    info: {
        margin: 0,
    },
})

export const Uploaded: React.FC = () => {
    const t = useI18N()
    const { classes } = useStyles()
    const navigate = useNavigate()
    const { onInsert, onDialogClose } = useExchange()
    const state = useLocation().state as FileInfo
    useEffect(() => {
        onInsert(state)
    }, [onInsert, state])
    const onBack = () => {
        onInsert(null)
        navigate(FileRouter.Prepare)
    }

    // return upload route
    onDialogClose(onBack)
    const onPreview = (event: React.MouseEvent) => {
        // ! THIS METHOD IS ONLY IN THE DEBUGGER !
        // ! Trigger: [Shift Key] + [Click] !
        // see https://mdn.io/shiftKey
        if (!event.shiftKey) {
            return
        }

        const linkPrefix = resolveGatewayAPI(state.provider)
        const link = urlcat(linkPrefix, '/:txId', { txId: state.landingTxID })
        openWindow(state.key ? `${link}#${state.key}` : link)
    }
    return (
        <Grid container className={classes.container}>
            <Grid item onClick={onPreview}>
                <File width={96} height={120} />
            </Grid>
            <Grid item sx={{ width: '100%' }}>
                <FileName name={state.name} />
                <Typography component="section" className={classes.meta}>
                    <p className={classes.info}>
                        <span>{formatFileSize(state.size)}</span>
                        <span>{'  '}</span>
                        <span>{formatDateTime(state.createdAt, 'yyyy-MM-dd HH:mm:ss')}</span>
                    </p>
                </Typography>
                <Button className={classes.change} onClick={onBack} variant="contained">
                    {t.on_change_file()}
                </Button>
            </Grid>
        </Grid>
    )
}
