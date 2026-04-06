'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProducts() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name),
      product_images(image_url, display_order, is_primary),
      product_variants(*)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw new Error(error.message)
  return data
}

export async function getProduct(id: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images(*),
      product_variants(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) throw new Error(error.message)
  return data
}

export async function createProduct(productData: any, images: any[], variants: any[] = []) {
  const supabase = createAdminClient()
  
  // 1. Crear producto
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single()

  if (productError) return { error: productError.message }

  // 2. Insertar imágenes
  if (images.length > 0) {
    const imagesToInsert = images.map((img, i) => ({
      product_id: product.id,
      image_url: img.url,
      display_order: i,
      is_primary: i === 0 // La primera es primaria
    }))

    const { error: imagesError } = await supabase
      .from('product_images')
      .insert(imagesToInsert)
      
    if (imagesError) console.error("Error guardando imágenes:", imagesError.message)
  }

  // 3. Insertar variantes
  if (variants.length > 0) {
    const variantsToInsert = variants.map((v, i) => ({
      name: v.name,
      price: v.price,
      is_active: v.is_active ?? true,
      product_id: product.id,
      display_order: i
    }))
    const { error: variantError } = await supabase.from('product_variants').insert(variantsToInsert)
    if (variantError) console.error("Error guardando variantes:", variantError.message)
  }

  revalidatePath('/products')
  return { success: true, id: product.id }
}

export async function updateProduct(id: string, productData: any, images: any[], variants: any[] = []) {
  const supabase = createAdminClient()
  
  // 1. Actualizar producto
  const { error: productError } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)

  if (productError) return { error: productError.message }

  // 2. Borrar imágenes viejas de la BDD (no de storage, de storage ya se borran en cliente o se dejan huérfanas)
  await supabase.from('product_images').delete().eq('product_id', id)

  // 3. Insertar nuevas imágenes con su nuevo orden
  if (images.length > 0) {
    const imagesToInsert = images.map((img, i) => ({
      product_id: id,
      image_url: img.url,
      display_order: i,
      is_primary: i === 0
    }))

    const { error: imagesError } = await supabase
      .from('product_images')
      .insert(imagesToInsert)
      
    if (imagesError) console.error("Error actualizando imágenes:", imagesError.message)
  }

  // 4. Actualizar variantes (borrar viejas e insertar nuevas)
  await supabase.from('product_variants').delete().eq('product_id', id)
  
  if (variants.length > 0) {
    const variantsToInsert = variants.map((v, i) => ({
      name: v.name,
      price: v.price,
      is_active: v.is_active ?? true,
      product_id: id,
      display_order: i
    }))
    const { error: variantError } = await supabase.from('product_variants').insert(variantsToInsert)
    if (variantError) console.error("Error actualizando variantes:", variantError.message)
  }

  revalidatePath('/products')
  revalidatePath('/')
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/products')
  revalidatePath('/')
  return { success: true }
}
