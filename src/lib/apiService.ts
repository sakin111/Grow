/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from 'axios'
import api from '@/lib/api'
import { nomad } from '@/env.auto'

const buildQueryString = (params?: string | URLSearchParams | null) => {
  if (!params) return ''
  if (typeof params === 'string') {
    return params.startsWith('?') ? params : `?${params}`
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}

export const authApi = {
  login: (payload: { email: string; password: string }) => api.post('/auth/login', payload),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  changePassword: (payload: { oldPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', payload),
  forgotPassword: (payload: { email: string }) => api.post('/auth/forgot-password', payload),
  resetPassword: (payload: { id: string; newPassword: string }) =>
    api.post('/auth/reset-password', payload),
  verifyEmail: (payload: { email: string; token: string }) =>
    api.post('/auth/verify-email', payload),
  checkVerificationStatus: (email: string) =>
    api.get(`/auth/check-verification-status?email=${encodeURIComponent(email)}`),
  googleAuthUrl: (redirect = '/feed') =>
    `${nomad.NEXT_PUBLIC_API_URL}/auth/google?redirect=${encodeURIComponent(redirect)}`,
}

export const userApi = {
  getCurrentUser: () => api.get('/user/me'),
  updateCurrentUser: (payload: any, config?: AxiosRequestConfig) =>
    api.patch('/user/me', payload, config),
  createUser: (payload: any) => api.post('/user/createUser', payload),
}

export const companyApi = {
  createCompany: (payload: any) => api.post('/company/createCompany', payload),
  updateCompany: (companyId: string, payload: any) =>
    api.patch(`/company/updateCompany/${companyId}`, payload),
  getSingleCompany: (companyId: string) =>
    api.get(`/company/getSingleCompany/${companyId}`),
  getAllCompanies: (query?: string | URLSearchParams) =>
    api.get(`/company/getAllCompanies${buildQueryString(query)}`),
  requestVerification: (companyId: string, payload: any) =>
    api.post(`/company/${companyId}/request`, payload),
}


export const socialApi = {
  getFeed: (query?: string | URLSearchParams) =>
    api.get(`/social/feed${buildQueryString(query)}`),

   createPost: (payload: FormData | Record<string, any>) =>
    api.post('/social/post', payload, {
      headers: payload instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' },
    }),

  searchPosts: (query?: string | URLSearchParams) =>
    api.get(`/social/search-post${buildQueryString(query)}`),

  getPostById: (postId: string) =>
    api.get(`/social/post/${postId}`),

  updatePost: (postId: string, payload: any) =>
    api.patch(`/social/post/${postId}`, payload),

  deletePost: (postId: string) =>
    api.delete(`/social/post/${postId}`),

  toggleLike: (payload: { postId: string }) =>
    api.post('/social/like', payload),

  followCompany: (payload: { followingId: string }  ) =>
    api.post('/social/follow', payload),
}


export const discussionApi = {
  getDiscussions: (query?: string | URLSearchParams) =>
    api.get(`/discussion/discussion${buildQueryString(query)}`),
  getDiscussionById: (discussionId: string) =>
    api.get(`/discussion/discussion/${discussionId}`),
  createDiscussion: (payload: any) => api.post('/discussion/discussion', payload),
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
  getMentorProfile: (mentorId: string) =>
    api.get(`/mentor/profile/${mentorId}`),
  getCurrentMentorProfile: () => api.get('/mentor/profile/me'),
  createMentorProfile: (payload: any) => api.post('/mentor/profile/me', payload),
  updateMentorProfile: (mentorId: string, payload: any) =>
    api.patch(`/mentor/profile/${mentorId}`, payload),
}

export const sessionApi = {
  createSession: (payload: any) => api.post('/session', payload),
  getSessionById: (sessionId: string) => api.get(`/session/${sessionId}`),
  updateSessionStatus: (sessionId: string, payload: any) =>
    api.patch(`/session/${sessionId}/status`, payload),
  startSession: (sessionId: string) => api.post(`/session/${sessionId}/start`),
  joinSession: (sessionId: string) => api.get(`/session/${sessionId}/join`),
  getMyBookings: (query?: string | URLSearchParams) =>
    api.get(`/session/booking/my${buildQueryString(query)}`),
  reviewSession: (sessionId: string, payload: any) =>
    api.post(`/session/${sessionId}/review`, payload),
}

export const adminApi = {
  getUsers: (query?: string | URLSearchParams) =>
    api.get(`/admin/users${buildQueryString(query)}`),
  updateUserStatus: (userId: string, payload: any) =>
    api.patch(`/admin/users/${userId}/status`, payload),
  getCompanies: (query?: string | URLSearchParams) =>
    api.get(`/admin/companies${buildQueryString(query)}`),
  reviewCompanyVerification: (companyId: string, payload: any) =>
    api.patch(`/verification/${companyId}/review`, payload),
}

export const apiService = {
  auth: authApi,
  user: userApi,
  company: companyApi,
  discussion: discussionApi,
  mentor: mentorApi,
  session: sessionApi,
  admin: adminApi,
  social: socialApi,
}
