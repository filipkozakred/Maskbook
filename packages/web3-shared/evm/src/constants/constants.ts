import Airdrop from '@masknet/web3-constants/evm/airdrop.json'
import Ethereum from '@masknet/web3-constants/evm/ethereum.json'
import DeBank from '@masknet/web3-constants/evm/debank.json'
import CoinGecko from '@masknet/web3-constants/evm/coingecko.json'
import CoinMarketCap from '@masknet/web3-constants/evm/coinmarketcap.json'
import Gitcoin from '@masknet/web3-constants/evm/gitcoin.json'
import OpenOcean from '@masknet/web3-constants/evm/openocean.json'
import ITO from '@masknet/web3-constants/evm/ito.json'
import RedPacket from '@masknet/web3-constants/evm/red-packet.json'
import NftRedPacket from '@masknet/web3-constants/evm/nft-red-packet.json'
import Token from '@masknet/web3-constants/evm/token.json'
import Trader from '@masknet/web3-constants/evm/trader.json'
import Trending from '@masknet/web3-constants/evm/trending.json'
import MaskBox from '@masknet/web3-constants/evm/mask-box.json'
import RPC from '@masknet/web3-constants/evm/rpc.json'
import Explorer from '@masknet/web3-constants/evm/explorer.json'
import PoolTogether from '@masknet/web3-constants/evm/pooltogether.json'
import TokenList from '@masknet/web3-constants/evm/token-list.json'
import TokenAssetBaseURL from '@masknet/web3-constants/evm/token-asset-base-url.json'
import GoodGhosting from '@masknet/web3-constants/evm/good-ghosting.json'
import SpaceStationGalaxy from '@masknet/web3-constants/evm/space-station-galaxy.json'
import OpenseaAPI from '@masknet/web3-constants/evm/opensea-api.json'
import CryptoArtAI from '@masknet/web3-constants/evm/cryptoartai.json'
import ArtBlocks from '@masknet/web3-constants/evm/artblocks.json'
import Aave from '@masknet/web3-constants/evm/aave.json'
import Lido from '@masknet/web3-constants/evm/lido.json'
import Game from '@masknet/web3-constants/evm/game.json'
import Pet from '@masknet/web3-constants/evm/pet.json'
import ens from '@masknet/web3-constants/evm/ens.json'

import {
    transformAllHook,
    transformHook,
    transformAll,
    transform,
    transformAllFromJSON,
    transformFromJSON,
} from '@masknet/web3-shared-base'
import { ChainId } from '../types/index.js'

function getEnvConstants(key: 'WEB3_CONSTANTS_RPC') {
    try {
        const map = {
            WEB3_CONSTANTS_RPC: process.env.WEB3_CONSTANTS_RPC,
        }
        return map[key] ?? ''
    } catch {
        return ''
    }
}

export const getAirdropConstant = transform(ChainId, Airdrop)
export const getAirdropConstants = transformAll(ChainId, Airdrop)
export const useAirdropConstant = transformHook(getAirdropConstants)
export const useAirdropConstants = transformAllHook(getAirdropConstants)

export const getEthereumConstant = transform(ChainId, Ethereum)
export const getEthereumConstants = transformAll(ChainId, Ethereum)
export const useEthereumConstant = transformHook(getEthereumConstants)
export const useEthereumConstants = transformAllHook(getEthereumConstants)

export const getDeBankConstant = transform(ChainId, DeBank)
export const getDeBankConstants = transformAll(ChainId, DeBank)
export const useDeBankConstant = transformHook(getDeBankConstants)
export const useDeBankConstants = transformAllHook(getDeBankConstants)

export const getCoinGeckoConstant = transform(ChainId, CoinGecko)
export const getCoinGeckoConstants = transformAll(ChainId, CoinGecko)
export const useCoinGeckoConstant = transformHook(getCoinGeckoConstants)
export const useCoinGeckoConstants = transformAllHook(getCoinGeckoConstants)

export const getCoinMarketCapConstant = transform(ChainId, CoinMarketCap)
export const getCoinMarketCapConstants = transformAll(ChainId, CoinMarketCap)
export const useCoinMarketCapConstant = transformHook(getCoinMarketCapConstants)
export const useCoinMarketCapConstants = transformAllHook(getCoinMarketCapConstants)

export const getGitcoinConstant = transform(ChainId, Gitcoin)
export const getGitcoinConstants = transformAll(ChainId, Gitcoin)
export const useGitcoinConstant = transformHook(getGitcoinConstants)
export const useGitcoinConstants = transformAllHook(getGitcoinConstants)

export const getOpenOceanConstant = transform(ChainId, OpenOcean)
export const getOpenOceanConstants = transformAll(ChainId, OpenOcean)
export const useOpenOceanConstant = transformHook(getOpenOceanConstants)
export const useOpenOceanConstants = transformAllHook(getOpenOceanConstants)

export const getITOConstant = transform(ChainId, ITO)
export const getITOConstants = transformAll(ChainId, ITO)
export const useITOConstant = transformHook(getITOConstants)
export const useITOConstants = transformAllHook(getITOConstants)

export const getRedPacketConstant = transform(ChainId, RedPacket)
export const getRedPacketConstants = transformAll(ChainId, RedPacket)
export const useRedPacketConstant = transformHook(getRedPacketConstants)
export const useRedPacketConstants = transformAllHook(getRedPacketConstants)

export const getTokenConstant = transform(ChainId, Token)
export const getTokenConstants = transformAll(ChainId, Token)
export const useTokenConstant = transformHook(getTokenConstants)
export const useTokenConstants = transformAllHook(getTokenConstants)

export const getTraderConstant = transform(ChainId, Trader)
export const getTraderConstants = transformAll(ChainId, Trader)
export const useTraderConstant = transformHook(getTraderConstants)
export const useTraderConstants = transformAllHook(getTraderConstants)

export const getTrendingConstant = transform(ChainId, Trending)
export const getTrendingConstants = transformAll(ChainId, Trending)
export const useTrendingConstant = transformHook(getTrendingConstants)
export const useTrendingConstants = transformAllHook(getTrendingConstants)

export const getMaskBoxConstant = transform(ChainId, MaskBox)
export const getMaskBoxConstants = transformAll(ChainId, MaskBox)
export const useMaskBoxConstant = transformHook(getMaskBoxConstants)
export const useMaskBoxConstants = transformAllHook(getMaskBoxConstants)

export const getRPCConstants = transformAllFromJSON(ChainId, getEnvConstants('WEB3_CONSTANTS_RPC'), RPC)
export const getRPCConstant = transformFromJSON(ChainId, getEnvConstants('WEB3_CONSTANTS_RPC'), RPC)
export const useRPCConstant = transformHook(getRPCConstants)
export const useRPCConstants = transformAllHook(getRPCConstants)

export const getExplorerConstant = transform(ChainId, Explorer)
export const getExplorerConstants = transformAll(ChainId, Explorer)
export const useExplorerConstant = transformHook(getExplorerConstants)
export const useExplorerConstants = transformAllHook(getExplorerConstants)

export const getTokenListConstant = transform(ChainId, TokenList)
export const getTokenListConstants = transformAll(ChainId, TokenList)
export const useTokenListConstant = transformHook(getTokenListConstants)
export const useTokenListConstants = transformAllHook(getTokenListConstants)

export const getTokenAssetBaseURLConstant = transform(ChainId, TokenAssetBaseURL)
export const getTokenAssetBaseURLConstants = transformAll(ChainId, TokenAssetBaseURL)
export const useTokenAssetBaseURLConstant = transformHook(getTokenAssetBaseURLConstants)
export const useTokenAssetBaseURLConstants = transformAllHook(getTokenAssetBaseURLConstants)

export const getPoolTogetherConstant = transform(ChainId, PoolTogether)
export const getPoolTogetherConstants = transformAll(ChainId, PoolTogether)
export const usePoolTogetherConstant = transformHook(getPoolTogetherConstants)
export const usePoolTogetherConstants = transformAllHook(getPoolTogetherConstants)

export const getGoodGhostingConstant = transform(ChainId, GoodGhosting)
export const getGoodGhostingConstants = transformAll(ChainId, GoodGhosting)
export const useGoodGhostingConstant = transformHook(getGoodGhostingConstants)
export const useGoodGhostingConstants = transformAllHook(getGoodGhostingConstants)

export const getSpaceStationGalaxyConstant = transform(ChainId, SpaceStationGalaxy)
export const getSpaceStationGalaxyConstants = transformAll(ChainId, SpaceStationGalaxy)
export const useSpaceStationGalaxyConstant = transformHook(getSpaceStationGalaxyConstants)
export const useSpaceStationGalaxyConstants = transformAllHook(getSpaceStationGalaxyConstants)

export const getOpenseaAPIConstant = transform(ChainId, OpenseaAPI)
export const getOpenseaAPIConstants = transformAll(ChainId, OpenseaAPI)
export const useOpenseaAPIConstant = transformHook(getOpenseaAPIConstants)
export const useOpenseaAPIConstants = transformAllHook(getOpenseaAPIConstants)

export const getCryptoArtAIConstant = transform(ChainId, CryptoArtAI)
export const getCryptoArtAIConstants = transformAll(ChainId, CryptoArtAI)
export const useCryptoArtAIConstant = transformHook(getCryptoArtAIConstants)
export const useCryptoArtAIConstants = transformAllHook(getCryptoArtAIConstants)

export const getArtBlocksConstant = transform(ChainId, ArtBlocks)
export const getArtBlocksConstants = transformAll(ChainId, ArtBlocks)
export const useArtBlocksConstant = transformHook(getArtBlocksConstants)
export const useArtBlocksConstants = transformAllHook(getArtBlocksConstants)

export const getNftRedPacketConstant = transform(ChainId, NftRedPacket)
export const getNftRedPacketConstants = transformAll(ChainId, NftRedPacket)
export const useNftRedPacketConstant = transformHook(getNftRedPacketConstants)
export const useNftRedPacketConstants = transformAllHook(getNftRedPacketConstants)

export const getAaveConstant = transform(ChainId, Aave)
export const getAaveConstants = transformAll(ChainId, Aave)
export const useAaveConstant = transformHook(getAaveConstants)
export const useAaveConstants = transformAllHook(getAaveConstants)

export const getLidoConstant = transform(ChainId, Lido)
export const getLidoConstants = transformAll(ChainId, Lido)
export const useLidoConstant = transformHook(getLidoConstants)
export const useLidoConstants = transformAllHook(getLidoConstants)

export const getGameConstant = transform(ChainId, Game)
export const getGameConstants = transformAll(ChainId, Game)
export const useGameConstant = transformHook(getGameConstants)
export const useGameConstants = transformAllHook(getGameConstants)

export const getPetConstant = transform(ChainId, Pet)
export const getPetConstants = transformAll(ChainId, Pet)
export const usePetConstant = transformHook(getPetConstants)
export const usePetConstants = transformAllHook(getPetConstants)

export const getENSConstants = transformAll(ChainId, ens)
