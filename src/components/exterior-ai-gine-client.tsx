
"use client";

import { useState, useRef, type ChangeEvent, useEffect, type DragEvent } from "react";
import Image from "next/image";
import {
  Upload,
  Download,
  Share2,
  Camera,
  Sparkles,
  Trees,
  Construction,
  PaintRoller,
  Expand,
  GalleryThumbnails,
  ChevronDown,
  MessageSquare,
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
import { generateExteriorStylesAction, publishToGalleryAction, deleteCreationAction, uploadOriginalImageAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { GenerateIcon } from "./icons";
import { motion } from "framer-motion";
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Helix } from 'ldrs/react';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Textarea } from "./ui/textarea";
import type { User } from "@supabase/supabase-js";
import { Header } from "./header";

type GeneratedImage = {
  designId: string;
  style: string;
  imageDataUri: string;
};

const designStyles = ["Modern", "Traditional", "Farmhouse", "Coastal", "Contemporary", "Craftsman"];
const exteriorTypes = [
    "House Exterior (Facade)",
    "Garden / Backyard",
    "Balcony / Terrace",
    "Driveway & Garage",
    "Poolside / Outdoor Lounge",
    "Fence & Gate Design",
];
const materialOptions = ["Siding", "Brick", "Stone", "Stucco"];
const landscapingOptions = ["Minimal", "Lush", "Modern", "Natural"];

const AppHeader = ({ user }: { user: User | null }) => {
    return (
        <Header user={user} isSliding={true} />
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
                        Drag & Drop Your Home's Photo
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        or click to select a file
                    </p>
                    <Button
                        size="lg"
                        className="mt-6 pointer-events-auto"
                        onClick={onUploadClick}
                    >
                        <Upload className="mr-2 h-5 w-5" /> Upload Photo
                    </Button>
                </div>
            </div>
        </motion.section>
    );
};


const ExteriorAIGineEditor = ({
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
    selectedExteriorType,
    setSelectedExteriorType,
    selectedMaterials,
    setSelectedMaterials,
    selectedLandscaping,
    setSelectedLandscaping,
    userPrompt,
    setUserPrompt,
}: any) => {

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 max-w-[1600px] mx-auto p-2 sm:p-4 lg:p-6 flex-grow w-full">
            <div className="col-span-1 xl:col-span-3 space-y-4 md:space-y-6">
                <Card className="bg-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Camera className="h-5 w-5" /> Your Space</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="rounded-lg overflow-hidden relative bg-muted flex justify-center items-center">
                            <Image src={uploadedImage} alt="Uploaded exterior" width={400} height={400} className="object-contain max-h-[25vh] w-auto" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">Choose a Style</CardTitle>
                        <CardDescription>Select a style for your exterior space.</CardDescription>
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
                                    className="h-auto p-3 flex-col items-start justify-start rounded-md border data-[state=on]:border-primary data-[state=on]:bg-accent"
                                >
                                    <p className="font-semibold text-sm data-[state=on]:text-accent-foreground">{style}</p>
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={startGeneration} disabled={isLoading} className="w-full">
                            {isLoading ? <Helix size={24} color="#FFFFFF" /> : <GenerateIcon className="h-4 w-4" />}
                            {isLoading ? 'Generating...' : 'Generate Style'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <div className="col-span-1 xl:col-span-6">
                 <Dialog>
                    <Card className="bg-card h-full flex flex-col">
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle className="text-lg">Redesigned Exterior</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow flex items-center justify-center p-2 sm:p-4">
                            {isLoading ? (
                                <div className="w-full h-full flex flex-col items-center justify-center text-center">
                                     <Helix size={45} color="hsl(var(--primary))" />
                                     <p className="mt-4 text-muted-foreground">{loadingMessage}</p>
                                </div>
                            ) : activeGeneratedImage ? (
                                <div className="w-full h-full rounded-lg overflow-hidden relative group flex justify-center items-center">
                                    <ReactCompareSlider
                                        className="w-full h-full"
                                        itemOne={<ReactCompareSliderImage src={uploadedImage} alt="Before image" className="object-contain w-full h-full aspect-video"/>}
                                        itemTwo={<ReactCompareSliderImage src={activeGeneratedImage.imageDataUri} alt="After image" className="object-contain w-full h-full aspect-video"/>}
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
                                <DialogTitle>Exterior Transformation</DialogTitle>
                                <DialogDescription>
                                    An enlarged view of the before and after exterior transformation using AI. Style: {activeGeneratedImage.style}.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="w-full h-full flex justify-center items-center">
                                <ReactCompareSlider
                                    className="w-full h-full"
                                    itemOne={<ReactCompareSliderImage src={uploadedImage} alt="Before image" className="object-contain w-full h-full"/>}
                                    itemTwo={<ReactCompareSliderImage src={activeGeneratedImage.imageDataUri} alt="After image" className="object-contain w-full h-full"/>}
                                />
                            </div>
                        </DialogContent>
                    )}
                 </Dialog>
            </div>

             <div className="col-span-1 xl:col-span-3">
                <Card className="bg-card">
                    <CardHeader>
                        <CardTitle className="text-lg">Personalize</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                             <Label className="mb-2 block flex items-center gap-2">
                                <PaintRoller className="h-5 w-5" /> Exterior Type
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between">
                                        {selectedExteriorType} <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64">
                                    {exteriorTypes.map((type) => (
                                        <DropdownMenuItem key={type} onSelect={() => setSelectedExteriorType(type)}>
                                            {type}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div>
                             <Label className="mb-2 block flex items-center gap-2">
                                <Construction className="h-5 w-5" /> Materials
                            </Label>
                            <ToggleGroup type="multiple" value={selectedMaterials} onValueChange={setSelectedMaterials} className="grid grid-cols-2 gap-2">
                                {materialOptions.map((material) => (
                                    <ToggleGroupItem key={material} value={material}>{material}</ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        </div>

                        <div>
                             <Label className="mb-2 block flex items-center gap-2">
                                <Trees className="h-5 w-5" /> Landscaping
                            </Label>
                            <ToggleGroup type="single" value={selectedLandscaping} onValueChange={(value) => { if (value) setSelectedLandscaping(value) }} className="grid grid-cols-2 gap-2">
                                {landscapingOptions.map((item) => (
                                    <ToggleGroupItem key={item} value={item}>{item}</ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        </div>
                        <div>
                            <Label htmlFor="user-prompt" className="mb-2 block flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" /> Any specific requests?
                            </Label>
                            <Textarea
                                id="user-prompt"
                                placeholder="e.g., add a fence, change the roof to terracotta tiles..."
                                value={userPrompt}
                                onChange={(e) => setUserPrompt(e.target.value)}
                                className="h-24"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function ExteriorAIGineClient({ user }: { user: User | null }) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [originalCloudinaryUrl, setOriginalCloudinaryUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("Modern");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [activeGeneratedImage, setActiveGeneratedImage] = useState<GeneratedImage | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  
  const [selectedExteriorType, setSelectedExteriorType] = useState<string>(exteriorTypes[0]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedLandscaping, setSelectedLandscaping] = useState<string>("Minimal");
  const [userPrompt, setUserPrompt] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isLoading = isUploading || isGenerating;
  
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
      setOriginalCloudinaryUrl(null);

      setIsUploading(true);
      setLoadingMessage("Securing your image...");

      const uploadResult = await uploadOriginalImageAction(dataUri, true);

      if ('url' in uploadResult) {
        setOriginalCloudinaryUrl(uploadResult.url);
      } else {
        toast.error("Image Upload Failed", { description: uploadResult.error });
        setUploadedImage(null);
      }
      
      setIsUploading(false);
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

  const startGeneration = async () => {
    if (!selectedStyle) {
      toast.error("No Style Selected", {
        description: "Please choose a design style.",
      });
      return;
    }

    if (!uploadedImage || !originalCloudinaryUrl) {
      toast.error("Image Not Ready", {
        description: "Please wait for the image to upload before generating.",
      });
      return;
    }

    setIsGenerating(true);
    setLoadingMessage(`Generating your new ${selectedStyle} exterior...`);
    setActiveGeneratedImage(null);

    const result = await generateExteriorStylesAction({ 
      styles: [selectedStyle],
      exteriorType: selectedExteriorType,
      materials: selectedMaterials,
      landscaping: selectedLandscaping,
      userPrompt: userPrompt,
    }, uploadedImage, originalCloudinaryUrl);


    if ("error" in result) {
      toast.error("Generation Failed", {
        description: result.error,
      });
    } else {
        const newImages = result.styledExteriorImages;
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

  const handlePublish = async (imageToPublish: GeneratedImage) => {
    if (!imageToPublish) return;

    setIsPublishing(true);
    const result = await publishToGalleryAction({ designId: imageToPublish.designId });

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
    link.download = `RoomAIgine-Exterior-${style}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async (imageDataUri: string, style: string) => {
    try {
        const response = await fetch(imageDataUri);
        const blob = await response.blob();
        const file = new File([blob], `RoomAIgine-Exterior-${style}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: `My ${style} exterior design from RoomAIgine!`,
                text: 'Check out my new home design created with AI.',
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
      <AppHeader user={user} />
      <main className="flex-grow flex items-center justify-center pt-24">
        {!uploadedImage ? (
          <UploadScreen
            onUploadClick={() => fileInputRef.current?.click()}
            onFileDrop={handleFileDrop}
          />
        ) : (
          <ExteriorAIGineEditor
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
            selectedExteriorType={selectedExteriorType}
            setSelectedExteriorType={setSelectedExteriorType}
            selectedMaterials={selectedMaterials}
            setSelectedMaterials={setSelectedMaterials}
            selectedLandscaping={selectedLandscaping}
            setSelectedLandscaping={setSelectedLandscaping}
            userPrompt={userPrompt}
            setUserPrompt={setUserPrompt}
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
