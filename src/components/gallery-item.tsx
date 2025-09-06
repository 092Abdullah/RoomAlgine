
"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { Heart, Home, Building2, GalleryThumbnails, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { incrementKudosAction, publishToGalleryAction, deleteCreationAction, deleteDesignAction } from '@/app/actions';
import type { Creation } from '@/app/gallery/page';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Helix } from 'ldrs/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function GalleryItem({ creation, isDashboardItem = false }: { creation: Creation, isDashboardItem?: boolean }) {
  const [kudos, setKudos] = useState(creation.kudos || 0);
  const [isKudoed, setIsKudoed] = useState(false);
  const [formattedDate, setFormattedDate] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImageBroken, setIsImageBroken] = useState(false);


  useEffect(() => {
    setFormattedDate(new Date(creation.created_at).toLocaleDateString());
  }, [creation.created_at]);

  const handleKudosClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (isKudoed) {
        toast("Already Appreciated!", { description: "You can only give kudos once per design." });
        return;
    }
    
    setIsKudoed(true);
    setKudos(prev => prev + 1);
    const result = await incrementKudosAction(creation.id);

    if (!result.success) {
      setKudos(prev => prev - 1);
      setIsKudoed(false);
      toast.error("Error", { description: "Could not add your kudos. Please try again." });
    }
  };

  const handlePublish = async () => {
      setIsPublishing(true);
      const result = await publishToGalleryAction({ designId: creation.id });

      if (result.success && result.creationId) {
          const creationId = result.creationId;
          toast("Published to Gallery!", {
              description: "Your creation is now live for others to see.",
              action: {
                  label: "Undo",
                  onClick: async () => {
                      toast.dismiss();
                      const deleteResult = await deleteCreationAction(creationId);
                      if (deleteResult.success) {
                          toast.success("Publication reverted.");
                      } else {
                          toast.error("Undo failed.", { description: deleteResult.error });
                      }
                  },
              },
          });
      } else {
          toast.error("Publishing Failed", { description: result.error });
      }
      setIsPublishing(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteDesignAction(creation.id);
    if (result.success) {
        toast.success("Design deleted successfully.");
    } else {
        toast.error("Deletion Failed", { description: result.error });
    }
    setIsDeleting(false);
  }

  const handleImageError = () => {
    setIsImageBroken(true);
  };

  if (isImageBroken) {
    return null;
  }

  const isInterior = !!creation.room_type;

  return (
    <Dialog>
      <Card className="overflow-hidden group">
        <div className="w-full aspect-video rounded-t-lg overflow-hidden relative">
          <ReactCompareSlider
            className="w-full h-full"
            itemOne={<ReactCompareSliderImage src={creation.original_image_url} alt="Before image" className="object-contain w-full h-full" onError={handleImageError} />}
            itemTwo={<ReactCompareSliderImage src={creation.generated_image_url} alt="After image" className="object-contain w-full h-full" onError={handleImageError}/>}
          />
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            {!isDashboardItem ? (
              <button
                  onClick={handleKudosClick}
                  className="flex items-center gap-1.5 bg-background/70 backdrop-blur-sm text-white px-2 py-1 h-8 rounded-full text-xs hover:bg-primary/80 transition-all disabled:opacity-50"
                  disabled={isKudoed}
              >
                  <Heart className={cn("h-4 w-4", isKudoed ? "text-red-500 fill-red-500" : "text-white")} />
                  <span>{kudos}</span>
              </button>
            ) : (
              <>
                <AlertDialog>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                         <AlertDialogTrigger asChild>
                            <Button
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8"
                                disabled={isPublishing}
                            >
                                {isPublishing ? <Helix size={18} /> : <GalleryThumbnails className="h-4 w-4" />}
                            </Button>
                         </AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                          <p>Publish to Public Gallery</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>Publish to Gallery?</AlertDialogTitle>
                          <AlertDialogDescription>
                              This will make your design visible to everyone in the public gallery. Are you sure you want to proceed?
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handlePublish} disabled={isPublishing}>
                              {isPublishing ? 'Publishing...' : 'Publish'}
                          </AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                           <Button size="icon" variant="destructive" className="h-8 w-8" disabled={isDeleting}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete Design</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your design
                        from your history. It will not be removed from the public gallery if already published.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? 'Deleting...' : 'Continue'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
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
        <div className="w-full h-full flex justify-center items-center">
            <ReactCompareSlider
                className="w-full h-full"
                itemOne={<ReactCompareSliderImage src={creation.original_image_url} alt="Before image" className="object-contain w-full h-full" />}
                itemTwo={<ReactCompareSliderImage src={creation.generated_image_url} alt="After image" className="object-contain w-full h-full" />}
            />
        </div>
      </DialogContent>
    </Dialog>
  );
}
