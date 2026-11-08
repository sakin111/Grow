import { LoginForm } from '@/components/auth/LoginForm'
import { Suspense } from 'react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; roleChanged?: string; email?: string }>
}) {

  const params = await searchParams || {}

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm
        redirect={params.redirect}
        roleChanged={params.roleChanged === 'true'}
        initialEmail={params.email}
      />
    </Suspense>
  )
}
