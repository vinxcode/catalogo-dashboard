import { getCategories } from '@/actions/categories'
import { CategoryManager } from '@/components/categories/CategoryManager'

export const revalidate = 0

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
          <p className="text-gray-500">
            Gestiona las secciones del catálogo.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-sm border dark:border-gray-800 p-6">
        <CategoryManager initialCategories={categories} />
      </div>
    </div>
  )
}
