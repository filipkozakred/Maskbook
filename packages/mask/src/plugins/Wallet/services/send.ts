import type { RequestArguments } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { defer } from '@dimensiondev/kit'
import { ChainId, EthereumMethodType, getPayloadId } from '@masknet/web3-shared-evm'
import { removePopupWindow } from '../../../../background/services/helper'
import { nativeAPI } from '../../../../shared/native-rpc'
import { WalletRPC } from '../messages'

const UNCONFIRMED_CALLBACK_MAP = new Map<number, (error: Error | null, response?: JsonRpcResponse) => void>()
const RISK_METHOD_LIST = [
    EthereumMethodType.ETH_SIGN,
    EthereumMethodType.PERSONAL_SIGN,
    EthereumMethodType.ETH_SIGN_TYPED_DATA,
    EthereumMethodType.ETH_DECRYPT,
    EthereumMethodType.ETH_GET_ENCRYPTION_PUBLIC_KEY,
    EthereumMethodType.ETH_SEND_TRANSACTION,
]

function isRiskMethod(method: EthereumMethodType) {
    return RISK_METHOD_LIST.includes(method)
}

let id = 0

export async function send(
    payload: JsonRpcPayload,
    callback: (error: Error | null, response?: JsonRpcResponse) => void,
    options?: {
        account?: string
        chainId?: ChainId
    },
): Promise<JsonRpcResponse> {
    id += 1
    const payload_ = {
        ...payload,
        id,
    }

    if (isRiskMethod(payload_.method as EthereumMethodType)) {
        await WalletRPC.pushUnconfirmedRequest(payload_)
    }
    UNCONFIRMED_CALLBACK_MAP.set(payload_.id, callback)
    throw new Error('')
}

export async function sendPayload(payload: JsonRpcPayload) {
    if (nativeAPI?.type === 'iOS') {
        return nativeAPI.api.send(payload) as unknown as JsonRpcResponse
    } else if (nativeAPI?.type === 'Android') {
        const response = await nativeAPI?.api.sendJsonString(JSON.stringify(payload))
        if (!response) throw new Error('Failed to send request to native APP.')
        return JSON.parse(response) as JsonRpcResponse
    }
    return new Promise<JsonRpcResponse>((resolve, reject) => {
        send(payload, (error, response) => {
            if (error) reject(error)
            else if (response) resolve(response)
        })
    })
}

export async function request<T extends unknown>(
    requestArguments: RequestArguments,
    options?: {
        account?: string
        chainId?: ChainId
    },
) {
    return new Promise<T>(async (resolve, reject) => {
        send(
            {
                jsonrpc: '2.0',
                id,
                params: [],
                ...requestArguments,
            },
            (error, response) => {
                if (error || response?.error) reject(error ?? response?.error)
                else resolve(response?.result)
            },
            options,
        )
    })
}

export async function confirmRequest(
    payload: JsonRpcPayload,
    options?: {
        account?: string
        chainId?: ChainId
        disableClose?: boolean
    },
) {
    const pid = getPayloadId(payload)
    if (!pid) return
    const [deferred, resolve, reject] = defer<JsonRpcResponse | undefined, Error>()
    send(
        payload,
        (error, response) => {
            UNCONFIRMED_CALLBACK_MAP.get(pid)?.(error, response)
            if (error) reject(error)
            else if (response?.error) reject(new Error(`Failed to send transaction: ${response.error}`))
            else {
                WalletRPC.deleteUnconfirmedRequest(payload)
                    .then(() => {
                        if (options?.disableClose) return
                        return removePopupWindow()
                    })
                    .then(() => {
                        UNCONFIRMED_CALLBACK_MAP.delete(pid)
                    })
                resolve(response)
            }
        },
        options,
    )
    return deferred
}

export async function rejectRequest(payload: JsonRpcPayload) {
    const pid = getPayloadId(payload)
    if (!pid) return
    UNCONFIRMED_CALLBACK_MAP.get(pid)?.(new Error('User rejected!'))
    await WalletRPC.deleteUnconfirmedRequest(payload)
    await removePopupWindow()
    UNCONFIRMED_CALLBACK_MAP.delete(pid)
}
