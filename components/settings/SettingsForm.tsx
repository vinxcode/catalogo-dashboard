'use client'

import { useState } from 'react'
import { updateStoreSettings } from '@/actions/settings'
import { toast } from 'sonner'
import { Save, Store, Phone, Link as LinkIcon, MapPin, Users, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SettingsForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const router = useRouter()
  const [settings, setSettings] = useState({
    store_name: initialSettings.store_name || '',
    phone: initialSettings.phone || '',
    whatsapp: initialSettings.whatsapp || '',
    facebook_url: initialSettings.facebook_url || '',
    instagram_url: initialSettings.instagram_url || '',
    tiktok_url: initialSettings.tiktok_url || '',
    address: initialSettings.address || '',
    // Storefront content pages
    about_title: initialSettings.about_title || '',
    about_content: initialSettings.about_content || '',
    values_title: initialSettings.values_title || '',
    values_content: initialSettings.values_content || '',
  })
  
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const toastId = toast.loading('Guardando ajustes...')

    try {
      const result = await updateStoreSettings(settings)
      if (result.error) throw new Error(result.error)
      
      toast.success('Ajustes de la tienda guardados correctamente', { id: toastId })
      router.refresh()
    } catch (err: any) {
      toast.error(err.message, { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl pb-10">
      <div className="flex justify-between items-center bg-white dark:bg-[#0f172a] p-4 rounded-xl border dark:border-gray-800 shadow-sm sticky top-0 z-10">
        <h3 className="font-bold text-gray-500 text-sm italic">Modifica los ajustes y presiona Guardar</h3>
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-[var(--color-brand-royal)] text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[var(--color-brand-deep)] disabled:opacity-50 transition shadow-sm"
        >
          <Save className="w-5 h-5" />
          {isLoading ? 'Guardando...' : 'Guardar Ajustes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identidad de la Tienda */}
        <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <div className="flex items-center gap-2 text-[var(--color-brand-deep)] dark:text-[var(--color-brand-sky)] border-b pb-2 dark:border-gray-800 mb-4">
            <Store className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Identidad de la Tienda</h2>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Negocio</label>
            <input 
              type="text" 
              value={settings.store_name}
              onChange={e => handleChange('store_name', e.target.value)}
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700" 
              placeholder="Ej. Multi Impresiones AH"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Dirección Física</label>
            <textarea 
              rows={3}
              value={settings.address}
              onChange={e => handleChange('address', e.target.value)}
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700" 
              placeholder="Ubicación de la tienda"
            />
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <div className="flex items-center gap-2 text-[var(--color-brand-deep)] dark:text-[var(--color-brand-sky)] border-b pb-2 dark:border-gray-800 mb-4">
            <Phone className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Contacto Directo</h2>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp (Número con código de país)</label>
            <input 
              type="text" 
              value={settings.whatsapp}
              onChange={e => handleChange('whatsapp', e.target.value)}
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[var(--color-brand-action)] dark:bg-gray-900 dark:border-gray-700 font-mono" 
              placeholder="+50300000000"
            />
            <p className="text-xs text-gray-500">Formato: código de país seguido del número (+503...), sin espacios.</p>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono (Solo visualización)</label>
            <input 
              type="text" 
              value={settings.phone}
              onChange={e => handleChange('phone', e.target.value)}
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700" 
              placeholder="+503 6052-8774"
            />
          </div>
        </div>

        {/* Redes Sociales */}
        <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 text-[var(--color-brand-deep)] dark:text-[var(--color-brand-sky)] border-b pb-2 dark:border-gray-800 mb-4">
            <LinkIcon className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Redes Sociales</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Facebook URL</label>
              <input 
                type="url" 
                value={settings.facebook_url}
                onChange={e => handleChange('facebook_url', e.target.value)}
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-600 dark:bg-gray-900 dark:border-gray-700" 
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Instagram URL</label>
              <input 
                type="url" 
                value={settings.instagram_url}
                onChange={e => handleChange('instagram_url', e.target.value)}
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-pink-600 dark:bg-gray-900 dark:border-gray-700" 
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">TikTok URL</label>
              <input 
                type="url" 
                value={settings.tiktok_url}
                onChange={e => handleChange('tiktok_url', e.target.value)}
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-gray-800 dark:bg-gray-900 dark:border-gray-700" 
                placeholder="https://tiktok.com/@..."
              />
            </div>
          </div>
        </div>

        {/* CONTENIDO DE PÁGINAS (NOSOTROS / VALORES) */}
        <div className="md:col-span-2 pt-6">
            <h3 className="text-xl font-bold mb-4 px-2 border-l-4 border-[var(--color-brand-royal)]">Contenido de las Páginas del Sitio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Página: Nosotros */}
                <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-4">
                    <div className="flex items-center gap-2 text-blue-600 border-b pb-2 dark:border-gray-800 mb-4">
                        <Users className="w-5 h-5" />
                        <h2 className="text-lg font-semibold uppercase tracking-wider text-sm">Sección: Nosotros</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-400">Título de la Página</label>
                            <input 
                                type="text" 
                                value={settings.about_title}
                                onChange={e => handleChange('about_title', e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-lg dark:bg-gray-900 dark:border-gray-700" 
                                placeholder="Ej. Quienes Somos"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-400">Contenido (Admite varios párrafos)</label>
                            <textarea 
                                rows={10}
                                value={settings.about_content}
                                onChange={e => handleChange('about_content', e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 text-sm leading-relaxed" 
                                placeholder="Escribe aquí la historia de la empresa..."
                            />
                        </div>
                    </div>
                </div>

                {/* Página: Nuestros Valores */}
                <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-4">
                    <div className="flex items-center gap-2 text-emerald-600 border-b pb-2 dark:border-gray-800 mb-4">
                        <FileText className="w-5 h-5" />
                        <h2 className="text-lg font-semibold uppercase tracking-wider text-sm">Sección: Nuestros Valores</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-400">Título de la Página</label>
                            <input 
                                type="text" 
                                value={settings.values_title}
                                onChange={e => handleChange('values_title', e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold text-lg dark:bg-gray-900 dark:border-gray-700" 
                                placeholder="Ej. Lo que nos define"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-400">Contenido (Admite varios párrafos)</label>
                            <textarea 
                                rows={10}
                                value={settings.values_content}
                                onChange={e => handleChange('values_content', e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-900 dark:border-gray-700 text-sm leading-relaxed" 
                                placeholder="Menciona vuestros valores y principios..."
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </form>
  )
}
