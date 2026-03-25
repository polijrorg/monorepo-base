import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar"

import AdminMenuList from "./AdminMenu";

export function AdminSidebar() {
  return (
    <Sidebar>
      <SidebarContent className="bg-pink-950 text-pink-50 pt-12">
        <div className="flex flex-col gap-6 px-7 mb-6">
          <div className="flex items-center gap-5">
            <h2 className="text-xl">Dashboard</h2>
          </div>

          <div className="divisor bg-pink-800"></div>
        </div>
        <SidebarGroup className="p-0">
          <SidebarGroupContent className="p-0">
            <AdminMenuList />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}