'use client'

import { useForm } from 'react-hook-form'
import { ChangeEvent, useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UserProfileFormValues {
  name: string
}

export function UserProfileForm() {
  const user = useAuthStore(state => state.user)
  const setUser = useAuthStore(state => state.setUser)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<UserProfileFormValues>({
    defaultValues: {
      name: user?.name || '',
    },
  })

  const previewUrl = useMemo(() => {
    if (!selectedFile) {
      return user?.picture
    }

    return URL.createObjectURL(selectedFile)
  }, [selectedFile, user?.picture])

  useEffect(() => {
    if (!selectedFile) {
      return
    }

    return () => {
      URL.revokeObjectURL(previewUrl || '')
    }
  }, [selectedFile, previewUrl])

  if (!user) {
    return <div className="text-muted-foreground">Loading profile...</div>
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const onSubmit = async (values: UserProfileFormValues) => {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('name', values.name)
      if (selectedFile) {
        formData.append('picture', selectedFile)
      }

      await api.patch('/user/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const res = await api.get('/user/me')
      setUser(res.data.data)
      toast.success('Profile updated successfully')
    } catch (error: unknown) {
      type AxiosErrorLike = {
        response?: {
          data?: {
            message?: string
          }
        }
      }
      const axiosError = error as AxiosErrorLike
      const message = axiosError?.response?.data?.message
      toast.error(message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative">
          <Avatar className="h-20 w-20">
            {previewUrl ? (
              <AvatarImage src={previewUrl} alt={user.name} />
            ) : (
              <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Profile picture</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-sm text-muted-foreground"
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Profile
            </Button>
            <Button type="button" variant="outline" onClick={() => form.reset({ name: user.name })} disabled={isLoading}>
              Reset
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
