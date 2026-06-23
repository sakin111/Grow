/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { apiService } from '@/lib/apiService'
import { cn } from '@/lib/utils'
import { ImagePlus, Loader2, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const TOPICS = [
    'MARKETING',
    'FUNDING',
    'HIRING',
    'OPERATIONS',
    'TECH',
    'GENERAL',
] as const

type Topic = typeof TOPICS[number]

export default function CreatePost() {
    const user = useAuthStore(state => state.user)
    const router = useRouter()
    const queryClient = useQueryClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [content, setContent] = useState('')
    const [topic, setTopic] = useState<Topic | ''>('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const companyId = (user as any)?.company?.id

    const mutation = useMutation({
        mutationFn: () => {
            const formData = new FormData()
            formData.append('content', content)
            formData.append('topic', topic)
            formData.append('companyId', companyId)
            if (imageFile) formData.append('image', imageFile)
            return apiService.social.createPost(formData)
        },
        onSuccess: () => {
            toast.success('Post published!')
            queryClient.invalidateQueries({ queryKey: ['social-feed'] })
            router.push('/feed')
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Failed to publish post')
        },
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith('image/')) {
            toast.error('Only image files are allowed')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be smaller than 5MB')
            return
        }
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }

    const removeImage = () => {
        setImageFile(null)
        if (imagePreview) URL.revokeObjectURL(imagePreview)
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const canSubmit = content.trim().length > 0 && topic !== '' && !!companyId

    if (!companyId) {
        return (
            <div className="max-w-2xl mx-auto py-16 text-center space-y-3">
                <p className="text-muted-foreground text-sm">
                    You need a company profile to create posts.
                </p>
                <Link
                    href="/company"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
                >
                    Create Company
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Create Post</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Posting as{' '}
                    <span className="font-medium text-foreground">
                        {(user as any)?.company?.name}
                    </span>
                </p>
            </div>

            <div className="rounded-xl border bg-card p-6 space-y-5">

                {/* Content */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                        Content <span className="text-destructive">*</span>
                    </label>
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="What's on your mind? Share updates, insights, or opportunities..."
                        rows={6}
                        maxLength={2000}
                        className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                        {content.length}/2000
                    </p>
                </div>

                {/* Topic */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                        Topic <span className="text-destructive">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {TOPICS.map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTopic(t)}
                                className={cn(
                                    'rounded-full px-3 py-1 text-xs font-medium border transition',
                                    topic === t
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                                )}
                            >
                                {t.charAt(0) + t.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Image upload */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Image (optional)</label>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {imagePreview ? (
                        <div className="relative rounded-lg border overflow-hidden">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full object-cover max-h-64"
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <p className="px-3 py-1.5 text-xs text-muted-foreground bg-muted/50 truncate">
                                {imageFile?.name}
                            </p>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-8 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition"
                        >
                            <ImagePlus className="h-5 w-5" />
                            Click to upload image (max 5MB)
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={mutation.isPending}
                        className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => mutation.mutate()}
                        disabled={!canSubmit || mutation.isPending}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
                    >
                        {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        Publish Post
                    </button>
                </div>

            </div>
        </div>
    )
}