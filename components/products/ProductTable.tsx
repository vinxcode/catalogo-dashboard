'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus, AlertCircle, ImageIcon } from 'lucide-react'
import { deleteProduct } from '@/actions/products'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function ProductTable({ initialProducts }: { initialProducts: any[] }) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [isLoading, setIsLoading] = useState(false)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }))
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la publicación "${name}"?\nEsta acción es irreversible y borrará el producto del catálogo público.`)) return
    
    setIsLoading(true)
    const result = await deleteProduct(id)
    setIsLoading(false)

    if (result.error) {
       toast.error(result.error)
    } else {
       toast.success(`Producto "${name}" eliminado`)
       // Remove from state optimistically
       setProducts(prev => prev.filter(p => p.id !== id))
       router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-[#0f172a] p-4 rounded-xl border dark:border-gray-800 shadow-sm">
        <h2 className="text-xl font-bold tracking-tight px-2">Lista de Productos</h2>
        <Link 
          href="/products/new"
          className="bg-[var(--color-brand-royal)] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[var(--color-brand-deep)] transition"
        >
          <Plus className="w-5 h-5" />
          Añadir Producto
        </Link>
      </div>

      {/* Vista de Escritorio (Tabla) */}
      <div className="hidden md:block bg-white dark:bg-[#0f172a] rounded-xl shadow-sm border dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left align-middle">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold w-24">Imagen</th>
                <th className="px-6 py-4 font-semibold">Detalles</th>
                <th className="px-6 py-4 font-semibold text-right">Precio</th>
                <th className="px-6 py-4 font-semibold text-center w-32">Estado</th>
                <th className="px-6 py-4 font-semibold text-right w-24">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
                  <td className="px-6 py-4">
                    <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center border dark:border-gray-700">
                      {product.product_images?.[0]?.image_url && !imageErrors[product.id] ? (
                        <img 
                          src={product.product_images[0].image_url} 
                          alt="" 
                          onError={() => handleImageError(product.id)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-[8px] text-gray-400 font-bold uppercase text-center leading-tight">Sin imagen</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-base mb-1">{product.name}</p>
                    <div className="flex flex-wrap items-center gap-2">
                       <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-500/20">
                         {product.category?.name || 'Varios'}
                       </span>
                       {product.is_featured && (
                         <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400 ring-1 ring-inset ring-yellow-600/20">
                           ⭐ Destacado
                         </span>
                       )}
                    </div>
                    <p className="text-gray-500 text-xs mt-2 line-clamp-1 max-w-sm">
                      {product.description || 'Sin descripción'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-lg">
                    ${product.price ? product.price.toFixed(2) : '0.00'}
                  </td>
                  <td className="px-6 py-4 text-center">
                     {product.is_active 
                       ? <span className="bg-green-100 text-green-800 font-medium text-xs px-2.5 py-1 rounded-full dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">Visible</span>
                       : <span className="bg-gray-100 text-gray-800 font-medium text-xs px-2.5 py-1 rounded-full dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">Oculto</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link 
                        href={`/products/${product.id}`} 
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition" 
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(product.id, product.name)} 
                        disabled={isLoading} 
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition" 
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <AlertCircle className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                    <p className="text-lg font-medium">No hay productos registrados.</p>
                    <p className="text-sm">Sube productos nuevos para llenar el catálogo de la tienda web.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista de Móvil (Cards) */}
      <div className="md:hidden space-y-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white dark:bg-[#0f172a] rounded-xl border dark:border-gray-800 p-4 shadow-sm space-y-4">
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 border dark:border-gray-700 flex items-center justify-center">
                {product.product_images?.[0]?.image_url && !imageErrors[product.id] ? (
                  <img 
                    src={product.product_images[0].image_url} 
                    alt="" 
                    onError={() => handleImageError(product.id)}
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                    <span className="text-[9px] text-gray-400 font-bold uppercase">Sin imagen</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate">{product.name}</h3>
                  <span className="font-bold text-[var(--color-brand-royal)] text-sm ml-2">
                    ${product.price?.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] px-2 py-0.5 rounded font-medium">
                    {product.category?.name || 'Varios'}
                  </span>
                  {product.is_featured && <span className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-[10px] px-2 py-0.5 rounded font-medium">⭐ Destacado</span>}
                </div>
                <p className="text-[10px] text-gray-500 mt-2 line-clamp-1">{product.description || 'Sin descripción'}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t dark:border-gray-800">
               <div>
                  {product.is_active 
                    ? <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">VISIBLE</span>
                    : <span className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">OCULTO</span>}
               </div>
               <div className="flex gap-2">
                 <Link href={`/products/${product.id}`} className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                 </Link>
                 <button onClick={() => handleDelete(product.id, product.name)} disabled={isLoading} className="p-2 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                 </button>
               </div>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="text-center py-10 bg-white dark:bg-[#0f172a] rounded-xl border dark:border-gray-800">
            <p className="text-gray-500">No hay productos.</p>
          </div>
        )}
      </div>
    </div>
  )
}
