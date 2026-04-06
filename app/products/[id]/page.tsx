import { ProductForm } from '@/components/products/ProductForm'
import { getCategories } from '@/actions/categories'
import { getProduct } from '@/actions/products'
import { notFound } from 'next/navigation'

export const revalidate = 0

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    getProduct(id).catch(() => null),
    getCategories()
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <ProductForm initialData={product} categories={categories} />
    </div>
  )
}
