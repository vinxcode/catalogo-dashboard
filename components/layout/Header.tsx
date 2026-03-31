import { Menu, Bell } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-white dark:bg-[#0f172a] shadow-sm sticky top-0 z-40 border-b border-[var(--color-brand-pale)] dark:border-[#1e293b]">
      <div className="flex h-16 items-center px-4 md:px-6 justify-between md:justify-end">

        {/* Mobile menu icon (only visible on mobile) */}
        <button className="md:hidden p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-4">


          <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
            <div className="w-9 h-9 rounded-full bg-[var(--color-brand-royal)] flex items-center justify-center text-white font-medium text-sm">
              AD
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">Administrador</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Acceso Total</p>
            </div>
          </div>
        </div>

      </div>
    </header>
  )
}
