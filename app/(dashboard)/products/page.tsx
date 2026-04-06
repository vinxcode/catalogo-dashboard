import { getProducts } from '@/actions/products'
import { ProductTable } from '@/components/products/ProductTable'

export const revalidate = 0

export default async function ProductsListPage() {
  const products = await getProducts()

  return (
    <div className="space-y-6">
      <ProductTable initialProducts={products} />
    </div>
  )
}
