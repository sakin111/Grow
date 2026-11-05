'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { apiService } from '@/lib/apiService'
import { User, UserStatus, Meta } from '@/types'
import { useState } from 'react'
import { SearchInput } from '@/components/shared/SearchInput'
import { Pagination } from '@/components/shared/Pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'

export default function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const queryClient = useQueryClient()
  
  const [actionUser, setActionUser] = useState<{id: string, status: UserStatus, name: string} | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [userToDelete, setUserToDelete] = useState<Pick<User, 'id' | 'name'> | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const currentUserId = useAuthStore(state => state.user?.id)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (searchTerm) params.append('searchTerm', searchTerm)
      const res = await apiService.admin.getUsers(params)
      return res.data
    }
  })

  const users: User[] = data?.data || []
  const meta: Meta = data?.meta

  const handleStatusChange = async () => {
    if (!actionUser) return
    setIsUpdating(true)
    try {
      await apiService.admin.updateUserStatus(actionUser.id, { status: actionUser.status })
      toast.success(`User status updated to ${actionUser.status}`)
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined
      toast.error(message || 'Failed to update user status')
    } finally {
      setIsUpdating(false)
      setActionUser(null)
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    setIsDeleting(true)
    try {
      await apiService.admin.deleteUser(userToDelete.id)
      toast.success(`${userToDelete.name} was deleted`)
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      if (users.length === 1 && page > 1) setPage(page - 1)
      setUserToDelete(null)
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined
      toast.error(message || 'Failed to delete user')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">User Management</h1>
      </div>

      <div className="max-w-md">
        <SearchInput value={searchTerm} onChange={v => { setSearchTerm(v); setPage(1); }} placeholder="Search users by name or email..." />
      </div>

      <div className="rounded-md border bg-card overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-muted/50 border-b">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last Login</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></td></tr>
            ) : users.length > 0 ? (
              users.map(user => (
                <tr key={user.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.picture || ''} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{user.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.status === 'ACTIVE' ? 'secondary' : 'destructive'} className={user.status === 'ACTIVE' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.lastLoginAt ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true }) : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Select
                        value={user.status}
                        onValueChange={(status) => {
                          if (
                            (status === 'ACTIVE' || status === 'SUSPENDED' || status === 'BANNED') &&
                            status !== user.status
                          ) {
                            setActionUser({ id: user.id, status, name: user.name || '' })
                          }
                        }}
                      >
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="SUSPENDED">Suspend</SelectItem>
                          <SelectItem value="BANNED">Ban</SelectItem>
                        </SelectContent>
                      </Select>
                      {user.id !== currentUserId && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          aria-label={`Delete ${user.name}`}
                          title={`Delete ${user.name}`}
                          onClick={() => setUserToDelete({ id: user.id, name: user.name })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination meta={meta} onPageChange={setPage} />

      <ConfirmDialog
        open={!!actionUser}
        onOpenChange={(open) => !open && setActionUser(null)}
        title={`Change User Status`}
        description={`Are you sure you want to change ${actionUser?.name}'s status to ${actionUser?.status}?`}
        confirmVariant={actionUser?.status === 'ACTIVE' ? 'default' : 'destructive'}
        onConfirm={handleStatusChange}
        isLoading={isUpdating}
      />
      <ConfirmDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && !isDeleting && setUserToDelete(null)}
        title="Delete user"
        description={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete user"
        confirmVariant="destructive"
        onConfirm={handleDeleteUser}
        isLoading={isDeleting}
      />
    </div>
  )
}
