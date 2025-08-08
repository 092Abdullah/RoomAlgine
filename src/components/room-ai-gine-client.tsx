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
  Wand2,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { generateRoomStylesAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { LogoIcon } from "./icons";
import { Skeleton } from "./ui/skeleton";
import { AnimatePresence, motion } from "framer-motion";

type GeneratedImage = {
  style: string;
  imageDataUri: string;
};

const designStyles = ["Minimalist", "Luxury", "Cozy", "Industrial", "Bohemian", "Modern Farmhouse", "Coastal", "Scandinavian", "Mid-Century Modern", "Art Deco"];

export default function RoomAIGineClient() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["Minimalist", "Cozy"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [lastSurpriseStyle, setLastSurpriseStyle] = useState<string | null>(null);

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setGeneratedImages([]);
        setSelectedImage(null);
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

  const startGeneration = async (stylesToGenerate: string[]) => {
     if (!uploadedImage) {
      toast({
        title: "No Image Uploaded",
        description: "Please upload an image of your room first.",
        variant: "destructive",
      });
      return;
    }
    if (stylesToGenerate.length === 0) {
      toast({
        title: "No Styles Selected",
        description: "Please choose at least one design style.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setSelectedImage(null);
    setGeneratedImages([]);

    const result = await generateRoomStylesAction(uploadedImage, stylesToGenerate);

    if ("error" in result) {
      toast({
        title: "Generation Failed",
        description: result.error,
        variant: "destructive",
      });
    } else {
      setGeneratedImages(result.styledRoomImages);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
    setIsGenerating(false);
  }

  const handleGenerate = () => {
    setLastSurpriseStyle(null);
    startGeneration(selectedStyles);
  };

  const handleSurpriseMe = () => {
    const availableStyles = designStyles.filter(s => s !== lastSurpriseStyle);
    const randomStyle = availableStyles[Math.floor(Math.random() * availableStyles.length)];
    setLastSurpriseStyle(randomStyle);
    setSelectedStyles([randomStyle]);
    startGeneration([randomStyle]);
  };
  
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

  const handleReset = () => {
    setUploadedImage(null);
    setGeneratedImages([]);
    setSelectedImage(null);
    setLastSurpriseStyle(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const header = (
    <header className="flex justify-between items-center py-4">
      <div className="flex items-center gap-2">
        <LogoIcon />
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          RoomAIgine
        </h1>
      </div>
      {uploadedImage && (
        <Button onClick={handleReset} variant="outline" size="sm">
          <X className="mr-2 h-4 w-4" /> Start Over
        </Button>
      )}
    </header>
  );

  return (
    <div className="min-h-screen bg-background font-body">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {header}
        <main className="py-12">
          <AnimatePresence>
            {!uploadedImage && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center max-w-2xl mx-auto"
              >
                <Badge variant="secondary" className="mb-4">
                  <Sparkles className="mr-2 h-4 w-4 text-primary" />
                  AI-Powered Interior Design
                </Badge>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  Visualize Your Dream Room in Seconds
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Upload a photo of your room, pick your favorite styles, and let
                  our AI bring your vision to life.
                </p>
                <Button
                  size="lg"
                  className="mt-8"
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
            )}
          </AnimatePresence>

          {uploadedImage && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4">
                <Card className="sticky top-8 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera /> Your Room
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video rounded-lg overflow-hidden relative">
                       <Image
                        src={uploadedImage}
                        alt="Uploaded room"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card className="mt-8 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Paintbrush /> Choose Styles
                    </CardTitle>
                    <CardDescription>
                      Select one or more styles to apply.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {designStyles.map((style) => (
                        <div key={style} className="flex items-center space-x-2">
                          <Checkbox
                            id={style}
                            checked={selectedStyles.includes(style)}
                            onCheckedChange={() => handleStyleToggle(style)}
                          />
                          <Label htmlFor={style} className="cursor-pointer">
                            {style}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-2">
                     <Button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating && !lastSurpriseStyle ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Styles
                        </>
                      )}
                    </Button>
                     <Button
                      onClick={handleSurpriseMe}
                      disabled={isGenerating}
                      variant="outline"
                      className="w-full"
                    >
                      {isGenerating && lastSurpriseStyle ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Working Magic...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Surprise Me!
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="lg:col-span-8">
                {isGenerating && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {(lastSurpriseStyle ? [lastSurpriseStyle] : selectedStyles).map(style => (
                        <div key={style}>
                            <Skeleton className="aspect-video w-full rounded-lg" />
                            <Skeleton className="h-6 w-1/3 mt-4" />
                             <Skeleton className="h-4 w-1/3 mt-2" />
                        </div>
                    ))}
                  </div>
                )}
                
                <AnimatePresence>
                {generatedImages.length > 0 && (
                  <motion.div 
                    ref={resultsRef} 
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {generatedImages.map((image, index) => (
                      <motion.div 
                        key={image.style} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
                      >
                        <Card
                          className={`shadow-md hover:shadow-primary/20 transition-all cursor-pointer ${selectedImage?.style === image.style ? 'ring-2 ring-primary' : ''}`}
                          onClick={() => handleImageSelect(image)}
                        >
                          <CardContent className="p-0">
                            <div className="aspect-video rounded-t-lg overflow-hidden relative group">
                              <Image
                                src={image.imageDataUri}
                                alt={`${image.style} room`}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint="room interior"
                              />
                               <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <p className="text-white font-bold text-lg flex items-center gap-2">
                                        View Design
                                    </p>
                                </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between items-center p-4">
                            <h3 className="font-bold text-lg">{image.style}</h3>
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); handleDownload(image.imageDataUri, image.style); }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); handleShare(image.imageDataUri, image.style); }}
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
