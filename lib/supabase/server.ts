import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

// Solo para ser usado en el servidor (Server Actions / Route Handlers)
// con permisos totales usando Service Role Key
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
