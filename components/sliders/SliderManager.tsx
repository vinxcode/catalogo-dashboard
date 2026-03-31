'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, AlertCircle, ImageIcon, X, Loader2 } from 'lucide-react'
import { createSlider, updateSlider, deleteSlider } from '@/actions/sliders'
import { uploadImage, deleteImage } from '@/actions/storage'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function SliderManager({ initialSliders }: { initialSliders: any[] }) {
  const router = useRouter()
  const [sliders, setSliders] = useState(initialSliders)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [formData, setFormData] = useState({ 
    title: '', 
    subtitle: '', 
    link_url: '', 
    display_order: '0', 
    is_active: true,
    image_url: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleAddNew = () => {
    setIsEditing('new')
    setFormData({ title: '', subtitle: '', link_url: '', display_order: '0', is_active: true, image_url: '' })
  }

  const handleEdit = (slider: any) => {
    setIsEditing(slider.id)
    setFormData({ 
      title: slider.title || '', 
      subtitle: slider.subtitle || '', 
      link_url: slider.link_url || '', 
      display_order: slider.display_order.toString(),
      is_active: slider.is_active,
      image_url: slider.image_url
    })
  }

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar esta imagen del carrusel?`)) return
    
    setIsLoading(true)
    const result = await deleteSlider(id)
    setIsLoading(false)

    if (result.error) {
       toast.error(result.error)
    } else {
       toast.success(`Imagen eliminada del slider`)
       if (imageUrl) {
         deleteImage(imageUrl, 'slider-images').catch(()=>null)
       }
       router.refresh()
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    
    setIsUploading(true)
    const toastId = toast.loading('Subiendo imagen para el slider...')
    try {
      const result = await uploadImage(file, 'slider-images')
      if (result.error) throw new Error(result.error)
      
      setFormData(prev => ({ ...prev, image_url: result.url! }))
      toast.success('Imagen subida correctamente', { id: toastId })
    } catch (err: any) {
      toast.error(err.message, { id: toastId })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.image_url) {
      toast.error('Debes subir una imagen para el slider')
      return
    }

    setIsLoading(true)
    const toastId = toast.loading('Guardando...')
    
    const payload = {
      title: formData.title,
      subtitle: formData.subtitle,
      link_url: formData.link_url,
      display_order: parseInt(formData.display_order, 10),
      is_active: formData.is_active,
      image_url: formData.image_url
    }

    try {
      if (isEditing === 'new') {
        const result = await createSlider(payload)
        if (result.error) throw new Error(result.error)
        toast.success("Slider creado", { id: toastId })
      } else {
        const result = await updateSlider(isEditing!, payload)
        if (result.error) throw new Error(result.error)
        toast.success("Slider actualizado", { id: toastId })
      }
      setIsEditing(null)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message, { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={handleAddNew}
          disabled={isEditing === 'new'}
          className="bg-[var(--color-brand-royal)] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[var(--color-brand-deep)] disabled:opacity-50 transition"
        >
          <Plus className="w-4 h-4" />
          Añadir Imagen
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left align-middle">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-b dark:border-gray-800">
            <tr>
              <th className="px-5 py-3 font-semibold w-16 text-center">Orden</th>
              <th className="px-5 py-3 font-semibold w-40">Imagen</th>
              <th className="px-5 py-3 font-semibold">Texto</th>
              <th className="px-5 py-3 font-semibold hidden sm:table-cell">Enlace URL</th>
              <th className="px-5 py-3 font-semibold w-24 text-center">Estado</th>
              <th className="px-5 py-3 font-semibold text-right w-24">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            
            {/* Formulario Inline */}
            {isEditing && (
              <tr className="bg-blue-50/50 dark:bg-blue-900/20">
                <td colSpan={6} className="p-5 border-b dark:border-gray-800">
                  <form onSubmit={handleSave} className="flex flex-col md:flex-row gap-5 items-start">
                    
                    {/* Imagen preview y upload */}
                    <div className="w-full md:w-64 space-y-2">
                       <label className="block text-xs text-gray-500 font-medium">Imagen del Banner * (1920x600px)</label>
                       {formData.image_url ? (
                         <div className="relative w-full aspect-[3/1] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border dark:border-gray-700 group">
                           <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                             <button type="button" onClick={() => setFormData({...formData, image_url: ''})} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition">
                               <X className="w-4 h-4" />
                             </button>
                           </div>
                         </div>
                       ) : (
                         <div className="relative w-full aspect-[3/1] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer">
                           {isUploading ? (
                             <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                           ) : (
                             <>
                              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                              <span className="text-xs text-gray-500 px-4 text-center">Clic para subir imagen</span>
                             </>
                           )}
                           <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                         </div>
                       )}
                    </div>

                    <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs text-gray-500">Título Principal</label>
                        <input type="text" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full p-2 border rounded text-sm dark:bg-gray-900 dark:border-gray-700" placeholder="Ej. ¡Impresiones de Alta Calidad!" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs text-gray-500">Subtítulo</label>
                        <input type="text" value={formData.subtitle} onChange={e=>setFormData({...formData, subtitle: e.target.value})} className="w-full p-2 border rounded text-sm dark:bg-gray-900 dark:border-gray-700" placeholder="Ej. Banners, camisas, tazas..." />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs text-gray-500">URL del Enlace (Opcional)</label>
                        <input type="text" value={formData.link_url} onChange={e=>setFormData({...formData, link_url: e.target.value})} className="w-full p-2 border rounded text-sm dark:bg-gray-900 dark:border-gray-700" placeholder="/categorias/banners" />
                      </div>
                      
                      <div className="flex gap-4 p-5">
                         <div className="w-20 space-y-1">
                           <label className="block text-xs text-gray-500">Orden</label>
                           <input type="number" required value={formData.display_order} onChange={e=>setFormData({...formData, display_order: e.target.value})} className="w-full p-2 border rounded text-sm dark:bg-gray-900 dark:border-gray-700" />
                         </div>
                         <div className="flex items-center pt-5">
                           <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                             <input type="checkbox" checked={formData.is_active} onChange={e=>setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                             <span>Visible</span>
                           </label>
                         </div>
                      </div>
                    </div>

                    <div className="w-full md:w-auto flex md:flex-col gap-2 justify-end self-stretch md:border-l pl-0 md:pl-5 dark:border-gray-700 mt-4 md:mt-0">
                      <button type="submit" disabled={isLoading || isUploading} className="flex-1 bg-[var(--color-brand-action)] hover:bg-green-600 text-white px-6 py-2 rounded font-medium disabled:opacity-50 transition">
                        Guardar
                      </button>
                      <button type="button" onClick={() => setIsEditing(null)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 px-6 py-2 rounded font-medium transition">
                        Cancelar
                      </button>
                    </div>
                  </form>
                </td>
              </tr>
            )}

            {/* Listado */}
            {initialSliders.map((slider) => (
              <tr key={slider.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <td className="px-5 py-4 text-center text-gray-500">{slider.display_order}</td>
                <td className="px-5 py-4">
                  <div className="w-32 aspect-[3/1] bg-gray-100 dark:bg-gray-800 rounded overflow-hidden border dark:border-gray-700">
                    <img src={slider.image_url} alt={slider.title || 'Slider image'} className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold">{slider.title || <span className="text-gray-400 italic">Sin título</span>}</p>
                  <p className="text-gray-500 text-xs mt-1">{slider.subtitle || <span className="text-gray-400 italic">Sin subtítulo</span>}</p>
                </td>
                <td className="px-5 py-4 text-gray-500 hidden sm:table-cell text-sm">
                  {slider.link_url || '-'}
                </td>
                <td className="px-5 py-4 text-center">
                   {slider.is_active 
                     ? <span className="bg-green-100 text-green-800 font-medium text-xs px-2.5 py-1 rounded-full dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">Activo</span>
                     : <span className="bg-gray-100 text-gray-800 font-medium text-xs px-2.5 py-1 rounded-full dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">Oculto</span>}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => handleEdit(slider)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition" title="Editar">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(slider.id, slider.image_url)} disabled={isLoading} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {initialSliders.length === 0 && !isEditing && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                  <AlertCircle className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="text-lg font-medium">No hay banners en el carrusel.</p>
                  <p className="text-sm">Añade imágenes promocionales para mostrar en la página de inicio.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
