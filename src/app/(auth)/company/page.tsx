"use client"

import { Loader2 } from "lucide-react"
import { CompanyForm } from "@/components/company/CompanyForm"
import CompanyProfile from "@/components/company/CompanyProfile"
import { useAuth } from "@/hooks/useAuth"

export default function CompanyPage() {
    const { user, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        )
    }

    return user?.company ? <CompanyProfile /> : <CompanyForm />
}
