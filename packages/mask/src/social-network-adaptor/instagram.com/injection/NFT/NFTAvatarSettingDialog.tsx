import { useCallback, useState } from 'react'
import { useMount } from 'react-use'
import { MaskMessages, useI18N } from '../../../../utils/index.js'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import { toPNG } from '../../../../plugins/Avatar/utils/index.js'
import { getAvatarId } from '../../utils/user.js'
import { InjectedDialog } from '@masknet/shared'
import { DialogContent } from '@mui/material'
import { NFTAvatar } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatar.js'
import { DialogStackingProvider, makeStyles } from '@masknet/theme'
import { Instagram } from '@masknet/web3-providers'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import type { SelectTokenInfo } from '../../../../plugins/Avatar/types.js'
import { RSS3_KEY_SNS } from '../../../../plugins/Avatar/constants.js'
import { useSaveNFTAvatar } from '../../../../plugins/Avatar/hooks/index.js'
import type { EnhanceableSite } from '@masknet/shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()(() => ({
    root: {},
}))

export function NFTAvatarSettingDialog() {
    const { t } = useI18N()
    const [open, setOpen] = useState(false)
    const { classes } = useStyles()
    const { account } = useChainContext()
    const identity = useCurrentVisitingIdentity()
    const { pluginID } = useNetworkContext()
    const saveNFTAvatar = useSaveNFTAvatar()

    const onChange = useCallback(
        async (info: SelectTokenInfo) => {
            try {
                if (!info.token.metadata?.imageURL || !info.token.contract?.address) return
                if (!identity.identifier) return
                const image = await toPNG(info.token.metadata.imageURL)
                if (!image || !account) return
                const { profile_pic_url_hd } = await Instagram.uploadUserAvatar(image, identity.identifier.userId)
                const avatarId = getAvatarId(profile_pic_url_hd)
                const avatarInfo = await saveNFTAvatar(
                    account,
                    {
                        address: info.token.contract.address,
                        userId: identity.identifier.userId,
                        tokenId: info.token.tokenId,
                        avatarId,
                        chainId: (info.token.chainId ?? ChainId.Mainnet) as ChainId,
                        schema: (info.token.schema ?? SchemaType.ERC721) as SchemaType,
                        pluginId: info.pluginID,
                    },
                    identity.identifier.network as EnhanceableSite,
                    RSS3_KEY_SNS.INSTAGRAM,
                    pluginID,
                )

                if (!avatarInfo) {
                    window.alert('Sorry, failed to save NFT Avatar. Please set again.')
                    setOpen(false)
                    return
                }

                // If the avatar is set successfully, reload the page
                window.location.reload()

                setOpen(false)
            } catch (error) {
                if (error instanceof Error) {
                    window.alert(error.message)
                    return
                }
            }
        },
        [identity, account, saveNFTAvatar],
    )

    const onClose = useCallback(() => setOpen(false), [])

    useMount(() => {
        return MaskMessages.events.nftAvatarSettingDialogUpdated.on((data) => setOpen(data.open))
    })

    return (
        <DialogStackingProvider>
            <InjectedDialog keepMounted open={open} onClose={onClose} title={t('set_nft_profile_photo')}>
                <DialogContent style={{ padding: 16 }}>
                    <NFTAvatar
                        onChange={onChange}
                        classes={{
                            root: classes.root,
                        }}
                    />
                </DialogContent>
            </InjectedDialog>
        </DialogStackingProvider>
    )
}
