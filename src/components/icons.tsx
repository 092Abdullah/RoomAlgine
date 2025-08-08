import type { SVGProps } from "react";
import { Home, Sparkles, Wand2, Palette, BedDouble, Lamp, Sofa, Armchair, MoreHorizontal } from 'lucide-react';

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="relative h-8 w-8">
      <Home {...props} className="h-full w-full text-primary" />
      <Sparkles {...props} className="absolute -top-1 -right-1 h-4 w-4 text-accent" />
    </div>
  )
}


export { Wand2 as GenerateIcon, Palette, BedDouble, Lamp as DeskIcon, Sofa as LivingRoomIcon, Armchair as OfficeIcon, MoreHorizontal as MoreFiltersIcon };
