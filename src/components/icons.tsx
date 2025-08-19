import type { SVGProps } from "react";
import { Home, Sparkles, Wand2, BedDouble, Sofa, Armchair, MoreHorizontal, Asterisk } from 'lucide-react';

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-8 w-8">
        <Home {...props} className="h-full w-full text-primary" />
        <Sparkles {...props} className="absolute -top-1 -right-1 h-4 w-4 text-purple-400" />
      </div>
      <span className="text-xl font-bold tracking-tight">RoomAIgine</span>
    </div>
  )
}

export function LogoIconPill(props: SVGProps<SVGSVGElement>) {
    return (
        <div className="flex items-center gap-2" {...props}>
            <div className="bg-[#a3e635] p-1.5 rounded-lg">
                <Asterisk className="h-5 w-5 text-black" />
            </div>
        </div>
    )
}


export { Wand2 as GenerateIcon, BedDouble, Sofa as LivingRoomIcon, Armchair as OfficeIcon, MoreHorizontal as MoreFiltersIcon };
