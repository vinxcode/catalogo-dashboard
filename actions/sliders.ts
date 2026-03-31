'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSliders() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('sliders')
    .select('*')
    .order('display_order', { ascending: true })
  
  if (error) throw new Error(error.message)
  return data
}

export async function createSlider(sliderData: any) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('sliders')
    .insert([sliderData])
    .select()

  if (error) return { error: error.message }
  
  revalidatePath('/sliders')
  return { success: true, data }
}

export async function updateSlider(id: string, sliderData: any) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('sliders')
    .update(sliderData)
    .eq('id', id)
    .select()

  if (error) return { error: error.message }
  
  revalidatePath('/sliders')
  return { success: true, data }
}

export async function deleteSlider(id: string) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('sliders')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/sliders')
  return { success: true }
}
