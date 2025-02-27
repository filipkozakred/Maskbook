import { useState, useCallback, useEffect, useMemo } from 'react'
import classNames from 'classnames'
import { Box, Typography, List, ListItem } from '@mui/material'
import { makeStyles, ActionButton, LoadingBase } from '@masknet/theme'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { useI18N } from '../locales/index.js'
import { ERC721ContractSelectPanel } from '../../../web3/UI/ERC721ContractSelectPanel.js'
import { WalletConnectedBoundary } from '../../../web3/UI/WalletConnectedBoundary.js'
import { EthereumERC721TokenApprovedBoundary } from '../../../web3/UI/EthereumERC721TokenApprovedBoundary.js'
import { ChainId, SchemaType, useNftRedPacketConstants, formatTokenId } from '@masknet/web3-shared-evm'
import { RedpacketMessagePanel } from './RedpacketMessagePanel.js'
import { SelectNftTokenDialog, OrderedERC721Token } from './SelectNftTokenDialog.js'
import { RedpacketNftConfirmDialog } from './RedpacketNftConfirmDialog.js'
import { NFTCardStyledAssetPlayer, PluginWalletStatusBar, ChainBoundary } from '@masknet/shared'
import { NFTSelectOption } from '../types.js'
import { NFT_RED_PACKET_MAX_SHARES } from '../constants.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import { useNonFungibleOwnerTokens } from '@masknet/web3-hooks-evm'
import { NetworkPluginID, EMPTY_LIST } from '@masknet/shared-base'
import type { NonFungibleTokenContract, NonFungibleToken } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            display: 'flex',
            alignItems: 'stretch',
            flexDirection: 'column',
            padding: '0 16px',
        },
        line: {
            display: 'flex',
            margin: theme.spacing(1, 0, 2, 0),
        },
        nftNameWrapper: {
            position: 'absolute',
            bottom: 0,
            width: '100%',
            background: theme.palette.background.paper,
            borderBottomRightRadius: 8,
            borderBottomLeftRadius: 8,
            paddingTop: 2,
            paddingBottom: 1,
        },
        nftName: {
            minHeight: 30,
            marginLeft: 8,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        tokenSelector: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            width: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            height: 200,
            background: theme.palette.background.default,
            borderRadius: 12,
            padding: theme.spacing(1.5, 1.5, 1, 1),
            boxSizing: 'border-box',
            '::-webkit-scrollbar': {
                backgroundColor: 'transparent',
                width: 20,
            },
            '::-webkit-scrollbar-thumb': {
                borderRadius: '20px',
                width: 5,
                border: '7px solid rgba(0, 0, 0, 0)',
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(250, 250, 250, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                backgroundClip: 'padding-box',
            },
        },
        tokenSelectorWrapper: {
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 8,
            padding: 0,
            marginBottom: theme.spacing(2.5),
            background: theme.palette.background.paper,
            width: 120,
            height: 180,
            overflow: 'hidden',
        },
        tokenSelectorParent: {
            background: theme.palette.background.default,
            borderRadius: 12,
            paddingBottom: 5,
            marginTop: theme.spacing(1.5),
            marginBottom: theme.spacing(1.5),
        },
        addWrapper: {
            cursor: 'pointer',
            alignItems: 'center',
            background: `${theme.palette.background.default} !important`,
            justifyContent: 'center',
            border: `1px solid ${theme.palette.divider}`,
        },
        addIcon: {
            color: '#AFC3E1',
        },
        closeIconWrapperBack: {
            position: 'absolute',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            top: 5,
            right: 5,
            width: 18,
            height: 18,
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 500,
            overflow: 'hidden',
        },
        closeIconWrapper: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: 18,
            height: 18,
            background: 'rgba(255, 95, 95, 0.3)',
        },
        closeIcon: {
            width: 14,
            height: 14,
            cursor: 'pointer',
            color: 'rgba(255, 95, 95, 1)',
        },
        fallbackImage: {
            minHeight: '0 !important',
            maxWidth: 'none',
            transform: 'translateY(10px)',
            width: 64,
            height: 64,
        },
        selectWrapper: {
            display: 'flex',
            alignItems: 'center',
            margin: 0,
        },
        option: {
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
        },
        optionLeft: {
            marginRight: '16px',
        },
        checkIcon: {
            width: 15,
            height: 15,
            color: '#fff',
        },
        checkIconWrapper: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            width: 17,
            height: 17,
            borderRadius: 999,
            marginRight: 5,
            border: '1px solid #6E748E',
            backgroundColor: 'white',
        },
        checked: {
            borderColor: '#1D9BF0 !important',
            background: '#1D9BF0 !important',
        },
        approveAllTip: {
            color: '#FF5F5F',
            margin: '16px 4px 24px 4px',
        },
        disabledSelector: {
            opacity: 0.5,
            pointerEvents: 'none',
        },
        loadingOwnerList: {
            margin: '24px auto 16px',
        },
        iframe: {
            minHeight: 147,
        },
        assetImgWrapper: {
            maxHeight: 155,
        },
        approveButton: {
            height: 40,
            margin: 0,
            padding: 0,
        },
    }
})
interface RedPacketERC721FormProps {
    onClose: () => void
    openNFTConfirmDialog: boolean
    openSelectNFTDialog: boolean
    setOpenSelectNFTDialog: (x: boolean) => void
    setOpenNFTConfirmDialog: (x: boolean) => void
    setIsNFTRedPacketLoaded?: (x: boolean) => void
}
export function RedPacketERC721Form(props: RedPacketERC721FormProps) {
    const t = useI18N()
    const {
        onClose,
        setIsNFTRedPacketLoaded,
        openNFTConfirmDialog,
        setOpenNFTConfirmDialog,
        openSelectNFTDialog,
        setOpenSelectNFTDialog,
    } = props
    const { classes } = useStyles()
    const [balance, setBalance] = useState(0)
    const [selectOption, setSelectOption] = useState<NFTSelectOption | undefined>(undefined)
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const [contract, setContract] = useState<NonFungibleTokenContract<ChainId, SchemaType.ERC721>>()
    const [manualSelectedTokenDetailedList, setExistTokenDetailedList] = useState<OrderedERC721Token[]>(EMPTY_LIST)
    const [onceAllSelectedTokenDetailedList, setAllTokenDetailedList] = useState<OrderedERC721Token[]>(EMPTY_LIST)
    const tokenDetailedList =
        selectOption === NFTSelectOption.Partial ? manualSelectedTokenDetailedList : onceAllSelectedTokenDetailedList
    const [message, setMessage] = useState('Best Wishes!')
    const {
        asyncRetry: { loading: loadingOwnerList },
        tokenDetailedOwnerList: _tokenDetailedOwnerList = [],
        clearTokenDetailedOwnerList,
    } = useNonFungibleOwnerTokens(contract?.address ?? '', account, chainId, balance)
    const tokenDetailedOwnerList = _tokenDetailedOwnerList.map((v, index) => ({ ...v, index } as OrderedERC721Token))
    const removeToken = useCallback(
        (token: NonFungibleToken<ChainId, SchemaType.ERC721>) => {
            ;(selectOption === NFTSelectOption.Partial ? setExistTokenDetailedList : setAllTokenDetailedList)((list) =>
                list.filter((t) => t.tokenId !== token.tokenId),
            )

            setSelectOption(NFTSelectOption.Partial)
        },
        [selectOption, setSelectOption, setExistTokenDetailedList, setAllTokenDetailedList],
    )

    const maxSelectShares = Math.min(NFT_RED_PACKET_MAX_SHARES, tokenDetailedOwnerList.length)

    const clearToken = useCallback(() => {
        setExistTokenDetailedList([])
        clearTokenDetailedOwnerList()
        setOpenNFTConfirmDialog(false)
    }, [clearTokenDetailedOwnerList])

    const clearContract = useCallback(() => {
        setContract(undefined)
    }, [])

    useEffect(() => {
        if (loadingOwnerList) {
            setSelectOption(undefined)
        } else if (!selectOption) {
            setSelectOption(NFTSelectOption.Partial)
        }
    }, [tokenDetailedOwnerList, selectOption, loadingOwnerList])

    useEffect(() => {
        clearToken()
        setOpenSelectNFTDialog(false)
    }, [contract, account])

    useEffect(() => {
        setOpenSelectNFTDialog(false)
        clearContract()
    }, [chainId])

    const { RED_PACKET_NFT_ADDRESS } = useNftRedPacketConstants(chainId)

    const validationMessage = useMemo(() => {
        if (!balance) return t.erc721_insufficient_balance()
        if (tokenDetailedList.length === 0) return t.select_a_token()
        return ''
    }, [tokenDetailedList.length, balance, t])

    setIsNFTRedPacketLoaded?.(balance > 0)

    if (openSelectNFTDialog) {
        return (
            <SelectNftTokenDialog
                onClose={() => setOpenSelectNFTDialog(false)}
                contract={contract}
                existTokenDetailedList={tokenDetailedList}
                setExistTokenDetailedList={setExistTokenDetailedList}
                tokenDetailedOwnerList={tokenDetailedOwnerList}
                loadingOwnerList={loadingOwnerList}
            />
        )
    }

    if (openNFTConfirmDialog && contract) {
        return (
            <RedpacketNftConfirmDialog
                message={message}
                contract={contract}
                tokenList={tokenDetailedList}
                onBack={() => setOpenNFTConfirmDialog(false)}
                onClose={onClose}
            />
        )
    }

    return (
        <>
            <Box className={classes.root}>
                <Box style={{ margin: '16px 0' }}>
                    <ERC721ContractSelectPanel
                        contract={contract}
                        onContractChange={setContract}
                        balance={balance}
                        onBalanceChange={setBalance}
                    />
                </Box>
                {contract && balance ? (
                    loadingOwnerList ? (
                        <LoadingBase size={24} className={classes.loadingOwnerList} />
                    ) : (
                        // TODO: replace to radio
                        <Box className={classes.selectWrapper}>
                            <div
                                className={classNames(
                                    classes.optionLeft,
                                    classes.option,
                                    tokenDetailedOwnerList.length === 0 ? classes.disabledSelector : null,
                                )}
                                onClick={() => {
                                    setSelectOption(NFTSelectOption.All)
                                    setAllTokenDetailedList(tokenDetailedOwnerList.slice(0, maxSelectShares))
                                }}>
                                <div
                                    className={classNames(
                                        classes.checkIconWrapper,
                                        selectOption === NFTSelectOption.All ? classes.checked : '',
                                    )}>
                                    <CheckIcon className={classes.checkIcon} />
                                </div>
                                <Typography color="textPrimary">
                                    {tokenDetailedOwnerList.length === 0
                                        ? 'All'
                                        : t.nft_select_all_option({
                                              total: Math.min(
                                                  NFT_RED_PACKET_MAX_SHARES,
                                                  tokenDetailedOwnerList.length,
                                              ).toString(),
                                          })}
                                </Typography>
                            </div>
                            <div className={classes.option} onClick={() => setSelectOption(NFTSelectOption.Partial)}>
                                <div
                                    className={classNames(
                                        classes.checkIconWrapper,
                                        selectOption === NFTSelectOption.Partial ? classes.checked : '',
                                    )}>
                                    <CheckIcon className={classes.checkIcon} />
                                </div>
                                <Typography color="textPrimary">{t.nft_select_partially_option()}</Typography>
                            </div>
                        </Box>
                    )
                ) : null}
                {contract && balance && !loadingOwnerList ? (
                    <div className={classes.tokenSelectorParent}>
                        <List className={classes.tokenSelector}>
                            {tokenDetailedList.map((value, i) => (
                                <div key={i}>
                                    <NFTCard token={value} removeToken={removeToken} renderOrder={i} />
                                </div>
                            ))}
                            <ListItem
                                onClick={() => setOpenSelectNFTDialog(true)}
                                className={classNames(classes.tokenSelectorWrapper, classes.addWrapper)}>
                                <AddCircleOutlineIcon className={classes.addIcon} onClick={() => void 0} />
                            </ListItem>
                        </List>
                    </div>
                ) : null}
                <div className={classes.line}>
                    <RedpacketMessagePanel onChange={(val: string) => setMessage(val)} message={message} />
                </div>
                {contract && balance && !loadingOwnerList ? (
                    <Typography className={classes.approveAllTip}>{t.nft_approve_all_tip()}</Typography>
                ) : null}
            </Box>
            <Box style={{ position: 'absolute', bottom: 0, width: '100%' }}>
                <PluginWalletStatusBar>
                    <ChainBoundary
                        expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                        expectedChainId={chainId}
                        forceShowingWrongNetworkButton>
                        <WalletConnectedBoundary>
                            <EthereumERC721TokenApprovedBoundary
                                validationMessage={validationMessage}
                                owner={account}
                                contractDetailed={contract}
                                classes={{ approveButton: classes.approveButton }}
                                operator={RED_PACKET_NFT_ADDRESS}>
                                <ActionButton
                                    style={{ height: 40, padding: 0, margin: 0 }}
                                    size="large"
                                    disabled={!!validationMessage}
                                    fullWidth
                                    onClick={() => setOpenNFTConfirmDialog(true)}>
                                    {t.next()}
                                </ActionButton>
                            </EthereumERC721TokenApprovedBoundary>
                        </WalletConnectedBoundary>
                    </ChainBoundary>
                </PluginWalletStatusBar>
            </Box>
        </>
    )
}

interface NFTCardProps {
    token: OrderedERC721Token
    removeToken: (token: NonFungibleToken<ChainId, SchemaType.ERC721>) => void
    renderOrder: number
}

function NFTCard(props: NFTCardProps) {
    const { token, removeToken, renderOrder } = props
    const { classes } = useStyles()
    const [name, setName] = useState(formatTokenId(token.tokenId, 2))
    return (
        <ListItem className={classNames(classes.tokenSelectorWrapper)}>
            <NFTCardStyledAssetPlayer
                contractAddress={token.contract?.address}
                chainId={token.chainId}
                url={token.metadata?.mediaURL || token.metadata?.imageURL}
                tokenId={token.tokenId}
                renderOrder={renderOrder}
                setERC721TokenName={setName}
                classes={{
                    fallbackImage: classes.fallbackImage,
                    iframe: classes.iframe,
                    imgWrapper: classes.assetImgWrapper,
                }}
            />
            <div className={classes.nftNameWrapper}>
                <Typography className={classes.nftName} color="textSecondary">
                    {name}
                </Typography>
            </div>
            <div className={classes.closeIconWrapperBack} onClick={() => removeToken(token)}>
                <div className={classes.closeIconWrapper}>
                    <CloseIcon className={classes.closeIcon} />
                </div>
            </div>
        </ListItem>
    )
}
