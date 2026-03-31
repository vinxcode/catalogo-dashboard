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
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }))
  }

  const handleAddNew = () => {
    setIsEditing('new')
    setFormData({ title: '', subtitle: '', link_url: '', display_order: '0', is_active: true, image_url: '' })
    setImageErrors(prev => ({ ...prev, 'form_preview': false }))
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
    setImageErrors(prev => ({ ...prev, 'form_preview': false }))
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
        deleteImage(imageUrl, 'slider-images').catch(() => null)
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
      setImageErrors(prev => ({ ...prev, 'form_preview': false }))
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

      {/* Formulario Mobile (se muestra fuera de la tabla en móvil si está editando) */}
      {isEditing && (
        <div className="md:hidden bg-blue dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 space-y-4">
          <h3 className="font-bold text-lg">
            {isEditing === 'new' ? 'Nueva Imagen' : 'Editar Imagen'}
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs text-gray-500 font-medium tracking-wider">BANNER PREVIEW *</label>
              {formData.image_url ? (
                <div className="relative w-full aspect-[21/9] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border dark:border-gray-700 group flex items-center justify-center">
                  {imageErrors['form_preview'] ? (
                    <span className="text-sm text-gray-400 font-bold uppercase tracking-widest">Sin imagen</span>
                  ) : (
                    <img
                      src={formData.image_url}
                      alt=""
                      onError={() => handleImageError('form_preview')}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <button type="button" onClick={() => setFormData({ ...formData, image_url: '' })} className="bg-red-500 text-white p-2 rounded-full shadow-lg">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative w-full aspect-[21/9] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center justify-center">
                  {isUploading ? <Loader2 className="w-8 h-8 animate-spin text-blue-500" /> : <ImageIcon className="w-10 h-10 text-gray-400" />}
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Título</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 border rounded-lg dark:bg-gray-900 dark:border-gray-700" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Subtítulo</label>
                <input type="text" value={formData.subtitle} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} className="w-full p-3 border rounded-lg dark:bg-gray-900 dark:border-gray-700" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Linl URL</label>
                <input type="text" value={formData.link_url} onChange={e => setFormData({ ...formData, link_url: e.target.value })} className="w-full p-3 border rounded-lg dark:bg-gray-900 dark:border-gray-700" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-gray-500">Orden</label>
                  <input type="number" value={formData.display_order} onChange={e => setFormData({ ...formData, display_order: e.target.value })} className="w-full p-3 border rounded-lg dark:bg-gray-900 dark:border-gray-700" />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-5 h-5 rounded" />
                    <span>Activo</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={isLoading || isUploading} className="flex-1 bg-[var(--color-brand-royal)] text-white py-3 rounded-lg font-bold">Guardar</button>
              <button type="button" onClick={() => setIsEditing(null)} className="flex-1 bg-gray-200 dark:bg-gray-800 py-3 rounded-lg font-bold">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Vista de Escritorio (Tabla) */}
      <div className="hidden md:block overflow-x-auto bg-white dark:bg-[#0f172a] rounded-xl border dark:border-gray-800 shadow-sm">
        <table className="w-full text-sm text-left align-middle">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-800 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-5 py-4 font-semibold w-16 text-center">Orden</th>
              <th className="px-5 py-4 font-semibold w-48">Imagen</th>
              <th className="px-5 py-4 font-semibold">Texto</th>
              <th className="px-5 py-4 font-semibold">URL Destino</th>
              <th className="px-5 py-4 font-semibold w-24 text-center">Estado</th>
              <th className="px-5 py-4 font-semibold text-right w-24">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {/* Inline Form Table Row - Desktop */}
            {isEditing && (
              <tr className="bg-blue-50/30 dark:bg-blue-900/10">
                <td colSpan={6} className="p-4 border-b dark:border-gray-800">
                  <form onSubmit={handleSave} className="flex gap-4 items-end">
                    <div className="w-16">
                      <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Orden</label>
                      <input type="number" required value={formData.display_order} onChange={e => setFormData({ ...formData, display_order: e.target.value })} className="w-full p-2 border rounded text-sm dark:bg-gray-900 dark:border-gray-700" />
                    </div>
                    <div className="w-48">
                      <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Banner (1920x600)</label>
                      <div className="relative aspect-[3/1] bg-gray-100 dark:bg-gray-800 rounded border border-dashed border-gray-300 dark:border-gray-700 overflow-hidden flex items-center justify-center">
                        {formData.image_url ? (
                          <>
                            {imageErrors['form_preview'] ? (
                              <span className="text-[8px] text-gray-400 font-bold uppercase">Sin imagen</span>
                            ) : (
                              <img
                                src={formData.image_url}
                                alt=""
                                onError={() => handleImageError('form_preview')}
                                className="w-full h-full object-cover"
                              />
                            )}
                            <button type="button" onClick={() => setFormData({ ...formData, image_url: '' })} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X className="w-3 h-3" /></button>
                          </>
                        ) : (
                          <>
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-5 h-5 text-gray-400" />}
                            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="absolute inset-0 opacity-0 cursor-pointer" />
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Título</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 border rounded text-sm dark:bg-gray-900 dark:border-gray-700" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Subtítulo</label>
                        <input type="text" value={formData.subtitle} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} className="w-full p-2 border rounded text-sm dark:bg-gray-900 dark:border-gray-700" />
                      </div>
                    </div>
                    <div className="w-40">
                      <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">URL (Opcional)</label>
                      <input type="text" value={formData.link_url} onChange={e => setFormData({ ...formData, link_url: e.target.value })} className="w-full p-2 border rounded text-sm dark:bg-gray-900 dark:border-gray-700" />
                    </div>
                    <div className="w-24 mb-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                        <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 rounded" />
                        <span>Activo</span>
                      </label>
                    </div>
                    <div className="flex gap-1 mb-1">
                      <button type="submit" disabled={isLoading || isUploading} className="bg-green-600 text-white p-2 rounded hover:bg-green-700 shadow-sm transition"><Save className="w-4 h-4" /></button>
                      <button type="button" onClick={() => setIsEditing(null)} className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500 shadow-sm transition"><X className="w-4 h-4" /></button>
                    </div>
                  </form>
                </td>
              </tr>
            )}

            {initialSliders.map((slider) => (
              <tr key={slider.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
                <td className="px-5 py-4 text-center font-mono text-gray-500">{slider.display_order}</td>
                <td className="px-5 py-4">
                  <div className="w-40 aspect-[3/1] bg-gray-100 dark:bg-gray-800 rounded border dark:border-gray-700 overflow-hidden shadow-sm flex items-center justify-center">
                    {imageErrors[slider.id] || !slider.image_url ? (
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Sin imagen</span>
                    ) : (
                      <img
                        src={slider.image_url}
                        alt=""
                        onError={() => handleImageError(slider.id)}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{slider.title || <span className="text-gray-400 italic font-normal">Sin título</span>}</p>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-1">{slider.subtitle || <span className="text-gray-400 italic">Sin subtítulo</span>}</p>
                </td>
                <td className="px-5 py-4 text-gray-400 font-mono text-xs truncate max-w-[120px]">
                  {slider.link_url || '-'}
                </td>
                <td className="px-5 py-4 text-center">
                  {slider.is_active
                    ? <span className="bg-green-100 text-green-700 font-bold text-[10px] uppercase px-2 py-1 rounded dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">Activo</span>
                    : <span className="bg-gray-100 text-gray-600 font-bold text-[10px] uppercase px-2 py-1 rounded dark:bg-gray-800 dark:text-gray-400">Oculto</span>}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => handleEdit(slider)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Editar">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(slider.id, slider.image_url)} disabled={isLoading} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {initialSliders.length === 0 && !isEditing && (
              <tr>
                <td colSpan={6} className="px-5 py-20 text-center text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-xl font-bold">No hay imágenes en el slider</p>
                  <p className="text-sm mt-1">Carga banners promocionales para tu tienda.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Vista de Móvil (Cards) */}
      <div className="md:hidden space-y-4">
        {initialSliders.map((slider) => (
          <div key={slider.id} className="bg-white dark:bg-[#0f172a] rounded-xl border dark:border-gray-800 overflow-hidden shadow-sm flex flex-col">
            <div className="relative aspect-[21/9] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {imageErrors[slider.id] || !slider.image_url ? (
                <span className="text-sm text-gray-400 font-bold uppercase tracking-widest">Sin imagen</span>
              ) : (
                <img
                  src={slider.image_url}
                  alt=""
                  onError={() => handleImageError(slider.id)}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded">
                Orden: {slider.display_order}
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                {slider.is_active
                  ? <span className="bg-green-500 text-white text-[9px] font-bold px-2 py-1 rounded shadow-sm">ACTIVO</span>
                  : <span className="bg-gray-500 text-white text-[9px] font-bold px-2 py-1 rounded shadow-sm">OCULTO</span>}
              </div>
            </div>

            <div className="p-4 flex-1">
              <h3 className="font-bold text-gray-900 dark:text-gray-100">{slider.title || <span className="italic text-gray-400 font-normal">Sin título</span>}</h3>
              <p className="text-xs text-gray-500 mt-1">{slider.subtitle || <span className="italic text-gray-400 font-normal">Sin subtítulo</span>}</p>
              {slider.link_url && <p className="text-[10px] font-mono text-blue-500 mt-2 truncate">🔗 {slider.link_url}</p>}
            </div>

            <div className="flex border-t dark:border-gray-800">
              <button onClick={() => handleEdit(slider)} className="flex-1 flex items-center justify-center gap-2 py-3 text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <Edit2 className="w-4 h-4" />
                <span className="text-sm font-bold">Editar</span>
              </button>
              <div className="w-[1px] bg-gray-200 dark:bg-gray-800"></div>
              <button onClick={() => handleDelete(slider.id, slider.image_url)} disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 py-3 text-red-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-bold">Eliminar</span>
              </button>
            </div>
          </div>
        ))}

        {initialSliders.length === 0 && !isEditing && (
          <div className="text-center py-12 bg-white dark:bg-[#0f172a] rounded-xl border dark:border-gray-800">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-bold">No hay banners configurados</p>
          </div>
        )}
      </div>
    </div>
  )
}
