import React from 'react'
import { Outlet } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { AdminSidebar } from '@/components/admin/Sidebar'

export default function AdminLayout() {
  return (
    <SidebarProvider defaultOpen>
      <AdminSidebar />
      <main className="w-full">
        <Outlet />
      </main>
      <Toaster />
    </SidebarProvider>
  )
}
