import { getSliders } from '@/actions/sliders'
import { SliderManager } from '@/components/sliders/SliderManager'

export const revalidate = 0

export default async function SlidersPage() {
  const sliders = await getSliders()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hero Sliders</h1>
          <p className="text-gray-500">
            Imágenes principales que aparecen en el carrusel de la página de inicio.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-sm border dark:border-gray-800 p-6">
        <SliderManager initialSliders={sliders} />
      </div>
    </div>
  )
}
