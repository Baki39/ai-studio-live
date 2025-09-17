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
  Square,
  Send,
  Monitor,
  Camera,
  Smile,
  Heart,
  Zap
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
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

  const addLink = () => {
    setLinks([...links, ""]);
  };

  const updateLink = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
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
    if (!script?.trim()) return "";

    const lines = script.replace(/\r\n?/g, "\n").split("\n");

    // Helper: try to parse a speaker label from a line
    const parseSpeakerFromLine = (line: string): { label: string; content: string } | null => {
      // Normalize and support bold markers both before and after the label/punctuation
      const l = line.replace(/\u00A0/g, ' ').trim();

      // 1) Prefer explicit "Avatar N" labels (supports **bold**, (brackets), and optional punctuation or EOL)
      //    Also allow closing **/__ immediately after punctuation
      const avatarMatch = l.match(/^\s*(?:\*\*|__)?\s*(?:[\[\(])?\s*(Avatar\s*\d+)\s*(?:[\]\)])?\s*(?::|[-–—])?\s*(?:\*\*|__)?\s*(.*)$/i);
      if (avatarMatch) {
        const label = avatarMatch[1].trim();
        let content = (avatarMatch[2] || "").trim();
        // Strip stray bold markers around content
        content = content.replace(/^(?:\*\*|__)\s*/, '').replace(/\s*(?:\*\*|__)$/, '').trim();
        return { label, content };
      }

      // 2) Named speakers (Amir:, Hana— ...) require punctuation; allow closing **/__ after punctuation
      const nameMatch = l.match(/^\s*(?:\*\*|__)?\s*([A-Za-zČĆŠĐŽčćšđž][\wČĆŠĐŽčćšđž'’\- ]{0,30})\s*[:\-–—]\s*(?:\*\*|__)?\s*(.*)$/i);
      if (nameMatch) {
        const label = nameMatch[1].trim();
        let content = (nameMatch[2] || "").trim();
        content = content.replace(/^(?:\*\*|__)\s*/, '').replace(/\s*(?:\*\*|__)$/, '').trim();
        return { label, content };
      }

      return null;
    };
    type Block = { speaker: string; text: string[] };
    const blocks: Block[] = [];
    const speakersOrder: string[] = [];

    let i = 0;
    while (i < lines.length) {
      const raw = lines[i].trim();
      const parsed = parseSpeakerFromLine(raw);

      if (parsed) {
        const speaker = parsed.label;
        if (!speakersOrder.includes(speaker)) speakersOrder.push(speaker);

        const textLines: string[] = [];
        if (parsed.content) textLines.push(parsed.content);

        let j = i + 1;
        // Collect until next line that starts with a speaker label
        while (j < lines.length) {
          const next = lines[j].trim();
          if (parseSpeakerFromLine(next)) break;
          if (next) textLines.push(next);
          j++;
        }

        blocks.push({ speaker, text: textLines });
        i = j; // continue from next potential speaker
        continue;
      }

      i++;
    }

    // If we could not detect any blocks with labels, fallback: give all text to the first avatar
    if (blocks.length === 0) {
      return avatarIndex === 0 ? lines.join(" ").trim() : "";
    }

    // Map speakers to avatar indices
    const getAvatarIdxForSpeaker = (speaker: string): number => {
      const avatarNum = speaker.match(/Avatar\s*(\d+)/i);
      if (avatarNum) {
        return Math.max(0, parseInt(avatarNum[1], 10) - 1);
      }
      // Non "Avatar X" label -> assign by order of first appearance
      const pos = speakersOrder.indexOf(speaker);
      return pos >= 0 ? pos : -1;
    };

    // Aggregate text for the requested avatar
    const collected: string[] = [];
    for (const b of blocks) {
      const idx = getAvatarIdxForSpeaker(b.speaker);
      if (idx === avatarIndex) {
        collected.push(b.text.join(" "));
      }
    }

    // If still empty and there are exactly 2 speakers, try alternating fallback
    if (collected.length === 0 && speakersOrder.length === 2) {
      const alt: string[] = [];
      blocks.forEach((b, bi) => {
        alt.push(bi % 2 === avatarIndex ? b.text.join(" ") : "");
      });
      return alt.filter(Boolean).join(" ").trim();
    }

    return collected.join(" ").trim();
  };

  const generateVoiceForAvatar = async (avatarIndex: number) => {
    const voiceConfig = avatarVoices[avatarIndex];
    if (!voiceConfig?.voiceId) {
      toast.error("Molimo izaberite voice za avatar");
      return;
    }

    let voiceId = voiceConfig.voiceId;
    
    // Handle custom voice ID or predefined voices  
    if (voiceConfig.voiceId === "custom") {
      voiceId = voiceConfig.customVoiceId;
    } else if (voiceConfig.voiceId === "bosanac-sarajlija") {
      voiceId = "lAB2lrSx4vWAj0r5TaOa"; // Bosanac/Sarajlija custom voice
      console.log("Using Bosanac/Sarajlija voice:", voiceId);
    }
    
    console.log("Final voice ID:", voiceId, "for voice config:", voiceConfig);
    
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
          voice_id: voiceId,
          model_id: voiceConfig.model || "eleven_multilingual_v2",
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error((error as any).message || 'Greška sa server funkcijom');
      }

      if (!data || (data as any).error) {
        const msg = (data as any)?.error || 'Prazan odgovor sa servera';
        console.error('Function returned error:', msg);
        throw new Error(msg);
      }

      if (!(data as any).audioContent) {
        console.error('No audioContent in response:', data);
        throw new Error('Nema audio sadržaja u odgovoru');
      }

      // Convert base64 to blob and create URL with robust fallback
      let audioUrl: string | undefined;
      const base64Audio = (data as any).audioContent;
      if (!base64Audio || typeof base64Audio !== 'string') {
        throw new Error('Invalid base64 audio content');
      }

      try {
        // Decode base64 safely
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBlob = new Blob([bytes], { type: (data as any).mimeType || 'audio/mpeg' });
        audioUrl = URL.createObjectURL(audioBlob);
      } catch (decodeError) {
        console.error('Error decoding base64 audio, using data URL fallback:', decodeError);
        const mime = (data as any).mimeType || 'audio/mpeg';
        audioUrl = `data:${mime};base64,${base64Audio}`;
      }
      
      const newGeneratedVoices = [...generatedVoices];
      newGeneratedVoices[avatarIndex] = audioUrl;
      setGeneratedVoices(newGeneratedVoices);
      
      toast.success(`Voice za Avatar ${avatarIndex + 1} uspješno generiran!`);
      
    } catch (error: any) {
      console.error('Greška pri generiranju voice-a:', error);
      toast.error(error?.message || "Greška pri generiranju voice-a. Molimo provjerite konfiguraciju.");
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

  const [selectedAvatarForCreation, setSelectedAvatarForCreation] = useState<number | null>(null);
  const [isCreatingVideo, setIsCreatingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [createdAvatarVideo, setCreatedAvatarVideo] = useState<string | null>(null);
  
  // Image generation/upload states
  const [selectedAvatarImage, setSelectedAvatarImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [uploadedAvatarFile, setUploadedAvatarFile] = useState<File | null>(null);

  const generateAvatarImage = async () => {
    if (!imagePrompt.trim()) {
      toast.error("Molimo unesite opis slike");
      return;
    }

    setIsGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt: imagePrompt }
      });

      if (error) {
        throw new Error(error.message);
      }

      setSelectedAvatarImage(data.imageUrl);
      toast.success("Slika avatara uspješno generirana!");
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error("Greška pri generiranju slike");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleAvatarImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedAvatarImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      toast.success("Slika uspješno učitana!");
    }
  };

  const createAvatarWithVoice = (avatarIndex: number) => {
    setSelectedAvatarForCreation(avatarIndex);
    // Reset image selection when creating new avatar
    setSelectedAvatarImage(null);
    setImagePrompt("");
    setUploadedAvatarFile(null);
  };

  const generateAvatarVideo = async () => {
    if (selectedAvatarForCreation === null) return;
    
    const voiceConfig = avatarVoices[selectedAvatarForCreation];
    const generatedVoice = generatedVoices[selectedAvatarForCreation];
    
    if (!generatedVoice) {
      toast.error("Nema generisanog glasa za ovaj avatar");
      return;
    }

    if (!selectedAvatarImage) {
      toast.error("Molimo odaberite ili generirajte sliku avatara");
      return;
    }

    setIsCreatingVideo(true);
    setVideoProgress(0);

    try {
      // Simulate video generation progress
      const progressInterval = setInterval(() => {
        setVideoProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 1000);

      // Get podcast duration (now in seconds)
      const durationValue = parseInt(duration) || 5; // Default to 5 seconds
      const finalDuration = Math.max(5, Math.min(10, durationValue)); // 5-10 seconds
      
      console.log('Using duration for video generation:', finalDuration, 'seconds');
      
      // Create video generation request
      const response = await supabase.functions.invoke('generate-avatar-video', {
        body: {
          avatar: {
            gender: selectedAvatarForCreation % 2 === 0 ? selectedGender : (selectedGender === 'male' ? 'female' : 'male'),
            image: selectedAvatarImage,
            voice: voiceConfig?.voiceId || 'default'
          },
          audioUrl: generatedVoice,
          duration: finalDuration, // Already in seconds
          emotions: ['neutral', 'smile', 'talking', 'laugh', 'nod'],
          movements: ['head_nod', 'slight_turn', 'blink', 'mouth_sync']
        }
      });

      clearInterval(progressInterval);
      setVideoProgress(100);

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Create avatar with video
      const newAvatar: GeneratedAvatar = {
        id: `avatar-${selectedAvatarForCreation + 1}-${Date.now()}`,
        name: `Avatar ${selectedAvatarForCreation + 1}`,
        gender: selectedAvatarForCreation % 2 === 0 ? selectedGender : (selectedGender === 'male' ? 'female' : 'male'),
        voice: voiceConfig?.voiceId || 'default',
        image: selectedAvatarImage,
        video: response.data?.videoUrl || null,
        audio: null, // Store the audio separately if needed
        description: avatarDescription || `Profesionalni avatar sa sinhronizovanim glasom i pokretima`
      };

      setCreatedAvatarVideo(response.data?.videoUrl || null);
      setAvatars(prev => [...prev, newAvatar]);
      toast.success("Avatar sa videom uspješno kreiran!");

    } catch (error) {
      console.error('Error generating avatar video:', error);
      toast.error("Greška pri kreiranju avatar videa");
    } finally {
      setIsCreatingVideo(false);
    }
  };

  const downloadAvatar = () => {
    if (selectedAvatarForCreation === null || !createdAvatarVideo) return;
    
    const link = document.createElement('a');
    link.href = createdAvatarVideo;
    link.download = `avatar-${selectedAvatarForCreation + 1}-video.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Avatar video preuzet!");
  };

  const sendToPodcastLive = () => {
    if (selectedAvatarForCreation === null) return;
    
    const avatar = avatars[avatars.length - 1]; // Latest created avatar
    if (avatar) {
      // Store avatar data in localStorage for Podcast Live
      localStorage.setItem('selectedAvatar', JSON.stringify(avatar));
      
      // Navigate to Podcast Live
      window.location.href = '/podcast-live';
      toast.success("Avatar poslat u Podcast Live!");
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
                      <SelectItem value="5">5 sekundi</SelectItem>
                      <SelectItem value="10">10 sekundi</SelectItem>
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
                                 <SelectItem value="bosanac-sarajlija">Bosanac/Sarajlija (Custom)</SelectItem>
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
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    onClick={() => createAvatarWithVoice(index)}
                                    size="sm"
                                    variant="default"
                                    className="glass-button bg-primary text-primary-foreground hover:bg-primary/90"
                                  >
                                    <UserCheck className="w-3 h-3 mr-1" />
                                    Kreiraj Avatar
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass border-glass-border">
                                  <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                      🎭 Kreiranje Avatara sa Video Animacijom
                                    </DialogTitle>
                                  </DialogHeader>
                                  
                                  <div className="space-y-6 p-2">
                                    {/* Avatar Preview */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                          <User className="w-5 h-5" />
                                          Avatar Informacije
                                        </h3>
                                        <div className="glass p-4 rounded-lg space-y-3">
                                          <div className="flex items-center gap-3">
                                            <Badge variant="secondary">Avatar {index + 1}</Badge>
                                            <Badge variant={index % 2 === 0 ? "default" : "secondary"}>
                                              {index % 2 === 0 ? selectedGender === 'male' ? '👨 Muški' : '👩 Ženski' : selectedGender === 'male' ? '👩 Ženski' : '👨 Muški'}
                                            </Badge>
                                          </div>
                                           {(selectedAvatarImage || avatarImagePreview) && (
                                             <img 
                                               src={selectedAvatarImage || avatarImagePreview || ""} 
                                               alt="Avatar preview" 
                                               className="w-full h-32 object-cover rounded-lg border border-glass-border"
                                             />
                                           )}
                                          <div className="text-sm text-muted-foreground">
                                            <p><strong>Glas:</strong> {avatarVoices[index]?.voiceId || 'Default'}</p>
                                            <p><strong>Tip:</strong> Profesionalni avatar</p>
                                            <p><strong>Trajanje videa:</strong> {duration.includes('3-5') ? '4' : duration.includes('5-8') ? '6' : '3'} minuta</p>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="space-y-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                          <Video className="w-5 h-5" />
                                          Video Animacija
                                        </h3>
                                        <div className="glass p-4 rounded-lg space-y-3">
                                          <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="flex items-center gap-2">
                                              <Smile className="w-4 h-4 text-primary" />
                                              <span>Emocije</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Camera className="w-4 h-4 text-accent" />
                                              <span>Pokreti</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Volume2 className="w-4 h-4 text-primary" />
                                              <span>Lip Sync</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Heart className="w-4 h-4 text-red-500" />
                                              <span>Animacije</span>
                                            </div>
                                          </div>
                                          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded-lg">
                                            <p className="text-sm text-center">
                                              ✨ AI će kreirati realnu avatar animaciju sa:<br/>
                                              • Sinhronizacija usta sa govorom<br/>
                                              • Prirodni pokreti i gestovi<br/>
                                              • Emocionalne ekspresije<br/>
                                              • Profesionalni kvalitet videa
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                     </div>

                                     {/* Image Generation/Upload Section */}
                                     <div className="space-y-4">
                                       <h3 className="text-lg font-semibold flex items-center gap-2">
                                         <Image className="w-5 h-5 text-blue-500" />
                                         Avatar Slika
                                       </h3>
                                       <div className="glass p-4 rounded-lg">
                                         <Tabs defaultValue="generate" className="w-full">
                                           <TabsList className="grid w-full grid-cols-2 mb-4">
                                             <TabsTrigger value="generate">Generiraj Sliku</TabsTrigger>
                                             <TabsTrigger value="upload">Upload Sliku</TabsTrigger>
                                           </TabsList>
                                           
                                           <TabsContent value="generate" className="space-y-4">
                                             <div>
                                               <Label>Opis avatar slike</Label>
                                               <Textarea
                                                 value={imagePrompt}
                                                 onChange={(e) => setImagePrompt(e.target.value)}
                                                 placeholder="Npr. Profesionalni poslovni avatar, muška osoba, formalna odjeća, studio pozadina..."
                                                 className="glass border-glass-border min-h-20"
                                               />
                                             </div>
                                             <Button
                                               onClick={generateAvatarImage}
                                               disabled={isGeneratingImage}
                                               className="w-full glass-button"
                                             >
                                               {isGeneratingImage ? (
                                                 <>
                                                   <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                                   Generiranje...
                                                 </>
                                               ) : (
                                                 <>
                                                   <Sparkles className="w-4 h-4 mr-2" />
                                                   Generiraj AI Sliku
                                                 </>
                                               )}
                                             </Button>
                                           </TabsContent>
                                           
                                           <TabsContent value="upload" className="space-y-4">
                                             <div>
                                               <Label>Upload sliku avatara</Label>
                                               <Input
                                                 type="file"
                                                 accept="image/*"
                                                 onChange={handleAvatarImageUpload}
                                                 className="glass border-glass-border"
                                               />
                                               <p className="text-sm text-muted-foreground mt-2">
                                                 Podržani formati: JPG, PNG, WEBP (max 10MB)
                                               </p>
                                             </div>
                                           </TabsContent>
                                         </Tabs>
                                         
                                         {selectedAvatarImage && (
                                           <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                                             <div className="flex items-center gap-2 mb-2">
                                               <Image className="w-4 h-4 text-green-600" />
                                               <span className="text-sm font-medium text-green-800 dark:text-green-200">Slika odabrana</span>
                                             </div>
                                             <img 
                                               src={selectedAvatarImage} 
                                               alt="Selected avatar" 
                                               className="w-full h-32 object-cover rounded border"
                                             />
                                           </div>
                                         )}
                                       </div>
                                     </div>

                                    {/* Video Generation Progress */}
                                    {isCreatingVideo && (
                                      <div className="space-y-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                          <Zap className="w-5 h-5 animate-pulse" />
                                          Kreiranje Video Avatara...
                                        </h3>
                                        <div className="glass p-4 rounded-lg">
                                          <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                              <span>Progres</span>
                                              <span>{videoProgress}%</span>
                                            </div>
                                            <Progress value={videoProgress} className="w-full" />
                                            <div className="text-xs text-muted-foreground text-center">
                                              {videoProgress < 30 && "🎯 Analiziranje audio sadržaja..."}
                                              {videoProgress >= 30 && videoProgress < 60 && "🎭 Kreiranje avatar animacije..."}
                                              {videoProgress >= 60 && videoProgress < 90 && "🎬 Renderovanje video sadržaja..."}
                                              {videoProgress >= 90 && "✨ Finaliziranje..."}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Created Video Preview */}
                                    {createdAvatarVideo && (
                                      <div className="space-y-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                          <Video className="w-5 h-5 text-green-500" />
                                          Kreiran Avatar Video
                                        </h3>
                                        <div className="glass p-4 rounded-lg">
                                          <video 
                                            src={createdAvatarVideo} 
                                            controls 
                                            className="w-full rounded-lg border border-glass-border"
                                            poster={avatarImagePreview || undefined}
                                          />
                                        </div>
                                      </div>
                                    )}

                                     {/* Action Buttons */}
                                     <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-glass-border">
                                       {!isCreatingVideo && !createdAvatarVideo && (
                                         <Button
                                           onClick={generateAvatarVideo}
                                           disabled={!selectedAvatarImage}
                                           className="flex-1 glass-button bg-gradient-to-r from-primary to-accent text-white font-semibold py-3"
                                           size="lg"
                                         >
                                           <Video className="w-5 h-5 mr-2" />
                                           {selectedAvatarImage ? 'Generiši Avatar Video' : 'Odaberite sliku prvo'}
                                         </Button>
                                       )}

                                      {createdAvatarVideo && (
                                        <>
                                          <Button
                                            onClick={downloadAvatar}
                                            variant="outline"
                                            className="flex-1 glass-button border-primary/50 hover:bg-primary/10"
                                            size="lg"
                                          >
                                            <Download className="w-5 h-5 mr-2" />
                                            Preuzmi Avatar
                                          </Button>

                                          <Button
                                            onClick={sendToPodcastLive}
                                            className="flex-1 glass-button bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold"
                                            size="lg"
                                          >
                                            <Send className="w-5 h-5 mr-2" />
                                            <Monitor className="w-4 h-4 mr-1" />
                                            Pošalji u Podcast Live
                                          </Button>
                                        </>
                                      )}
                                    </div>

                                    {/* Info Section */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                      <div className="flex items-start gap-3">
                                        <div className="bg-blue-500 p-2 rounded-full">
                                          <Brain className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="text-sm">
                                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                            AI Avatar Tehnologija
                                          </h4>
                                          <p className="text-blue-700 dark:text-blue-300">
                                            Naš napredni AI sistem automatski sinhronizuje govor sa pokretima usta, 
                                            kreira prirodne gestove i emocionalne ekspresije za maksimalno realistične avatar videe.
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
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