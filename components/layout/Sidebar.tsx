import Link from 'next/link'
import { Home, Package, Tags, Image as ImageIcon, Settings, User, LogOut } from 'lucide-react'
import { getStoreSettings } from '@/actions/settings'
import { logout } from '@/actions/auth'

export async function Sidebar() {
  const settings = await getStoreSettings()
  const logoUrl = settings.store_logo
  const storeName = settings.store_name || 'Multi Impresiones AH'

  return (
    <aside className="w-full h-full bg-[var(--color-brand-deep)] text-white flex flex-col">
      <div className="p-6 border-b border-[var(--color-brand-royal)] flex flex-col items-center text-center">
        {logoUrl ? (
          <img src={logoUrl} alt={storeName} className="h-16 w-auto object-contain mb-3" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-[var(--color-brand-royal)] flex items-center justify-center mb-3">
             <Home className="w-6 h-6 text-[var(--color-brand-sky)]" />
          </div>
        )}
        <h1 className="text-sm font-bold tracking-tight uppercase">{storeName}</h1>
        <div className="flex items-center gap-1.5 mt-2 bg-black/20 px-3 py-1 rounded-full border border-white/10">
            <User className="w-3 h-3 text-[var(--color-brand-sky)]" />
            <p className="text-[10px] font-bold text-[var(--color-brand-sky)] uppercase tracking-wider">Administrador de Tienda</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link 
          href="/" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-[var(--color-brand-royal)] transition-colors"
        >
          <Home className="w-5 h-5 text-[var(--color-brand-sky)]" />
          <span>Inicio</span>
        </Link>
        <Link 
          href="/products" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-[var(--color-brand-royal)] transition-colors"
        >
          <Package className="w-5 h-5 text-[var(--color-brand-sky)]" />
          <span>Productos</span>
        </Link>
        <Link 
          href="/categories" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-[var(--color-brand-royal)] transition-colors"
        >
          <Tags className="w-5 h-5 text-[var(--color-brand-sky)]" />
          <span>Categorías</span>
        </Link>
        <Link 
          href="/sliders" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-[var(--color-brand-royal)] transition-colors"
        >
          <ImageIcon className="w-5 h-5 text-[var(--color-brand-sky)]" />
          <span>Hero Sliders</span>
        </Link>
        <Link 
          href="/settings" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white hover:bg-[var(--color-brand-royal)] transition-colors"
        >
          <Settings className="w-5 h-5 text-[var(--color-brand-sky)]" />
          <span>Ajustes Tienda</span>
        </Link>
      </nav>

      <div className="p-4 bg-[var(--color-brand-royal)]/30 text-xs text-[var(--color-brand-sky)] text-center border-t border-[var(--color-brand-royal)] flex flex-col gap-3">
        <form action={logout}>
          <button type="submit" className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition">
            <LogOut className="w-4 h-4" />
            <span className="font-medium text-sm">Cerrar Sesión</span>
          </button>
        </form>
        <div>Dashboard v1.0</div>
      </div>
    </aside>
  )
}
