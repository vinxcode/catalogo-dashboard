'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { uploadImage, deleteImage } from '@/actions/storage'
import { createProduct, updateProduct } from '@/actions/products'
import { toast } from 'sonner'
import { Save, ArrowLeft, Image as ImageIcon, X, GripVertical } from 'lucide-react'
import Link from 'next/link'

// Quick array reorder helper
const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}

export function ProductForm({ initialData = null, categories = [] }: { initialData?: any, categories: any[] }) {
  const router = useRouter()
  const isEditing = !!initialData
  
  const [isLoading, setIsLoading] = useState(false)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const handleImageError = (url: string) => {
    setImageErrors(prev => ({ ...prev, [url]: true }))
  }
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price?.toString() || '',
    category_id: initialData?.category_id || '',
    is_active: initialData?.is_active ?? true,
    is_featured: initialData?.is_featured ?? false,
  })

  // Images state: { url: string, isNew?: boolean, file?: File }
  const [images, setImages] = useState<any[]>(
    initialData?.product_images?.map((img: any) => ({ url: img.image_url })) || []
  )

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Para simplificar, subimos las imágenes inmediatamente al drop
    // Esto es común para poder previsualizarlas desde la URL real y manejar su estado
    setIsLoading(true)
    const toastId = toast.loading(`Subiendo ${acceptedFiles.length} imagen(es)...`)
    
    try {
      const newImages: { url: string, isNew?: boolean }[] = []
      for (const file of acceptedFiles) {
        const result = await uploadImage(file, 'product-images')
        if (result.error) throw new Error(result.error)
        newImages.push({ url: result.url as string, isNew: true })
      }
      setImages(prev => [...prev, ...newImages])
      toast.success('Imágenes subidas', { id: toastId })
    } catch (err: any) {
      toast.error(`Error: ${err.message}`, { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': [] },
    disabled: isLoading
  })

  const removeImage = async (index: number) => {
    const imgToRemove = images[index]
    
    // Optimistic remove
    setImages(prev => prev.filter((_, i) => i !== index))
    
    // Si la imagen ya estaba en storage (incluso las acabadas de subir), la borramos
    if (imgToRemove.url.includes('/storage/')) {
        // Borrar silenciosamente en background
        deleteImage(imgToRemove.url, 'product-images').catch(e => console.error("Error borrarndo img:", e))
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.price || !formData.category_id) {
      toast.error('Nombre, precio y categoría son obligatorios')
      return
    }

    setIsLoading(true)
    const toastId = toast.loading('Guardando producto...')

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: formData.category_id,
        is_active: formData.is_active,
        is_featured: formData.is_featured
      }

      const imagesPayload = images.map(img => ({ url: img.url }))

      if (isEditing) {
        const res = await updateProduct(initialData.id, payload, imagesPayload)
        if (res.error) throw new Error(res.error)
        toast.success('Producto actualizado', { id: toastId })
      } else {
        const res = await createProduct(payload, imagesPayload)
        if (res.error) throw new Error(res.error)
        toast.success('Producto creado', { id: toastId })
      }
      
      router.push('/products')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message, { id: toastId })
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <Link href="/products" className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditing ? 'Editar Producto' : 'Crear Producto'}
            </h1>
            <p className="text-gray-500">
              Completa todos los campos necesarios.
            </p>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-[var(--color-brand-royal)] text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[var(--color-brand-deep)] disabled:opacity-50 transition"
        >
          <Save className="w-5 h-5" />
          {isLoading ? 'Guardando...' : 'Guardar Producto'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-sm">
        
        {/* IZQUIERDA: INFORMACIÓN BÁSICA */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2 dark:border-gray-800">Información General</h2>
            
            <div className="space-y-2">
              <label className="font-medium">Nombre del Producto *</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700" 
                placeholder="Ej. Banner Publicitario Grande"
              />
            </div>

            <div className="space-y-2">
              <label className="font-medium">Descripción</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700" 
                placeholder="Describe el producto. Detalles, medidas, materiales..."
              />
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
             <h2 className="text-lg font-semibold border-b pb-2 dark:border-gray-800 mb-4 text-[var(--color-brand-deep)] dark:text-[var(--color-brand-sky)]">Galería de Imágenes</h2>
             
             {/* Dropzone */}
             <div 
               {...getRootProps()} 
               className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
             >
               <input {...getInputProps()} />
               <ImageIcon className="w-10 h-10 mx-auto text-gray-400 mb-3" />
               <p className="font-medium mb-1">Arrastra tus imágenes aquí o haz click para explorar</p>
               <p className="text-xs text-gray-500">JPG, PNG, WEBP (Recomendado 800x800px)</p>
             </div>

             {/* Grid de Imágenes subidas */}
             {images.length > 0 && (
               <div className="mt-6">
                 <h3 className="text-sm font-medium mb-3 text-gray-500">Imágenes subidas ({images.length})</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {images.map((img, index) => (
                     <div key={img.url + index} className="group relative aspect-square rounded-lg border overflow-hidden bg-gray-100 dark:bg-gray-800 dark:border-gray-700 flex items-center justify-center">
                       {imageErrors[img.url] ? (
                         <div className="flex flex-col items-center gap-1">
                           <ImageIcon className="w-6 h-6 text-gray-400" />
                           <span className="text-[10px] text-gray-400 font-bold uppercase">Sin imagen</span>
                         </div>
                       ) : (
                         <img 
                           src={img.url} 
                           alt="" 
                           onError={() => handleImageError(img.url)}
                           className="w-full h-full object-cover" 
                         />
                       )}
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-start justify-end p-2">
                         <button 
                           type="button" 
                           onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                           className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600 transition"
                         >
                           <X className="w-4 h-4" />
                         </button>
                       </div>
                       {index === 0 && (
                         <span className="absolute bottom-2 left-2 bg-[var(--color-brand-royal)] text-white text-[10px] px-2 py-1 rounded shadow">
                           Primaria
                         </span>
                       )}
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* DERECHA: PRECIO, CATEGORÍA, ESTADO */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2 dark:border-gray-800">Organización</h2>
            
            <div className="space-y-2">
              <label className="font-medium">Precio ($) *</label>
              <input 
                required
                type="number" 
                min="0"
                step="0.01"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 text-lg font-medium tracking-tight" 
                placeholder="25.00"
              />
            </div>

            <div className="space-y-2">
              <label className="font-medium">Categoría *</label>
              <select 
                required
                value={formData.category_id}
                onChange={e => setFormData({...formData, category_id: e.target.value})}
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 bg-white"
              >
                <option value="" disabled>Seleccionar categoría...</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2 dark:border-gray-800">Visibilidad</h2>
            
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50 transition">
              <input 
                type="checkbox" 
                checked={formData.is_active}
                onChange={e => setFormData({...formData, is_active: e.target.checked})}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" 
              />
              <div>
                <p className="font-medium">Publicado Activo</p>
                <p className="text-xs text-gray-500 mt-0.5">Visible para clientes de la tienda.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50 transition">
              <input 
                type="checkbox" 
                checked={formData.is_featured}
                onChange={e => setFormData({...formData, is_featured: e.target.checked})}
                className="w-5 h-5 rounded text-yellow-500 focus:ring-yellow-500" 
              />
              <div>
                <p className="font-medium">⭐ Destacado</p>
                <p className="text-xs text-gray-500 mt-0.5">Se mostrará en secciones especiales del inicio.</p>
              </div>
            </label>
          </div>
        </div>

      </div>
    </form>
  )
}
