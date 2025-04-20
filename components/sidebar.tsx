"use client"

import { Home, Star, LogOut, Menu, Orbit } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut, useSession } from "next-auth/react"
import { toast } from "sonner"
import type React from "react"
import { useState } from "react"

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
      className={cn(
        "w-full justify-start gap-3 rounded-xl px-3 py-2 transition-all duration-200",
        isActive && "bg-primary/10 text-primary font-medium"
      )}
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
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/login" })
      toast.success("Logged out successfully")
    } catch (error) {
      toast.error("Error logging out")
    }
  }

  return (
    <div 
      className={cn(
        "flex h-screen flex-col border-r border-border/50 bg-background/20 backdrop-blur-sm transition-all duration-500 ease-in-out",
        isCollapsed ? "w-20" : "w-[240px]"
      )}
    >
      <div className="flex flex-col flex-1 p-3">
        <div className="flex items-center justify-between py-2">
          <div className={cn(
            "flex items-center gap-3",
            isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto",
            "transition-all duration-500 ease-in-out overflow-hidden"
          )}>
            <div className="relative shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 via-violet-800 to-purple-900 shadow-inner shadow-white/20">
                <div className="absolute inset-0 rounded-lg bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)] animate-pulse"></div>
                <Orbit className="h-4 w-4 text-white animate-spin-slow" />
              </div>
            </div>
            <span className="text-base font-semibold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              AI Notes
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-lg shrink-0 hover:bg-background/40 transition-all duration-300",
              isCollapsed && "w-full justify-center"
            )}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-4 space-y-1">
          <NavItem href="#" isActive={currentView === "home"} onClick={() => onViewChange("home")}>
            <Home className={cn(
              "h-4 w-4 shrink-0 transition-all duration-300",
              isCollapsed && "mr-0"
            )} />
            <span className={cn(
              "transition-all duration-500 ease-in-out",
              isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            )}>
              Home
            </span>
          </NavItem>
          <NavItem href="#" isActive={currentView === "favorites"} onClick={() => onViewChange("favorites")}>
            <Star className={cn(
              "h-4 w-4 shrink-0 transition-all duration-300",
              isCollapsed && "mr-0"
            )} />
            <span className={cn(
              "transition-all duration-500 ease-in-out",
              isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            )}>
              Favourites
            </span>
          </NavItem>
        </div>
      </div>

      <div className="p-3 border-t border-border/50">
        <div className="flex flex-col gap-1">
          <Button 
            variant="ghost" 
            className={cn(
              "justify-start gap-3 rounded-lg px-3 py-2 hover:bg-background/40 transition-all duration-300",
              isCollapsed && "justify-center px-0"
            )}
          >
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarImage src={session?.user?.image || undefined} />
              <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className={cn(
              "transition-all duration-500 ease-in-out",
              isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            )}>
              {session?.user?.name}
            </span>
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "justify-start gap-3 rounded-lg px-3 py-2 text-red-500 hover:bg-red-500/10 transition-all duration-300",
              isCollapsed && "justify-center px-0"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={cn(
              "transition-all duration-500 ease-in-out",
              isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            )}>
              Logout
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}

