import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { ProfileRow } from '../shared'

export interface AuthContextValue {
  session: Session | null
  profile: ProfileRow | null
  loading: boolean
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
