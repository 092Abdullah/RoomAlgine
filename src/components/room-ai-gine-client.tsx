
"use client";

import { useState, useRef, type ChangeEvent, useEffect, type DragEvent } from "react";
import { useSearchParams, useRouter } from 'next/navigation'
import Image from "next/image";
import {
  Upload,
  Download,
  Share2,
  Camera,
  Sparkles,
  RefreshCw,
  Bath,
  CookingPot,
  Lightbulb,
  X,
  GalleryThumbnails,
  Expand,
  ArrowRight,
  UtensilsCrossed
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { generateRoomStylesAction, detectRoomTypeAction, suggestStylesAction, publishToGalleryAction, deleteCreationAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { GenerateIcon, BedDouble, LivingRoomIcon, OfficeIcon, MoreFiltersIcon, HeaderLogoIcon } from "./icons";
import { motion, AnimatePresence } from "framer-motion";
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Link from "next/link";
import { Helix } from 'ldrs/react'
import { Separator } from "./ui/separator";
import type { PublishToGalleryInput } from "@/app/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ThemeSwitcher } from "./theme-switcher";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { cn } from "@/lib/utils";

type GeneratedImage = {
  style: string;
  imageDataUri: string;
};

type StyleSuggestion = {
    style: string;
    colorCombo: string;
};

const designStyles = ["Minimalist", "Luxury", "Cozy", "Industrial", "Bohemian", "Coastal", "Scandinavian", "Eclectic"];
const roomTypes = [
  { id: 'bedroom', label: 'Bedroom', icon: BedDouble },
  { id: 'living-room', label: 'Living Room', icon: LivingRoomIcon },
  { id: 'kitchen', label: 'Kitchen', icon: CookingPot },
  { id: 'bathroom', label: 'Bathroom', icon: Bath },
  { id: 'office', label: 'Office', icon: OfficeIcon },
  { id: 'dining-room', label: 'Dining Room', icon: UtensilsCrossed },
];

const colorPreferences = [
  { id: 'soft-ivory', value: '#F8F4EF', name: 'Soft Ivory' },
  { id: 'warm-beige', value: '#DCC7AA', name: 'Warm Beige' },
  { id: 'light-gray', value: '#D3D3D3', name: 'Light Gray' },
  { id: 'charcoal', value: '#333333', name: 'Charcoal' },
  { id: 'terracotta', value: '#E07A5F', name: 'Terracotta' },
  { id: 'blush-pink', value: '#F2C6C2', name: 'Blush Pink' },
  { id: 'mustard-yellow', value: '#E6B325', name: 'Mustard Yellow' },
  { id: 'burnt-orange', value: '#C84B31', name: 'Burnt Orange' },
  { id: 'sage-green', value: '#A3B18A', name: 'Sage Green' },
  { id: 'forest-green', value: '#3A5A40', name: 'Forest Green' },
  { id: 'dusty-blue', value: '#7DA0B6', name: 'Dusty Blue' },
  { id: 'navy-blue', value: '#1D3557', name: 'Navy Blue' },
  { id: 'emerald', value: '#2D6A4F', name: 'Emerald' },
  { id: 'deep-plum', value: '#5A189A', name: 'Deep Plum' },
  { id: 'teal', value: '#008080', name: 'Teal' },
  { id: 'coral', value: '#FF6B6B', name: 'Coral' },
];

const moodOptions = ["Relaxed", "Energetic", "Romantic", "Productive"];

const AppHeader = ({ onGenerateNew, showGenerateButton }: { onGenerateNew: () => void, showGenerateButton: boolean }) => {
    const scrollDirection = useScrollDirection();
    return (
        <header className={cn(
            "fixed top-4 left-0 right-0 z-50 transition-transform duration-300",
            scrollDirection === "down" ? "-translate-y-24" : "translate-y-0"
        )}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="floating-header">
                    <Link href="/">
                        <HeaderLogoIcon />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild className="p-2 sm:px-4">
                            <Link href="/gallery">
                                <GalleryThumbnails className="h-4 w-4 md:mr-2" />
                                <span className="hidden md:inline">Gallery</span>
                            </Link>
                        </Button>
                        {showGenerateButton && (
                        <Button variant="ghost" onClick={onGenerateNew} className="hidden md:inline-flex">
                            <RefreshCw className="mr-2 h-4 w-4" /> Generate New
                        </Button>
                        )}
                        <ThemeSwitcher />
                        {showGenerateButton && (
                             <div className="md:hidden">
                                <Button onClick={onGenerateNew} size="icon">
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

const UploadScreen = ({ onUploadClick, onFileDrop }: { onUploadClick: () => void, onFileDrop: (file: File) => void }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileDrop(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center max-w-2xl mx-auto p-4 w-full"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div className={cn(
                "w-full h-full border-2 border-dashed rounded-xl p-8 sm:p-12 transition-colors duration-300",
                isDragging ? "border-primary bg-primary/10" : "border-border"
            )}>
                <div className="flex flex-col items-center justify-center pointer-events-none">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <h1 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                        Drag & Drop Your Room Photo
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        or click to select a file
                    </p>
                    <Button
                        size="lg"
                        className="mt-6 pointer-events-auto"
                        onClick={onUploadClick}
                    >
                        <Upload className="mr-2 h-5 w-5" /> Upload Your Room
                    </Button>
                </div>
            </div>
        </motion.section>
    );
};


const RoomAIGineEditor = ({
    uploadedImage,
    selectedStyle,
    setSelectedStyle,
    startGeneration,
    isLoading,
    loadingMessage,
    activeGeneratedImage,
    generatedImages,
    setActiveGeneratedImage,
    handleDownload,
    handleShare,
    handlePublish,
    isPublishing,
    roomType,
    setRoomType,
    isDetectingRoomType,
    selectedColors,
    handleColorSelect,
    setSelectedColors,
    selectedMoods,
    setSelectedMoods,
    priceRange,
    setPriceRange,
    getAIStyleIdeas,
    isSuggesting,
    styleSuggestions,
    setStyleSuggestions,
}: any) => {

    const handleSuggestionClick = (suggestion: StyleSuggestion) => {
        if (designStyles.includes(suggestion.style)) {
            setSelectedStyle(suggestion.style);
        }

        const suggestedColorNames = suggestion.colorCombo
          .toLowerCase()
          .split(',')
          .map(name => name.trim());
    
        const colorValuesToSelect = colorPreferences
          .filter(c => suggestedColorNames.includes(c.name.toLowerCase()))
          .map(c => c.value);
        
        setSelectedColors(colorValuesToSelect);
    };
    
    const closeSuggestions = () => {
        setStyleSuggestions([]);
        setSelectedStyle("Minimalist");
        setSelectedColors([]);
    };

    const formatCurrency = (value: number) => {
        if (value >= 1000) {
            return `$${Math.round(value / 1000)}k`;
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 max-w-[1600px] mx-auto p-2 sm:p-4 lg:p-6 flex-grow w-full">
            {/* Left Column */}
            <div className="col-span-1 xl:col-span-3 space-y-4 md:space-y-6">
                <Card className="bg-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Camera className="h-5 w-5" /> Your Room</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="aspect-video rounded-lg overflow-hidden relative">
                            <Image src={uploadedImage} alt="Uploaded room" fill className="object-cover" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">Choose a Style</CardTitle>
                        <CardDescription>Select a style or get ideas from our AI.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AnimatePresence>
                            {isSuggesting && (
                                <motion.div
                                    key="suggestion-loader"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center justify-center p-4"
                                >
                                    <Helix size="24" color="hsl(var(--primary))" />
                                    <p className="ml-2 text-sm text-muted-foreground">Getting ideas...</p>
                                </motion.div>
                            )}
                            {styleSuggestions.length > 0 && (
                                <motion.div
                                    key="suggestions"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mb-4 relative"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-sm font-semibold flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-400"/> AI Suggestions</h4>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={closeSuggestions}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        {styleSuggestions.map((suggestion: StyleSuggestion) => (
                                            <button 
                                                key={suggestion.style} 
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className={`w-full text-left p-2 rounded-md border-2 bg-secondary hover:border-primary transition-all ${selectedStyle === suggestion.style ? 'border-primary' : 'border-border'}`}
                                            >
                                                <p className="font-semibold text-primary text-sm">{suggestion.style}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{suggestion.colorCombo}</p>
                                            </button>
                                        ))}
                                    </div>
                                    <Separator className="my-4" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <ToggleGroup
                            type="single"
                            value={selectedStyle}
                            onValueChange={(style) => {
                                if (style) setSelectedStyle(style);
                            }}
                            className="grid grid-cols-2 gap-3"
                        >
                            {designStyles.map((style) => (
                                <ToggleGroupItem
                                    key={style}
                                    value={style}
                                    className="h-auto p-3 flex-col items-start justify-start rounded-md border data-[state=on]:border-primary data-[state=on]:bg-accent"
                                >
                                    <p className="font-semibold text-sm data-[state=on]:text-accent-foreground">{style}</p>
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </CardContent>
                    <CardFooter className="flex-col gap-3">
                        <Button onClick={startGeneration} disabled={isLoading || isSuggesting} className="w-full">
                            {isLoading ? <Helix size="24" color="#FFFFFF" /> : <GenerateIcon className="h-4 w-4" />}
                            {isLoading ? 'Generating...' : 'Generate Style'}
                        </Button>
                        <Button onClick={getAIStyleIdeas} variant="outline" className="w-full" disabled={isSuggesting || isLoading}>
                            AI-Powered Ideas
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Middle Column */}
            <div className="col-span-1 xl:col-span-6">
                 <Dialog>
                    <Card className="bg-card h-full flex flex-col">
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle className="text-lg">Decorated Room</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow flex items-center justify-center p-2 sm:p-4">
                            {isLoading ? (
                                <div className="w-full aspect-video flex flex-col items-center justify-center text-center">
                                     <Helix size="45" color="hsl(var(--primary))" />
                                     <p className="mt-4 text-muted-foreground">{loadingMessage}</p>
                                </div>
                            ) : activeGeneratedImage ? (
                                <div className="w-full aspect-video rounded-lg overflow-hidden relative group">
                                    <ReactCompareSlider
                                        className="w-full h-full"
                                        itemOne={<ReactCompareSliderImage src={uploadedImage} alt="Before image" className="object-cover w-full h-full"/>}
                                        itemTwo={<ReactCompareSliderImage src={activeGeneratedImage.imageDataUri} alt="After image" className="object-cover w-full h-full"/>}
                                    />
                                    <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 flex gap-2">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <DialogTrigger asChild>
                                                    <Button size="icon" variant="secondary"><Expand className="h-4 w-4" /></Button>
                                                </DialogTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Expand</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" variant="secondary" onClick={() => handleDownload(activeGeneratedImage!.imageDataUri, activeGeneratedImage!.style)}><Download className="h-4 w-4" /></Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Download</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                 <Button size="icon" variant="secondary" onClick={() => handleShare(activeGeneratedImage!.imageDataUri, activeGeneratedImage!.style)}><Share2 className="h-4 w-4" /></Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Share</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" variant="secondary" onClick={() => handlePublish(activeGeneratedImage)} disabled={isPublishing}>
                                                    {isPublishing ? <Helix size={18} /> : <GalleryThumbnails className="h-4 w-4" />}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Publish to Public Gallery</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    </div>
                                    <div className="absolute top-2 right-2 md:top-4 md:right-4">
                                        <Badge variant="secondary">{activeGeneratedImage.style}</Badge>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full aspect-video rounded-lg bg-muted/30 flex flex-col items-center justify-center text-center p-4">
                                    <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                    <p className="text-muted-foreground">Your generated designs will appear here.</p>
                                    <p className="text-xs text-muted-foreground/50 mt-2">Select a style and other options to get started.</p>
                                </div>
                            )}
                        </CardContent>
                        {generatedImages.length > 0 && !isLoading && (
                            <CardFooter className="p-2 overflow-x-auto">
                                <div className="flex gap-2 w-max p-2">
                                    {generatedImages.map((image: GeneratedImage) => (
                                        <button key={image.style} onClick={() => setActiveGeneratedImage(image)} className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden ring-2 ring-transparent hover:ring-primary transition-all ${activeGeneratedImage?.style === image.style ? 'ring-primary' : ''}`}>
                                            <Image src={image.imageDataUri} alt={image.style} width={100} height={100} className="object-cover w-full h-full" />
                                        </button>
                                    ))}
                                </div>
                            </CardFooter>
                        )}
                    </Card>
                    {activeGeneratedImage && (
                        <DialogContent className="max-w-4xl p-2 sm:p-4">
                            <DialogHeader className='sr-only'>
                                <DialogTitle>Room Transformation</DialogTitle>
                                <DialogDescription>
                                    An enlarged view of the before and after room transformation using AI. Style: {activeGeneratedImage.style}.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="w-full aspect-video rounded-lg overflow-hidden">
                                <ReactCompareSlider
                                    className="w-full h-full"
                                    itemOne={<ReactCompareSliderImage src={uploadedImage} alt="Before image" className="object-cover w-full h-full"/>}
                                    itemTwo={<ReactCompareSliderImage src={activeGeneratedImage.imageDataUri} alt="After image" className="object-cover w-full h-full"/>}
                                />
                            </div>
                        </DialogContent>
                    )}
                 </Dialog>
            </div>

            {/* Right Column */}
             <div className="col-span-1 xl:col-span-3">
                <Card className="bg-card">
                    <CardHeader>
                        <CardTitle className="text-lg">Personalize</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div>
                             <Label className="mb-2 block flex items-center gap-2">
                                Room Type
                                {isDetectingRoomType && <Helix size="16" color="hsl(var(--primary))" />}
                            </Label>
                            <ToggleGroup type="single" value={roomType} onValueChange={(value) => { if (value) setRoomType(value) }} className="grid grid-cols-3 gap-2">
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
                            <div className="grid grid-cols-6 sm:grid-cols-5 md:grid-cols-6 gap-2">
                                {colorPreferences.map((color) => (
                                    <button
                                        key={color.id}
                                        onClick={() => handleColorSelect(color.value)}
                                        className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColors.includes(color.value) ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background' : 'border-transparent'}`}
                                        style={{ backgroundColor: color.value }}
                                        aria-label={color.name}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label className="mb-2 block">Mood</Label>
                            <ToggleGroup type="single" value={selectedMoods[0]} onValueChange={(mood) => {if(mood) setSelectedMoods([mood])}} className="grid grid-cols-2 gap-2">
                                {moodOptions.map((mood) => (
                                    <ToggleGroupItem key={mood} value={mood} className="w-full">{mood}</ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        </div>
                        <div>
                            <Label htmlFor="price-range" className="mb-2 block">Price Range</Label>
                            <Slider
                                id="price-range"
                                min={0}
                                max={50000}
                                step={100}
                                value={[priceRange]}
                                onValueChange={(value) => setPriceRange(value[0])}
                                className="my-4"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{formatCurrency(priceRange)}</span>
                                <span>{formatCurrency(50000)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function RoomAIGineClient() {
  const router = useRouter();
  const searchParams = useSearchParams()
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("Minimalist");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [activeGeneratedImage, setActiveGeneratedImage] = useState<GeneratedImage | null>(null);
  const [isDetectingRoomType, setIsDetectingRoomType] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  
  const [roomType, setRoomType] = useState<string>('bedroom');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>(["Relaxed"]);
  const [priceRange, setPriceRange] = useState<number>(10000);

  const [isSuggesting, setIsSuggesting] = useState(false);
  const [styleSuggestions, setStyleSuggestions] = useState<StyleSuggestion[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // This code runs only on the client
    import('ldrs').then(ldrs => ldrs.helix.register());

    const image = searchParams.get('image');
    if (image) {
      // In a real app, you might fetch the image data from a URL
      // For simplicity here, we assume it's a data URI passed for demo purposes
      // setUploadedImage(image);
    }
  }, [searchParams]);

  const isLoading = isDetectingRoomType || isGenerating;

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid File Type", {
        description: "Please upload an image file (e.g., JPG, PNG).",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUri = e.target?.result as string;
      setUploadedImage(dataUri);
      setGeneratedImages([]);
      setActiveGeneratedImage(null);
      setStyleSuggestions([]);

      setIsDetectingRoomType(true);
      setLoadingMessage("Detecting room type...");

      const detectionResult = await detectRoomTypeAction(dataUri);
      if ('roomType' in detectionResult) {
          const isValidRoomType = roomTypes.some(rt => rt.id === detectionResult.roomType);
          if (isValidRoomType) {
              setRoomType(detectionResult.roomType);
          } else {
              console.warn(`Detected room type "${detectionResult.roomType}" is not a selectable option.`);
          }
      } else {
          toast.error("Room Detection Failed", {
              description: detectionResult.error,
          });
      }
      setIsDetectingRoomType(false);
      setLoadingMessage("");
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileDrop = (file: File) => {
    if (file) {
      processFile(file);
    }
  };

  const handleGenerateNew = () => {
    setUploadedImage(null);
    setGeneratedImages([]);
    setActiveGeneratedImage(null);
    setStyleSuggestions([]);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleColorSelect = (colorValue: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorValue) ? prev.filter((c) => c !== colorValue) : [...prev, colorValue]
    );
  };


  const startGeneration = async () => {
    if (!selectedStyle) {
      toast.error("No Style Selected", {
        description: "Please choose a design style.",
      });
      return;
    }

    setIsGenerating(true);
    setLoadingMessage(`Generating your new ${selectedStyle} room...`);
    setActiveGeneratedImage(null);

    const result = await generateRoomStylesAction({ 
      styles: [selectedStyle],
      roomType,
      colorPreferences: selectedColors.map(hex => colorPreferences.find(c => c.value === hex)?.name).filter(Boolean) as string[],
      mood: selectedMoods[0],
      priceRange: `$${priceRange.toLocaleString()}`,
    }, uploadedImage);


    if ("error" in result) {
      toast.error("Generation Failed", {
        description: result.error,
      });
    } else {
        const newImages = result.styledRoomImages;
        setGeneratedImages(prevImages => {
            const existingStyles = new Set(prevImages.map(img => img.style));
            const filteredNewImages = newImages.filter(img => !existingStyles.has(img.style));
            return [...prevImages, ...filteredNewImages];
        });

      if (newImages.length > 0) {
        setActiveGeneratedImage(newImages[0]);
      }
    }
    setIsGenerating(false);
    setLoadingMessage('');
  }

  const getAIStyleIdeas = async () => {
    if (!uploadedImage) return;
    setIsSuggesting(true);
    setStyleSuggestions([]);

    const availableColorNames = colorPreferences.map(c => c.name);

    const result = await suggestStylesAction({
      photoDataUri: uploadedImage,
      roomType: roomType,
      availableColors: availableColorNames,
    });

    if ('error' in result) {
        toast.error("Suggestion Failed", {
            description: result.error,
        });
    } else if (result.suggestions) {
        setStyleSuggestions(result.suggestions);
    }
    setIsSuggesting(false);
  };

  const handlePublish = async (imageToPublish: GeneratedImage) => {
    if (!uploadedImage || !imageToPublish) return;

    setIsPublishing(true);
    const result = await publishToGalleryAction({
        originalImageDataUri: uploadedImage,
        generatedImageDataUri: imageToPublish.imageDataUri,
        style: imageToPublish.style,
        roomType: roomType,
    });

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
                        toast.error("Undo failed.", {
                            description: deleteResult.error
                        });
                    }
                },
            },
        });
    } else {
        toast.error("Publishing Failed", {
            description: result.error,
        });
    }
    setIsPublishing(false);
  };

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
            toast('Sharing not supported', {
                description: 'Your browser does not support sharing files.',
            });
        }
    } catch (error) {
        toast.error('Sharing failed', {
            description: 'Could not share the image.',
        });
    }
  };


  return (
    <div className="min-h-screen bg-background font-body text-foreground flex flex-col">
      <AppHeader onGenerateNew={handleGenerateNew} showGenerateButton={!!uploadedImage} />
      <main className="flex-grow flex items-center justify-center pt-24">
        {!uploadedImage ? (
          <UploadScreen
            onUploadClick={() => fileInputRef.current?.click()}
            onFileDrop={handleFileDrop}
          />
        ) : (
          <RoomAIGineEditor
            uploadedImage={uploadedImage}
            selectedStyle={selectedStyle}
            setSelectedStyle={setSelectedStyle}
            startGeneration={startGeneration}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            activeGeneratedImage={activeGeneratedImage}
            generatedImages={generatedImages}
            setActiveGeneratedImage={setActiveGeneratedImage}
            handleDownload={handleDownload}
            handleShare={handleShare}
            handlePublish={handlePublish}
            isPublishing={isPublishing}
            roomType={roomType}
            setRoomType={setRoomType}
            isDetectingRoomType={isDetectingRoomType}
            selectedColors={selectedColors}
            handleColorSelect={handleColorSelect}
            setSelectedColors={setSelectedColors}
            selectedMoods={selectedMoods}
            setSelectedMoods={setSelectedMoods}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            getAIStyleIdeas={getAIStyleIdeas}
            isSuggesting={isSuggesting}
            styleSuggestions={styleSuggestions}
            setStyleSuggestions={setStyleSuggestions}
          />
        )}
         <Input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
      </main>
    </div>
  );
}

    