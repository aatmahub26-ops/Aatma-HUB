"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MessageSquare, Instagram, Send, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Message Sent", description: "Our support squad will contact you shortly." });
  };

  const contactMethods = [
    { 
      label: "Call Now", 
      value: "+91 8566936666", 
      icon: Phone, 
      href: "tel:+918566936666",
      color: "bg-blue-500/10 text-blue-500"
    },
    { 
      label: "WhatsApp Chat", 
      value: "+91 8566936666", 
      icon: MessageSquare, 
      href: "https://wa.me/918566936666",
      color: "bg-green-500/10 text-green-500"
    },
    { 
      label: "Email Support", 
      value: "aatmahub26@gmail.com", 
      icon: Mail, 
      href: "mailto:aatmahub26@gmail.com",
      color: "bg-primary/10 text-primary"
    },
    { 
      label: "Follow Instagram", 
      value: "@aatma_hub", 
      icon: Instagram, 
      href: "https://instagram.com/aatma_hub",
      color: "bg-pink-500/10 text-pink-500"
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-12 text-center space-y-4">
             <h1 className="text-4xl md:text-6xl font-headline font-bold uppercase tracking-tighter">Contact <span className="text-primary">Aatma HUB</span></h1>
             <p className="text-muted-foreground max-w-md mx-auto">Get in touch with our elite support squad for any top-up or account queries.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Contact Methods */}
            <div className="lg:col-span-5 space-y-6">
               {contactMethods.map((method, i) => (
                 <a key={i} href={method.href} target="_blank" rel="noopener noreferrer" className="block group">
                    <Card className="bg-card/50 border-white/5 transition-all group-hover:border-primary/30 group-hover:bg-card">
                       <CardContent className="p-6 flex items-center gap-6">
                          <div className={`p-4 rounded-2xl ${method.color}`}>
                             <method.icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                             <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{method.label}</p>
                             <p className="text-lg font-bold text-white">{method.value}</p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                       </CardContent>
                    </Card>
                 </a>
               ))}
            </div>

            {/* Contact Form */}
            <Card className="lg:col-span-7 bg-card border-white/5">
               <CardHeader className="bg-white/5 border-b border-white/5">
                  <CardTitle className="font-headline font-bold text-xl uppercase tracking-widest">Send Transmission</CardTitle>
                  <CardDescription>Fill out the form below and we'll route your request to the right team.</CardDescription>
               </CardHeader>
               <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label className="text-xs uppercase font-bold tracking-widest">Full Name</Label>
                           <Input placeholder="Player Name" className="bg-black/40 border-white/10 h-12" required />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-xs uppercase font-bold tracking-widest">Email Address</Label>
                           <Input type="email" placeholder="email@example.com" className="bg-black/40 border-white/10 h-12" required />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label className="text-xs uppercase font-bold tracking-widest">Subject</Label>
                        <Input placeholder="e.g. Order Support, Wallet Issue" className="bg-black/40 border-white/10 h-12" required />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-xs uppercase font-bold tracking-widest">Message Intelligence</Label>
                        <Textarea placeholder="Explain your query in detail..." className="bg-black/40 border-white/10 min-h-[150px]" required />
                     </div>
                     <Button type="submit" className="w-full h-14 font-bold neon-glow-hover text-lg uppercase tracking-widest">
                        <Send className="mr-2 h-5 w-5" /> Deploy Message
                     </Button>
                  </form>
               </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
