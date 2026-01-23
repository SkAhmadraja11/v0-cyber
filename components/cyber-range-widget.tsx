"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Gamepad2, Trophy, Zap, ArrowRight, Target } from "lucide-react"
import Link from "next/link"

export default function CyberRangeWidget() {
    return (
        <Card className="p-6 relative overflow-hidden group hover:border-primary/50 transition-all duration-500">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10 transition-all group-hover:bg-primary/20" />

            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Gamepad2 className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-lg">Cyber Range</h3>
                    </div>
                    <p className="text-sm text-muted-foreground"> sharpen your skills</p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-yellow-500 flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> Lvl 1 Cadet
                    </span>
                    <div className="text-[10px] text-muted-foreground">0/1500 XP</div>
                </div>
            </div>

            {/* Daily Challenge Mini-View */}
            <div className="bg-muted/50 rounded-xl p-4 mb-4 border border-transparent group-hover:border-primary/20 transition-all">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Target className="w-3 h-3" /> Daily Mission
                    </span>
                    <span className="text-xs font-mono text-green-500">+200 XP</span>
                </div>
                <h4 className="font-bold text-sm mb-1">Phishing Detective: Spot the Fake</h4>
                <div className="w-full bg-background h-1.5 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-primary w-[0%]" />
                </div>
                <Button size="sm" variant="secondary" className="w-full h-8 text-xs font-bold">
                    Start Challenge
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-background rounded-lg p-3 text-center border border-border/50">
                    <Zap className="w-4 h-4 mx-auto text-yellow-500 mb-1" />
                    <div className="text-xl font-bold leading-none">0</div>
                    <div className="text-[10px] text-muted-foreground">Day Streak</div>
                </div>
                <div className="bg-background rounded-lg p-3 text-center border border-border/50">
                    <Target className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                    <div className="text-xl font-bold leading-none">0/15</div>
                    <div className="text-[10px] text-muted-foreground">Completed</div>
                </div>
            </div>

            <Link href="/games">
                <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transform transition-all duration-300 shadow-lg hover:shadow-primary/25">
                    Enter Cyber Range <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
            </Link>
        </Card>
    )
}
