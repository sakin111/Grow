/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from 'axios'
import api from '@/lib/api'
import { nomad } from '@/env.auto'
import { UserStatus } from '@/types'
import type { Company } from '@/types'

const buildQueryString = (params?: string | URLSearchParams | null) => {
  if (!params) return ''
  if (typeof params === 'string') {
    return params.startsWith('?') ? params : `?${params}`
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}

export const authApi = {
  login: (payload: { email: string; password: string }) =>
    api.post('/auth/login', payload, {
      withCredentials: true,
      skipAuthHandling: true,
    }),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', payload),
  forgotPassword: (payload: { email: string }) => api.post('/auth/forgot-password', payload),
  resetPassword: (
    payload: { id: string; newPassword: string },
    config?: AxiosRequestConfig
  ) => api.post('/auth/reset-password', payload, config),
  verifyEmail: (payload: { email: string; token: string }) =>
    api.post('/auth/verify-email', payload),
  verifyEmailFromLink: (email: string, token: string) =>
    api.get(`/auth/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`),
  checkVerificationStatus: (email: string) =>
    api.get(`/auth/check-verification-status?email=${encodeURIComponent(email)}`, {
      skipAuthHandling: true,
    }),
  setPassword: (payload: { password: string }) =>
    api.post('/auth/set-password', payload),
  exchangeGoogleAuthCode: (payload: { code: string }) =>
    api.post('/auth/google/exchange', payload, { skipAuthHandling: true }),
  googleAuthUrl: (returnTo = '/feed') => {
    const callback = `/login/google-callback?redirect=${encodeURIComponent(returnTo)}`
    const apiUrl = nomad.NEXT_PUBLIC_API_URL.replace(/\/+$/, '')
    return `${apiUrl}/auth/google?redirect=${encodeURIComponent(callback)}`
  },
}

export const userApi = {
  getCurrentUser: (config?: AxiosRequestConfig) => api.get('/user/me', config),
  updateCurrentUser: (payload: any, config?: AxiosRequestConfig) =>
    api.patch('/user/me', payload, config),
  changeRole: (payload: { role: 'OWNER' | 'MENTOR' }) =>
    api.patch('/user/role', payload),
  createUser: (payload: any) => api.post('/user/createUser', payload),
}

export const companyApi = {
  createCompany: (
    payload: Pick<Company, 'name' | 'industry' | 'size' | 'stage' | 'description'>
  ) =>
    api.post('/company/createCompany', payload, {
      withCredentials: true,
      skipAuthHandling: true,
    }),
  updateCompany: (companyId: string, payload: any) =>
    api.patch(`/company/updateCompany/${companyId}`, payload),
  getSingleCompany: (companyId: string) =>
    api.get(`/company/getSingleCompany/${companyId}`),
  getAllCompanies: (query?: string | URLSearchParams, config?: AxiosRequestConfig) =>
    api.get(`/company/getAllCompanies${buildQueryString(query)}`, config),
  deleteCompany: (companyId: string) =>
    api.delete(`/company/deleteCompany/${companyId}`),
  requestVerification: (
    companyId: string,
    payload: { website: string; contactEmail: string; note?: string }
  ) =>
    api.post(`/company/${companyId}/request`, payload),
}


export const socialApi = {
  getFeed: (query?: string | URLSearchParams) =>
    api.get(`/social/feed${buildQueryString(query)}`),

  getUploadSignature: () =>
    api.get<{
      data: {
        timestamp: number
        folder: string
        signature: string
        apiKey: string
        cloudName: string
      }
    }>('/social/upload-signature'),
  createPost: (payload: { companyId: string; content: string; image?: string }) =>
    api.post('/social/post', payload, {
      headers: { 'Content-Type': 'application/json' },
    }),

  searchPosts: (query?: string | URLSearchParams) =>
    api.get(`/social/search-post${buildQueryString(query)}`),

  getPostById: (postId: string) =>
    api.get(`/social/post/${postId}`),

  updatePost: (postId: string, payload: any) =>
    api.patch(`/social/post/${postId}`, payload),

  deletePost: (postId: string) =>
    api.delete(`/social/post/${postId}`),

  toggleLike: (payload: { postId?: string; discussionId?: string; commentId?: string }) =>
    api.post('/social/like', payload),

  followCompany: (payload: { followingId: string }) =>
    api.post('/social/follow', payload),

  // Comments
  createComment: (payload: { content: string; postId?: string; parentId?: string }) =>
    api.post('/social/comment', payload),

  getComments: (postId: string, query?: string | URLSearchParams) =>
    api.get(`/social/comment/${postId}${buildQueryString(query)}`),

  getReplies: (commentId: string, query?: string | URLSearchParams) =>
    api.get(`/social/comment/replies/${commentId}${buildQueryString(query)}`),

  updateComment: (commentId: string, payload: { content: string }) =>
    api.patch(`/social/comment/${commentId}`, payload),

  deleteComment: (commentId: string) =>
    api.delete(`/social/comment/${commentId}`),
}


export const discussionApi = {
  getDiscussions: (query?: string | URLSearchParams, config?: AxiosRequestConfig) =>
    api.get(`/discussion/discussion${buildQueryString(query)}`, config),
  getDiscussionById: (discussionId: string) =>
    api.get(`/discussion/discussion/${discussionId}`),
  createDiscussion: (payload: any) => api.post('/discussion/discussion', payload),
  updateDiscussion: (discussionId: string, payload: any) =>
    api.patch(`/discussion/discussion/${discussionId}`, payload),
  deleteDiscussion: (discussionId: string) =>
    api.delete(`/discussion/discussion/${discussionId}`),
  createComment: (payload: any) => api.post('/discussion/comments', payload),
  updateComment: (commentId: string, payload: any) =>
    api.patch(`/discussion/comments/${commentId}`, payload),
  deleteComment: (commentId: string) =>
    api.delete(`/discussion/comments/${commentId}`),
}

export const mentorApi = {
  getAllMentors: (query?: string | URLSearchParams) =>
    api.get(`/mentor/allMentors${buildQueryString(query)}`),
  searchMentors: (query?: string | URLSearchParams) =>
    api.get(`/mentor/search${buildQueryString(query)}`),
  getMentorProfile: (mentorId: string) =>
    api.get(`/mentor/profile/${mentorId}`),
  getCurrentMentorProfile: (config?: AxiosRequestConfig) => api.get('/mentor/profile/me', config),
  updateActiveStatus: (isActive: boolean) =>
    api.patch<{ data: { id: string; isActive: boolean } }>(
      '/mentor/profile/active-status',
      { isActive }
    ),
  createMentorProfile: (payload: any) => api.post('/mentor/profile', payload),
  updateMentorProfile: (payload: any) => api.patch('/mentor/profile', payload),
  deleteMentorProfile: () => api.delete('/mentor/profile'),
  createAvailability: (payload: { dayOfWeek: string; startTime: string; endTime: string }) =>
    api.post('/mentor/availability', payload),
  getAvailability: (mentorId: string) =>
    api.get(`/mentor/availability/${mentorId}`),
  updateAvailability: (slotId: string, payload: { dayOfWeek?: string; startTime?: string; endTime?: string }) =>
    api.patch(`/mentor/availability/${slotId}`, payload),
  deleteAvailability: (slotId: string) =>
    api.delete(`/mentor/availability/${slotId}`),
}

export const sessionApi = {
  createBooking: (payload: { mentorId: string; startTime: string; endTime: string }) =>
    api.post('/session/booking', payload),
  getBookingById: (bookingId: string) => api.get(`/session/booking/${bookingId}`),
  confirmBooking: (bookingId: string) =>
    api.patch(`/session/booking/${bookingId}/confirm`),
  cancelBooking: (bookingId: string) =>
    api.patch(`/session/booking/${bookingId}/cancel`),
  completeBooking: (bookingId: string) =>
    api.patch(`/session/booking/${bookingId}/complete`),
  startSession: (sessionId: string) => api.post(`/session/${sessionId}/start`),
  joinSession: (sessionId: string) => api.get(`/session/${sessionId}/join`),
  endSession: (bookingId: string) => api.post(`/session/${bookingId}/end`),
  getMyBookings: (query?: string | URLSearchParams, config?: AxiosRequestConfig) =>
    api.get(`/session/booking/my${buildQueryString(query)}`, config),
  getAllBookings: (query?: string | URLSearchParams, config?: AxiosRequestConfig) =>
    api.get(`/session/booking/all${buildQueryString(query)}`, config),
}

export const reviewApi = {
  createReview: (payload: { bookingId: string; rating: number; comment: string }) =>
    api.post('/review', payload),
  getMyReviews: (query?: string | URLSearchParams) =>
    api.get(`/review/my${buildQueryString(query)}`),
  getMentorReviews: (
    mentorId: string,
    query?: string | URLSearchParams,
    config?: AxiosRequestConfig
  ) => api.get(`/review/mentor/${mentorId}${buildQueryString(query)}`, config),
  updateReview: (reviewId: string, payload: { rating?: number; comment?: string }) =>
    api.patch(`/review/${reviewId}`, payload),
  deleteReview: (reviewId: string) => api.delete(`/review/${reviewId}`),
}

export const notificationApi = {
  getNotifications: (query?: string | URLSearchParams) =>
    api.get(`/notification${buildQueryString(query)}`),
  markAllRead: () => api.patch('/notification/mark-all-read'),
  markRead: (notificationId: string) =>
    api.patch(`/notification/${notificationId}/read`),
}

export const uploadApi = {
  uploadFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const adminApi = {
  getUsers: (query?: string | URLSearchParams, config?: AxiosRequestConfig) =>
    api.get(`/admin/users${buildQueryString(query)}`, config),
  updateUserStatus: (userId: string, payload: { status: UserStatus }) =>
    api.patch(`/admin/users/${userId}/status`, payload),
  deleteUser: (userId: string) =>
    api.delete(`/admin/users/${userId}`),
  getCompanies: (query?: string | URLSearchParams, config?: AxiosRequestConfig) =>
    api.get(`/admin/companies${buildQueryString(query)}`, config),
  reviewCompanyVerification: (requestId: string, payload: { status: 'VERIFIED' | 'REJECTED'; adminNote?: string }) =>
    api.patch(`/admin/verification/${requestId}/review`, payload),
}

export const apiService = {
  auth: authApi,
  user: userApi,
  company: companyApi,
  discussion: discussionApi,
  mentor: mentorApi,
  session: sessionApi,
  review: reviewApi,
  notification: notificationApi,
  upload: uploadApi,
  admin: adminApi,
  social: socialApi,
}
