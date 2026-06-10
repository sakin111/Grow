export type Role = 'OWNER' | 'MENTOR' | 'ADMIN'
export type Topic = 'MARKETING' | 'FUNDING' | 'HIRING' | 'OPERATIONS' | 'TECH' | 'GENERAL'
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED'
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
export type SessionStatus = 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  picture?: string
  emailVerified: boolean
  emailVerifiedAt?: string
  status: UserStatus
  isDeleted: boolean
  isActive: boolean
  profileCompleted: boolean
  lastLoginAt?: string
  company?: Company
  createdAt: string
  updatedAt: string
}

export interface Company {
  id: string
  name: string
  industry: string
  size: string
  stage: string
  description: string
  ownerId: string
  owner?: Pick<User, 'id' | 'name' | 'email'>
  verificationStatus: VerificationStatus
  verificationRequestId?: string
  verifiedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Discussion {
  id: string
  title: string
  content: string
  topic: Topic
  companyId: string
  company?: Pick<Company, 'id' | 'name'>
  comments?: Comment[]
  isPublic: boolean
  isDeleted: boolean
  createdAt: string
  _count?: { comments: number }
}

export interface Comment {
  id: string
  content: string
  discussionId: string
  companyId: string
  company?: Pick<Company, 'id' | 'name'>
  isEdited: boolean
  isDeleted: boolean
  createdAt: string
}

export interface MentorProfile {
  id: string
  bio: string
  expertise: string[]
  tokenPrice: number
  categories: string[]
  avgRating: number
  totalReviews: number
  isActive: boolean
  userId: string
  user?: Pick<User, 'id' | 'name' | 'picture'>
  availability?: MentorAvailability[]
  createdAt: string
}

export interface MentorAvailability {
  id: string
  mentorId: string
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
}

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'

export interface SessionBooking {
  id: string
  ownerId: string
  owner?: Pick<User, 'id' | 'name' | 'picture'>
  mentorId: string
  mentor?: MentorProfile & { user: Pick<User, 'id' | 'name' | 'picture'> }
  status: BookingStatus
  startTime: string
  endTime: string
  bookingDate: string
  videoSession?: VideoSession
  review?: Review
  createdAt: string
}

export interface VideoSession {
  id: string
  bookingId: string
  liveKitRoomName: string
  status: SessionStatus
  startedAt?: string
  endedAt?: string
}

export interface Review {
  id: string
  ownerId: string
  mentorId: string
  bookingId: string
  rating: number
  comment: string
  createdAt: string
}

export interface LiveKitTokenResponse {
  token: string
  roomName: string
  serverUrl: string
}

export interface Meta {
  page: number
  limit: number
  total: number
  totalPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  message: string
  timestamp: number
}

export interface ParticipantInfo {
  userId: string
  userName: string
  role: string
  handRaised: boolean
  joinedAt: number
}
