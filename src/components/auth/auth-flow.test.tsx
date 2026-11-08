import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'

import { LoginForm } from '@/components/auth/LoginForm'
import VerifyEmail from '@/components/auth/VerifyEmail'
import { CompanyForm } from '@/components/company/CompanyForm'
import { authApi, companyApi, userApi } from '@/lib/apiService'

const navigation = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  search: '',
}))

vi.mock('next/navigation', () => ({
  useRouter: () => navigation,
  useSearchParams: () => new URLSearchParams(navigation.search),
}))

vi.mock('@/lib/apiService', () => ({
  authApi: {
    login: vi.fn(),
    verifyEmail: vi.fn(),
    checkVerificationStatus: vi.fn(),
    googleAuthUrl: vi.fn(),
  },
  companyApi: {
    createCompany: vi.fn(),
    updateCompany: vi.fn(),
  },
  userApi: {
    getCurrentUser: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

describe('verification, login, and company setup', () => {
  beforeEach(() => {
    navigation.push.mockReset()
    navigation.replace.mockReset()
    navigation.search = ''
    vi.mocked(authApi.verifyEmail).mockReset()
    vi.mocked(authApi.login).mockReset()
    vi.mocked(companyApi.createCompany).mockReset()
    vi.mocked(userApi.getCurrentUser).mockReset()
  })

  it('shows a verified state and directs the user to login without requiring a token response', async () => {
    navigation.search = '?email=owner%40example.com&token=verify-token'
    vi.mocked(authApi.verifyEmail).mockResolvedValue({
      data: { success: true },
    } as never)

    render(<VerifyEmail />)

    expect(await screen.findByText(/Email verified successfully/i)).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Continue to login' }).getAttribute('href')
    ).toBe('/login?email=owner%40example.com')
  })

  it('sends login credentials and routes an owner without a company to company setup', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockResolvedValue({ data: { success: true } } as never)
    vi.mocked(userApi.getCurrentUser).mockResolvedValue({
      data: {
        data: {
          id: 'owner-1',
          role: 'OWNER',
          company: null,
        },
      },
    } as never)

    renderWithQueryClient(<LoginForm initialEmail="owner@example.com" />)

    await user.type(screen.getByLabelText('Password'), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => {
      expect(navigation.replace).toHaveBeenCalledWith('/company?loggedIn=true')
    })
    expect(authApi.login).toHaveBeenCalledWith({
      email: 'owner@example.com',
      password: 'secret123',
    })
    expect(userApi.getCurrentUser).toHaveBeenCalledWith({
      withCredentials: true,
      skipAuthHandling: true,
    })
  })

  it.each([
    { status: 401, message: 'Unauthorized' },
    { status: 403, message: 'No Token Recieved' },
  ])('routes token errors ($status) back to login', async ({ status, message }) => {
    const user = userEvent.setup()
    vi.mocked(companyApi.createCompany).mockRejectedValue({
      isAxiosError: true,
      response: { status, data: { message } },
    })

    renderWithQueryClient(<CompanyForm />)

    await user.type(screen.getByLabelText('Company Name'), 'Acme')
    await user.type(screen.getByLabelText('Industry'), 'Technology')
    await user.type(
      screen.getByLabelText('Description'),
      'A technology company building helpful products.'
    )
    await user.click(screen.getByRole('button', { name: 'Create Company' }))

    await waitFor(() => {
      expect(navigation.replace).toHaveBeenCalledWith(
        '/login?redirect=%2Fcompany'
      )
    })
    expect((await screen.findByRole('alert')).textContent).toContain(
      'Please log in again'
    )
  })

  it('submits the existing company form and shows the creation success state', async () => {
    const user = userEvent.setup()
    vi.mocked(companyApi.createCompany).mockResolvedValue({
      data: { success: true },
    } as never)

    renderWithQueryClient(<CompanyForm />)

    await user.type(screen.getByLabelText('Company Name'), 'Acme')
    await user.type(screen.getByLabelText('Industry'), 'Technology')
    await user.type(
      screen.getByLabelText('Description'),
      'A technology company building helpful products.'
    )
    await user.click(screen.getByRole('button', { name: 'Create Company' }))

    expect(await screen.findByRole('status')).toBeTruthy()
    expect(companyApi.createCompany).toHaveBeenCalledWith({
      name: 'Acme',
      industry: 'Technology',
      size: '1-10',
      stage: 'Idea',
      description: 'A technology company building helpful products.',
    })
  })

  it('shows company field validation next to the form without calling the API', async () => {
    const user = userEvent.setup()
    renderWithQueryClient(<CompanyForm />)

    await user.click(screen.getByRole('button', { name: 'Create Company' }))

    expect(await screen.findByText('Company name is required')).toBeTruthy()
    expect(companyApi.createCompany).not.toHaveBeenCalled()
  })

  it('shows the OWNER requirement when the API rejects company creation by role', async () => {
    vi.mocked(companyApi.createCompany).mockRejectedValue({
      isAxiosError: true,
      response: { status: 403, data: { message: 'Forbidden' } },
    })

    const user = userEvent.setup()
    renderWithQueryClient(<CompanyForm />)

    await user.type(screen.getByLabelText('Company Name'), 'Acme')
    await user.type(screen.getByLabelText('Industry'), 'Technology')
    await user.type(
      screen.getByLabelText('Description'),
      'A technology company building helpful products.'
    )
    await user.click(screen.getByRole('button', { name: 'Create Company' }))

    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(companyApi.createCompany).toHaveBeenCalled()
  })
})
