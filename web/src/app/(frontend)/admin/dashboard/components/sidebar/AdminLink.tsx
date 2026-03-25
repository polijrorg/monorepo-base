'use client'
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";

 
function AdminLink({ item, pathname }: { item: any, pathname: string }) {
  const selected = pathname === item.url

  return ( 
    <SidebarMenuItem className={cn("pr-7", item.marginTop && 'mt-2', selected && "hover:text-pink-50")}>
      <SidebarMenuButton asChild className={cn("pl-7 rounded-l-none transition-colors hover:bg-pink-300", selected && "hover:text-pink-50")}>
        <Link 
          href={item.url} 
          className={("flex gap-3 " + (selected ? 'bg-pink-700 hover:bg-pink-700' : ''))}
        >
          <item.icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
   );
}

export default AdminLink;