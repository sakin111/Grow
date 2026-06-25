/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiService } from "@/lib/apiService"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { format } from 'date-fns'
import Image from 'next/image'



export default function RepliesSection({
  commentId,
  userId,
  onReply,
}: {
  commentId: string
  userId?: string
  onReply: (name: string) => void
}) {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['replies', commentId],
    queryFn: async () => {
      const res = await apiService.social.getReplies(commentId)
      return res.data
    },
  })

  const replies = data?.data ?? []

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.social.deleteComment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['replies', commentId] }),
    onError: () => toast.error('Failed to delete reply'),
  })

  if (isLoading) return (
    <div className="ml-11 space-y-2 animate-pulse">
      {[1, 2].map(i => <div key={i} className="h-3 w-3/4 rounded bg-muted" />)}
    </div>
  )

  return (
    <div className="ml-11 space-y-2 border-l pl-4">
      {replies.map((reply: any) => (
        <div key={reply.id} className="flex gap-2">
          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 border overflow-hidden">
            {reply.user?.picture ? (
              <Image src={reply.user.picture} alt={reply.user.name} width={28} height={28} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-medium">{reply.user?.name?.[0] ?? '?'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="rounded-xl bg-muted px-3 py-2">
              <p className="text-xs font-semibold">{reply.user?.name ?? 'Unknown'}</p>
              <p className="text-xs text-foreground mt-0.5">{reply.content}</p>
            </div>
            <div className="flex items-center gap-3 mt-1 px-1">
              <span className="text-xs text-muted-foreground">
                {format(new Date(reply.createdAt), 'MMM d · h:mm a')}
              </span>
              <button
                onClick={() => onReply(reply.user?.name ?? 'Unknown')}
                className="text-xs text-muted-foreground hover:text-foreground transition"
              >
                Reply
              </button>
              {reply.userId === userId && (
                <button
                  onClick={() => deleteMutation.mutate(reply.id)}
                  className="text-xs text-red-500 hover:text-red-700 transition"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}