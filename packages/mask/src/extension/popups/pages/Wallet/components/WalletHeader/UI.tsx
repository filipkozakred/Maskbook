import { makeStyles } from '@masknet/theme'
import { memo, MouseEvent } from 'react'
import { Box, Link, Typography } from '@mui/material'
import { CopyIconButton } from '../../../../components/CopyIconButton/index.js'
import { ChainIcon, FormattedAddress, WalletIcon } from '@masknet/shared'
import { ChainId, formatEthereumAddress, explorerResolver, NetworkType } from '@masknet/web3-shared-evm'
import { Icons } from '@masknet/icons'
import type { NetworkDescriptor, Wallet } from '@masknet/web3-shared-base'
import { useI18N } from '../../../../../../utils/index.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(98, 126, 234, 0.2) 0%, rgba(59, 153, 252, 0.2) 100%)',
        padding: '11px 16px',
        lineHeight: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    action: {
        background: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 99,
        padding: '5px 8px 5px 4px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
    avatar: {
        marginRight: 4,
        width: 30,
        height: 30,
    },
    nickname: {
        color: '#07101B',
        lineHeight: '18px',
        fontWeight: 700,
    },
    identifier: {
        fontSize: 10,
        color: '#767F8D',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
    },
    icon: {
        fontSize: 12,
        height: 12,
        width: 12,
        color: '#767F8D',
        cursor: 'pointer',
        marginLeft: 4,
    },
    arrow: {
        fontSize: 20,
        transition: 'all 300ms',
        color: theme.palette.maskColor.secondaryDark,
    },
    colorChainICon: {
        borderRadius: '999px!important',
        margin: '0 !important',
    },
    networkSelector: {
        display: 'flex',
        cursor: 'pointer',
    },
    chainName: {
        lineHeight: '18px',
        color: '#15181B',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
    },
    connected: {
        display: 'flex',
        alignItems: 'center',
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
        columnGap: 4,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 99,
    },
    connectedDot: {
        backgroundColor: theme.palette.maskColor.success,
    },
    unconnectedDot: {
        backgroundColor: theme.palette.maskColor.third,
    },
}))
interface WalletHeaderUIProps {
    currentNetwork: NetworkDescriptor<ChainId, NetworkType>
    chainId: ChainId
    onOpenNetworkSelector: (event: MouseEvent<HTMLDivElement>) => void
    onActionClick: () => void
    wallet: Wallet
    isSwitchWallet: boolean
    disabled?: boolean
    connected?: boolean
    hiddenConnected?: boolean
}

export const WalletHeaderUI = memo<WalletHeaderUIProps>(
    ({
        currentNetwork,
        chainId,
        onOpenNetworkSelector,
        onActionClick,
        wallet,
        isSwitchWallet,
        disabled,
        connected,
        hiddenConnected,
    }) => {
        const { t } = useI18N()
        const { classes, cx } = useStyles()

        return (
            <Box className={classes.container}>
                <div
                    className={classes.networkSelector}
                    onClick={(event) => {
                        if (!disabled) onOpenNetworkSelector(event)
                    }}>
                    {currentNetwork.isMainnet ? (
                        <WalletIcon mainIcon={currentNetwork.icon} size={30} />
                    ) : (
                        <ChainIcon
                            color={currentNetwork.iconColor}
                            size={30}
                            classes={{ point: classes.colorChainICon }}
                        />
                    )}

                    <div style={{ marginLeft: 4 }}>
                        <Typography className={classes.chainName}>
                            {currentNetwork.name}
                            {!disabled ? (
                                <Icons.ArrowDrop
                                    className={classes.arrow}
                                    style={{ transform: status ? 'rotate(-180deg)' : undefined }}
                                />
                            ) : null}
                        </Typography>
                        {!hiddenConnected ? (
                            <Typography className={classes.connected}>
                                <div
                                    className={cx(
                                        classes.dot,
                                        connected ? classes.connectedDot : classes.unconnectedDot,
                                    )}
                                />
                                <span>
                                    {t('popups_wallet_connected_status', {
                                        context: connected ? 'connected' : 'unconnected',
                                    })}
                                </span>
                            </Typography>
                        ) : null}
                    </div>
                </div>
                <div
                    className={classes.action}
                    onClick={() => {
                        if (!disabled) onActionClick()
                    }}>
                    <Icons.MaskBlue className={classes.avatar} />
                    <div>
                        <Typography className={classes.nickname}>{wallet.name}</Typography>
                        <Typography className={classes.identifier}>
                            <FormattedAddress address={wallet.address} formatter={formatEthereumAddress} size={4} />
                            <CopyIconButton text={wallet.address ?? ''} className={classes.icon} />
                            <Link
                                onClick={(event) => event.stopPropagation()}
                                style={{ width: 12, height: 12 }}
                                href={explorerResolver.addressLink(chainId, wallet.address ?? '')}
                                target="_blank"
                                rel="noopener noreferrer">
                                <Icons.PopupLink className={classes.icon} />
                            </Link>
                        </Typography>
                    </div>
                    {!disabled ? (
                        <Icons.ArrowDrop
                            className={classes.arrow}
                            style={{ transform: isSwitchWallet ? 'rotate(-180deg)' : undefined }}
                        />
                    ) : null}
                </div>
            </Box>
        )
    },
)
