'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, AlertCircle, Save, X } from 'lucide-react'
import { createCategory, updateCategory, deleteCategory } from '@/actions/categories'
import { toast } from 'sonner'
import { Category } from '@/types/database.types'
import { useRouter } from 'next/navigation'

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  
  // Sync state when DB updates so created/edited categories show immediately
  useEffect(() => {
    setCategories(initialCategories)
  }, [initialCategories])
  const [formData, setFormData] = useState({ name: '', slug: '', icon: '', display_order: '0', is_active: true })
  const [isLoading, setIsLoading] = useState(false)

  // Handlers
  const handleAddNew = () => {
    setIsEditing('new')
    setFormData({ name: '', slug: '', icon: '', display_order: '0', is_active: true })
  }

  const handleEdit = (cat: Category) => {
    setIsEditing(cat.id)
    setFormData({ 
      name: cat.name, 
      slug: cat.slug, 
      icon: cat.icon || '', 
      display_order: cat.display_order.toString(),
      is_active: cat.is_active
    })
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la categoría "${name}"?\nSe verificará si hay productos asignados.`)) return
    
    setIsLoading(true)
    const result = await deleteCategory(id)
    setIsLoading(false)

    if (result.error) {
       toast.error(result.error)
    } else {
       toast.success(`Categoría "${name}" eliminada`)
       router.refresh()
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    const data = new FormData()
    data.append('name', formData.name)
    data.append('slug', formData.slug)
    data.append('icon', formData.icon)
    data.append('display_order', formData.display_order)
    data.append('is_active', formData.is_active.toString())

    try {
      if (isEditing === 'new') {
        const result = await createCategory(data)
        if (result.error) throw new Error(result.error)
        toast.success("Categoría creada")
      } else {
        const result = await updateCategory(isEditing!, data)
        // @ts-ignore
        if (result.error) throw new Error(result.error)
        toast.success("Categoría actualizada")
      }
      setIsEditing(null)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
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
          className="bg-[var(--color-brand-royal)] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[var(--color-brand-deep)] disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Nueva Categoría
        </button>
      </div>

      {/* Formulario Mobile para Nueva Categoría (solo visible si crea) */}
      {isEditing === 'new' && (
        <div className="md:hidden bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 space-y-4">
          <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100">Nueva Categoría</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-xs text-gray-500 font-bold uppercase">Icono</label>
                 <input type="text" placeholder="☕ Ej" value={formData.icon} onChange={e=>setFormData({...formData, icon: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-900 dark:border-gray-700 font-medium" />
               </div>
               <div className="space-y-1">
                 <label className="text-xs text-gray-500 font-bold uppercase">Orden</label>
                 <input type="number" required value={formData.display_order} onChange={e=>setFormData({...formData, display_order: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-900 dark:border-gray-700 font-medium" />
               </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-bold uppercase">Nombre *</label>
              <input type="text" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')})} className="w-full p-3 border rounded-lg dark:bg-gray-900 dark:border-gray-700 font-bold" />
            </div>

            <div className="flex items-center pt-2">
               <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-lg bg-white dark:bg-[#0f172a] dark:border-gray-800 w-full hover:bg-gray-50">
                 <input type="checkbox" checked={formData.is_active} onChange={e=>setFormData({...formData, is_active: e.target.checked})} className="w-5 h-5 rounded text-[var(--color-brand-royal)]" />
                 <span className="font-bold text-gray-800 dark:text-gray-200">Categoría Activa</span>
               </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={isLoading} className="flex-1 bg-[var(--color-brand-royal)] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"><Save className="w-5 h-5"/> Guardar</button>
              <button type="button" onClick={() => setIsEditing(null)} className="flex-1 bg-gray-200 text-gray-800 dark:text-white dark:bg-gray-800 py-3 rounded-lg font-bold flex items-center justify-center gap-2"><X className="w-5 h-5"/> Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Vista de Escritorio (Tabla) */}
      <div className="hidden md:block bg-white dark:bg-[#0f172a] rounded-xl border dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left align-middle">
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-b dark:border-gray-800">
              <tr>
                <th className="px-5 py-4 font-semibold w-16 text-center">Orden</th>
                <th className="px-5 py-4 font-semibold w-16 text-center">Icono</th>
                <th className="px-5 py-4 font-semibold">Nombre</th>
                <th className="px-5 py-4 font-semibold">Slug (URL)</th>
                <th className="px-5 py-4 font-semibold w-24 text-center">Estado</th>
                <th className="px-5 py-4 font-semibold text-right w-24">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              
              {/* Formulario Inline Escritorio */}
              {isEditing && (
                <tr className="bg-blue-50/30 dark:bg-blue-900/10">
                  <td colSpan={6} className="p-4">
                    <form onSubmit={handleSave} className="flex gap-4 items-end">
                      <div className="w-20">
                        <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Orden</label>
                        <input type="number" required value={formData.display_order} onChange={e=>setFormData({...formData, display_order: e.target.value})} className="w-full p-2 border rounded text-sm dark:bg-gray-900 dark:border-gray-700" />
                      </div>
                      <div className="w-20">
                        <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Icono</label>
                        <input type="text" placeholder="☕ Ej" value={formData.icon} onChange={e=>setFormData({...formData, icon: e.target.value})} className="w-full p-2 border rounded text-sm dark:bg-gray-900 dark:border-gray-700 text-center" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Nombre *</label>
                        <input type="text" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')})} className="w-full p-2 border rounded text-sm dark:bg-gray-900 dark:border-gray-700" />
                      </div>
                      <div className="w-24 mb-2">
                         <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                           <input type="checkbox" checked={formData.is_active} onChange={e=>setFormData({...formData, is_active: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                           <span>Activo</span>
                         </label>
                      </div>
                      <div className="flex gap-1 mb-1">
                        <button type="submit" disabled={isLoading} className="bg-green-600 text-white p-2 rounded hover:bg-green-700"><Plus className="w-4 h-4" /></button>
                        <button type="button" onClick={() => setIsEditing(null)} className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500 self-center"><X className="w-4 h-4" /></button>
                      </div>
                    </form>
                  </td>
                </tr>
              )}

              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
                  <td className="px-5 py-4 text-center font-mono text-gray-500">{cat.display_order}</td>
                  <td className="px-5 py-4 text-center text-xl">{cat.icon}</td>
                  <td className="px-5 py-4 font-bold text-gray-900 dark:text-gray-100">{cat.name}</td>
                  <td className="px-5 py-4 text-gray-400 font-mono text-xs">{cat.slug}</td>
                  <td className="px-5 py-4 text-center">
                     {cat.is_active 
                       ? <span className="bg-green-100 text-green-700 font-bold text-[10px] uppercase px-2.5 py-1 rounded dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">Activo</span>
                       : <span className="bg-gray-100 text-gray-600 font-bold text-[10px] uppercase px-2.5 py-1 rounded dark:bg-gray-800 dark:text-gray-400">Oculto</span>}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleEdit(cat)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Editar">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(cat.id, cat.name)} disabled={isLoading} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {categories.length === 0 && !isEditing && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-gray-500">
                    <AlertCircle className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="font-bold text-lg">No hay categorías registradas</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista de Móvil (Cards) */}
      <div className="md:hidden space-y-4">
        {categories.map((cat) => (
          isEditing === cat.id ? (
            <div key={cat.id} className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-blue-200 dark:border-blue-800/50 pb-2">
                <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100">Editar Categoría</h3>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <label className="text-xs text-gray-500 font-bold uppercase">Icono</label>
                     <input type="text" placeholder="☕ Ej" value={formData.icon} onChange={e=>setFormData({...formData, icon: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-900 dark:border-gray-700 font-medium" />
                   </div>
                   <div className="space-y-1">
                     <label className="text-xs text-gray-500 font-bold uppercase">Orden</label>
                     <input type="number" required value={formData.display_order} onChange={e=>setFormData({...formData, display_order: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-900 dark:border-gray-700 font-medium" />
                   </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-bold uppercase">Nombre *</label>
                  <input type="text" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')})} className="w-full p-3 border rounded-lg dark:bg-gray-900 dark:border-gray-700 font-bold" />
                </div>
                <div className="flex items-center pt-2">
                   <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-lg bg-white dark:bg-[#0f172a] dark:border-gray-800 w-full hover:bg-gray-50">
                     <input type="checkbox" checked={formData.is_active} onChange={e=>setFormData({...formData, is_active: e.target.checked})} className="w-5 h-5 rounded text-[var(--color-brand-royal)]" />
                     <span className="font-bold text-gray-800 dark:text-gray-200">Categoría Activa</span>
                   </label>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={isLoading} className="flex-1 bg-[var(--color-brand-royal)] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"><Save className="w-5 h-5"/> Guardar</button>
                  <button type="button" onClick={() => setIsEditing(null)} className="flex-1 bg-gray-200 text-gray-800 dark:text-white dark:bg-gray-800 py-3 rounded-lg font-bold flex items-center justify-center gap-2"><X className="w-5 h-5"/> Cancelar</button>
                </div>
              </form>
            </div>
          ) : (
            <div key={cat.id} className="bg-white dark:bg-[#0f172a] rounded-xl border dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-2xl border dark:border-gray-700 shadow-inner">
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                     <h3 className="font-bold text-gray-900 dark:text-gray-100">{cat.name}</h3>
                     <span className="text-[10px] font-mono text-gray-400 font-bold">Orden: {cat.display_order}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                     {cat.is_active 
                       ? <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">ACTIVA</span>
                       : <span className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">OCULTA</span>}
                  </div>
                </div>
              </div>

              <div className="flex border-t dark:border-gray-800">
                <button onClick={() => handleEdit(cat)} className="flex-1 flex items-center justify-center gap-2 py-3 text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm font-bold">Editar</span>
                </button>
                <div className="w-[1px] bg-gray-200 dark:bg-gray-800"></div>
                <button onClick={() => handleDelete(cat.id, cat.name)} disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 py-3 text-red-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-bold">Eliminar</span>
                </button>
              </div>
            </div>
          )
        ))}
        {categories.length === 0 && !isEditing && (
          <div className="text-center py-10 bg-white dark:bg-[#0f172a] rounded-xl border dark:border-gray-800">
            <p className="text-gray-500">No hay categorías.</p>
          </div>
        )}
      </div>
    </div>
  )
}
