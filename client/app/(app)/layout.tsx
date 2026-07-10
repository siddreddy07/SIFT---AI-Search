import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { NotificationBell } from "@/components/NotificationBell"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex fixed z-80 w-full items-center gap-2 p-2">
          <SidebarTrigger />
        </div>
        {children}
      </main>
      <div className="fixed top-3 right-3 z-80">
        <NotificationBell />
      </div>
    </SidebarProvider>
  )
}
