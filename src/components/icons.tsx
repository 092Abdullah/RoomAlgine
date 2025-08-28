
import type { SVGProps } from "react";
import { Home, Sparkles, Wand2, BedDouble, Sofa, Armchair, MoreHorizontal } from 'lucide-react';

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-8 w-8">
        <Home {...props} className="h-full w-full text-primary" />
        <Sparkles {...props} className="absolute -top-1 -right-1 h-4 w-4 text-primary/80" />
      </div>
      <span className="hidden sm:inline text-xl font-bold tracking-tight">RoomAIgine</span>
    </div>
  )
}

export function HeaderLogoIcon(props: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className="flex items-center gap-2" {...props}>
            <div className="relative h-8 w-8">
                <Home className="h-full w-full text-primary" />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-primary/80" />
            </div>
            <span className="hidden sm:inline text-xl font-bold tracking-tight">RoomAIgine</span>
        </div>
    )
}


export { Wand2 as GenerateIcon, BedDouble, Sofa as LivingRoomIcon, Armchair as OfficeIcon, MoreHorizontal as MoreFiltersIcon };
