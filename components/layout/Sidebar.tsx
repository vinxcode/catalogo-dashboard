import Link from 'next/link'
import { Home, Package, Tags, Image as ImageIcon, Settings } from 'lucide-react'

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-[var(--color-brand-deep)] text-white shadow-lg overflow-y-auto z-50 flex flex-col hidden md:flex">
      <div className="p-6 border-b border-[var(--color-brand-royal)]">
        <h1 className="text-xl font-bold tracking-tight">Catalogo Admin</h1>
        <p className="text-sm text-[var(--color-brand-sky)] mt-1">Multi Impresiones AH</p>
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

      <div className="p-4 bg-[var(--color-brand-royal)]/30 text-xs text-[var(--color-brand-sky)]text-center border-t border-[var(--color-brand-royal)]">
        Dashboard v1.0
      </div>
    </aside>
  )
}
