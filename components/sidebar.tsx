"use client"

import { Home, Star, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { signOut, useSession } from "next-auth/react"
import { toast } from "sonner"
import type React from "react"

interface NavItemProps {
  href: string
  isActive?: boolean
  children: React.ReactNode
  onClick: () => void
}

function NavItem({ href, isActive, children, onClick }: NavItemProps) {
  return (
    <Button
      variant="ghost"
      className={cn("w-full justify-start gap-2 rounded-xl", isActive && "bg-purple-50 text-purple-900")}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

interface SidebarProps {
  currentView: "home" | "favorites"
  onViewChange: (view: "home" | "favorites") => void
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { data: session } = useSession()
  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/login" })
      toast.success("Logged out successfully")
    } catch (error) {
      toast.error("Error logging out")
    }
  }

  return (
    <div className="flex h-screen w-[240px] flex-col border-r bg-white rounded-r-3xl">
      <div className="p-4">
        <div className="flex items-center gap-2 pb-4 ">
          <img 
            src="https://images.saasworthy.com/tars_4723_logo_1587125010_cvg74.png" 
            alt="TARS Logo" 
            className="h-12 w-12 rounded-xl"
          />
          <span className="text-lg font-semibold">AI Notes</span>
        </div>
        <nav className="space-y-1">
          <NavItem href="#" isActive={currentView === "home"} onClick={() => onViewChange("home")}>
            <Home className="h-4 w-4" />
            Home
          </NavItem>
          <NavItem href="#" isActive={currentView === "favorites"} onClick={() => onViewChange("favorites")}>
            <Star className="h-4 w-4" />
            Favourites
          </NavItem>
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Button variant="ghost" className="w-full justify-start gap-2 rounded-xl">
          <Avatar className="h-6 w-6">
            <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{session?.user?.name}</span>
        </Button>
      </div>
      <Button
        variant="ghost"
        className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  )
}

