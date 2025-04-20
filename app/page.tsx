"use client"

import * as React from "react"
import { Search, Calendar, Text, FileType, ArrowUpDown, Mic, FileText, Sparkles, Shield, Zap, Check, Headphones, Brain, Cloud, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Icons } from "@/components/icons"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-slate-50/50 to-background dark:from-background dark:via-slate-900/50 dark:to-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">AI Notes</span>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="font-medium hover:bg-primary/10">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="font-medium shadow-sm hover:shadow-md transition-all bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">Get Started</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl animate-pulse delay-500"></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative flex flex-col lg:flex-row items-center justify-between gap-12 py-16 md:py-24 lg:py-32">
            <div className="space-y-8 max-w-2xl text-center lg:text-left">
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium bg-background/50 backdrop-blur-sm">
                  <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">AI-Powered Note Taking</span>
                </div>
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  Transform Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">Voice</span> into Organized Notes
                </h1>
                <p className="text-xl text-muted-foreground">
                  Capture your thoughts effortlessly with advanced voice-to-text technology. 
                  Let AI help you organize and enhance your notes for better productivity.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link href="/signup">
                  <Button size="lg" className="font-medium shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
                    Get Started for Free
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button variant="outline" size="lg" className="font-medium backdrop-blur-sm bg-background/50">
                    Watch Demo
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start space-x-6 pt-4">
                <div className="text-sm">
                  <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">1,000+</span> happy users
                </div>
              </div>
            </div>
            
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary to-blue-600 opacity-30 blur animate-pulse"></div>
              <div className="relative rounded-lg overflow-hidden border shadow-xl backdrop-blur-sm bg-background/50">
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">AI Notes App</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Button variant="outline" size="sm" className="rounded-full mr-2 bg-primary/10 hover:bg-primary/20">
                        <Mic className="h-4 w-4 text-primary" />
                      </Button>
                      <div className="text-sm font-medium">Recording in progress...</div>
                    </div>
                    
                    <div className="h-20 w-full bg-muted/30 rounded-md flex items-center justify-center backdrop-blur-sm">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div 
                            key={i} 
                            className="w-1 bg-gradient-to-b from-primary to-blue-600 animate-pulse" 
                            style={{ 
                              height: `${Math.sin(i/2) * 14 + 20}px`,
                              animationDelay: `${i * 0.1}s`
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-3 rounded-md bg-muted/20 border backdrop-blur-sm text-sm">
                      <p><span className="text-primary font-medium">Transcribing:</span> Capture your thoughts effortlessly with advanced voice-to-text technology...</p>
                    </div>
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>00:16</span>
                      <span>April 20, 2025</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="text-center space-y-4 mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold">
                Powerful Features for <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">Effortless</span> Note-Taking
              </h2>
              <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
                Everything you need to capture and organize your thoughts efficiently, powered by cutting-edge AI technology.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <Mic className="h-10 w-10" />,
                  title: "Voice Recording",
                  description: "Record your thoughts and meetings with crystal clear audio quality."
                },
                {
                  icon: <FileText className="h-10 w-10" />,
                  title: "Instant Transcription",
                  description: "Convert speech to text with high accuracy in real-time."
                },
                {
                  icon: <Sparkles className="h-10 w-10" />,
                  title: "AI Enhancement",
                  description: "Let AI improve your notes with smart suggestions and organization."
                },
                {
                  icon: <Brain className="h-10 w-10" />,
                  title: "Smart Organization",
                  description: "Automatically categorize and tag your notes for easy retrieval."
                },
                {
                  icon: <Cloud className="h-10 w-10" />,
                  title: "Cloud Sync",
                  description: "Access your notes from any device with seamless cloud synchronization."
                },
                {
                  icon: <Shield className="h-10 w-10" />,
                  title: "Secure & Private",
                  description: "End-to-end encryption ensures your notes remain private and secure."
                }
              ].map((feature, index) => (
                <div 
                  key={index} 
                  className="group relative overflow-hidden rounded-lg border bg-background/50 backdrop-blur-sm p-2 transition-all hover:shadow-lg hover:scale-[1.02] duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex h-[220px] flex-col justify-between rounded-md p-6">
                    <div className="text-primary group-hover:text-primary/80 transition-colors">
                      {feature.icon}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-16 md:py-24 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="text-center space-y-4 mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-bold">
                How AI Notes <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">Works</span>
              </h2>
              <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
                Our simple three-step process makes note-taking effortless
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Record",
                  description: "Capture your voice with a simple tap. Record lectures, meetings, or quick thoughts on the go."
                },
                {
                  step: "02",
                  title: "Transcribe",
                  description: "Our AI instantly converts your speech to text with remarkable accuracy and proper formatting."
                },
                {
                  step: "03",
                  title: "Organize",
                  description: "Smart organization features help you categorize, search, and retrieve your notes whenever you need them."
                }
              ].map((item, index) => (
                <div key={index} className="relative group">
                  <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary to-blue-600 opacity-20 blur group-hover:opacity-30 transition duration-300"></div>
                  <div className="relative">
                    <div className="text-6xl font-bold text-primary/10 absolute -top-10 left-0 group-hover:text-primary/20 transition-colors duration-300">
                      {item.step}
                    </div>
                    <div className="pt-8 space-y-3">
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="text-center space-y-4 mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold">
                What Our Users <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">Say</span>
              </h2>
              <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
                Join thousands of users who are already transforming their productivity with AI Notes
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  quote: "AI Notes has **completely transformed** how I take notes during meetings. The transcription is *incredibly accurate*!",
                  author: "Sarah Johnson",
                  role: "Product Manager"
                },
                {
                  quote: "As a student, this app has been a *game-changer* for recording lectures. The **AI organization features** save me hours of work.",
                  author: "Michael Chen",
                  role: "Computer Science Student"
                },
                {
                  quote: "The voice-to-text quality is *exceptional*. I've tried many similar apps, but AI Notes is by far the **most accurate** and feature-rich.",
                  author: "Emily Rodriguez",
                  role: "Content Creator"
                }
              ].map((testimonial, index) => (
                <div key={index} className="group relative overflow-hidden rounded-lg border bg-card/50 backdrop-blur-sm p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex flex-col h-full justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex text-yellow-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <div 
                        className="text-muted-foreground"
                        dangerouslySetInnerHTML={{ 
                          __html: testimonial.quote
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>') 
                        }} 
                      />
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="rounded-2xl bg-gradient-to-r from-primary/90 to-blue-600/90 text-white p-8 md:p-12 lg:p-16 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 w-96 h-96 -translate-x-1/2 rounded-full bg-white blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-blue-500 blur-3xl opacity-20 animate-pulse delay-1000"></div>
              </div>
              
              <div className="relative flex flex-col lg:flex-row justify-between items-center gap-8">
                <div className="space-y-4 text-center lg:text-left">
                  <h2 className="font-heading text-3xl md:text-4xl font-bold">
                    Ready to Transform Your Note-Taking?
                  </h2>
                  <p className="text-lg text-white/90 max-w-xl">
                    Join thousands of professionals and students who use AI Notes to capture and organize their thoughts effortlessly.
                  </p>
                </div>
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                  <Link href="/signup">
                    <Button size="lg" variant="secondary" className="font-medium shadow-md bg-white/10 hover:bg-white/20 backdrop-blur-sm">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 font-medium backdrop-blur-sm">
                      View Pricing
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-12 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Link href="/" className="flex items-center space-x-2">
                <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">AI Notes</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Transform your voice into organized notes with the power of AI.
              </p>
              <div className="flex space-x-3">
                {[
                  { name: 'twitter', icon: Icons.twitter },
                  { name: 'github', icon: Icons.gitHub },
                  { name: 'linkedin', icon: Icons.linkedin }
                ].map(({ name, icon: Icon }) => (
                  <Link key={name} href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full border hover:border-primary/50 hover:bg-primary/10 transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Use Cases", "Roadmap"]
              },
              {
                title: "Resources",
                links: ["Documentation", "Guides", "Support", "API"]
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Contact"]
              }
            ].map((column, index) => (
              <div key={index} className="space-y-4">
                <h3 className="font-medium">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map(link => (
                    <li key={link}>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AI Notes. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}