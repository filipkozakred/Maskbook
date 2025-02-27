import { NetworkPluginID } from '@masknet/shared-base'

export const RSS3_ENDPOINT = 'https://hub.pass3.me'
export const NEW_RSS3_ENDPOINT = 'https://pregod.rss3.dev/v1/notes/'

export const RSS3_FEED_ENDPOINT = 'https://pregod.rss3.dev/v0.4.0/'

export const NETWORK_PLUGIN = {
    [NetworkPluginID.PLUGIN_EVM]: 'ethereum',
    [NetworkPluginID.PLUGIN_FLOW]: 'flow',
    [NetworkPluginID.PLUGIN_SOLANA]: 'solana',
}

export enum CollectionType {
    NFTs = 'NFTs',
    Donations = 'Donations',
    Footprints = 'Footprints',
    Feeds = 'Feeds',
}

export enum TAG {
    NFT = 'NFT',
    Token = 'Token',
    POAP = 'POAP',
    Gitcoin = 'Gitcoin',
    Mirror = 'Mirror Entry',
    ETH = 'ETH',
}

export enum NETWORK {
    ethereum = 'ethereum',
    ethereum_classic = 'ethereum_classic',
    binance_smart_chain = 'binance_smart_chain',
    polygon = 'polygon',
    zksync = 'zksync',
    xdai = 'xdai',
    arweave = 'arweave',
    arbitrum = 'arbitrum',
    optimism = 'optimism',
    fantom = 'fantom',
    avalanche = 'avalanche',
    crossbell = 'crossbell',
}
export enum PLATFORM {
    mirror = 'mirror',
    lens = 'lens',
    gitcoin = 'gitcoin',
    snapshot = 'snapshot',
    uniswap = 'uniswap',
    binance = 'binance',
    crossbell = 'crossbell',
}

export enum TAG {
    social = 'social',
    transaction = 'transaction',
    exchange = 'exchange',
    collectible = 'collectible',
    donation = 'donation',
    governance = 'governance',
}

export enum TYPE {
    transfer = 'transfer',
    mint = 'mint',
    burn = 'burn',
    withdraw = 'withdraw',
    deposit = 'deposit',
    swap = 'swap',
    trade = 'trade',
    poap = 'poap',
    post = 'post',
    comment = 'comment',
    share = 'share',
    profile = 'profile',
    follow = 'follow',
    unfollow = 'unfollow',
    like = 'like',
    propose = 'propose',
    vote = 'vote',
    launch = 'launch',
    donate = 'donate',
}
