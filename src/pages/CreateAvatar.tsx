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
  Download,
  FileText,
  Edit3,
  RefreshCw,
  Key,
  User2,
  UserCheck,
  Play,
  Pause,
  Volume2
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedAvatar {
  id: string;
  name: string;
  gender: 'male' | 'female';
  voice: string;
  image: string | null;
  video: string | null;
  audio: Blob | null;
  description?: string;
}

export default function CreateAvatar() {
  const [concept, setConcept] = useState("");
  const [links, setLinks] = useState<string[]>([""]);
  const [avatars, setAvatars] = useState<GeneratedAvatar[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Avatar customization states
  const [avatarDescription, setAvatarDescription] = useState('');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [avatarImage, setAvatarImage] = useState<File | null>(null);
  const [avatarImagePreview, setAvatarImagePreview] = useState<string | null>(null);
  
  // Script generation states
  const [scriptAvatarCount, setScriptAvatarCount] = useState("2");
  const [generatedScript, setGeneratedScript] = useState("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isEditingScript, setIsEditingScript] = useState(false);
  
  // Voice generation states
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState("");
  const [avatarVoices, setAvatarVoices] = useState<Array<{
    voiceId: string;
    model: string;
    customVoiceId?: string;
  }>>([]);
  const [generatedVoices, setGeneratedVoices] = useState<Array<string | null>>([]);
  const [isGeneratingVoices, setIsGeneratingVoices] = useState<Array<boolean>>([]);
  const [isGeneratingAllVoices, setIsGeneratingAllVoices] = useState(false);

  const addLink = () => {
    setLinks([...links, ""]);
  };

  const updateLink = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const generateScript = async () => {
    if (!concept.trim()) {
      toast.error("Molimo unesite koncept podcasta");
      return;
    }

    setIsGeneratingScript(true);
    toast.success("Generiranje AI scripta u toku...");

    try {
      const { data, error } = await supabase.functions.invoke('generate-script', {
        body: {
          concept,
          links: links.filter(link => link.trim()),
          scriptAvatarCount
        }
      });

      if (error) {
        throw new Error(error.message || 'Greška pri generiranju scripta');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setGeneratedScript(data.script);
      setIsGeneratingScript(false);
      toast.success("Script uspješno generiran!");
      
    } catch (error) {
      console.error('Greška:', error);
      setIsGeneratingScript(false);
      toast.error(error.message || "Greška pri generiranju scripta");
    }
  };

  const regenerateScript = () => {
    setGeneratedScript("");
    generateScript();
  };

  // Voice generation functions
  const updateAvatarVoice = (index: number, field: string, value: string) => {
    const newVoices = [...avatarVoices];
    if (!newVoices[index]) {
      newVoices[index] = { voiceId: "", model: "eleven_multilingual_v2" };
    }
    newVoices[index] = { ...newVoices[index], [field]: value };
    setAvatarVoices(newVoices);
  };

  const extractAvatarText = (script: string, avatarIndex: number): string => {
    const lines = script.split('\n');
    const avatarPattern = new RegExp(`Avatar ${avatarIndex + 1}:`, 'i');
    const result: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (avatarPattern.test(line)) {
        // Extract text after "Avatar X:"
        const text = line.replace(avatarPattern, '').trim();
        if (text) result.push(text);
        
        // Continue reading until next avatar or end
        let j = i + 1;
        while (j < lines.length && !lines[j].match(/Avatar \d+:/i)) {
          const nextLine = lines[j].trim();
          if (nextLine) result.push(nextLine);
          j++;
        }
      }
    }
    
    return result.join(' ').trim();
  };

  const generateVoiceForAvatar = async (avatarIndex: number) => {
    if (!elevenLabsApiKey.trim()) {
      toast.error("Molimo unesite ElevenLabs API ključ");
      return;
    }

    const voiceConfig = avatarVoices[avatarIndex];
    if (!voiceConfig?.voiceId) {
      toast.error("Molimo izaberite voice za avatar");
      return;
    }

    const voiceId = voiceConfig.voiceId === "custom" ? voiceConfig.customVoiceId : voiceConfig.voiceId;
    if (!voiceId) {
      toast.error("Molimo unesite voice ID");
      return;
    }

    const newIsGenerating = [...isGeneratingVoices];
    newIsGenerating[avatarIndex] = true;
    setIsGeneratingVoices(newIsGenerating);

    try {
      const avatarText = extractAvatarText(generatedScript, avatarIndex);
      if (!avatarText) {
        toast.error(`Nema teksta za Avatar ${avatarIndex + 1}`);
        return;
      }

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey,
        },
        body: JSON.stringify({
          text: avatarText,
          model_id: voiceConfig.model,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.5,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Greška pri generiranju voice-a');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const newGeneratedVoices = [...generatedVoices];
      newGeneratedVoices[avatarIndex] = audioUrl;
      setGeneratedVoices(newGeneratedVoices);
      
      toast.success(`Voice za Avatar ${avatarIndex + 1} uspješno generiran!`);
      
    } catch (error) {
      console.error('Greška:', error);
      toast.error("Greška pri generiranju voice-a. Molimo provjerite API ključ.");
    } finally {
      const newIsGenerating = [...isGeneratingVoices];
      newIsGenerating[avatarIndex] = false;
      setIsGeneratingVoices(newIsGenerating);
    }
  };

  const playGeneratedVoice = (avatarIndex: number) => {
    const audioUrl = generatedVoices[avatarIndex];
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => {
        toast.error("Greška pri reprodukciji audio fajla");
      });
    }
  };

  const generateAllVoices = async () => {
    if (!elevenLabsApiKey.trim()) {
      toast.error("Molimo unesite ElevenLabs API ključ");
      return;
    }

    const avatarCount = parseInt(scriptAvatarCount);
    setIsGeneratingAllVoices(true);
    
    try {
      for (let i = 0; i < avatarCount; i++) {
        if (!generatedVoices[i]) {
          await generateVoiceForAvatar(i);
        }
      }
      toast.success("Svi glasovi uspješno generirani!");
    } catch (error) {
      toast.error("Greška pri generiranju glasova");
    } finally {
      setIsGeneratingAllVoices(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAvatars = async () => {
    if (!elevenLabsApiKey) {
      toast.error("Molimo unesite ElevenLabs API ključ");
      return;
    }

    setIsGenerating(true);
    try {
      const newAvatars: GeneratedAvatar[] = [];
      
      for (let i = 0; i < parseInt(scriptAvatarCount); i++) {
        const avatar: GeneratedAvatar = {
          id: `avatar-${i + 1}`,
          name: `Avatar ${i + 1}`,
          gender: i % 2 === 0 ? selectedGender : (selectedGender === 'male' ? 'female' : 'male'),
          voice: avatarVoices[i]?.voiceId || 'default',
          image: avatarImagePreview,
          video: null,
          audio: null,
          description: avatarDescription || `Profesionalni ${i % 2 === 0 ? selectedGender === 'male' ? 'muški' : 'ženski' : selectedGender === 'male' ? 'ženski' : 'muški'} avatar za podcast`
        };
        newAvatars.push(avatar);
      }
      
      setAvatars(newAvatars);
      toast.success(`Uspješno generirani ${scriptAvatarCount} avatar(i)!`);
    } catch (error) {
      console.error('Error generating avatars:', error);
      toast.error("Greška pri generiranju avatara");
    } finally {
      setIsGenerating(false);
    }
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

            {/* Script Generation */}
            <GlassCard variant="secondary">
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-secondary" />
                  AI Script Generiranje
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                <div>
                  <Label>Broj avatara za script</Label>
                  <Select value={scriptAvatarCount} onValueChange={setScriptAvatarCount}>
                    <SelectTrigger className="glass border-glass-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass border-glass-border">
                      <SelectItem value="1">1 Avatar (Monolog)</SelectItem>
                      <SelectItem value="2">2 Avatara (Dijalog)</SelectItem>
                      <SelectItem value="3">3 Avatara (Grupa)</SelectItem>
                      <SelectItem value="4">4 Avatara (Panel)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={generateScript}
                    disabled={isGeneratingScript}
                    className="flex-1 glass-button"
                  >
                    {isGeneratingScript ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Generiranje...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Generiraj Script
                      </>
                    )}
                  </Button>
                  
                  {generatedScript && (
                    <Button
                      onClick={regenerateScript}
                      disabled={isGeneratingScript}
                      variant="outline"
                      className="glass-button"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* AI Voice Podcast Generation */}
            {generatedScript && (
              <GlassCard variant="accent">
                <GlassCardHeader>
                  <GlassCardTitle className="flex items-center gap-2">
                    <Mic className="w-6 h-6 text-accent" />
                    AI Voice Podcast
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent className="space-y-4">
                  <div>
                    <Label>ElevenLabs API Ključ</Label>
                    <Input
                      type="password"
                      placeholder="xi_..."
                      value={elevenLabsApiKey}
                      onChange={(e) => setElevenLabsApiKey(e.target.value)}
                      className="glass border-glass-border"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Potreban za generiranje glasova i kloniranje
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Voice konfiguracija za svaki avatar</Label>
                    {Array.from({ length: parseInt(scriptAvatarCount) }, (_, index) => (
                      <div key={index} className="glass p-4 rounded-lg space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium">Avatar {index + 1}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm">Voice ID</Label>
                            <Select 
                              value={avatarVoices[index]?.voiceId || ""} 
                              onValueChange={(value) => updateAvatarVoice(index, 'voiceId', value)}
                            >
                              <SelectTrigger className="glass border-glass-border">
                                <SelectValue placeholder="Izaberi voice" />
                              </SelectTrigger>
                              <SelectContent className="glass border-glass-border">
                                <SelectItem value="9BWtsMINqrJLrRacOk9x">Aria (Ženski)</SelectItem>
                                <SelectItem value="CwhRBWXzGAHq8TQ4Fs17">Roger (Muški)</SelectItem>
                                <SelectItem value="EXAVITQu4vr4xnSDxMaL">Sarah (Ženski)</SelectItem>
                                <SelectItem value="FGY2WhTYpPnrIDTdsKH5">Laura (Ženski)</SelectItem>
                                <SelectItem value="TX3LPaxmHKxFdv7VOQHJ">Liam (Muški)</SelectItem>
                                <SelectItem value="XB0fDUnXU5powFXDhCwa">Charlotte (Ženski)</SelectItem>
                                <SelectItem value="custom">Vlastiti Voice ID</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label className="text-sm">Model</Label>
                            <Select 
                              value={avatarVoices[index]?.model || "eleven_multilingual_v2"} 
                              onValueChange={(value) => updateAvatarVoice(index, 'model', value)}
                            >
                              <SelectTrigger className="glass border-glass-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="glass border-glass-border">
                                <SelectItem value="eleven_multilingual_v2">Multilingual v2</SelectItem>
                                <SelectItem value="eleven_turbo_v2_5">Turbo v2.5</SelectItem>
                                <SelectItem value="eleven_turbo_v2">Turbo v2</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {avatarVoices[index]?.voiceId === "custom" && (
                          <div>
                            <Label className="text-sm">Vlastiti Voice ID</Label>
                            <Input
                              placeholder="Unesite ElevenLabs Voice ID"
                              value={avatarVoices[index]?.customVoiceId || ""}
                              onChange={(e) => updateAvatarVoice(index, 'customVoiceId', e.target.value)}
                              className="glass border-glass-border"
                            />
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={() => generateVoiceForAvatar(index)}
                            disabled={isGeneratingVoices[index] || !elevenLabsApiKey.trim()}
                            size="sm"
                            className="flex-1 glass-button"
                          >
                            {isGeneratingVoices[index] ? (
                              <>
                                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                Generiranje...
                              </>
                            ) : (
                              <>
                                <Mic className="w-4 h-4 mr-2" />
                                Generiraj Voice
                              </>
                            )}
                          </Button>
                          
                          {generatedVoices[index] && (
                            <Button
                              onClick={() => playGeneratedVoice(index)}
                              size="sm"
                              variant="outline"
                              className="glass-button"
                            >
                              <Video className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        {generatedVoices[index] && (
                          <div className="mt-2 p-2 glass rounded border border-green-500/20">
                            <p className="text-sm text-green-400 flex items-center gap-2">
                              <Sparkles className="w-4 h-4" />
                              Voice uspješno generiran - spreman za avatar generiranje
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={generateAllVoices}
                      disabled={!elevenLabsApiKey.trim() || isGeneratingAllVoices}
                      className="flex-1 glass-button cyber-gradient text-white font-semibold"
                    >
                      {isGeneratingAllVoices ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                          Generiranje svih glasova...
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 mr-2" />
                          Generiraj Sve Glasove
                        </>
                      )}
                    </Button>
                  </div>
                </GlassCardContent>
              </GlassCard>
            )}

            {/* Avatar Customization */}
            <GlassCard variant="accent">
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <UserCheck className="w-6 h-6 text-accent" />
                  Prilagođavanje Avatara
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="space-y-6">
                  {/* Gender Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Spol avatara</Label>
                    <RadioGroup
                      value={selectedGender}
                      onValueChange={(value) => setSelectedGender(value as 'male' | 'female')}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="flex items-center gap-2 cursor-pointer">
                          <User2 className="w-4 h-4" />
                          Muški
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="flex items-center gap-2 cursor-pointer">
                          <Users className="w-4 h-4" />
                          Ženski
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Avatar Description */}
                  <div className="space-y-3">
                    <Label htmlFor="avatar-description" className="text-sm font-medium">
                      Opis avatara
                    </Label>
                    <Textarea
                      id="avatar-description"
                      placeholder="Opišite kako avatar treba da izgleda (npr. 'Mlada poslovnica sa kratkom crnom kosom, profesionalno odjevena, prijatan osmijeh...')"
                      value={avatarDescription}
                      onChange={(e) => setAvatarDescription(e.target.value)}
                      className="glass border-glass-border min-h-20"
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Referentna slika (opcionalno)</Label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="glass border-glass-border"
                        />
                      </div>
                      {avatarImagePreview && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-glass-border">
                          <img
                            src={avatarImagePreview}
                            alt="Avatar preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Uploadaj sliku koja će služiti kao referenca za izgled avatara
                    </p>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* Avatar Generation */}
            <GlassCard variant="accent">
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-accent" />
                  Avatar Generiranje
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="space-y-4">
                  <div className="glass p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Spremni za generiranje</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Broj avatara: {scriptAvatarCount}</p>
                      <p>• Generirani glasovi: {generatedVoices.filter(v => v).length}/{scriptAvatarCount}</p>
                      <p>• Spol: {selectedGender === 'male' ? 'Muški' : 'Ženski'}</p>
                      {avatarDescription && <p>• Opis: Definisan</p>}
                      {avatarImage && <p>• Referentna slika: Uploadana</p>}
                    </div>
                  </div>
                  
                  <Button
                    onClick={generateAvatars}
                    className="w-full glass-button"
                    disabled={isGenerating || generatedVoices.filter(v => v).length === 0}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generiranje realističnih avatara...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Generiraj realistične avatare
                      </>
                    )}
                  </Button>
                  
                  {generatedVoices.filter(v => v).length === 0 && (
                    <div className="glass p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                      <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                        Prvo generirajte glasove u "AI Voice Podcast" sekciji
                      </p>
                    </div>
                  )}
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            {/* Generated Script */}
            <GlassCard variant="glow">
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  Generirani Script
                  {generatedScript && (
                    <Button
                      onClick={() => setIsEditingScript(!isEditingScript)}
                      size="sm"
                      variant="ghost"
                      className="ml-auto"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  )}
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                {!generatedScript ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Script će se pojaviti ovdje nakon generiranja</p>
                    <p className="text-sm mt-2">Unesite OpenAI API ključ i generirajte script</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {isEditingScript ? (
                      <div className="space-y-3">
                        <Textarea
                          value={generatedScript}
                          onChange={(e) => setGeneratedScript(e.target.value)}
                          className="min-h-96 glass border-glass-border font-mono text-sm"
                          placeholder="Uređujte script ovdje..."
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setIsEditingScript(false)}
                            className="glass-button"
                          >
                            Spremi izmjene
                          </Button>
                          <Button
                            onClick={() => setIsEditingScript(false)}
                            variant="outline"
                            className="glass-button"
                          >
                            Otkaži
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="glass p-4 rounded-lg">
                        <div className="whitespace-pre-wrap font-mono text-sm">
                          {generatedScript}
                        </div>
                        <div className="flex gap-2 mt-4 pt-4 border-t border-glass-border">
                          <Button
                            onClick={() => setIsEditingScript(true)}
                            size="sm"
                            variant="outline"
                            className="glass-button"
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Uredi
                          </Button>
                          <Button
                            onClick={regenerateScript}
                            size="sm"
                            variant="outline"
                            className="glass-button"
                            disabled={isGeneratingScript}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Regeneriraj
                          </Button>
                          <Button
                            onClick={() => {
                              navigator.clipboard.writeText(generatedScript);
                              toast.success("Script kopiran u clipboard!");
                            }}
                            size="sm"
                            variant="outline"
                            className="glass-button ml-auto"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Kopiraj
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>

            <GlassCard variant="secondary">
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
                           <div className="w-16 h-16 rounded-full cyber-gradient-secondary flex items-center justify-center overflow-hidden">
                             {avatar.image ? (
                               <img 
                                 src={avatar.image} 
                                 alt={avatar.name}
                                 className="w-full h-full object-cover"
                               />
                             ) : (
                               <User className="w-8 h-8 text-white" />
                             )}
                           </div>
                           <div className="flex-1">
                             <h3 className="font-semibold text-lg">{avatar.name}</h3>
                             {avatar.description && (
                               <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                 {avatar.description}
                               </p>
                             )}
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
                               <div className="w-full h-32 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-lg flex items-center justify-center overflow-hidden">
                                 {avatar.image ? (
                                   <img 
                                     src={avatar.image} 
                                     alt={`${avatar.name} full image`}
                                     className="w-full h-full object-cover rounded-lg"
                                   />
                                 ) : (
                                   <Image className="w-8 h-8 text-accent" />
                                 )}
                               </div>
                               <div className="flex justify-between items-center mt-2">
                                 <span className="text-sm text-muted-foreground">
                                   {avatar.image ? 'Realistični Avatar' : 'Avatar Image'}
                                 </span>
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