import { getStoreSettings } from '@/actions/settings'
import { SettingsForm } from '@/components/settings/SettingsForm'

export const revalidate = 0

export default async function SettingsPage() {
  const settings = await getStoreSettings()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ajustes de la Tienda</h1>
          <p className="text-gray-500">
            Administra la información de contacto, nombre, enlaces a redes sociales y más.
          </p>
        </div>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  )
}
