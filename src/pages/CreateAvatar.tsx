import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  Link, 
  Youtube, 
  User, 
  Users, 
  Mic, 
  Video, 
  Image, 
  Sparkles,
  Brain,
  Download
} from "lucide-react";
import { toast } from "sonner";

export default function CreateAvatar() {
  const [concept, setConcept] = useState("");
  const [links, setLinks] = useState<string[]>([""]);
  const [avatars, setAvatars] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const addLink = () => {
    setLinks([...links, ""]);
  };

  const updateLink = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const generateAvatars = async () => {
    if (!concept.trim()) {
      toast.error("Molimo unesite koncept podcasta");
      return;
    }

    setIsGenerating(true);
    toast.success("Generiranje AI avatara u toku...");
    
    // Simulacija generiranja
    setTimeout(() => {
      setAvatars([
        {
          id: 1,
          name: "Marko",
          gender: "male",
          voice: "profesionalni",
          avatar: "generated-male-avatar",
        },
        {
          id: 2,
          name: "Ana",
          gender: "female", 
          voice: "prijateljski",
          avatar: "generated-female-avatar",
        }
      ]);
      setIsGenerating(false);
      toast.success("AI avatari uspješno generirani!");
    }, 3000);
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 animated-bg relative">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-cyber mb-4">
            Kreiraj AI Avatar
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unesite koncept vašeg podcasta i generirajte jedinstvene AI avatare sa glasovima
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <GlassCard variant="primary">
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <Brain className="w-6 h-6 text-primary" />
                  Koncept Podcasta
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                <div>
                  <Label htmlFor="concept">Opis teme i stila</Label>
                  <Textarea
                    id="concept"
                    placeholder="Npr. Tech podcast o AI-ju, casual razgovor između dva eksperta..."
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    className="min-h-32 glass border-glass-border"
                  />
                </div>

                <div>
                  <Label>Sadržaj i resursi</Label>
                  <div className="space-y-3">
                    {links.map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            placeholder="YouTube link ili web stranica..."
                            value={link}
                            onChange={(e) => updateLink(index, e.target.value)}
                            className="glass border-glass-border pl-10"
                          />
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            {link.includes('youtube') ? (
                              <Youtube className="w-4 h-4 text-red-500" />
                            ) : (
                              <Link className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      onClick={addLink}
                      variant="outline"
                      size="sm"
                      className="glass-button"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Dodaj link
                    </Button>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-accent" />
                  Postavke generiranja
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Broj avatara</Label>
                    <Select defaultValue="2">
                      <SelectTrigger className="glass border-glass-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass border-glass-border">
                        <SelectItem value="1">1 Avatar</SelectItem>
                        <SelectItem value="2">2 Avatara</SelectItem>
                        <SelectItem value="3">3 Avatara</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Stil razgovora</Label>
                    <Select defaultValue="casual">
                      <SelectTrigger className="glass border-glass-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass border-glass-border">
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="professional">Profesionalni</SelectItem>
                        <SelectItem value="educational">Edukativni</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={generateAvatars}
                  disabled={isGenerating}
                  className="w-full glass-button cyber-gradient text-white font-semibold py-3"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Generiranje u toku...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Generiraj AI Avatare
                    </>
                  )}
                </Button>
              </GlassCardContent>
            </GlassCard>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <GlassCard variant="glow">
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-secondary" />
                  Generirani Avatari
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                {avatars.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Avatari će se pojaviti ovdje nakon generiranja</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {avatars.map((avatar) => (
                      <div key={avatar.id} className="glass p-4 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full cyber-gradient-secondary flex items-center justify-center">
                            <User className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{avatar.name}</h3>
                            <div className="flex gap-2 mt-2">
                              <Badge variant={avatar.gender === 'male' ? 'default' : 'secondary'}>
                                {avatar.gender === 'male' ? 'Muški' : 'Ženski'}
                              </Badge>
                              <Badge variant="outline">
                                {avatar.voice}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <Tabs defaultValue="audio" className="mt-4">
                          <TabsList className="grid w-full grid-cols-3 glass">
                            <TabsTrigger value="audio" className="flex items-center gap-1">
                              <Mic className="w-4 h-4" />
                              Audio
                            </TabsTrigger>
                            <TabsTrigger value="video" className="flex items-center gap-1">
                              <Video className="w-4 h-4" />
                              Video
                            </TabsTrigger>
                            <TabsTrigger value="image" className="flex items-center gap-1">
                              <Image className="w-4 h-4" />
                              Slika
                            </TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="audio" className="mt-4">
                            <div className="glass p-4 rounded-lg">
                              <div className="w-full h-12 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                                <Mic className="w-6 h-6 text-primary" />
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-muted-foreground">Voice Sample</span>
                                <Button size="sm" variant="outline" className="glass-button">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="video" className="mt-4">
                            <div className="glass p-4 rounded-lg">
                              <div className="w-full h-32 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-lg flex items-center justify-center">
                                <Video className="w-8 h-8 text-secondary" />
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-muted-foreground">Video Preview</span>
                                <Button size="sm" variant="outline" className="glass-button">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="image" className="mt-4">
                            <div className="glass p-4 rounded-lg">
                              <div className="w-full h-32 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-lg flex items-center justify-center">
                                <Image className="w-8 h-8 text-accent" />
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-muted-foreground">Avatar Image</span>
                                <Button size="sm" variant="outline" className="glass-button">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}