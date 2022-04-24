import { SchemaType } from '../types'
import { useERC20TokenContract, useERC721TokenContract } from '../contracts'
import { useAccount } from './useAccount'
import { useWeb3 } from './useWeb3'
import { useAsync } from 'react-use'
import { unreachable } from '@dimensiondev/kit'
import type { AsyncState } from 'react-use/lib/useAsyncFn'

export function useGasLimit(
    type?: SchemaType,
    contractAddress?: string,
    amount?: string,
    recipient?: string,
    tokenId?: string,
): AsyncState<number> {
    const web3 = useWeb3()
    const account = useAccount()
    const erc20Contract = useERC20TokenContract(contractAddress)
    const erc721Contract = useERC721TokenContract(contractAddress)

    return useAsync(async () => {
        if (!recipient || type === undefined) return 0
        if ((type === SchemaType.ERC20 && !amount) || !contractAddress) return 0
        if ((type === SchemaType.ERC721 && !tokenId) || !contractAddress) return 0

        switch (type) {
            case SchemaType.Native:
                return web3.eth.estimateGas({
                    from: account,
                    to: recipient,
                    value: amount,
                })
            case SchemaType.ERC20:
                return erc20Contract?.methods.transfer(recipient, amount ?? 0).estimateGas({
                    from: account,
                })
            case SchemaType.ERC721:
                return erc721Contract?.methods.transferFrom(account, recipient, tokenId ?? '').estimateGas({
                    from: account,
                })
            case SchemaType.ERC1155:
                throw new Error('To be implemented')
            default:
                unreachable(type)
        }
    }, [erc20Contract, type, amount, account, recipient, tokenId])
}
