import ss from '@snapshot-labs/snapshot.js'
import type { Proposal, VoteSuccess, RawVote, Strategy } from '../../types.js'
import { transform } from 'lodash-unified'
import { SNAPSHOT_GET_SCORE_API } from '../../constants.js'
import type { ChainId } from '@masknet/web3-shared-evm'

export async function fetchProposal(id: string) {
    const { votes, proposal } = await fetchProposalFromGraphql(id)
    const now = Date.now()
    const isStart = proposal.start * 1000 < now
    const isEnd = proposal.end * 1000 < now
    return {
        ...proposal,
        address: proposal.author,
        isStart,
        isEnd,
        votes,
        chainId: Number(proposal.network) as ChainId,
    } as unknown as Proposal
}

async function fetchProposalFromGraphql(id: string) {
    const response = await fetch('https://hub.snapshot.org/graphql', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `query Proposal($id: String!) {
                proposal(id: $id) {
                    id
                    ipfs
                    title
                    body
                    choices
                    start
                    end
                    snapshot
                    state
                    author
                    created
                    plugins
                    network
                    type
                    strategies {
                      name
                      params
                      __typename
                    }
                    space {
                      id
                      name
                      symbol
                      avatar
                    }
                }
                votes(first: 10000, where: { proposal: $id }) {
                    id
                    ipfs
                    voter
                    created
                    choice
                  }
            }`,
            variables: {
                id,
            },
        }),
    })
    interface Res {
        data: {
            proposal: {
                author: string
                body: string
                choices: string[]
                created: number
                end: number
                start: number
                id: string
                ipfs: string
                snapshot: string
                space: {
                    id: string
                    name: string
                    symbol: string
                    avatar: string
                }
                state: string
                title: string
                type: string
                network: string
                strategies: Strategy[]
            }
            votes: RawVote[]
        }
    }

    const { data }: Res = await response.json()
    return data
}

export async function getScores(
    snapshot: string,
    voters: string[],
    network: string,
    space: string,
    strategies: Strategy[],
) {
    const scores: Array<{
        [key in string]: number
    }> = await ss.utils.getScores(space, strategies, network, voters, Number(snapshot), SNAPSHOT_GET_SCORE_API)
    return scores.map((score) =>
        transform(
            score,
            function (
                result: {
                    [key in string]: number
                },
                val,
                key: string,
            ) {
                result[key.toLowerCase()] = val
            },
        ),
    )
}

export async function vote(body: string) {
    const response = await fetch('https://hub.snapshot.org/api/msg', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body,
    })

    const result: VoteSuccess = await response.json()
    return result
}
