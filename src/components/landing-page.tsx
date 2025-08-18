
"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  UploadCloud,
  Palette,
  Sparkles,
  Download,
  Star,
  Instagram,
  Linkedin,
  Github,
  GalleryThumbnails
} from "lucide-react";
import { LogoIcon } from "./icons";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";


const FADE_IN_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" } },
};

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body antialiased">
      {/* Header */}
       <header className="sticky top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/">
              <LogoIcon />
            </Link>
            <nav className="hidden md:flex md:gap-8 items-center">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link href="#see-the-magic" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Examples</Link>
              <Link href="#loved-by-creatives" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Reviews</Link>
              <Link href="/gallery" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Gallery</Link>
              <Button asChild>
                  <Link href="/generate">
                    Try for Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
              </Button>
            </nav>
             <div className="md:hidden">
               <Button asChild>
                  <Link href="/generate">
                    Start Designing
                  </Link>
                </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 text-center overflow-hidden">
          <motion.div
            className="container mx-auto px-4 sm:px-6 lg:px-8"
            initial="hidden"
            animate="show"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-300"
              variants={FADE_IN_ANIMATION_VARIANTS}
            >
              Visualize Your Dream Room in Seconds
            </motion.h1>
            <motion.p 
              className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground"
              variants={FADE_IN_ANIMATION_VARIANTS}
            >
              Transform your space with AI. Upload a photo of your room and let our advanced algorithm generate stunning redesigns in any style you can imagine.
            </motion.p>
            <motion.div variants={FADE_IN_ANIMATION_VARIANTS} className="flex justify-center items-center gap-4">
              <Button size="lg" className="mt-8" asChild>
                <Link href="/generate">
                  Try It Free – No Signup Needed
                </Link>
              </Button>
               <Button size="lg" variant="outline" className="mt-8 hover:bg-primary/10 hover:text-primary" asChild>
                <Link href="/gallery">
                  <GalleryThumbnails className="mr-2 h-5 w-5" /> View Gallery
                </Link>
              </Button>
            </motion.div>
          </motion.div>
          <motion.div 
            className="relative container mx-auto mt-12 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Image 
                src="https://i.ibb.co/1Y512tmL/hero1.jpg" 
                alt="AI generated room" 
                width={1200}
                height={600}
                className="w-full max-w-4xl mx-auto h-auto rounded-xl overflow-hidden shadow-2xl shadow-primary/20"
                data-ai-hint="minimalist bedroom"
                priority
            />
          </motion.div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
              <p className="mt-2 text-lg text-muted-foreground">Four simple steps to your dream room.</p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: UploadCloud, title: "1. Upload Photo", description: "Snap a picture of your room and upload it instantly." },
                { icon: Palette, title: "2. Choose Style", description: "Select from a variety of design styles like Minimalist, Luxury, and more." },
                { icon: Sparkles, title: "3. AI Transformation", description: "Our AI redesigns your room based on your chosen style." },
                { icon: Download, title: "4. Download & Share", description: "Save your favorite designs or share them with friends." },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="text-center p-6"
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.5 }}
                  variants={FADE_IN_ANIMATION_VARIANTS}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto mb-4">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">Powerful Features</h2>
              <p className="mt-2 text-lg text-muted-foreground">Everything you need to create the perfect space.</p>
            </div>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {[
                { title: "Multiple Styles", description: "From Industrial to Scandinavian, find the perfect look." },
                { title: "Instant Preview", description: "See your new room in seconds, not weeks." },
                { title: "HD Quality", description: "Download high-resolution images for a detailed view." },
                { title: "Community Gallery", description: "Get inspired by creations from other users." },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.5 }}
                  variants={FADE_IN_ANIMATION_VARIANTS}
                >
                    <Card className="glassmorphic-card p-6 h-full">
                        <CardContent className="p-0">
                            <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                            <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                        </CardContent>
                    </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Live Preview Carousel */}
        <section id="see-the-magic" className="py-20 bg-secondary/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight">See the Magic</h2>
                    <p className="mt-2 text-lg text-muted-foreground">Drag the slider to see the before-and-after transformation.</p>
                </div>
                <Carousel className="mt-12 w-full max-w-4xl mx-auto">
                    <CarouselContent>
                        <CarouselItem>
                             <ReactCompareSlider
                                itemOne={<ReactCompareSliderImage src="https://i.ibb.co/spCKd6WL/before.webp" alt="Before image" data-ai-hint="messy bedroom" className="object-cover w-full h-full"/>}
                                itemTwo={<ReactCompareSliderImage src="https://i.ibb.co/NgKGqxJ0/after.png" alt="After image" data-ai-hint="minimalist bedroom" className="object-cover w-full h-full"/>}
                                className="w-full aspect-[16/9] md:aspect-video rounded-xl overflow-hidden"
                            />
                        </CarouselItem>
                        <CarouselItem>
                             <ReactCompareSlider
                                itemOne={<ReactCompareSliderImage src="https://i.ibb.co/nq3QGF2t/before1.jpg" alt="Before image" data-ai-hint="old kitchen" className="object-cover w-full h-full"/>}
                                itemTwo={<ReactCompareSliderImage src="https://i.ibb.co/G4KRf34j/after1.png" alt="After image" data-ai-hint="luxury kitchen" className="object-cover w-full h-full"/>}
                                className="w-full aspect-[16/9] md:aspect-video rounded-xl overflow-hidden"
                            />
                        </CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="loved-by-creatives" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">Loved by Creatives</h2>
              <p className="mt-2 text-lg text-muted-foreground">Don't just take our word for it.</p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { name: "Areef Rehman", role: "Homeowner", review: "This app is a game-changer! I redesigned my entire living room in one evening. So easy and fun to use.", rating: 5, img: "https://i.ibb.co/XxsMswcR/areef.jpg" },
                { name: "Muzaffar Ali", role: "Interior Designer", review: "RoomAIgine helps me create quick mockups for clients. It's an indispensable tool in my workflow now.", rating: 5, img: "https://i.ibb.co/zWyNwQV3/muz.jpg" },
                { name: "Abdullah Maqbool", role: "Renter", review: "I wasn't sure what to do with my small apartment, but this app gave me incredible ideas. Highly recommend!", rating: 5, img: "https://i.ibb.co/cSZDytmb/pic1.jpg" },
              ].map((testimonial, i) => (
                <motion.div
                    key={i}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={FADE_IN_ANIMATION_VARIANTS}
                >
                    <Card className="glassmorphic-card p-6 h-full">
                        <CardContent className="p-0">
                            <div className="flex items-center mb-4">
                                <Image src={testimonial.img} alt={testimonial.name} width={48} height={48} className="rounded-full" data-ai-hint="person"/>
                                <div className="ml-4">
                                <p className="font-semibold text-white">{testimonial.name}</p>
                                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                </div>
                            </div>
                            <div className="flex mb-2">
                                {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="h-5 w-5 text-accent fill-accent" />)}
                            </div>
                            <p className="text-muted-foreground">{`"${testimonial.review}"`}</p>
                        </CardContent>
                    </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready to Redesign Your Space?</h2>
            <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
              Unlock your home's potential today. Start creating the room of your dreams with the power of AI.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/generate">Transform My Room Now</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-secondary/30">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center space-x-6 md:order-2">
                <Link href="https://github.com/Abdullah-Maqbool1" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Github /></Link>
                <Link href="https://www.instagram.com/abdullah__maqbool" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Instagram /></Link>
                <Link href="https://www.linkedin.com/in/abdullah-maqbool-se" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><Linkedin /></Link>
            </div>
            <div className="mt-8 md:mt-0 md:order-1">
                <p className="text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} RoomAIgine. All rights reserved.
                </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
