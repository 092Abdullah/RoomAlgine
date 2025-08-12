
"use client";

import { useState, useRef, type ChangeEvent, useEffect } from "react";
import Image from "next/image";
import {
  Upload,
  Download,
  Share2,
  Camera,
  Paintbrush,
  Sparkles,
  RefreshCw,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { generateRoomStylesAction, detectRoomTypeAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { GenerateIcon, BedDouble, LivingRoomIcon, OfficeIcon, MoreFiltersIcon, LogoIcon } from "./icons";
import { motion } from "framer-motion";
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Helix } from 'ldrs/react'

type GeneratedImage = {
  style: string;
  imageDataUri: string;
};

const designStyles = ["Minimalist", "Luxury", "Cozy", "Industrial", "Bohemian", "Coastal", "Scandinavian", "Eclectic"];
const roomTypes = [
  { id: 'bedroom', label: 'Bedroom', icon: BedDouble },
  { id: 'living-room', label: 'Living Room', icon: LivingRoomIcon },
  { id: 'kitchen', label: 'Kitchen', icon: CookingPot },
  { id: 'bathroom', label: 'Bathroom', icon: Bath },
  { id: 'office', label: 'Office', icon: OfficeIcon },
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

const AppHeader = ({ onGenerateNew, showGenerateButton }: { onGenerateNew: () => void, showGenerateButton: boolean }) => (
    <header className="flex justify-between items-center p-4 border-b border-border">
      <Link href="/">
        <LogoIcon />
      </Link>
      {showGenerateButton && (
        <Button variant="outline" onClick={onGenerateNew} size="sm">
          <RefreshCw className="mr-2 h-4 w-4" /> Generate New
        </Button>
      )}
    </header>
);

const UploadScreen = ({ onUploadClick }: { onUploadClick: () => void }) => (
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
        onClick={onUploadClick}
      >
        <Upload className="mr-2 h-5 w-5" /> Upload Your Room
      </Button>
    </motion.section>
);


const RoomAIGineEditor = ({
    uploadedImage,
    selectedStyle,
    setSelectedStyle,
    startGeneration,
    isGenerating,
    activeGeneratedImage,
    generatedImages,
    setActiveGeneratedImage,
    handleDownload,
    handleShare,
    budget,
    setBudget,
    roomType,
    setRoomType,
    isDetectingRoomType,
    selectedColors,
    handleColorSelect,
    selectedMoods,
    setSelectedMoods,
}: any) => {

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 max-w-[1600px] mx-auto p-2 sm:p-4 lg:p-8 flex-grow w-full">
            {/* Left Column */}
            <div className="col-span-1 xl:col-span-3 space-y-4 md:space-y-6">
                <Card className="bg-secondary/50 border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Camera className="h-5 w-5" /> Your Room</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="aspect-video rounded-lg overflow-hidden relative">
                            <Image src={uploadedImage} alt="Uploaded room" fill className="object-cover" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-secondary/50 border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Paintbrush className="h-5 w-5" /> Choose a Style</CardTitle>
                        <CardDescription>Select a style to apply to your room.</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                    className="h-auto p-3 flex-col items-start justify-start rounded-md border-2 border-border data-[state=on]:border-primary data-[state=on]:bg-primary/10"
                                >
                                    <p className="font-semibold text-sm data-[state=on]:text-primary">{style}</p>
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </CardContent>
                    <CardFooter className="flex-col gap-3">
                        <Button onClick={startGeneration} disabled={isGenerating || isDetectingRoomType} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                            {isGenerating ? <Helix size="24" color="#a855f7" /> : <GenerateIcon className="h-4 w-4" />}
                            Generate Style
                        </Button>
                        <Button variant="outline" className="w-full">AI-Powered Ideas</Button>
                        <Button variant="ghost" className="w-full"><MoreFiltersIcon className="h-4 w-4" /> More Filters</Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Middle Column */}
            <div className="col-span-1 xl:col-span-6">
                <Card className="bg-secondary/50 border-border h-full flex flex-col">
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle className="text-lg">Decorated Room</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-center justify-center">
                        {isGenerating ? (
                            <div className="w-full aspect-video flex items-center justify-center">
                                 <Helix size="45" color="#a855f7" />
                            </div>
                        ) : activeGeneratedImage ? (
                            <div className="w-full aspect-video rounded-lg overflow-hidden relative group">
                                <ReactCompareSlider
                                    itemOne={<ReactCompareSliderImage src={uploadedImage} alt="Before image" />}
                                    itemTwo={<ReactCompareSliderImage src={activeGeneratedImage.imageDataUri} alt="After image" />}
                                    className="w-full h-full"
                                />
                                <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 flex gap-2">
                                    <Button size="icon" variant="secondary" onClick={() => handleDownload(activeGeneratedImage!.imageDataUri, activeGeneratedImage!.style)}><Download className="h-4 w-4" /></Button>
                                    <Button size="icon" variant="secondary" onClick={() => handleShare(activeGeneratedImage!.imageDataUri, activeGeneratedImage!.style)}><Share2 className="h-4 w-4" /></Button>
                                </div>
                                <div className="absolute top-2 right-2 md:top-4 md:right-4">
                                    <Badge variant="secondary">{activeGeneratedImage.style}</Badge>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full aspect-video rounded-lg bg-muted flex flex-col items-center justify-center text-center p-4">
                                <Sparkles className="h-12 w-12 text-primary/50 mb-4" />
                                <p className="text-muted-foreground">Your generated designs will appear here.</p>
                                <p className="text-xs text-muted-foreground/50">Select a style and other options to get started.</p>
                            </div>
                        )}
                    </CardContent>
                    {generatedImages.length > 0 && (
                        <CardFooter className="p-2">
                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 w-full">
                                {generatedImages.map((image: GeneratedImage) => (
                                    <button key={image.style} onClick={() => setActiveGeneratedImage(image)} className={`aspect-square rounded-md overflow-hidden ring-2 ring-transparent hover:ring-primary transition-all ${activeGeneratedImage?.style === image.style ? 'ring-primary' : ''}`}>
                                        <Image src={image.imageDataUri} alt={image.style} width={100} height={100} className="object-cover w-full h-full" />
                                    </button>
                                ))}
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </div>

            {/* Right Column */}
             <div className="col-span-1 xl:col-span-3">
                <Card className="bg-secondary/50 border-border">
                    <CardHeader>
                        <CardTitle className="text-lg">Personalize</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label className="mb-2 block">Budget</Label>
                            <div className="flex items-center gap-2 md:gap-4">
                                <span className="text-sm text-muted-foreground">${(budget[0] / 1000)}k</span>
                                <Slider value={budget} onValueChange={setBudget} max={50000} step={1000} />
                                <span className="text-sm text-muted-foreground">$50k</span>
                            </div>
                        </div>
                        <div>
                             <Label className="mb-2 block flex items-center gap-2">
                                Room Type
                                {isDetectingRoomType && <Helix size="16" color="#a855f7" />}
                            </Label>
                            <ToggleGroup type="single" value={roomType} onValueChange={(value) => { if (value) setRoomType(value) }} className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-2">
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
                            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-6 gap-2">
                                {colorPreferences.map((color) => (
                                    <button
                                        key={color.id}
                                        onClick={() => handleColorSelect(color.value)}
                                        className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColors.includes(color.value) ? 'border-primary' : 'border-transparent'}`}
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
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function RoomAIGineClient() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("Minimalist");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [activeGeneratedImage, setActiveGeneratedImage] = useState<GeneratedImage | null>(null);
  const [isDetectingRoomType, setIsDetectingRoomType] = useState(false);

  const [budget, setBudget] = useState([5000]);
  const [roomType, setRoomType] = useState<string>('bedroom');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>(["Relaxed"]);

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // This code runs only on the client
    import('ldrs').then(({ helix }) => helix.register());
  }, []);


  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUri = e.target?.result as string;
        setUploadedImage(dataUri);
        setGeneratedImages([]);
        setActiveGeneratedImage(null);

        // Start room type detection
        setIsDetectingRoomType(true);
        const detectionResult = await detectRoomTypeAction(dataUri);
        if ('roomType' in detectionResult) {
            // Check if the detected room type is one of the available options
            const isValidRoomType = roomTypes.some(rt => rt.id === detectionResult.roomType);
            if (isValidRoomType) {
                setRoomType(detectionResult.roomType);
            } else {
                // Handle cases where the detected room is 'other' or not in our list
                console.warn(`Detected room type "${detectionResult.roomType}" is not a selectable option.`);
                // Optionally, set to a default or 'other' if you add it to roomTypes
            }
        } else {
            toast({
                title: "Room Detection Failed",
                description: detectionResult.error,
                variant: "destructive",
            });
        }
        setIsDetectingRoomType(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateNew = () => {
    setUploadedImage(null);
    setGeneratedImages([]);
    setActiveGeneratedImage(null);
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
      toast({
        title: "No Style Selected",
        description: "Please choose a design style.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    // Keep existing images but deactivate them
    setActiveGeneratedImage(null);

    const result = await generateRoomStylesAction({ 
      styles: [selectedStyle],
      roomType,
      colorPreferences: selectedColors,
      mood: selectedMoods[0]
    }, uploadedImage);


    if ("error" in result) {
      toast({
        title: "Generation Failed",
        description: result.error,
        variant: "destructive",
      });
    } else {
        const newImages = result.styledRoomImages;
        // Add new images, avoiding duplicates by style
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
  }

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


  return (
    <div className="min-h-screen bg-background font-body text-foreground flex flex-col">
      <AppHeader onGenerateNew={handleGenerateNew} showGenerateButton={!!uploadedImage} />
      <main className="flex-grow flex items-center justify-center">
        {!uploadedImage ? (
          <UploadScreen onUploadClick={() => fileInputRef.current?.click()} />
        ) : (
          <RoomAIGineEditor
            uploadedImage={uploadedImage}
            selectedStyle={selectedStyle}
            setSelectedStyle={setSelectedStyle}
            startGeneration={startGeneration}
            isGenerating={isGenerating}
            activeGeneratedImage={activeGeneratedImage}
            generatedImages={generatedImages}
            setActiveGeneratedImage={setActiveGeneratedImage}
            handleDownload={handleDownload}
            handleShare={handleShare}
            budget={budget}
            setBudget={setBudget}
            roomType={roomType}
            setRoomType={setRoomType}
            isDetectingRoomType={isDetectingRoomType}
            selectedColors={selectedColors}
            handleColorSelect={handleColorSelect}
            selectedMoods={selectedMoods}
            setSelectedMoods={setSelectedMoods}
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
