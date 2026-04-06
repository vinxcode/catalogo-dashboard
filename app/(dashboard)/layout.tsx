import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SidebarWrapper } from "@/components/layout/SidebarWrapper";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Shared Layout wrapper for Sidebar and Header */}
      <div className="flex">
        {/* Sidebar wrapper handles mobile slide and desktop sticky positioning */}
        <SidebarWrapper>
          <Sidebar />
        </SidebarWrapper>

        {/* Main Content area */}
        <div className="flex flex-col flex-1 min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto max-w-6xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
