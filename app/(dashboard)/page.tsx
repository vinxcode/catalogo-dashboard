import { createAdminClient } from '@/lib/supabase/server'
import { Package, Tags, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 0 // Disable cache for dashboard

export default async function DashboardHome() {
  const supabase = createAdminClient()

  // Fetch metrics in parallel
  const [
    { count: productsCount },
    { count: categoriesCount },
    { count: slidersCount },
    { data: recentProducts }
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('sliders').select('*', { count: 'exact', head: true }),
    supabase.from('products')
      .select('id, name, price, is_active, created_at, category:categories(name)')
      .order('created_at', { ascending: false })
      .limit(5)
  ])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bienvenido al Panel de Control</h2>
        <p className="text-gray-500 mt-1">Aquí puedes gestionar todo el contenido de tu catálogo.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Metric Cards */}
        <div className="rounded-xl border bg-white dark:bg-[#0f172a] dark:border-gray-800 p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Productos</h3>
            <Package className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold">{productsCount || 0}</div>
          <p className="text-xs text-gray-500 mt-1">Productos en el catálogo</p>
        </div>

        <div className="rounded-xl border bg-white dark:bg-[#0f172a] dark:border-gray-800 p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Categorías</h3>
            <Tags className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold">{categoriesCount || 0}</div>
          <p className="text-xs text-gray-500 mt-1">Categorías activas</p>
        </div>

        <div className="rounded-xl border bg-white dark:bg-[#0f172a] dark:border-gray-800 p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Hero Sliders</h3>
            <ImageIcon className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold">{slidersCount || 0}</div>
          <p className="text-xs text-gray-500 mt-1">Imágenes en el carrusel</p>
        </div>

      </div>

      <div className="rounded-xl border bg-white dark:bg-[#0f172a] dark:border-gray-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold tracking-tight">Últimos Productos Añadidos</h3>
          <Link href="/products" className="text-sm text-[var(--color-brand-bright)] hover:underline">
            Ver todos
          </Link>
        </div>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b dark:[&_tr]:border-gray-800">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Producto</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">Categoría</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-gray-500">Precio</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {recentProducts?.map((product: any) => (
                <tr key={product.id} className="border-b transition-colors dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-4 align-middle font-medium">{product.name}</td>
                  <td className="p-4 align-middle">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                      {product.category?.name || 'Sin categoría'}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-right">${product.price !== null && product.price !== undefined ? Number(product.price).toFixed(2) : '0.00'}</td>                  </tr>
              ))}
              {(!recentProducts || recentProducts.length === 0) && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500">
                    No hay productos registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
