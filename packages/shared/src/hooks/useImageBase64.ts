import { useState } from 'react'
import { useAsyncRetry } from 'react-use'
import LRUCache from 'lru-cache'

function readAsDataURL(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.addEventListener('load', () => resolve(reader.result as string))
        reader.addEventListener('error', reject)
        reader.readAsDataURL(blob)
    })
}

const cache = new LRUCache<string, string | Promise<Response>>({
    max: 500,
    ttl: 300_000,
})
const responseToBase64 = async (response: Response) => {
    const blob = await response.blob()
    const dataURL = await readAsDataURL(blob)
    return dataURL
}

export function useImageBase64(key = '', url?: string) {
    const cacheKey = key || (url ?? '')
    const [availableUrl, setAvailableUrl] = useState(() => {
        const hit = cache.get(cacheKey)
        return typeof hit === 'string' ? hit : ''
    })

    useAsyncRetry(async () => {
        if (!cacheKey) return
        const hit = cache.get(cacheKey)
        if (typeof hit === 'string') {
            setAvailableUrl(hit)
            return
        } else if (hit instanceof Promise) {
            try {
                const response = await hit
                const result = await responseToBase64(response.clone())
                cache.set(cacheKey, result)
                setAvailableUrl(result)
                return
            } catch {
                setAvailableUrl('')
            }
        }

        if (!url) return
        const fetchingTask = fetch(url, {
            headers: {
                accept: url.includes('imagedelivery.net')
                    ? 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
                    : '',
            },
        })
        cache.set(cacheKey, fetchingTask)
        const response = await fetchingTask
        if (!response.ok) {
            cache.delete(cacheKey)
            setAvailableUrl('')
            return
        }

        const dataURL = await responseToBase64(response)
        cache.set(cacheKey, dataURL)
        setAvailableUrl(dataURL)
    }, [cacheKey, url])

    if (!cacheKey) return ''

    return availableUrl
}
