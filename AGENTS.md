<!-- BEGIN:nextjs-agent-rules -->

# 🤖 Development Guidelines for Grow Platform

> Comprehensive guidelines for developing features on the Grow mentorship platform. This document is NOT standard Next.js - read carefully before implementing code.

## Table of Contents
- [Next.js Version & Breaking Changes](#nextjs-version--breaking-changes)
- [Architectural Patterns](#architectural-patterns)
- [API Integration](#api-integration)
- [Dashboard Routing](#dashboard-routing)
- [Component Development](#component-development)
- [State Management](#state-management)
- [Error Handling](#error-handling)
- [Performance Guidelines](#performance-guidelines)

---

## Next.js Version & Breaking Changes

### ⚠️ This is NOT the Next.js you know

**Version**: Next.js 16.2.6 with React 19

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

### Key Differences
- **React 19**: New hooks and rendering model
- **App Router**: File-based routing in `src/app/`
- **Server Components by default**: Add `'use client'` only when needed
- **Next 16 Features**: Enhanced metadata, streaming, etc.

### Required Reading
Before starting development:
1. Check `node_modules/next/dist/docs/` for current API docs
2. Review React 19 changes
3. Understand Server vs Client Components paradigm

---

## Architectural Patterns

### Project Structure
```
src/
├── app/              # Next.js routing (server-first)
├── components/       # React components (client & server)
├── lib/              # Utilities, services, helpers
├── server/           # Server actions
├── stores/           # Zustand state stores
├── hooks/            # Custom React hooks
├── types/            # TypeScript interfaces
└── ForProxy/         # Authentication utilities
```

### Centralized API Service

**ALL API calls must go through `src/lib/apiService.ts`**

Never use raw `fetch()` or `api.get/post/patch/delete` directly in components.

```typescript
// ❌ WRONG - Direct API call
const res = await api.get('/mentor/profile/me')

// ✅ CORRECT - Use apiService
const res = await mentorApi.getCurrentMentorProfile()
```

### Available API Modules

- `authApi` - Authentication (login, logout, password reset, email verification)
- `userApi` - User profiles (get, update, create)
- `companyApi` - Company management (CRUD, verification)
- `discussionApi` - Discussions & comments (CRUD)
- `mentorApi` - Mentor profiles (list, get, create, update)
- `sessionApi` - Session booking (create, join, review, status)
- `adminApi` - Admin operations (user/company management)

---

## API Integration

### 97% Endpoint Coverage

All 28 out of 29 backend endpoints are implemented:

| Module | Coverage | Status |
|--------|----------|--------|
| Auth | 8/8 | ✅ 100% |
| User | 2/3 | ⚠️ 67% (createUser via server action) |
| Company | 5/5 | ✅ 100% |
| Discussion | 7/7 | ✅ 100% |
| Mentor | 5/5 | ✅ 100% |
| Session | 7/7 | ✅ 100% |
| Admin | 4/4 | ✅ 100% |

### Adding New API Endpoints

1. **Define in apiService** (`src/lib/apiService.ts`):
```typescript
export const newApi = {
  getItems: (query?: string) =>
    api.get(`/items${buildQueryString(query)}`),
  createItem: (payload: any) =>
    api.post('/items', payload),
}
```

2. **Use in components**:
```typescript
const { data } = useQuery({
  queryKey: ['items'],
  queryFn: async () => {
    const res = await newApi.getItems()
    return res.data.data
  },
})
```

3. **Handle errors consistently**:
```typescript
try {
  await newApi.createItem(data)
  toast.success('Created successfully')
  queryClient.invalidateQueries({ queryKey: ['items'] })
} catch (error: any) {
  const msg = error?.response?.data?.message || 'Failed'
  toast.error(msg)
}
```

---

## Dashboard Routing

### Route Structure

Use layout groups for dashboard organization:

```
app/(dashboard)/
├── admin/
│   ├── dashboard/
│   │   └── page.tsx          ← Admin dashboard
│   ├── users/
│   │   └── page.tsx          ← User management
│   └── companies/
│       └── page.tsx          ← Company verification
├── mentor/
│   ├── dashboard/
│   │   └── page.tsx          ← Mentor dashboard
│   └── layout.tsx
├── owner/
│   ├── dashboard/
│   │   └── page.tsx          ← Owner dashboard
│   └── layout.tsx
└── layout.tsx                ← Protected layout
```

### Dashboard Pages Requirements

#### Server-Rendered Dashboard Pages
- Use `app/(dashboard)/<role>/dashboard/page.tsx` pattern
- Keep as **server components** whenever possible
- Use `'use client'` only for interactive elements (forms, buttons)

**Example: Admin Dashboard**
```typescript
// src/app/(dashboard)/admin/dashboard/page.tsx
import { getCookie } from '@/ForProxy/getCookie'
import { adminApi } from '@/lib/apiService'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'

export default async function AdminDashboard() {
  const headers = {
    Cookie: `accessToken=${getCookie('accessToken')}`,
  }
  
  try {
    const [usersRes, companiesRes] = await Promise.all([
      adminApi.getUsers('?limit=1', { headers }),
      adminApi.getCompanies('?limit=1', { headers }),
    ])
    
    return (
      <AdminDashboardClient 
        users={usersRes.data.data}
        companies={companiesRes.data.data}
      />
    )
  } catch (error) {
    return <div>Failed to load dashboard</div>
  }
}
```

#### Client Components for Interactivity
```typescript
// src/components/admin/AdminDashboardClient.tsx
'use client'

import { useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/apiService'

export default function AdminDashboardClient({ users, companies }) {
  const queryClient = useQueryClient()
  
  const handleStatusChange = async (userId: string, status: string) => {
    try {
      await adminApi.updateUserStatus(userId, { status })
      toast.success('Status updated')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    } catch (error) {
      toast.error('Failed to update status')
    }
  }
  
  return <div>{/* UI here */}</div>
}
```

### Authentication & Redirect Logic

Align login redirects with dashboard routes:

```typescript
// src/lib/auth-utils.ts
export const getDefaultDashboardRoute = (role: UserRole): string => {
  switch (role) {
    case 'ADMIN': return '/admin/dashboard'
    case 'MENTOR': return '/mentor/dashboard'
    case 'OWNER': return '/owner/dashboard'
    default: return '/feed'
  }
}
```

### Data Fetching in Dashboards

**Always** fetch from backend API endpoints:

- **Admin Dashboard**: `/admin/users`, `/admin/companies`, `/discussion/discussion`
- **Mentor Dashboard**: `/session/booking/my`, `/mentor/profile/me`
- **Owner Dashboard**: `/user/me`, `/session/booking/my`, `/discussion/discussion?companyId=...`

```typescript
// ✅ CORRECT - Get real data
const usersRes = await adminApi.getUsers('?limit=10&page=1')

// ❌ WRONG - Using hardcoded data
const users = [{ id: 1, name: 'John' }]
```

---

## Component Development

### Component Patterns

#### Client Component (Interactive)
```typescript
// src/components/feature/ItemForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { newApi } from '@/lib/apiService'
import { toast } from 'sonner'

const schema = z.object({
  name: z.string().min(1, 'Required'),
})

export function ItemForm() {
  const form = useForm({ resolver: zodResolver(schema) })
  
  async function onSubmit(data: z.infer<typeof schema>) {
    try {
      await newApi.createItem(data)
      toast.success('Created')
      form.reset()
    } catch (error: any) {
      toast.error(error?.response?.data?.message)
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* fields */}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

#### Server Component (Data Fetching)
```typescript
// src/components/feature/ItemList.tsx
import { newApi } from '@/lib/apiService'

export async function ItemList() {
  try {
    const res = await newApi.getItems()
    const items = res.data.data
    
    return (
      <div>
        {items.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    )
  } catch {
    return <div>Failed to load items</div>
  }
}
```

### Form Validation

**Always use Zod + React Hook Form**:

```typescript
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const profileSchema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  email: z.email('Valid email required'),
  bio: z.string().max(500).optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export function ProfileForm() {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })
  
  // form implementation
}
```

### Styling

**Use Tailwind CSS only** - no CSS files unless absolutely necessary:

```typescript
// ✅ CORRECT
<div className="flex items-center gap-4 p-6 bg-card rounded-lg">
  <Avatar />
  <div>
    <h3 className="font-semibold">Name</h3>
    <p className="text-sm text-muted-foreground">Email</p>
  </div>
</div>

// ❌ WRONG - CSS file
// styles.module.css + className={styles.card}
```

### UI Components

Use **shadcn/ui** components for consistency:

```typescript
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Form, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
```

---

## State Management

### Global State (Zustand)

For app-wide state (auth, theme, user prefs):

```typescript
// src/stores/authStore.ts
import create from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))

// Usage in components
const user = useAuthStore((state) => state.user)
useAuthStore.getState().setUser(newUser)
```

### Server State (React Query)

For API responses and caching:

```typescript
// Client component
import { useQuery } from '@tanstack/react-query'
import { mentorApi } from '@/lib/apiService'

export function MentorsList() {
  const { data: mentors, isLoading } = useQuery({
    queryKey: ['mentors'],
    queryFn: async () => {
      const res = await mentorApi.getAllMentors()
      return res.data.data
    },
  })
  
  if (isLoading) return <Loader />
  return <div>{/* render mentors */}</div>
}
```

### Invalidate Queries After Mutations

Always invalidate cache after create/update/delete:

```typescript
const queryClient = useQueryClient()

try {
  await mentorApi.updateMentorProfile(id, data)
  queryClient.invalidateQueries({ queryKey: ['mentors'] })
  toast.success('Updated')
} catch (error) {
  toast.error('Failed')
}
```

---

## Error Handling

### API Error Handling

```typescript
try {
  await apiService.someAction(data)
} catch (error: any) {
  // Extract backend error message
  const message = error?.response?.data?.message || 'Something went wrong'
  
  // Show to user
  toast.error(message)
  
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error)
  }
}
```

### Form Error Handling

```typescript
const form = useForm({ resolver: zodResolver(schema) })

// Errors automatically displayed via FormMessage component
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage /> {/* Shows validation error */}
    </FormItem>
  )}
/>
```

### Error Boundaries

```typescript
'use client'

export function ErrorBoundary({ children, fallback }) {
  return (
    <div>
      {children}
    </div>
  )
}
```

---

## Performance Guidelines

### Image Optimization

Use `next/image` for all images:

```typescript
import Image from 'next/image'

<Image
  src="/mentor.jpg"
  alt="Mentor profile"
  width={200}
  height={200}
  priority // Only for above-the-fold
/>
```

### Code Splitting

Use dynamic imports for large components:

```typescript
import dynamic from 'next/dynamic'

const MentorList = dynamic(() => import('@/components/MentorList'), {
  loading: () => <Skeleton />,
})
```

### React Query Caching

Configure query stale time:

```typescript
useQuery({
  queryKey: ['mentors'],
  queryFn: async () => { /* fetch */ },
  staleTime: 5 * 60 * 1000, // 5 minutes
})
```

### Memoization

For expensive components:

```typescript
import { memo } from 'react'

export const MentorCard = memo(function MentorCard({ mentor }) {
  return <div>{/* render */}</div>
})
```

---

## Common Patterns

### Protected Page Pattern

```typescript
// src/app/(main)/sessions/page.tsx
'use client'

import AuthGuard from '@/components/layout/AuthGuard'
import { sessionApi } from '@/lib/apiService'
import { useQuery } from '@tanstack/react-query'

export default function SessionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const res = await sessionApi.getMyBookings()
      return res.data.data
    },
  })
  
  return (
    <AuthGuard>
      {isLoading ? <Loader /> : <SessionList sessions={data} />}
    </AuthGuard>
  )
}
```

### Paginated List Pattern

```typescript
'use client'

const [page, setPage] = useState(1)

const { data: items } = useQuery({
  queryKey: ['items', page],
  queryFn: async () => {
    const res = await newApi.getItems(`?page=${page}&limit=10`)
    return res.data.data
  },
})

return (
  <div>
    <ItemsList items={items?.data} />
    <Pagination
      page={page}
      total={items?.total}
      onPageChange={setPage}
    />
  </div>
)
```

---

## Quick Checklist Before Pushing

- [ ] All API calls use `apiService` module
- [ ] Components have `'use client'` if interactive
- [ ] Forms use Zod + React Hook Form
- [ ] Error handling with try-catch + toast
- [ ] React Query for data fetching
- [ ] Styling with Tailwind only
- [ ] No hardcoded API URLs
- [ ] TypeScript strict mode (no `any`)
- [ ] Tests pass locally
- [ ] ESLint: `npm run lint`

---

<!-- END:nextjs-agent-rules -->

**Last Updated**: June 10, 2026
