
"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { Heart, Home, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { incrementKudosAction } from '@/app/actions';
import type { Creation } from '@/app/gallery/page';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';

export function GalleryItem({ creation }: { creation: Creation }) {
  const [kudos, setKudos] = useState(creation.kudos);
  const [isKudoed, setIsKudoed] = useState(false);
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    // Format date only on the client to avoid hydration mismatch
    setFormattedDate(new Date(creation.created_at).toLocaleDateString());
  }, [creation.created_at]);

  const handleKudosClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dialog from opening when heart is clicked
    if (isKudoed) {
        toast("Already Appreciated!", {
            description: "You can only give kudos once per design.",
        });
        return;
    }
    
    setIsKudoed(true);
    setKudos(prev => prev + 1);

    const result = await incrementKudosAction(creation.id);

    if (!result.success) {
      // Revert optimistic update on failure
      setKudos(prev => prev - 1);
      setIsKudoed(false);
      toast.error("Error", {
        description: "Could not add your kudos. Please try again.",
      });
    }
  };

  const isInterior = !!creation.room_type;

  return (
    <Dialog>
      <Card className="overflow-hidden group">
        <div className="w-full aspect-video rounded-t-lg overflow-hidden relative">
          <ReactCompareSlider
            className="w-full h-full"
            itemOne={<ReactCompareSliderImage src={creation.original_image_url} alt="Before image" className="object-cover w-full h-full" />}
            itemTwo={<ReactCompareSliderImage src={creation.generated_image_url} alt="After image" className="object-cover w-full h-full" />}
          />
          <button
            onClick={handleKudosClick}
            className="absolute top-2 right-2 z-10 flex items-center gap-1.5 bg-background/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs hover:bg-primary/80 transition-all disabled:opacity-50"
            disabled={isKudoed}
          >
            <Heart className={cn("h-4 w-4", isKudoed ? "text-red-500 fill-red-500" : "text-white")} />
            <span>{kudos}</span>
          </button>
        </div>
        <DialogTrigger asChild>
            <div className="p-4 cursor-pointer">
                <div className="flex items-center justify-between">
                    <Badge variant="secondary">{creation.style}</Badge>
                    <Badge variant="outline" className="flex items-center gap-1.5">
                        {isInterior ? <Home className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                        {isInterior ? creation.room_type : 'Exterior'}
                    </Badge>
                </div>
                {formattedDate && (
                <p className="text-xs text-muted-foreground mt-2">
                    Created {formattedDate}
                </p>
                )}
            </div>
        </DialogTrigger>
      </Card>
      <DialogContent className="max-w-4xl p-2 sm:p-4">
        <DialogHeader className='sr-only'>
            <DialogTitle>Room Transformation</DialogTitle>
            <DialogDescription>
                An enlarged view of the before and after room transformation using AI. Style: {creation.style}. Type: {isInterior ? creation.room_type : 'Exterior'}.
            </DialogDescription>
        </DialogHeader>
        <div className="w-full aspect-video rounded-lg overflow-hidden">
            <ReactCompareSlider
                className="w-full h-full"
                itemOne={<ReactCompareSliderImage src={creation.original_image_url} alt="Before image" className="object-cover w-full h-full" />}
                itemTwo={<ReactCompareSliderImage src={creation.generated_image_url} alt="After image" className="object-cover w-full h-full" />}
            />
        </div>
      </DialogContent>
    </Dialog>
  );
}
