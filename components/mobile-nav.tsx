"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Shield, Zap, GraduationCap, Lock, Activity, Gamepad2, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false)

    const navItems = [
        { label: "Scanner", href: "/scanner", icon: Shield },
        { label: "Security Awareness", href: "/awareness", icon: GraduationCap },
        { label: "Cryptography", href: "/encryption", icon: Lock },
        { label: "Dashboard", href: "/dashboard", icon: Activity },
        { label: "Cyber Range", href: "/games", icon: Gamepad2 },
        { label: "Profile", href: "/profile", icon: User },
        { label: "Settings", href: "/profile/settings", icon: Settings },
    ]

    return (
        <div className="md:hidden">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
                className="text-foreground"
            >
                <Menu className="h-6 w-6" />
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl animate-in fade-in duration-200">
                    <div className="flex flex-col h-full p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] pr-[calc(1.5rem+env(safe-area-inset-right))] pl-[calc(1.5rem+env(safe-area-inset-left))]">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <span className="font-bold">PhishGuard AI</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-6 w-6" />
                            </Button>
                        </div>

                        <nav className="flex-1 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-white/5 transition-colors group"
                                >
                                    <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <span className="font-medium text-lg">{item.label}</span>
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-auto pt-6 border-t border-border/50">
                            <Link href="/scanner" onClick={() => setIsOpen(false)}>
                                <Button className="w-full h-14 text-lg font-bold" size="lg">
                                    Launch Scanner
                                    <Zap className="ml-2 w-5 h-5 fill-current" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
