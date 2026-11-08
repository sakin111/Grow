"use client"

import Link from "next/link"
import { Loader2 } from "lucide-react"
import { CompanyForm } from "@/components/company/CompanyForm"
import CompanyProfile from "@/components/company/CompanyProfile"
import { useAuth } from "@/hooks/useAuth"

export default function CompanyPage() {
    const { user, isLoading } = useAuth({ skipAuthHandling: true })

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="space-y-3 text-center">
                <p>Please log in to create a company.</p>
                <Link
                    href="/login?redirect=%2Fcompany"
                    className="text-primary underline"
                >
                    Log in
                </Link>
            </div>
        )
    }

    if (user.role !== 'OWNER') {
        return (
            <p role="alert" className="text-center">
                Creating a company requires an OWNER account.
            </p>
        )
    }

    return user?.company ? <CompanyProfile /> : <CompanyForm />
}
