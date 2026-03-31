'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCategories() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })
  
  if (error) throw new Error(error.message)
  return data
}

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const icon = formData.get('icon') as string
  const display_order = parseInt(formData.get('display_order') as string, 10) || 0

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('categories')
    .insert([{ name, slug, icon, display_order, is_active: true }])
    .select()

  if (error) return { error: error.message }
  
  revalidatePath('/categories')
  return { success: true, data }
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const icon = formData.get('icon') as string
  const is_active = formData.get('is_active') === 'true'
  const display_order = parseInt(formData.get('display_order') as string, 10) || 0

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('categories')
    .update({ name, slug, icon, is_active, display_order })
    .eq('id', id)
    .select()

  if (error) return { error: error.message }
  
  revalidatePath('/categories')
  return { success: true, data }
}

export async function deleteCategory(id: string) {
  const supabase = createAdminClient()
  
  // Verificación crítica: ¿Tiene productos asociados?
  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id)
    
  if (countError) return { error: 'Error al verificar productos asociados: ' + countError.message }
  
  if (count && count > 0) {
    return { 
      error: `No se puede eliminar la categoría porque hay ${count} producto(s) asignado(s) a ella. Reasigna los productos primero.` 
    }
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/categories')
  return { success: true }
}
