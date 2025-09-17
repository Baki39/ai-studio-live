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
  Zap,
  Minimize2
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
  audio: string | null;
  description: string;
}

interface AudioState {
  isPlaying: boolean;
  audio: HTMLAudioElement | null;
}

const CreateAvatar = () => {
  const [podcastConcept, setPodcastConcept] = useState("");
  const [links, setLinks] = useState("");
  const [duration, setDuration] = useState("5-8 minuta");
  const [generatedScript, setGeneratedScript] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [avatars, setAvatars] = useState<GeneratedAvatar[]>([]);
  const [scriptAvatarCount, setScriptAvatarCount] = useState("2");
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [avatarDescription, setAvatarDescription] = useState("");
  const [avatarImage, setAvatarImage] = useState<File | null>(null);
  const [avatarImagePreview, setAvatarImagePreview] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<string>("");
  const [isEditingScript, setIsEditingScript] = useState(false);
  
  // Voice generation states
  const [avatarVoices, setAvatarVoices] = useState<Array<{voiceId: string; model: string; customVoiceId?: string}>>([]);
  const [isGeneratingVoices, setIsGeneratingVoices] = useState<{[key: number]: boolean}>({});
  const [isGeneratingAllVoices, setIsGeneratingAllVoices] = useState(false);
  const [generatedVoices, setGeneratedVoices] = useState<{[key: number]: string}>({});
  const [audioStates, setAudioStates] = useState<{[key: string]: AudioState}>({});

  // Video creation states
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
      
      // Create video generation request with enhanced voice integration
      const response = await supabase.functions.invoke('generate-avatar-video', {
        body: {
          avatar: {
            gender: selectedAvatarForCreation % 2 === 0 ? selectedGender : (selectedGender === 'male' ? 'female' : 'male'),
            image: selectedAvatarImage,
            voice: voiceConfig?.voiceId || 'default',
            audioData: generatedVoice // Include the actual audio data
          },
          audioUrl: generatedVoice,
          duration: finalDuration, // Already in seconds
          emotions: ['neutral', 'smile', 'talking', 'laugh', 'nod'],
          movements: ['head_nod', 'slight_turn', 'blink', 'mouth_sync'],
          // Include voice configuration for better lip sync
          voiceConfig: {
            voiceId: voiceConfig?.voiceId,
            model: voiceConfig?.model || 'eleven_multilingual_v2'
          }
        }
      });

      clearInterval(progressInterval);
      setVideoProgress(100);

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Create avatar with video
      const videoUrl = response.data?.videoUrl || response.data?.output?.url || null;
      console.log('Generated video URL:', videoUrl);
      
      const newAvatar: GeneratedAvatar = {
        id: `avatar-${selectedAvatarForCreation + 1}-${Date.now()}`,
        name: `Avatar ${selectedAvatarForCreation + 1}`,
        gender: selectedAvatarForCreation % 2 === 0 ? selectedGender : (selectedGender === 'male' ? 'female' : 'male'),
        voice: voiceConfig?.voiceId || 'default',
        image: selectedAvatarImage,
        video: videoUrl,
        audio: generatedVoice, // Store the generated voice audio
        description: avatarDescription || `Profesionalni avatar sa sinhronizovanim glasom i pokretima`
      };

      setCreatedAvatarVideo(videoUrl);
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

  const analyzeLinks = async () => {
    if (!links.trim()) {
      toast.error("Molimo unesite linkove za analizu");
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-links', {
        body: { links: links.split('\n').filter(link => link.trim()) }
      });

      if (error) {
        throw new Error(error.message);
      }

      setAnalysisResults(data.analysis);
      toast.success("Linkovi uspješno analizirani!");
    } catch (error) {
      console.error('Error analyzing links:', error);
      toast.error("Greška pri analizi linkova");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateScript = async () => {
    if (!podcastConcept.trim()) {
      toast.error("Molimo unesite koncept podkasta");
      return;
    }

    setIsGeneratingScript(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-script', {
        body: {
          concept: podcastConcept,
          analysis: analysisResults,
          duration,
          avatarCount: scriptAvatarCount
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      setGeneratedScript(data.script);
      
      // Initialize avatar voices array
      const voiceArray = Array.from({ length: parseInt(scriptAvatarCount) }, (_, index) => ({
        voiceId: index === 0 ? "21m00Tcm4TlvDq8ikWAM" : "AZnzlk1XvdvUeBnXmlld",
        model: "eleven_multilingual_v2"
      }));
      setAvatarVoices(voiceArray);
      
      toast.success("Script uspješno generiran!");
    } catch (error) {
      console.error('Error generating script:', error);
      toast.error("Greška pri generiranju scripta");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const regenerateScript = async () => {
    await generateScript();
  };

  const updateAvatarVoice = (index: number, field: string, value: string) => {
    setAvatarVoices(prev => {
      const newVoices = [...prev];
      if (!newVoices[index]) newVoices[index] = { voiceId: "", model: "eleven_multilingual_v2" };
      newVoices[index] = { ...newVoices[index], [field]: value };
      return newVoices;
    });
  };

  const extractAvatarText = (script: string, avatarIndex: number): string => {
    const lines = script.split('\n');
    const avatarPattern = new RegExp(`Avatar\\s*${avatarIndex + 1}[:\\s]`, 'i');
    const nextAvatarPattern = new RegExp(`Avatar\\s*${avatarIndex + 2}[:\\s]`, 'i');
    
    let avatarText = '';
    let recording = false;
    
    for (const line of lines) {
      if (avatarPattern.test(line)) {
        recording = true;
        avatarText += line.replace(avatarPattern, '').trim() + ' ';
      } else if (recording && nextAvatarPattern.test(line)) {
        break;
      } else if (recording && !line.match(/Avatar\s*\d+[:\s]/i)) {
        avatarText += line.trim() + ' ';
      }
    }
    
    return avatarText.trim() || `Dio teksta za Avatar ${avatarIndex + 1}`;
  };

  const generateVoiceForAvatar = async (avatarIndex: number) => {
    const voiceConfig = avatarVoices[avatarIndex];
    if (!voiceConfig?.voiceId || !generatedScript) {
      toast.error("Nedostaju voice konfiguracija ili script");
      return;
    }

    setIsGeneratingVoices(prev => ({ ...prev, [avatarIndex]: true }));

    try {
      const avatarText = extractAvatarText(generatedScript, avatarIndex);
      
      const actualVoiceId = voiceConfig.voiceId === "custom" 
        ? voiceConfig.customVoiceId 
        : voiceConfig.voiceId;

      const { data, error } = await supabase.functions.invoke('generate-voice', {
        body: {
          text: avatarText,
          voice_id: actualVoiceId,
          model_id: voiceConfig.model
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      const audioBlob = new Blob([Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      setGeneratedVoices(prev => ({ ...prev, [avatarIndex]: audioUrl }));
      toast.success(`Glas za Avatar ${avatarIndex + 1} uspješno generiran!`);
    } catch (error) {
      console.error('Error generating voice:', error);
      toast.error(`Greška pri generiranju glasa za Avatar ${avatarIndex + 1}`);
    } finally {
      setIsGeneratingVoices(prev => ({ ...prev, [avatarIndex]: false }));
    }
  };

  const generateAllVoices = async () => {
    setIsGeneratingAllVoices(true);
    try {
      for (let i = 0; i < parseInt(scriptAvatarCount); i++) {
        await generateVoiceForAvatar(i);
      }
      toast.success("Svi glasovi uspješno generirani!");
    } catch (error) {
      toast.error("Greška pri generiranju glasova");
    } finally {
      setIsGeneratingAllVoices(false);
    }
  };

  const handlePlayPause = (avatarIndex: number) => {
    const audioUrl = generatedVoices[avatarIndex];
    if (!audioUrl) return;

    const key = `avatar-${avatarIndex}`;
    const currentState = audioStates[key];

    if (currentState?.isPlaying) {
      currentState.audio?.pause();
      setAudioStates(prev => ({
        ...prev,
        [key]: { ...currentState, isPlaying: false }
      }));
    } else {
      // Stop all other playing audios
      Object.entries(audioStates).forEach(([audioKey, state]) => {
        if (state.isPlaying && state.audio) {
          state.audio.pause();
          setAudioStates(prev => ({
            ...prev,
            [audioKey]: { ...state, isPlaying: false }
          }));
        }
      });

      if (currentState?.audio) {
        currentState.audio.play();
        setAudioStates(prev => ({
          ...prev,
          [key]: { ...currentState, isPlaying: true }
        }));
      } else {
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setAudioStates(prev => ({
            ...prev,
            [key]: { ...prev[key], isPlaying: false }
          }));
        };
        audio.play();
        setAudioStates(prev => ({
          ...prev,
          [key]: { audio, isPlaying: true }
        }));
      }
    }
  };

  const handleStop = (avatarIndex: number) => {
    const key = `avatar-${avatarIndex}`;
    const currentState = audioStates[key];
    
    if (currentState?.audio) {
      currentState.audio.pause();
      currentState.audio.currentTime = 0;
      setAudioStates(prev => ({
        ...prev,
        [key]: { ...currentState, isPlaying: false }
      }));
    }
  };

  const handleDownload = (avatarIndex: number) => {
    const audioUrl = generatedVoices[avatarIndex];
    if (!audioUrl) return;

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `avatar-${avatarIndex + 1}-voice.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Audio za Avatar ${avatarIndex + 1} preuzet!`);
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

  const handleAvatarImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            🎭 AI Avatar Kreator
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Kreirajte profesionalne AI avatare sa realnim glasom i animacijama za vaše podkast sadržaje
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Step 1: Podcast Concept */}
            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <Brain className="w-6 h-6 text-primary" />
                  Korak 1: Koncept Podkasta
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                <div>
                  <Label htmlFor="concept">Opišite koncept vašeg podkasta</Label>
                  <Textarea
                    id="concept"
                    placeholder="Npr. Razgovor o najnovijim tehnologijama u AI industriji, intervju sa ekspertom o klimatskim promjenama, diskusija o trendovima u zdravstvu..."
                    value={podcastConcept}
                    onChange={(e) => setPodcastConcept(e.target.value)}
                    className="glass border-glass-border min-h-32"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Trajanje podkasta</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger className="glass border-glass-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass border-glass-border">
                        <SelectItem value="3-5 minuta">3-5 minuta</SelectItem>
                        <SelectItem value="5-8 minuta">5-8 minuta</SelectItem>
                        <SelectItem value="8-12 minuta">8-12 minuta</SelectItem>
                        <SelectItem value="12-20 minuta">12-20 minuta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Broj avatara</Label>
                    <Select value={scriptAvatarCount} onValueChange={setScriptAvatarCount}>
                      <SelectTrigger className="glass border-glass-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass border-glass-border">
                        <SelectItem value="1">1 Avatar</SelectItem>
                        <SelectItem value="2">2 Avatara</SelectItem>
                        <SelectItem value="3">3 Avatara</SelectItem>
                        <SelectItem value="4">4 Avatara</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* Step 2: Content Sources */}
            <GlassCard variant="secondary">
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <Link className="w-6 h-6 text-secondary" />
                  Korak 2: Sadržaj i Reference (Opciono)
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                <div>
                  <Label htmlFor="links">Dodajte linkove za AI analizu (jedan po liniji)</Label>
                  <Textarea
                    id="links"
                    placeholder="https://example.com/article1
https://youtube.com/watch?v=...
https://docs.example.com/..."
                    value={links}
                    onChange={(e) => setLinks(e.target.value)}
                    className="glass border-glass-border min-h-32"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    AI će analizirati sadržaj sa ovih linkova kako bi obogatio podcast
                  </p>
                </div>
                
                <Button
                  onClick={analyzeLinks}
                  disabled={isAnalyzing || !links.trim()}
                  className="w-full glass-button"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Analiziram linkove...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Analiziraj Linkove
                    </>
                  )}
                </Button>
                
                {analysisResults && (
                  <div className="glass p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Rezultati Analize:
                    </h4>
                    <p className="text-sm text-muted-foreground">{analysisResults.substring(0, 200)}...</p>
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>

            {/* Step 3: Generate Script */}
            <GlassCard variant="accent">
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-accent" />
                  Korak 3: AI Script Generator
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                <Button
                  onClick={generateScript}
                  disabled={isGeneratingScript || !podcastConcept.trim()}
                  className="w-full glass-button bg-gradient-to-r from-accent to-primary text-white font-semibold"
                  size="lg"
                >
                  {isGeneratingScript ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                      Generiram script...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generiraj AI Script
                    </>
                  )}
                </Button>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Ukoliko nisu zadovoljni scriptom, možete ga regenerirati
                  </p>
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
                                  <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-glass-border pb-2 mb-4">
                                    <div className="flex justify-between items-center">
                                      <div className="text-xs text-muted-foreground">Scroll za pristup svim opcijama</div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => {
                                          const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
                                          if (dialog) {
                                            if (dialog.style.height === '40vh') {
                                              dialog.style.height = '90vh';
                                            } else {
                                              dialog.style.height = '40vh';
                                            }
                                          }
                                        }}
                                      >
                                        <Minimize2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  
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
                                          <Video className="w-5 h-5 text-green-500" />
                                          AI Video Mogućnosti
                                        </h3>
                                        <div className="glass p-4 rounded-lg">
                                          <div className="grid grid-cols-2 gap-3 mb-4">
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

                                      {/* Image Generation/Upload Section */}
                                      <div className="space-y-4 col-span-full">
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
                                       <div className="space-y-4 col-span-full">
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
                                       <div className="space-y-4 col-span-full">
                                         <h3 className="text-lg font-semibold flex items-center gap-2">
                                           <Video className="w-5 h-5 text-green-500" />
                                           Kreiran Avatar Video
                                         </h3>
                                         <div className="glass p-4 rounded-lg">
                                           <video 
                                             src={createdAvatarVideo} 
                                             controls 
                                             className="w-full rounded-lg border border-glass-border"
                                             poster={selectedAvatarImage || undefined}
                                           />
                                         </div>
                                       </div>
                                     )}

                                      {/* Action Buttons */}
                                      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-glass-border col-span-full">
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
                                     <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 col-span-full">
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
};

export default CreateAvatar;
