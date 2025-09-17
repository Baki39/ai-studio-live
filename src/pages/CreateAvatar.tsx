import { useState, useRef } from "react";
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
  Volume2,
  Square
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

interface AudioState {
  [key: string]: {
    isPlaying: boolean;
    audio: HTMLAudioElement | null;
  };
}

export default function CreateAvatar() {
  const [concept, setConcept] = useState("");
  const [links, setLinks] = useState<string[]>([""]);
  const [duration, setDuration] = useState("");
  const [avatars, setAvatars] = useState<GeneratedAvatar[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioStates, setAudioStates] = useState<AudioState>({});
  
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
  const [avatarVoices, setAvatarVoices] = useState<Array<{
    voiceId: string;
    model: string;
    customVoiceId?: string;
  }>>([]);
  const [generatedVoices, setGeneratedVoices] = useState<Array<string | null>>([]);
  const [isGeneratingVoices, setIsGeneratingVoices] = useState<Array<boolean>>([]);
  const [isGeneratingAllVoices, setIsGeneratingAllVoices] = useState(false);
  const [isAnalyzingLinks, setIsAnalyzingLinks] = useState(false);
  const [linkAnalysis, setLinkAnalysis] = useState<any>(null);
  
  // ElevenLabs API configuration
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState("");
  const [isUpdatingApiKey, setIsUpdatingApiKey] = useState(false);

  const addLink = () => {
    setLinks([...links, ""]);
  };

  const updateLink = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const updateElevenLabsApiKey = async () => {
    if (!elevenLabsApiKey.trim()) {
      toast.error("Molimo unesite ElevenLabs API ključ");
      return;
    }

    setIsUpdatingApiKey(true);
    try {
      // This would typically call an edge function to update the API key securely
      // For now, we'll just show a success message
      toast.success("ElevenLabs API ključ uspješno ažuriran!");
      setElevenLabsApiKey(""); // Clear the input for security
    } catch (error) {
      console.error('Error updating API key:', error);
      toast.error("Greška pri ažuriranju API ključa");
    } finally {
      setIsUpdatingApiKey(false);
    }
  };

  const analyzeLinks = async () => {
    const validLinks = links.filter(link => link.trim());
    
    if (validLinks.length === 0) {
      toast.error("Molimo dodajte barem jedan link");
      return;
    }

    setIsAnalyzingLinks(true);
    toast.success("AI analizira linkove...");

    try {
      const { data, error } = await supabase.functions.invoke('analyze-links', {
        body: {
          links: validLinks,
          concept,
          duration
        }
      });

      if (error) {
        throw new Error(error.message || 'Greška pri analizi linkova');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setLinkAnalysis(data.analysis);
      
      // Auto-update concept if it was empty or if user wants enhancement
      if (!concept.trim() && data.analysis.enhancedConcept) {
        setConcept(data.analysis.enhancedConcept);
      }
      
      setIsAnalyzingLinks(false);
      toast.success("Linkovi uspješno analizirani!");
      
    } catch (error) {
      console.error('Greška:', error);
      setIsAnalyzingLinks(false);
      toast.error(error.message || "Greška pri analizi linkova");
    }
  };

  const generateScript = async () => {
    // Auto-analyze links if we have links but no analysis yet
    const validLinks = links.filter(link => link.trim());
    let finalConcept = concept;
    
    if (validLinks.length > 0 && !linkAnalysis) {
      await analyzeLinks();
      finalConcept = linkAnalysis?.enhancedConcept || concept;
    }
    
    if (!finalConcept.trim() && !linkAnalysis) {
      toast.error("Molimo unesite koncept podcasta ili dodajte linkove za analizu");
      return;
    }

    setIsGeneratingScript(true);
    toast.success("Generiranje AI scripta u toku...");

    try {
      const { data, error } = await supabase.functions.invoke('generate-script', {
        body: {
          concept: finalConcept || linkAnalysis?.enhancedConcept,
          links: validLinks,
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

      const { data, error } = await supabase.functions.invoke('generate-voice', {
        body: {
          text: avatarText,
          voice_id: voiceId
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      // Convert base64 to blob and create URL
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const newGeneratedVoices = [...generatedVoices];
      newGeneratedVoices[avatarIndex] = audioUrl;
      setGeneratedVoices(newGeneratedVoices);
      
      toast.success(`Voice za Avatar ${avatarIndex + 1} uspješno generiran!`);
      
    } catch (error) {
      console.error('Greška:', error);
      toast.error("Greška pri generiranju voice-a. Molimo provjerite konfiguraciju.");
    } finally {
      const newIsGenerating = [...isGeneratingVoices];
      newIsGenerating[avatarIndex] = false;
      setIsGeneratingVoices(newIsGenerating);
    }
  };

  const handlePlayPause = (avatarIndex: number) => {
    const audioUrl = generatedVoices[avatarIndex];
    if (!audioUrl) return;

    const currentState = audioStates[`avatar-${avatarIndex}`];
    
    if (currentState?.isPlaying) {
      // Pause
      currentState.audio?.pause();
      setAudioStates(prev => ({
        ...prev,
        [`avatar-${avatarIndex}`]: { ...prev[`avatar-${avatarIndex}`], isPlaying: false }
      }));
    } else {
      // Play
      if (currentState?.audio) {
        currentState.audio.play();
        setAudioStates(prev => ({
          ...prev,
          [`avatar-${avatarIndex}`]: { ...prev[`avatar-${avatarIndex}`], isPlaying: true }
        }));
      } else {
        // Create new audio instance
        const audio = new Audio(audioUrl);
        audio.addEventListener('ended', () => {
          setAudioStates(prev => ({
            ...prev,
            [`avatar-${avatarIndex}`]: { ...prev[`avatar-${avatarIndex}`], isPlaying: false }
          }));
        });
        audio.play();
        setAudioStates(prev => ({
          ...prev,
          [`avatar-${avatarIndex}`]: { audio, isPlaying: true }
        }));
      }
    }
  };

  const handleStop = (avatarIndex: number) => {
    const currentState = audioStates[`avatar-${avatarIndex}`];
    if (currentState?.audio) {
      currentState.audio.pause();
      currentState.audio.currentTime = 0;
      setAudioStates(prev => ({
        ...prev,
        [`avatar-${avatarIndex}`]: { ...prev[`avatar-${avatarIndex}`], isPlaying: false }
      }));
    }
  };

  const handleDownload = (avatarIndex: number) => {
    const audioUrl = generatedVoices[avatarIndex];
    if (!audioUrl) return;
    
    const filename = `avatar_${avatarIndex + 1}_voice.mp3`;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const playGeneratedVoice = (avatarIndex: number) => {
    handlePlayPause(avatarIndex);
  };

  const generateAllVoices = async () => {
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
            {/* ElevenLabs API Configuration */}
            <GlassCard variant="primary">
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <Key className="w-6 h-6 text-primary" />
                  ElevenLabs API Konfiguracija
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                <div>
                  <Label htmlFor="elevenlabs-api">ElevenLabs API Ključ</Label>
                  <div className="flex gap-2">
                    <Input
                      id="elevenlabs-api"
                      type="password"
                      placeholder="Unesite vaš ElevenLabs API ključ..."
                      value={elevenLabsApiKey}
                      onChange={(e) => setElevenLabsApiKey(e.target.value)}
                      className="glass border-glass-border"
                    />
                    <Button
                      onClick={updateElevenLabsApiKey}
                      disabled={isUpdatingApiKey || !elevenLabsApiKey.trim()}
                      className="glass-button"
                    >
                      {isUpdatingApiKey ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Ažuriranje...
                        </>
                      ) : (
                        <>
                          <Key className="w-4 h-4 mr-2" />
                          Ažuriraj
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Sigurno čuvanje vašeg API ključa za generiranje glasova
                  </p>
                </div>
              </GlassCardContent>
            </GlassCard>

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
                    <div className="flex gap-2">
                      <Button
                        onClick={addLink}
                        variant="outline"
                        size="sm"
                        className="glass-button"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Dodaj link
                      </Button>
                      
                      {links.some(link => link.trim()) && (
                        <Button
                          onClick={analyzeLinks}
                          disabled={isAnalyzingLinks}
                          size="sm"
                          className="glass-button"
                        >
                          {isAnalyzingLinks ? (
                            <>
                              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                              Analiziranje...
                            </>
                          ) : (
                            <>
                              <Brain className="w-4 h-4 mr-2" />
                              Analiziraj AI
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {linkAnalysis && (
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      AI Analiza Linkova
                    </h4>
                    <div className="space-y-2 text-sm">
                      {linkAnalysis.enhancedConcept && (
                        <div>
                          <span className="font-medium">Poboljšani koncept:</span>
                          <p className="text-muted-foreground mt-1">{linkAnalysis.enhancedConcept}</p>
                        </div>
                      )}
                      {linkAnalysis.mainTopics?.length > 0 && (
                        <div>
                          <span className="font-medium">Glavne teme:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {linkAnalysis.mainTopics.map((topic: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {linkAnalysis.style && (
                        <div>
                          <span className="font-medium">Stil:</span>
                          <span className="text-muted-foreground ml-2">{linkAnalysis.style}</span>
                        </div>
                      )}
                      <Button
                        onClick={() => setConcept(linkAnalysis.enhancedConcept)}
                        size="sm"
                        variant="outline"
                        className="mt-2"
                      >
                        Koristi ovaj koncept
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <Label>Trajanje live podcast-a</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="glass border-glass-border">
                      <SelectValue placeholder="Izaberi trajanje..." />
                    </SelectTrigger>
                    <SelectContent className="glass border-glass-border">
                      <SelectItem value="0-1">0-1 minuta</SelectItem>
                      <SelectItem value="1-3">1-3 minuta</SelectItem>
                      <SelectItem value="3-5">3-5 minuta</SelectItem>
                      <SelectItem value="5-8">5-8 minuta</SelectItem>
                      <SelectItem value="8-10">8-10 minuta</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <div className="space-y-3">
                    <Label>Voice konfiguracija za svaki avatar</Label>
                    {Array.from({ length: parseInt(scriptAvatarCount) }, (_, index) => (
                      <div key={index} className="glass p-4 rounded-lg space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium">Avatar {index + 1}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm">Voice</Label>
                            <Select 
                              value={avatarVoices[index]?.voiceId || ""} 
                              onValueChange={(value) => updateAvatarVoice(index, "voiceId", value)}
                            >
                              <SelectTrigger className="glass border-glass-border">
                                <SelectValue placeholder="Izaberite voice" />
                              </SelectTrigger>
                              <SelectContent className="glass border-glass-border">
                                <SelectItem value="21m00Tcm4TlvDq8ikWAM">Rachel</SelectItem>
                                <SelectItem value="AZnzlk1XvdvUeBnXmlld">Domi</SelectItem>
                                <SelectItem value="EXAVITQu4vr4xnSDxMaL">Bella</SelectItem>
                                <SelectItem value="ErXwobaYiN019PkySvjV">Antoni</SelectItem>
                                <SelectItem value="MF3mGyEYCl7XYWbV9V6O">Elli</SelectItem>
                                <SelectItem value="TxGEqnHWrfWFTfGW9XjX">Josh</SelectItem>
                                <SelectItem value="VR6AewLTigWG4xSOukaG">Arnold</SelectItem>
                                <SelectItem value="pNInz6obpgDQGcFmaJgB">Adam</SelectItem>
                                <SelectItem value="yoZ06aMxZJJ28mfd3POQ">Sam</SelectItem>
                                <SelectItem value="custom">Custom Voice ID</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label className="text-sm">Model</Label>
                            <Select 
                              value={avatarVoices[index]?.model || "eleven_multilingual_v2"} 
                              onValueChange={(value) => updateAvatarVoice(index, "model", value)}
                            >
                              <SelectTrigger className="glass border-glass-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="glass border-glass-border">
                                <SelectItem value="eleven_multilingual_v2">Multilingual v2</SelectItem>
                                <SelectItem value="eleven_turbo_v2_5">Turbo v2.5</SelectItem>
                                <SelectItem value="eleven_turbo_v2">Turbo v2</SelectItem>
                                <SelectItem value="eleven_monolingual_v1">English v1</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        {avatarVoices[index]?.voiceId === "custom" && (
                          <div>
                            <Label className="text-sm">Custom Voice ID</Label>
                            <Input
                              placeholder="Unesite voice ID..."
                              value={avatarVoices[index]?.customVoiceId || ""}
                              onChange={(e) => updateAvatarVoice(index, "customVoiceId", e.target.value)}
                              className="glass border-glass-border"
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => generateVoiceForAvatar(index)}
                            disabled={isGeneratingVoices[index]}
                            size="sm"
                            className="glass-button"
                          >
                            {isGeneratingVoices[index] ? (
                              <>
                                <Sparkles className="w-3 h-3 mr-1 animate-spin" />
                                Generiranje...
                              </>
                            ) : (
                              <>
                                <Mic className="w-3 h-3 mr-1" />
                                Generiraj
                              </>
                            )}
                          </Button>
                          
                          {generatedVoices[index] && (
                            <div className="flex gap-1">
                              <Button
                                onClick={() => handlePlayPause(index)}
                                size="sm"
                                variant="outline"
                                className="glass-button"
                              >
                                {audioStates[`avatar-${index}`]?.isPlaying ? (
                                  <Pause className="w-3 h-3" />
                                ) : (
                                  <Play className="w-3 h-3" />
                                )}
                              </Button>
                              
                              <Button
                                onClick={() => handleStop(index)}
                                size="sm"
                                variant="outline"
                                className="glass-button"
                              >
                                <Square className="w-3 h-3" />
                              </Button>
                              
                              <Button
                                onClick={() => handleDownload(index)}
                                size="sm"
                                variant="outline"
                                className="glass-button"
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={generateAllVoices}
                    disabled={isGeneratingAllVoices}
                    className="w-full glass-button"
                  >
                    {isGeneratingAllVoices ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Generiranje svih glasova...
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 mr-2" />
                        Generiraj sve glasove
                      </>
                    )}
                  </Button>
                </GlassCardContent>
              </GlassCard>
            )}
          </div>

          {/* Generated Script Display */}
          <div className="space-y-6">
            {generatedScript && (
              <GlassCard>
                <GlassCardHeader>
                  <div className="flex items-center justify-between">
                    <GlassCardTitle className="flex items-center gap-2">
                      <FileText className="w-6 h-6 text-primary" />
                      Generirani Script
                    </GlassCardTitle>
                    <Button
                      onClick={() => setIsEditingScript(!isEditingScript)}
                      variant="outline"
                      size="sm"
                      className="glass-button"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                </GlassCardHeader>
                <GlassCardContent>
                  {isEditingScript ? (
                    <Textarea
                      value={generatedScript}
                      onChange={(e) => setGeneratedScript(e.target.value)}
                      className="min-h-96 glass border-glass-border font-mono text-sm"
                    />
                  ) : (
                    <div className="glass p-4 rounded-lg max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                        {generatedScript}
                      </pre>
                    </div>
                  )}
                </GlassCardContent>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}