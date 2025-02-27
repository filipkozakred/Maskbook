import {
    TableContainer,
    Paper,
    Table,
    TableRow,
    TableCell,
    TableBody,
    Typography,
    Stack,
    MenuItem,
    IconButton,
} from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { DataProvider } from '@masknet/public-api'
import { useI18N } from '../../../../utils/index.js'
import { ContractSection } from './ContractSection.js'
import type { CommunityType } from '../../types/index.js'
import { Icons } from '@masknet/icons'
import { upperFirst } from 'lodash-unified'
import type { TrendingAPI } from '@masknet/web3-providers'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { Linking, useMenuConfig } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    container: {
        borderRadius: 0,
        backgroundColor: 'transparent',
        boxSizing: 'border-box',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    table: {},
    cell: {
        whiteSpace: 'nowrap',
        border: 'none',
        padding: 0,
        lineHeight: 1.2,
        fontWeight: 700,
    },
    cellValue: {
        border: 'none',
    },
    label: {
        color: theme.palette.text.secondary,
        whiteSpace: 'nowrap',
        textAlign: 'left',
    },
    link: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: theme.spacing(0.25),
        whiteSpace: 'nowrap',
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        '&:last-child': {
            paddingRight: 0,
        },
    },
}))

export interface CoinMetadataTableProps {
    trending: TrendingAPI.Trending
    dataProvider: DataProvider
}

const brands: Record<CommunityType, React.ReactNode> = {
    discord: <Icons.DiscordRound size={16} />,
    facebook: <Icons.FacebookRound size={16} />,
    github: <Icons.GitHub size={16} />,
    instagram: <Icons.InstagramRound size={16} />,
    medium: <Icons.Medium size={16} />,
    reddit: <Icons.RedditRound size={16} />,
    telegram: <Icons.TelegramRound size={16} />,
    twitter: <Icons.TwitterRound size={16} />,
    youtube: <Icons.YouTube size={16} />,
    other: null,
}

export function CoinMetadataTable(props: CoinMetadataTableProps) {
    const { trending } = props
    const { t } = useI18N()
    const { classes } = useStyles()

    const metadataLinks = [['Website', trending.coin.home_urls]] as Array<[string, string[] | undefined]>

    const contracts =
        trending.contracts ?? (trending.coin.chainId && trending.coin.contract_address)
            ? [
                  {
                      chainId: trending.coin.chainId!,
                      address: trending.coin.contract_address!,
                      name: trending.coin.name,
                      symbol: trending.coin.symbol,
                      iconURL: '',
                  },
              ]
            : []

    const [menu, openMenu] = useMenuConfig(
        contracts.map((x) => (
            <MenuItem key={x.chainId}>
                <ContractSection
                    chainId={x.chainId}
                    address={x.address}
                    name={x.name}
                    symbol={x.symbol}
                    iconURL={x.iconURL}
                />
            </MenuItem>
        )),
        {
            anchorSibling: false,
        },
    )

    return (
        <Stack>
            <Stack>
                <Typography fontSize={14} fontWeight={700}>
                    {t('plugin_trader_info')}
                </Typography>
            </Stack>
            <TableContainer className={classes.container} component={Paper} elevation={0}>
                <Table className={classes.table} size="small">
                    <TableBody>
                        {contracts.length ? (
                            <TableRow>
                                <TableCell className={classes.cell}>
                                    <Typography className={classes.label} variant="body2">
                                        {t('contract')}
                                    </Typography>
                                </TableCell>
                                <TableCell className={classes.cellValue} align="right">
                                    {contracts[0].address ? (
                                        <Stack
                                            direction="row"
                                            justifyContent="flex-end"
                                            height={18}
                                            style={{ position: 'relative', right: -5 }}>
                                            <ContractSection
                                                iconURL={contracts[0].iconURL}
                                                chainId={contracts[0].chainId}
                                                address={contracts[0].address}
                                                name={contracts[0].name}
                                                symbol={contracts[0].symbol}
                                            />
                                            {contracts.length > 1 ? (
                                                <IconButton size="small" onClick={openMenu}>
                                                    <MoreHorizIcon style={{ fontSize: 16 }} />
                                                </IconButton>
                                            ) : null}
                                            {menu}
                                        </Stack>
                                    ) : (
                                        '--'
                                    )}
                                </TableCell>
                            </TableRow>
                        ) : null}
                        {metadataLinks.map(([label, links], i) => {
                            if (!links?.length) return null
                            return (
                                <TableRow key={i}>
                                    <TableCell className={classes.cell}>
                                        <Typography className={classes.label} variant="body2">
                                            {label}
                                        </Typography>
                                    </TableCell>
                                    <TableCell className={classes.cellValue} align="right">
                                        <Stack display="inline-flex" direction="row" gap={1}>
                                            {links.map((x, i) => (
                                                <Linking
                                                    key={i}
                                                    href={x}
                                                    LinkProps={{ className: classes.link }}
                                                    TypographyProps={{ fontWeight: 700 }}
                                                />
                                            ))}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {!!trending.coin.community_urls?.length && (
                            <TableRow>
                                <TableCell className={classes.cell}>
                                    <Typography className={classes.label} variant="body2">
                                        {t('plugin_trader_community')}
                                    </Typography>
                                </TableCell>
                                <TableCell className={classes.cellValue} align="right">
                                    <Stack
                                        height="100%"
                                        display="flex"
                                        direction="row"
                                        justifyContent="flex-end"
                                        flexWrap="wrap"
                                        alignItems="center"
                                        gap={1.5}>
                                        {trending.coin.community_urls.map((x) => (
                                            <Linking
                                                key={x.link}
                                                href={x.link}
                                                LinkProps={{
                                                    className: classes.link,
                                                }}>
                                                {brands[x.type]}
                                                {upperFirst(x.type)}
                                            </Linking>
                                        ))}
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    )
}
