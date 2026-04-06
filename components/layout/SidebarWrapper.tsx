'use client'

import { useUIStore } from '@/store/ui'
import { ReactNode, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function SidebarWrapper({ children }: { children: ReactNode }) {
  const { isSidebarOpen, closeSidebar } = useUIStore()
  const pathname = usePathname()

  // Close sidebar when navigating on mobile
  useEffect(() => {
    closeSidebar()
  }, [pathname, closeSidebar])

  return (
    <>
      {/* Overlay - visible on mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar container with transform for mobile and sticky for desktop */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out bg-[var(--color-brand-deep)] overflow-y-auto
        md:sticky md:top-0 md:h-screen md:translate-x-0 md:flex-shrink-0 md:z-auto
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0 md:shadow-none'}
      `}>
        {children}
      </div>
    </>
  )
}
