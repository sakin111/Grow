/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Loader2, X, ExternalLink, CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'

export type VerificationRequest = {
  id: string
  website?: string | null
  contactEmail?: string | null
  note?: string | null
  createdAt?: string
}

export type ReviewAction = {
  companyId: string
  companyName: string
  requestId: string   
  status: 'VERIFIED' | 'REJECTED'
  verificationRequest?: VerificationRequest | null
}

export default function ReviewModal({
  action,
  onClose,
  onConfirm,
  isSubmitting,
}: {
  action: ReviewAction
  onClose: () => void
  onConfirm: (note: string) => void
  isSubmitting: boolean
}) {
  const [note, setNote] = useState('')
  const isRejecting = action.status === 'REJECTED'
  const vr = action.verificationRequest

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) onClose() }}
    >
      <div className="bg-background rounded-xl border shadow-lg w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            {isRejecting
              ? <XCircle className="h-5 w-5 text-destructive" />
              : <CheckCircle className="h-5 w-5 text-green-600" />
            }
            <h2 className="text-base font-semibold">
              {isRejecting ? 'Reject' : 'Verify'} Company
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-md p-1 hover:bg-muted transition disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            You are about to{' '}
            <span className={`font-medium ${isRejecting ? 'text-destructive' : 'text-green-600'}`}>
              {isRejecting ? 'reject' : 'verify'}
            </span>{' '}
            <span className="font-medium text-foreground">{action.companyName}</span>.
          </p>

          {/* Submitted information */}
          {vr && (vr.website || vr.contactEmail || vr.note) && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Submitted Information</p>
              <div className="rounded-lg border divide-y text-sm">
                {vr.website && (
                  <div className="flex items-center justify-between px-3 py-2 gap-2">
                    <span className="text-muted-foreground">Website</span>
                    <a
                      href={vr.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1 truncate max-w-[240px]"
                    >
                      {vr.website}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                )}
                {vr.contactEmail && (
                  <div className="flex items-center justify-between px-3 py-2 gap-2">
                    <span className="text-muted-foreground">Contact Email</span>
                    <span className="text-foreground">{vr.contactEmail}</span>
                  </div>
                )}
                {vr.note && (
                  <div className="flex flex-col gap-1 px-3 py-2">
                    <span className="text-muted-foreground">Note</span>
                    <p className="text-foreground leading-relaxed">{vr.note}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Admin note */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Admin Note{isRejecting ? <span className="text-destructive"> *</span> : ' (optional)'}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                isRejecting
                  ? 'Provide a reason for rejection...'
                  : 'Add an optional note for the company owner...'
              }
              rows={3}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {isRejecting && !note.trim() && (
              <p className="text-xs text-muted-foreground">A rejection reason is required.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(note)}
            disabled={isSubmitting || (isRejecting && !note.trim())}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 inline-flex items-center gap-2 ${
              isRejecting
                ? 'bg-destructive hover:bg-destructive/90'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isRejecting ? 'Reject Company' : 'Verify Company'}
          </button>
        </div>

      </div>
    </div>
  )
}