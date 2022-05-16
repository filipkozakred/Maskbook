import { SecurityRiskIcon } from '@masknet/icons'
import { useWeb3State } from '@masknet/plugin-infra/web3'
import { TokenSecurity, useSnackbarCallback } from '@masknet/shared'
import { makeStyles, MaskDialog } from '@masknet/theme'
import { formatEthereumAddress, ZERO_ADDRESS } from '@masknet/web3-shared-evm'

import { Button, DialogActions, DialogContent, Link, Stack, Typography } from '@mui/material'
import { Copy, ExternalLink } from 'react-feather'
import { useCopyToClipboard } from 'react-use'
import { useI18N } from '../../../../utils'

const useStyles = makeStyles()((theme) => ({
    paperRoot: {
        padding: '0px',
        '&>h2': {
            background:
                theme.palette.mode === 'light'
                    ? 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%)'
                    : undefined,
            borderBottom: `1px solid ${theme.palette.divider}`,
            marginBottom: 24,
        },
    },
    content: {
        marginLeft: 12,
        marginRight: 12,
        paddingLeft: 0,
        paddingRight: 0,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    tokenInfo: {
        marginTop: '16px',
        backgroundColor: theme.palette.mode === 'light' ? '#f9f9f9' : '#1c1c1c',
        borderRadius: '8px',
        padding: '12px',
    },
    link: {
        color: theme.palette.text.primary,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        marginLeft: '4px',
    },
    actions: {
        padding: '16px',
        boxShadow:
            theme.palette.mode === 'light'
                ? '0px 0px 20px rgba(0, 0, 0, 0.05)'
                : '0px 0px 20px rgba(255, 255, 255, 0.12)',
        justifyContent: 'space-between',
        flexGrow: 1,
    },
    warningButton: {
        width: '48%',
        backgroundColor: '#ff3545',
        color: '#fff',
        '&:hover': { backgroundColor: '#ff3545', color: '#fff' },
    },
}))

export interface RiskWarningDialogProps extends withClasses<never> {
    open: boolean
    onConfirm: () => void
    onClose?: () => void
    tokenInfo: TokenSecurity
}

export function RiskWarningDialog(props: RiskWarningDialogProps) {
    const { t } = useI18N()
    const { open, onConfirm, onClose, tokenInfo } = props
    const { classes } = useStyles()
    const { Utils } = useWeb3State() ?? {}
    const [, copyToClipboard] = useCopyToClipboard()
    const onCopy = useSnackbarCallback(
        async (ev: React.MouseEvent<HTMLAnchorElement>) => {
            ev.stopPropagation()
            copyToClipboard(tokenInfo?.contract ?? '')
        },
        [],
        undefined,
        undefined,
        undefined,
        t('copy_success_of_token_addr'),
    )
    return (
        <>
            <MaskDialog
                open={open}
                onClose={onClose}
                DialogProps={{ classes: { paper: classes.paperRoot } }}
                maxWidth="xs"
                fullWidth
                title="Swapping Risk">
                <DialogContent className={classes.content}>
                    <Stack alignItems="center">
                        <SecurityRiskIcon sx={{ fontSize: '68px' }} />
                        <Typography marginTop="22px" color="#ff3545" fontSize="24px" fontWeight="600">
                            {t('plugin_trader_risk_warning_short')}
                        </Typography>
                    </Stack>
                    <Stack marginTop="51px">
                        <Typography color="#ff3545">{t('plugin_trader_dear_user')}</Typography>
                        <Typography color="#ff3545" marginTop="16px">
                            {t('plugin_trader_user_warning')}
                        </Typography>
                    </Stack>
                    <Stack className={classes.tokenInfo}>
                        <Typography>{tokenInfo?.token_name ?? '--'}</Typography>
                        <Stack direction="row">
                            <Typography>
                                {tokenInfo.contract ? formatEthereumAddress(tokenInfo?.contract, 4) : '--'}
                            </Typography>
                            <Link
                                className={classes.link}
                                underline="none"
                                component="button"
                                title={t('wallet_status_button_copy_address')}
                                onClick={onCopy}>
                                <Copy size={14} />
                            </Link>
                            <Link
                                className={classes.link}
                                href={
                                    Utils?.resolveAddressLink?.(
                                        tokenInfo?.chainId ?? 1,
                                        tokenInfo?.contract ?? ZERO_ADDRESS,
                                    ) ?? ''
                                }
                                target="_blank"
                                title={t('plugin_wallet_view_on_explorer')}
                                rel="noopener noreferrer">
                                <ExternalLink size={14} />
                            </Link>
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions className={classes.actions}>
                    <Button sx={{ width: '48%' }} onClick={onClose}>
                        {t('cancel')}
                    </Button>
                    <Button className={classes.warningButton} onClick={onConfirm}>
                        {t('plugin_trader_make_risk_trade')}
                    </Button>
                </DialogActions>
            </MaskDialog>
        </>
    )
}
