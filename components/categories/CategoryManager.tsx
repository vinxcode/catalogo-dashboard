'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, AlertCircle } from 'lucide-react'
import { createCategory, updateCategory, deleteCategory } from '@/actions/categories'
import { toast } from 'sonner'
import { Category } from '@/types/database.types'
import { useRouter } from 'next/navigation'

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [isEditing, setIsEditing] = useState<string | null>(null)
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

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left align-middle">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3 font-semibold w-16 text-center">Orden</th>
              <th className="px-4 py-3 font-semibold w-16 text-center">Icono</th>
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">Slug</th>
              <th className="px-4 py-3 font-semibold w-24 text-center">Estado</th>
              <th className="px-4 py-3 font-semibold text-right w-24">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            
            {/* Fila de creación/edición en línea */}
            {isEditing && (
              <tr className="bg-blue-50/50 dark:bg-blue-900/20">
                <td colSpan={6} className="p-4">
                  <form onSubmit={handleSave} className="flex flex-wrap md:flex-nowrap gap-4 items-end">
                    <div className="w-20">
                      <label className="block text-xs text-gray-500 mb-1">Orden</label>
                      <input type="number" required value={formData.display_order} onChange={e=>setFormData({...formData, display_order: e.target.value})} className="w-full p-2 border rounded text-sm dark:bg-gray-900 dark:border-gray-700" />
                    </div>
                    <div className="w-20">
                      <label className="block text-xs text-gray-500 mb-1">Icono</label>
                      <input type="text" placeholder="☕ Ej" value={formData.icon} onChange={e=>setFormData({...formData, icon: e.target.value})} className="w-full p-2 border rounded text-sm dark:bg-gray-900 dark:border-gray-700" />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-xs text-gray-500 mb-1">Nombre *</label>
                      <input type="text" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')})} className="w-full p-2 border rounded text-sm dark:bg-gray-900 dark:border-gray-700" />
                    </div>
                    <div className="flex-1 min-w-[150px] hidden sm:block">
                      <label className="block text-xs text-gray-500 mb-1">Slug *</label>
                      <input type="text" required value={formData.slug} onChange={e=>setFormData({...formData, slug: e.target.value})} className="w-full p-2 border rounded text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700" />
                    </div>
                    <div className="w-24 flex items-center mb-2">
                       <label className="flex items-center gap-2 cursor-pointer text-sm">
                         <input type="checkbox" checked={formData.is_active} onChange={e=>setFormData({...formData, is_active: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                         <span>Activo</span>
                       </label>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={isLoading} className="bg-[var(--color-brand-action)] hover:bg-green-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50">Guardar</button>
                      <button type="button" onClick={() => setIsEditing(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded text-sm">Cancelar</button>
                    </div>
                  </form>
                </td>
              </tr>
            )}

            {/* Listado de categorías */}
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3 text-center text-gray-500">{cat.display_order}</td>
                <td className="px-4 py-3 text-center text-xl">{cat.icon}</td>
                <td className="px-4 py-3 font-medium">{cat.name}</td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell text-xs font-mono">{cat.slug}</td>
                <td className="px-4 py-3 text-center">
                   {cat.is_active 
                     ? <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full dark:bg-green-900 dark:text-green-300">Activo</span>
                     : <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full dark:bg-gray-700 dark:text-gray-300">Oculto</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => handleEdit(cat)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded" title="Editar">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(cat.id, cat.name)} disabled={isLoading} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {categories.length === 0 && !isEditing && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No hay categorías registradas.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
