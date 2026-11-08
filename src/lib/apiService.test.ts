import api from '@/lib/api'
import { authApi, companyApi } from '@/lib/apiService'
import { describe, expect, it, vi } from 'vitest'

describe('credentialed auth and company API requests', () => {
  it('sends login credentials using the browser cookie session', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { success: true } })

    await authApi.login({ email: 'owner@example.com', password: 'secret123' })

    expect(post).toHaveBeenCalledWith(
      '/auth/login',
      { email: 'owner@example.com', password: 'secret123' },
      { withCredentials: true, skipAuthHandling: true }
    )
    expect(post.mock.calls[0][2]?.headers?.Authorization).toBeUndefined()
    post.mockRestore()
  })

  it('sends the existing company form fields with credentials and no bearer token', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { success: true } })
    const payload = {
      name: 'Acme',
      industry: 'Technology',
      size: '1-10',
      stage: 'Idea',
      description: 'A technology company building helpful products.',
    }

    await companyApi.createCompany(payload)

    expect(post).toHaveBeenCalledWith(
      '/company/createCompany',
      payload,
      { withCredentials: true, skipAuthHandling: true }
    )
    expect(post.mock.calls[0][2]?.headers?.Authorization).toBeUndefined()
    post.mockRestore()
  })
})
