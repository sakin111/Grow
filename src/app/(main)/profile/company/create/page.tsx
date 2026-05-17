'use client'

import { CompanyForm } from '@/components/company/CompanyForm'

export default function CreateCompanyPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Company Profile</h1>
        <p className="text-muted-foreground mt-2">Tell us about your business to get started.</p>
      </div>
      <CompanyForm />
    </div>
  )
}
