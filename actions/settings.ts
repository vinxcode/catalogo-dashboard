'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getStoreSettings() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('store_settings').select('*')
  
  if (error) throw new Error(error.message)
  
  // Transform array of key/value pairs into an object map
  const settingsMap: Record<string, string> = {}
  data.forEach((setting) => {
    settingsMap[setting.key] = setting.value || ''
  })
  
  return settingsMap
}

export async function updateStoreSettings(settings: Record<string, string>) {
  const supabase = createAdminClient()
  
  try {
    // Update each setting one by one (or upsert)
    const updates = Object.entries(settings).map(async ([key, value]) => {
      const { error } = await supabase
        .from('store_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      if (error) throw new Error(error.message)
    })

    await Promise.all(updates)

    revalidatePath('/settings')
    // We revalidate everything since settings like phone/whatsapp are in footer and could affect the layout
    return { success: true }
  } catch(error: any) {
    return { error: error.message }
  }
}
