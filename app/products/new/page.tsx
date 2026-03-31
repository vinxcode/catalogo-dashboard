import { ProductForm } from '@/components/products/ProductForm'
import { getCategories } from '@/actions/categories'

export const revalidate = 0

export default async function NewProductPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <ProductForm categories={categories} />
    </div>
  )
}
