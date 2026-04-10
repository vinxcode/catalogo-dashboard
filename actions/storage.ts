'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export async function uploadImage(file: File, bucket: string = 'product-images') {
  const supabase = createAdminClient()
  
  // Ensure we have a unique filename to avoid overwrites
  const ext = file.name.split('.').pop()
  const fileName = `${uuidv4()}.${ext}`
  
  // En Next.js Server Actions, a veces enviar el objeto File directamente a Supabase
  // falla, por lo que es más seguro convertirlo en un Buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, buffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    })

  if (error) {
    return { error: error.message }
  }

  // Get the public URL for the newly uploaded file
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName)

  return { success: true, url: publicUrlData.publicUrl }
}

export async function deleteImage(url: string, bucket: string = 'product-images') {
  const supabase = createAdminClient()
  
  // Extract filename from URL (assumes standard Supabase URL format)
  // e.g. https://.../storage/v1/object/public/product-images/my-image.jpg
  const parts = url.split('/')
  const fileName = parts[parts.length - 1]
  
  if (!fileName) return { error: 'Invalid URL' }

  const { error } = await supabase.storage
    .from(bucket)
    .remove([fileName])

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
