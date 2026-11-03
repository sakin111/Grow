'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { formatDistanceToNow } from 'date-fns'
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { apiService } from '@/lib/apiService'

interface NotificationItem {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

const getErrorMessage = (error: unknown, fallback: string) =>
  isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message || fallback
    : fallback

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications', 1],
    queryFn: async () => {
      const params = new URLSearchParams({ page: '1', limit: '100' })
      const response = await apiService.notification.getNotifications(params)
      return response.data.data as NotificationItem[]
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  const markRead = useMutation({
    mutationFn: (notificationId: string) =>
      apiService.notification.markRead(notificationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onError: error => toast.error(getErrorMessage(error, 'Could not update notification')),
  })

  const markAllRead = useMutation({
    mutationFn: () => apiService.notification.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onError: error => toast.error(getErrorMessage(error, 'Could not update notifications')),
  })

  const notifications = data || []
  const unreadCount = notifications.filter(notification => !notification.isRead).length

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        onClick={() => setOpen(true)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-destructive px-1 text-center text-[10px] leading-4 text-destructive-foreground">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between gap-3 pr-7">
              <div>
                <DialogTitle>Notifications</DialogTitle>
                <DialogDescription>Recent activity for your account.</DialogDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={unreadCount === 0 || markAllRead.isPending}
                onClick={() => markAllRead.mutate()}
              >
                {markAllRead.isPending
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <CheckCheck className="mr-2 h-4 w-4" />}
                Mark all read
              </Button>
            </div>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto divide-y">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : isError ? (
              <div className="space-y-3 py-8 text-center">
                <p className="text-sm text-muted-foreground">Notifications could not be loaded.</p>
                <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
                  Retry
                </Button>
              </div>
            ) : notifications.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                You&apos;re all caught up.
              </p>
            ) : (
              notifications.map(notification => (
                <article
                  key={notification.id}
                  className={`flex items-start gap-3 py-4 ${notification.isRead ? '' : 'border-l-2 border-primary pl-3'}`}
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium">{notification.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                    <time className="mt-2 block text-xs text-muted-foreground" dateTime={notification.createdAt}>
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </time>
                  </div>
                  {!notification.isRead && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Mark notification as read"
                      disabled={markRead.isPending}
                      onClick={() => markRead.mutate(notification.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </article>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}