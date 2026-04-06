'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { hashPassword, verifyPassword, createSession, deleteSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

const DEFAULT_PASSWORD = '1234'

async function ensureAdminPassword(): Promise<string> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('store_settings')
    .select('value')
    .eq('key', 'admin_password_hash')
    .single()

  if (data?.value) return data.value

  // Seed default password hash
  const hash = await hashPassword(DEFAULT_PASSWORD)
  await supabase
    .from('store_settings')
    .upsert(
      { key: 'admin_password_hash', value: hash, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )

  return hash
}

export async function login(username: string, password: string) {
  if (username !== 'admin') {
    return { error: 'Usuario incorrecto' }
  }

  const passwordHash = await ensureAdminPassword()
  const isValid = await verifyPassword(password, passwordHash)

  if (!isValid) {
    return { error: 'Contraseña incorrecta' }
  }

  await createSession()
  return { success: true }
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const passwordHash = await ensureAdminPassword()
  const isValid = await verifyPassword(currentPassword, passwordHash)

  if (!isValid) {
    return { error: 'La contraseña actual es incorrecta' }
  }

  const newHash = await hashPassword(newPassword)
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('store_settings')
    .upsert(
      { key: 'admin_password_hash', value: newHash, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )

  if (error) return { error: error.message }

  return { success: true }
}
