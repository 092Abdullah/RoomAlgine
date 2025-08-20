
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
  GalleryThumbnails,
  Users,
  Paintbrush,
  Globe,
  Zap,
  Sofa,
  CheckCircle,
} from "lucide-react";
import { HeaderLogoIcon } from "./icons";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { ThemeSwitcher } from "./theme-switcher";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import AnimatedCounter from "./animated-counter";


const FADE_IN_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" } },
};

const LandingPage = () => {
  const faqs = [
      {
        question: "What is RoomAIgine?",
        answer: "RoomAIgine is an AI-powered interior design tool that allows you to upload a photo of your room and instantly visualize it in various design styles. It's a fast, easy, and fun way to get design inspiration and see your room's potential."
      },
      {
        question: "How accurate are the AI redesigns?",
        answer: "Our AI is trained to preserve the core architectural elements of your room, such as walls, windows, and doors, while creatively reimagining the furniture, decor, colors, and materials. The results are highly realistic visualizations designed to inspire you."
      },
      {
        question: "Can I use photos from my phone?",
        answer: "Absolutely! Photos taken with your phone work perfectly. For best results, take a clear, well-lit photo of your room from a good angle."
      },
      {
        question: "What styles can I choose from?",
        answer: "We offer a wide range of popular interior design styles, including Minimalist, Luxury, Cozy, Industrial, Bohemian, and more. You can also use our AI-powered suggestion tool to get ideas based on your room's photo."
      },
      {
        question: "Is my data private?",
        answer: "Yes, your privacy is important to us. Your uploaded photos are used only to generate your designs and are not shared or used for any other purpose. You have the option to publish your creations to our public gallery if you wish to share them."
      }
  ];
  
    const stats = [
    { value: 150, text: "k+", label: "Designs Generated", icon: Sparkles },
    { value: 50, text: "k+", label: "Happy Users", icon: Users },
    { value: 200, text: "+", label: "Room Styles", icon: Paintbrush },
    { value: 30, text: "+", label: "Countries Reached", icon: Globe },
  ];
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body antialiased">
      {/* Header */}
      <header className="fixed top-4 left-0 right-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="floating-header">
            <Link href="/">
              <HeaderLogoIcon />
            </Link>
            <nav className="hidden md:flex md:gap-2 items-center">
              <Link href="#features" className="header-link">Features</Link>
              <Link href="#see-the-magic" className="header-link">Examples</Link>
              <Link href="#loved-by-creatives" className="header-link">Reviews</Link>
              <Link href="#faq" className="header-link">FAQs</Link>
              <Link href="/gallery" className="header-link">Gallery</Link>
              <ThemeSwitcher />
              <Button asChild variant="secondary" className="bg-white text-black hover:bg-gray-200">
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
        <section className="relative pt-24 pb-16 md:pt-40 md:pb-24 text-center overflow-hidden">
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
              className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70"
              variants={FADE_IN_ANIMATION_VARIANTS}
            >
              Visualize Your Dream Room in Seconds
            </motion.h1>
            <motion.p
              className="mt-6 max-w-2xl mx-auto text-md md:text-lg text-muted-foreground"
              variants={FADE_IN_ANIMATION_VARIANTS}
            >
             Upload a photo of your room, pick your favorite styles, and let our AI bring your vision to life in seconds. No credit card required.
            </motion.p>
            <motion.div variants={FADE_IN_ANIMATION_VARIANTS} className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
               <Button size="lg" asChild>
                <Link href="/generate">
                  <UploadCloud className="mr-2 h-5 w-5" /> Upload Your Room
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
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
        
        {/* Why Choose Us Section */}
        <section id="why-choose-us" className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Image
                            src="https://i.ibb.co/G4KRf34j/after1.png"
                            alt="Beautifully designed modern room"
                            width={600}
                            height={600}
                            className="rounded-xl shadow-lg w-full h-auto"
                            data-ai-hint="luxury kitchen"
                            loading="lazy"
                        />
                    </motion.div>
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={{
                          hidden: {},
                          show: { transition: { staggerChildren: 0.15 } },
                        }}
                    >
                        <h2 className="text-3xl font-bold tracking-tight">The Ultimate AI Interior Designer</h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            RoomAIgine empowers you to create stunning, professional-quality designs with ease. Here’s why we’re the best choice for your next project.
                        </p>
                        <ul className="mt-8 space-y-6">
                            {[
                                { icon: Zap, title: "Blazing Fast Results", description: "Get your redesigned room in seconds, not days. Our AI is optimized for speed and efficiency." },
                                { icon: Paintbrush, title: "Photorealistic Quality", description: "Our models create stunning, high-resolution images that are hard to distinguish from real photos." },
                                { icon: Sofa, title: "Endless Style Options", description: "Choose from a vast library of styles or mix and match to find the perfect look for your space." },
                            ].map((feature, index) => (
                                <motion.li key={index} className="flex items-start gap-4" variants={FADE_IN_ANIMATION_VARIANTS}>
                                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary mt-1">
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">{feature.title}</h3>
                                        <p className="mt-1 text-muted-foreground">{feature.description}</p>
                                    </div>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>

        {/* By the Numbers Section */}
        <section id="by-the-numbers" className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">Trusted by creators worldwide</h2>
              <p className="mt-2 text-lg text-muted-foreground">Our platform is growing and reaching a global community of designers and homeowners.</p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
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
                    <stat.icon className="h-8 w-8" />
                  </div>
                  <p className="text-4xl font-bold text-primary">
                    <AnimatedCounter targetValue={stat.value} />
                    {stat.text}
                  </p>
                  <p className="mt-2 text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 relative overflow-hidden">
            <div
                aria-hidden="true"
                className="absolute inset-0 z-0"
            >
                <Image
                    src="https://i.ibb.co/spCKd6WL/before.webp"
                    alt="abstract background"
                    fill
                    className="object-cover object-center opacity-10"
                    data-ai-hint="messy bedroom"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
            </div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">Powerful Features for Everyone</h2>
                <p className="mt-2 text-lg text-muted-foreground">Everything you need to create the perfect space, whether you're a homeowner or a pro.</p>
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
                          <CheckCircle className="h-8 w-8 text-primary mb-4" />
                          <h3 className="text-lg font-semibold text-card-foreground">{feature.title}</h3>
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
                    itemOne={<ReactCompareSliderImage src="https://i.ibb.co/nq3QGF2t/before1.jpg" alt="Before image" data-ai-hint="old kitchen" className="object-cover w-full h-full" />}
                    itemTwo={<ReactCompareSliderImage src="https://i.ibb.co/G4KRf34j/after1.png" alt="After image" data-ai-hint="luxury kitchen" className="object-cover w-full h-full" />}
                    className="w-full aspect-[16/9] md:aspect-video rounded-xl overflow-hidden"
                  />
                </CarouselItem>
                <CarouselItem>
                  <ReactCompareSlider
                    itemOne={<ReactCompareSliderImage src="https://i.ibb.co/spCKd6WL/before.webp" alt="Before image" data-ai-hint="messy bedroom" className="object-cover w-full h-full" />}
                    itemTwo={<ReactCompareSliderImage src="https://i.ibb.co/NgKGqxJ0/after.png" alt="After image" data-ai-hint="minimalist bedroom" className="object-cover w-full h-full" />}
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
                { name: "Areef Rehman", role: "Homeowner", review: "This app is a game-changer! I redesigned my entire living room in one evening. So easy and fun to use.", rating: 5 },
                { name: "Muzaffar Ali", role: "Interior Designer", review: "RoomAIgine helps me create quick mockups for clients. It's an indispensable tool in my workflow now.", rating: 5 },
                { name: "Abdullah Maqbool", role: "Renter", review: "I wasn't sure what to do with my small apartment, but this app gave me incredible ideas. Highly recommend!", rating: 5 },
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
                        <div>
                          <p className="font-semibold text-card-foreground">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                      <div className="flex mb-2">
                        {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)}
                      </div>
                      <p className="text-muted-foreground">{`"${testimonial.review}"`}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-secondary/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-10 items-start">
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={FADE_IN_ANIMATION_VARIANTS}
                    >
                        <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Have questions? We have answers. If you can't find what you're looking for, feel free to contact our support team.
                        </p>
                    </motion.div>
                    <motion.div 
                        className="max-w-3xl"
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={FADE_IN_ANIMATION_VARIANTS}
                    >
                        <Accordion type="single" collapsible className="w-full">
                            {faqs.map((faq, index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </motion.div>
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

    
