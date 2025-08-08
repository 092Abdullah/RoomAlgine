
"use client";

import { useState, useCallback, useRef, type ChangeEvent } from "react";
import Image from "next/image";
import {
  Upload,
  Download,
  Share2,
  Loader2,
  Camera,
  Paintbrush,
  X,
  Sparkles,
  RefreshCw,
  Home,
  Bath,
  CookingPot,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { generateRoomStylesAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { GenerateIcon, Palette, BedDouble, DeskIcon, LivingRoomIcon, OfficeIcon, MoreFiltersIcon } from "./icons";
import { Skeleton } from "./ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";


type GeneratedImage = {
  style: string;
  imageDataUri: string;
};

const designStyles = ["Minimalist", "Luxury", "Cozy", "Industrial", "Bohemian", "Modern Farmhouse", "Coastal", "Scandinavian", "Mid-Century Modern", "Eclectic"];
const roomTypes = [
  { id: 'bedroom', label: 'Bedroom', icon: BedDouble },
  { id: 'living-room', label: 'Living Room', icon: LivingRoomIcon },
  { id: 'kitchen', label: 'Kitchen', icon: CookingPot },
  { id: 'bathroom', label: 'Bathroom', icon: Bath },
  { id: 'office', label: 'Office', icon: OfficeIcon },
];

const colorPreferences = [
  { id: 'cool-blue', value: '#6096BA', name: 'Cool Blue' },
  { id: 'emerald-green', value: '#52B788', name: 'Emerald Green' },
  { id: 'olive-green', value: '#99A88C', name: 'Olive Green' },
  { id: 'warm-beige', value: '#C9B7A6', name: 'Warm Beige' },
  { id: 'terracotta-red', value: '#BA6D3B', name: 'Terracotta Red' },
  { id: 'sunset-orange', value: '#F4A261', name: 'Sunset Orange' },
];

const iNeedOptions = ["Desk", "Storage", "Child-Friendly", "Pet-Friendly"];
const moodOptions = ["Relaxed", "Energetic", "Romantic", "Productive"];

export default function RoomAIGineClient() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["Mid-Century Modern"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [activeGeneratedImage, setActiveGeneratedImage] = useState<GeneratedImage | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  
  const [budget, setBudget] = useState([10000]);
  const [roomType, setRoomType] = useState<string>('bedroom');
  const [selectedColors, setSelectedColors] = useState<string[]>(['#6096BA']);
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>(["Relaxed"]);


  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setGeneratedImages([]);
        setSelectedImage(null);
        setActiveGeneratedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStyleToggle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : [...prev, style]
    );
  };
  
  const handleNeedToggle = (need: string) => {
    setSelectedNeeds((prev) =>
      prev.includes(need)
        ? prev.filter((n) => n !== need)
        : [...prev, need]
    );
  };

  const handleColorSelect = (colorValue: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorValue) ? prev.filter((c) => c !== colorValue) : [...prev, colorValue]
    );
  };


  const startGeneration = async () => {
    if (selectedStyles.length === 0) {
      toast({
        title: "No Styles Selected",
        description: "Please choose at least one design style.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);
    setActiveGeneratedImage(null);

    const result = await generateRoomStylesAction({ 
      styles: selectedStyles,
      roomType,
      colorPreferences: selectedColors,
      mood: selectedMoods[0] // Assuming single mood selection for now
    }, uploadedImage);


    if ("error" in result) {
      toast({
        title: "Generation Failed",
        description: result.error,
        variant: "destructive",
      });
    } else {
      setGeneratedImages(result.styledRoomImages);
      if (result.styledRoomImages.length > 0) {
        setActiveGeneratedImage(result.styledRoomImages[0]);
      }
    }
    setIsGenerating(false);
  }

  const handleImageSelect = useCallback((image: GeneratedImage) => {
    setSelectedImage(image);
  }, []);


  const handleDownload = (imageDataUri: string, style: string) => {
    const link = document.createElement("a");
    link.href = imageDataUri;
    link.download = `RoomAIgine-${style}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async (imageDataUri: string, style: string) => {
    try {
        const response = await fetch(imageDataUri);
        const blob = await response.blob();
        const file = new File([blob], `RoomAIgine-${style}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: `My ${style} room design from RoomAIgine!`,
                text: 'Check out my new room design created with AI.',
                files: [file],
            });
        } else {
            toast({
                title: 'Sharing not supported',
                description: 'Your browser does not support sharing files.',
            });
        }
    } catch (error) {
        toast({
            title: 'Sharing failed',
            description: 'Could not share the image.',
            variant: 'destructive',
        });
    }
  };


  if (!uploadedImage) {
    return (
      <div className="min-h-screen bg-background font-body flex items-center justify-center">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-center max-w-2xl mx-auto p-4"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            Visualize Your Dream Room
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Upload a photo of your room, pick your favorite styles, and let
            our AI bring your vision to life in seconds.
          </p>
          <Button
            size="lg"
            className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-5 w-5" /> Upload Your Room
          </Button>
          <Input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
        </motion.section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body text-foreground p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-12 gap-6 max-w-[1600px] mx-auto">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <Card className="bg-secondary/50 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Camera /> Your Room</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg overflow-hidden relative">
                <Image src={uploadedImage} alt="Uploaded room" fill className="object-cover" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-secondary/50 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Paintbrush /> Choose Styles</CardTitle>
              <CardDescription>Select one or more styles to apply.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {designStyles.map((style) => (
                  <div key={style} className="flex items-center space-x-2">
                    <Checkbox id={style} checked={selectedStyles.includes(style)} onCheckedChange={() => handleStyleToggle(style)} />
                    <Label htmlFor={style} className="text-sm cursor-pointer">{style}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button onClick={startGeneration} disabled={isGenerating} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {isGenerating ? <Loader2 className="animate-spin" /> : <GenerateIcon />}
                Generate Styles
              </Button>
              <Button variant="outline" className="w-full">AI-Powered Ideas</Button>
              <Button variant="ghost" className="w-full"><MoreFiltersIcon /> More Filters</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Middle Column */}
        <div className="col-span-12 lg:col-span-6">
          <Card className="bg-secondary/50 border-border h-full flex flex-col">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-lg">Decored Room</CardTitle>
              <Button variant="ghost" size="sm">RoomAIgine &gt;</Button>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
              {isGenerating ? (
                <div className="w-full aspect-video flex items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : activeGeneratedImage ? (
                <div className="w-full aspect-video rounded-lg overflow-hidden relative group">
                  <ReactCompareSlider
                    itemOne={<ReactCompareSliderImage src={uploadedImage} alt="Before image" />}
                    itemTwo={<ReactCompareSliderImage src={activeGeneratedImage.imageDataUri} alt="After image" />}
                    className="w-full h-full"
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <Button size="icon" variant="secondary" onClick={() => handleDownload(activeGeneratedImage!.imageDataUri, activeGeneratedImage!.style)}><Download /></Button>
                    <Button size="icon" variant="secondary" onClick={() => handleShare(activeGeneratedImage!.imageDataUri, activeGeneratedImage!.style)}><Share2 /></Button>
                  </div>
                   <div className="absolute top-4 right-4">
                    <Badge variant="secondary">{activeGeneratedImage.style}</Badge>
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-video rounded-lg bg-muted flex flex-col items-center justify-center text-center p-4">
                   <Sparkles className="h-12 w-12 text-primary/50 mb-4" />
                   <p className="text-muted-foreground">Your generated designs will appear here.</p>
                   <p className="text-xs text-muted-foreground/50">Use the panel on the right to customize your generation.</p>
                </div>
              )}
            </CardContent>
            {generatedImages.length > 0 && (
                 <CardFooter className="p-2">
                    <div className="grid grid-cols-5 gap-2 w-full">
                        {generatedImages.map((image) => (
                            <button key={image.style} onClick={() => setActiveGeneratedImage(image)} className={`aspect-square rounded-md overflow-hidden ring-2 ring-transparent hover:ring-primary transition-all ${activeGeneratedImage?.style === image.style ? 'ring-primary' : ''}`}>
                                <Image src={image.imageDataUri} alt={image.style} width={100} height={100} className="object-cover w-full h-full"/>
                            </button>
                        ))}
                    </div>
                </CardFooter>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-3">
          <Card className="bg-secondary/50 border-border">
            <CardHeader>
              <CardTitle className="text-lg">Personalize</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-2 block">Budget</Label>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">${(budget[0] / 1000)}k</span>
                    <Slider value={budget} onValueChange={setBudget} max={550000} step={1000} />
                    <span className="text-sm text-muted-foreground">$550k</span>
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Room Type</Label>
                <ToggleGroup type="single" value={roomType} onValueChange={(value) => { if(value) setRoomType(value)}} className="grid grid-cols-5 gap-1">
                  {roomTypes.map(({ id, label, icon: Icon }) => (
                    <ToggleGroupItem key={id} value={id} aria-label={label} className="flex-col h-auto p-2 text-xs gap-1">
                      <Icon className="h-5 w-5" />
                      {label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
              <div>
                <Label className="mb-2 block">Color Preferences</Label>
                 <div className="flex gap-2">
                    {colorPreferences.map((color) => (
                      <button key={color.id} onClick={() => handleColorSelect(color.value)} className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColors.includes(color.value) ? 'border-primary' : 'border-transparent'}`} style={{ backgroundColor: color.value }} />
                    ))}
                 </div>
              </div>
              <div>
                <Label className="mb-2 block">Mood-Based Design</Label>
                 <ToggleGroup type="multiple" value={selectedMoods} onValueChange={setSelectedMoods} className="grid grid-cols-2 gap-2">
                    {moodOptions.map((mood) => (
                      <ToggleGroupItem key={mood} value={mood} className="w-full">{mood}</ToggleGroupItem>
                    ))}
                 </ToggleGroup>
              </div>
              <div>
                <Label className="mb-2 block">I Need</Label>
                 <div className="grid grid-cols-2 gap-2">
                    {iNeedOptions.map((need) => (
                         <div key={need} className="flex items-center space-x-2">
                            <Checkbox id={need} checked={selectedNeeds.includes(need)} onCheckedChange={() => handleNeedToggle(need)} />
                            <Label htmlFor={need} className="text-sm font-light cursor-pointer">{need}</Label>
                        </div>
                    ))}
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

       <Dialog open={!!selectedImage} onOpenChange={(isOpen) => !isOpen && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          {selectedImage && uploadedImage && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedImage.style} Design</DialogTitle>
              </DialogHeader>
              <div className="my-4">
                <ReactCompareSlider
                  itemOne={<ReactCompareSliderImage src={uploadedImage} alt="Before image" />}
                  itemTwo={<ReactCompareSliderImage src={selectedImage.imageDataUri} alt="After image" />}
                  className="aspect-video rounded-lg overflow-hidden"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button onClick={() => handleDownload(selectedImage.imageDataUri, selectedImage.style)}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
                <Button variant="outline" onClick={() => handleShare(selectedImage.imageDataUri, selectedImage.style)}>
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
