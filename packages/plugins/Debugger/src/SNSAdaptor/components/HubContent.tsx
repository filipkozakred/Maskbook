import { useState } from 'react'
import { useChainContext, useWeb3Hub } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { makeStyles, ShadowRootMenu } from '@masknet/theme'
import { Hub, OrderSide, resolveSourceTypeName, SourceType } from '@masknet/web3-shared-base'
import { Button, MenuItem, Table, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material'
import { getEnumAsArray } from '@dimensiondev/kit'
import { Icons } from '@masknet/icons'

export interface HubContentProps {
    onClose?: () => void
}

const useStyles = makeStyles()({
    container: {
        overflow: 'auto',
    },
})

export function HubContent(props: HubContentProps) {
    const { classes } = useStyles()
    const hub = useWeb3Hub()
    const { account, chainId } = useChainContext()
    const [keyword, setKeyword] = useState<string>('PUNK')
    const [address, setAddress] = useState<string>('0x932261f9fc8da46c4a22e31b45c4de60623848bf')
    const [tokenId, setTokenId] = useState<string>('32342')
    const [sourceType, setSourceType] = useState<SourceType | undefined>()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    type HubAll = Required<Hub<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll, Web3Helper.GasOptionAll>>
    type API<T extends keyof HubAll = keyof HubAll> = readonly [T, Parameters<HubAll[T]>]

    const APIs: API[] = [
        // gas options
        ['getGasOptions', [chainId]],

        // transactions
        ['getTransactions', [chainId, account]],

        // fungible tokens
        ['getFungibleAsset', [address]],
        ['getFungibleAssets', [account]],
        ['getFungibleTokenBalance', [address]],
        ['getFungibleTokenPrice', [chainId, address]],
        ['getFungibleTokenSecurity', [chainId, address]],

        ['getFungibleTokenIconURLs', [chainId, address]],
        ['getNonFungibleTokenIconURLs', [chainId, address, tokenId]],

        ['getFungibleTokenStats', [address]],
        ['getFungibleTokensFromTokenList', [chainId]],
        ['getFungibleTokenSpenders', [chainId, account]],

        // non-fungible tokens
        ['getNonFungibleTokenOwner', [address, tokenId]],
        ['getNonFungibleTokenPrice', [chainId, address, tokenId]],
        ['getNonFungibleTokensFromTokenList', [chainId]],
        ['getNonFungibleTokenSpenders', [chainId, address]],
        ['getNonFungibleTokenBalance', [address]],
        ['getNonFungibleTokenStats', [address]],
        ['getNonFungibleTokenSecurity', [chainId, address]],
        ['getNonFungibleTokenContract', [address]],
        ['getNonFungibleCollectionsByOwner', [account]],
        ['getNonFungibleCollectionsByKeyword', [keyword]],
        ['getNonFungibleTokenEvents', [address, tokenId]],
        ['getNonFungibleTokenOffers', [address, tokenId]],
        ['getNonFungibleTokenListings', [address, tokenId]],
        ['getNonFungibleTokenOrders', [address, tokenId, OrderSide.Buy]],
        ['getNonFungibleAsset', [address, tokenId]],
        ['getNonFungibleAssets', [account]],
        ['getNonFungibleRarity', [address, tokenId]],
        ['getNonFungibleTokenFloorPrice', [address, tokenId]],
        ['getNonFungibleAssetsByCollection', [address]],
    ]

    return (
        <section className={classes.container}>
            <Table size="small">
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Keyword
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <TextField
                                label="Keyword"
                                value={keyword}
                                placeholder="Enter keyword to search"
                                size="small"
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Contract Address
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <TextField
                                label="Address"
                                value={address}
                                placeholder="Enter contract address"
                                size="small"
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Token ID
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <TextField
                                label="Token Id"
                                value={tokenId}
                                placeholder="Enter token id"
                                size="small"
                                style={{ marginTop: 8 }}
                                onChange={(e) => setTokenId(e.target.value)}
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body2" whiteSpace="nowrap">
                                Source Type
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Button
                                size="small"
                                onClick={(e) => setAnchorEl(e.currentTarget)}
                                endIcon={<Icons.ArrowDownRound size={14} />}>
                                {sourceType ? resolveSourceTypeName(sourceType) : 'NO PROVIDER'}
                            </Button>
                            <ShadowRootMenu
                                anchorEl={anchorEl}
                                open={!!anchorEl}
                                defaultValue={SourceType.OpenSea}
                                onClose={() => setAnchorEl(null)}>
                                {getEnumAsArray(SourceType).map((x) => {
                                    return (
                                        <MenuItem key={x.key} value={x.value} onClick={() => setSourceType(x.value)}>
                                            {x.key}
                                        </MenuItem>
                                    )
                                })}
                            </ShadowRootMenu>
                        </TableCell>
                    </TableRow>
                    {APIs.map(([key, parameters]) => {
                        return (
                            <TableRow key={key}>
                                <TableCell>
                                    <Typography variant="body2" whiteSpace="nowrap">
                                        {key}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        size="small"
                                        onClick={async () => {
                                            try {
                                                console.log(`Query ${key}:`)
                                                console.log(
                                                    // @ts-ignore
                                                    await hub?.[key]?.(...parameters, {
                                                        chainId,
                                                        account,
                                                        sourceType,
                                                    }),
                                                )
                                            } catch (error) {
                                                console.error(error)
                                            }
                                        }}>
                                        Query
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </section>
    )
}
