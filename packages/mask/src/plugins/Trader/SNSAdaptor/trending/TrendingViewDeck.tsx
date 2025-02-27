import { Icons } from '@masknet/icons'
import { useActivatedPluginsSNSAdaptor, useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import { useChainContext } from '@masknet/web3-hooks-base'
import { DataProvider } from '@masknet/public-api'
import {
    FormattedCurrency,
    Linking,
    TokenSecurityBar,
    useTokenSecurity,
    SourceSwitcher,
    FootnoteMenuOption,
} from '@masknet/shared'
import { EMPTY_LIST, PluginID, NetworkPluginID } from '@masknet/shared-base'
import { useRemoteControlledDialog, useValueRef } from '@masknet/shared-base-ui'
import { makeStyles, MaskColors, MaskLightTheme, useStylesExtends } from '@masknet/theme'
import type { TrendingAPI } from '@masknet/web3-providers'
import { formatCurrency, TokenType, SourceType } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import {
    Avatar,
    Button,
    CardContent,
    IconButton,
    Paper,
    Stack,
    ThemeProvider,
    Typography,
    useTheme,
} from '@mui/material'
import { Box } from '@mui/system'
import stringify from 'json-stable-stringify'
import { first, last } from 'lodash-unified'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useI18N } from '../../../../utils/index.js'
import { useTransakAllowanceCoin } from '../../../Transak/hooks/useTransakAllowanceCoin.js'
import { PluginTransakMessages } from '../../../Transak/messages.js'
import { getCurrentPreferredCoinIdSettings } from '../../settings.js'
import { setStorage } from '../../storage/index.js'
import type { Coin, Currency, Stat } from '../../types/index.js'
import { CoinMenu } from './CoinMenu.js'
import { CoinIcon } from './components/index.js'
import { PluginHeader } from './PluginHeader.js'
import { PriceChanged } from './PriceChanged.js'
import { TrendingCard, TrendingCardProps } from './TrendingCard.js'

const useStyles = makeStyles()((theme) => {
    return {
        content: {
            paddingTop: 0,
            paddingBottom: '0 !important',
            '&:last-child': {
                padding: 0,
            },
        },
        cardHeader: {
            padding: theme.spacing(2),
            paddingBottom: theme.spacing(6.5),
            background:
                'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(90deg, rgba(28, 104, 243, 0.2) 0%, rgba(69, 163, 251, 0.2) 100%), #FFFFFF;',
        },
        headline: {
            marginTop: 30,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            position: 'relative',
        },
        title: {
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
        },
        name: {
            maxWidth: 200,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            fontSize: 18,
            fontWeight: 700,
            color: theme.palette.maskColor?.dark,
        },
        symbol: {
            fontWeight: 700,
            fontSize: 18,
            color: theme.palette.maskColor?.dark,
            marginLeft: theme.spacing(0.5),
            marginRight: theme.spacing(0.5),
        },
        rank: {
            display: 'inline-flex',
            padding: theme.spacing(0.25, 0.5),
            color: theme.palette.maskColor?.white,
            fontWeight: 400,
            fontSize: 10,
            background: theme.palette.maskColor?.dark,
            borderRadius: theme.spacing(0.5),
        },
        avatar: {
            width: 24,
            height: 24,
            fontSize: 10,
            backgroundColor: theme.palette.common.white,
        },
        buyButton: {
            marginLeft: 'auto',
            marginBottom: theme.spacing(2),
        },
        icon: {
            color: MaskColors.dark.maskColor.dark,
        },
    }
})

export interface TrendingViewDeckProps extends withClasses<'header' | 'body' | 'footer' | 'content' | 'cardHeader'> {
    keyword: string
    stats: Stat[]
    coins: Coin[]
    currency: Currency
    trending: TrendingAPI.Trending
    dataProvider: DataProvider
    children?: React.ReactNode
    showDataProviderIcon?: boolean
    TrendingCardProps?: Partial<TrendingCardProps>
    dataProviders: DataProvider[]
}

export function TrendingViewDeck(props: TrendingViewDeckProps) {
    const {
        keyword,
        coins,
        trending,
        dataProvider,
        stats,
        children,
        showDataProviderIcon = false,
        TrendingCardProps,
        dataProviders = EMPTY_LIST,
    } = props
    const { coin, market } = trending

    const { t } = useI18N()
    const theme = useTheme()
    const classes = useStylesExtends(useStyles(), props)

    const isNFT = coin.type === TokenType.NonFungible

    // #region buy
    const transakPluginEnabled = useActivatedPluginsSNSAdaptor('any').some((x) => x.ID === PluginID.Transak)
    const transakIsMinimalMode = useIsMinimalMode(PluginID.Transak)

    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const isAllowanceCoin = useTransakAllowanceCoin({ address: coin.contract_address, symbol: coin.symbol })
    const { setDialog: setBuyDialog } = useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated)

    const snsAdaptorMinimalPlugins = useActivatedPluginsSNSAdaptor(true)
    const isTokenSecurityEnable = !isNFT && !snsAdaptorMinimalPlugins.map((x) => x.ID).includes(PluginID.GoPlusSecurity)

    const { value: tokenSecurityInfo, error } = useTokenSecurity(
        coin.chainId ?? ChainId.Mainnet,
        coin.contract_address?.trim(),
        isTokenSecurityEnable,
    )

    const isBuyable = !isNFT && transakPluginEnabled && !transakIsMinimalMode && coin.symbol && isAllowanceCoin
    const onBuyButtonClicked = useCallback(() => {
        setBuyDialog({
            open: true,
            code: coin.symbol,
            address: account,
        })
    }, [account, coin.symbol])
    // #endregion

    // #region sync with settings
    const onDataProviderChange = useCallback((option: FootnoteMenuOption) => {
        setStorage(option.value as DataProvider)
    }, [])
    // #endregion

    // #region switch between coins with the same symbol
    const currentPreferredCoinIdSettings = useValueRef(getCurrentPreferredCoinIdSettings(dataProvider))
    const onCoinMenuChange = useCallback(
        (type: TokenType, value: string) => {
            const settings = JSON.parse(currentPreferredCoinIdSettings) as Record<string, string>
            const coin = coins.find((x) => x.id === value && x.type === type)
            if (!coin) return
            settings[keyword.toLowerCase()] = value
            getCurrentPreferredCoinIdSettings(dataProvider).value = stringify(settings)
        },
        [dataProvider, keyword, coins, currentPreferredCoinIdSettings],
    )
    // #endregion
    const titleRef = useRef<HTMLElement>(null)
    const coinOptions = useMemo(() => coins.map((coin) => ({ coin, value: coin.id })), [coins])
    const [coinMenuOpen, setCoinMenuOpen] = useState(false)

    return (
        <TrendingCard {...TrendingCardProps}>
            <ThemeProvider theme={MaskLightTheme}>
                <Stack className={classes.cardHeader}>
                    <PluginHeader>
                        {showDataProviderIcon ? (
                            <SourceSwitcher
                                sourceType={dataProvider as unknown as SourceType}
                                sourceTypes={dataProviders as unknown as SourceType[]}
                                onSourceTypeChange={onDataProviderChange}
                            />
                        ) : null}
                    </PluginHeader>
                    <Stack className={classes.headline}>
                        <Stack gap={2} flexGrow={1}>
                            <Stack flexDirection="row">
                                {typeof coin.market_cap_rank === 'number' ? (
                                    <Typography component="span" className={classes.rank} title="Index Cap Rank">
                                        {t('plugin_trader_rank', { rank: coin.market_cap_rank })}
                                    </Typography>
                                ) : null}
                                <Box flex={1} />
                            </Stack>
                            <Stack>
                                <Stack flexDirection="row" alignItems="center" gap={0.5} ref={titleRef}>
                                    {coin.address ? (
                                        <Linking href={first(coin.home_urls)}>
                                            <Avatar className={classes.avatar} src={coin.image_url} alt={coin.symbol}>
                                                <CoinIcon
                                                    type={coin.type}
                                                    name={coin.name}
                                                    label=""
                                                    symbol={coin.symbol}
                                                    address={coin.address}
                                                    logoURL={coin.image_url}
                                                    size={20}
                                                />
                                            </Avatar>
                                        </Linking>
                                    ) : null}

                                    <Typography className={classes.title} variant="h6">
                                        <Linking
                                            href={first(coin.home_urls)}
                                            LinkProps={{ className: classes.name, title: coin.name.toUpperCase() }}>
                                            {coin.name.toUpperCase()}
                                        </Linking>
                                        {coin.symbol ? (
                                            <Typography component="span" className={classes.symbol}>
                                                ({coin.symbol.toUpperCase()})
                                            </Typography>
                                        ) : null}
                                    </Typography>
                                    {coins.length > 1 ? (
                                        <>
                                            <IconButton
                                                sx={{ padding: 0 }}
                                                size="small"
                                                onClick={() => setCoinMenuOpen((v) => !v)}>
                                                <Icons.ArrowDrop size={24} className={classes.icon} />
                                            </IconButton>
                                            <CoinMenu
                                                open={coinMenuOpen}
                                                anchorEl={titleRef.current}
                                                options={coinOptions}
                                                value={coins.find((x) => x.id === coin.id)?.id}
                                                type={coin.type}
                                                onChange={onCoinMenuChange}
                                                onClose={() => setCoinMenuOpen(false)}
                                            />
                                        </>
                                    ) : null}
                                    {isBuyable ? (
                                        <Button
                                            color="primary"
                                            className={classes.buyButton}
                                            size="small"
                                            startIcon={<Icons.Buy size={16} />}
                                            variant="contained"
                                            onClick={onBuyButtonClicked}>
                                            {t('buy_now')}
                                        </Button>
                                    ) : null}
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Stack direction="row" gap={1} alignItems="center">
                                        {market ? (
                                            <Typography
                                                fontSize={18}
                                                fontWeight={500}
                                                lineHeight="24px"
                                                color={theme.palette.maskColor.dark}>
                                                {isNFT ? `${t('plugin_trader_floor_price')}: ` : null}
                                                <FormattedCurrency
                                                    value={
                                                        (dataProvider === DataProvider.CoinMarketCap
                                                            ? last(stats)?.[1] ?? market.current_price
                                                            : market.current_price) ?? 0
                                                    }
                                                    sign={isNFT ? 'ETH' : 'USD'}
                                                    formatter={formatCurrency}
                                                />
                                            </Typography>
                                        ) : (
                                            <Typography fontSize={14} fontWeight={500} lineHeight="24px">
                                                {t('plugin_trader_no_data')}
                                            </Typography>
                                        )}
                                        <PriceChanged
                                            amount={
                                                market?.price_change_percentage_1h ??
                                                market?.price_change_percentage_24h ??
                                                0
                                            }
                                        />
                                    </Stack>
                                    {isTokenSecurityEnable && tokenSecurityInfo && !error && (
                                        <TokenSecurityBar tokenSecurity={tokenSecurityInfo} />
                                    )}
                                </Stack>
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>
            </ThemeProvider>
            <CardContent className={classes.content}>
                <Paper className={classes.body} elevation={0}>
                    {children}
                </Paper>
            </CardContent>
        </TrendingCard>
    )
}
