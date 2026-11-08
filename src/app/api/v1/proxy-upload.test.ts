import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PATCH } from './[...path]/route'

describe('API proxy multipart forwarding', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('preserves multipart headers, cookies, and body bytes', async () => {
    const boundary = 'grow-test-boundary'
    const multipartBody = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="picture"; filename="avatar.png"',
      'Content-Type: image/png',
      '',
      'test-image-bytes',
      `--${boundary}--`,
      '',
    ].join('\r\n')
    const fetchMock = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      expect(init?.headers).toBeInstanceOf(Headers)
      const headers = init?.headers as Headers
      expect(headers.get('content-type')).toBe(
        `multipart/form-data; boundary=${boundary}`
      )
      expect(headers.get('cookie')).toBe('accessToken=test-cookie')
      expect(await new Response(init?.body).text()).toBe(multipartBody)

      return Response.json({ success: true })
    })
    vi.stubGlobal('fetch', fetchMock)

    const request = new NextRequest('http://localhost/api/v1/user/me', {
      method: 'PATCH',
      headers: {
        'content-type': `multipart/form-data; boundary=${boundary}`,
        cookie: 'accessToken=test-cookie',
      },
      body: multipartBody,
    })

    const response = await PATCH(request, {
      params: Promise.resolve({ path: ['user', 'me'] }),
    })

    expect(response.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledOnce()
  })
})
