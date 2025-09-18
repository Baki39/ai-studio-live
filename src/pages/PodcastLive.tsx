import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useAvatarContext } from "@/contexts/AvatarContext";
import { 
  Play, 
  Pause, 
  Square, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Camera,
  Users,
  Settings,
  Download,
  Share2,
  RotateCcw,
  Volume2,
  Sparkles,
  Monitor,
  Cpu,
  Waves,
  Zap,
  Eye,
  EyeOff,
  Headphones,
  Radio,
  Gauge,
  Brain,
  Activity,
  Focus,
  ScanLine,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

export default function PodcastLive() {
  // Get avatar context
  const { selectedAvatarsForLive, generatedScript, generatedVoice } = useAvatarContext();
  
  const [isLive, setIsLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [avatarsActive, setAvatarsActive] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [currentSpeaker, setCurrentSpeaker] = useState<'host' | 'avatar1' | 'avatar2'>('host');
  
  // AI Scene Control States
  const [aiSceneControl, setAiSceneControl] = useState(true);
  const [audioSensitivity, setAudioSensitivity] = useState([75]);
  const [sceneTransitionSpeed, setSceneTransitionSpeed] = useState([300]);
  const [voiceDetectionActive, setVoiceDetectionActive] = useState(false);
  const [currentAudioLevel, setCurrentAudioLevel] = useState(0);
  
  // Professional Audio Settings
  const [hostVolume, setHostVolume] = useState([100]);
  const [avatar1Volume, setAvatar1Volume] = useState([85]);
  const [avatar2Volume, setAvatar2Volume] = useState([85]);
  const [backgroundNoise, setBackgroundNoise] = useState([10]);
  const [audioQuality, setAudioQuality] = useState('HD');
  
  // Camera Controls
  const [hostCameraActive, setHostCameraActive] = useState(true);
  const [avatar1CameraActive, setAvatar1CameraActive] = useState(false);
  const [avatar2CameraActive, setAvatar2CameraActive] = useState(false);
  const [focusMode, setFocusMode] = useState<'auto' | 'manual'>('auto');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Dynamic avatars from context with fallback to default ones
  const defaultAvatars = [
    {
      id: 1,
      name: "Marko",
      gender: "male",
      isActive: avatar1CameraActive,
      avatar: "male-avatar",
      voicePattern: "deep-professional",
      lastSpoke: 0,
      speakingIntensity: 0,
      video: null
    },
    {
      id: 2,
      name: "Ana", 
      gender: "female",
      isActive: avatar2CameraActive,
      avatar: "female-avatar",
      voicePattern: "warm-friendly",
      lastSpoke: 0,
      speakingIntensity: 0,
      video: null
    }
  ];

  // Merge context avatars with default display properties
  const avatars = selectedAvatarsForLive.length > 0 
    ? selectedAvatarsForLive.map((avatar, index) => ({
        id: index + 1,
        name: avatar.name,
        gender: avatar.gender,
        isActive: index === 0 ? avatar1CameraActive : avatar2CameraActive,
        avatar: avatar.gender === 'male' ? 'male-avatar' : 'female-avatar',
        voicePattern: avatar.gender === 'male' ? 'deep-professional' : 'warm-friendly',
        lastSpoke: 0,
        speakingIntensity: 0,
        video: avatar.video,
        image: avatar.image
      }))
    : defaultAvatars.map(avatar => ({ ...avatar, image: null }));

  // AI Audio Analysis and Scene Control
  useEffect(() => {
    if (isLive && aiSceneControl) {
      const interval = setInterval(() => {
        // Simulate voice detection and auto scene switching
        if (voiceDetectionActive) {
          const random = Math.random();
          const audioLevel = Math.floor(random * 100);
          setCurrentAudioLevel(audioLevel);
          
          if (audioLevel > audioSensitivity[0]) {
            // AI decides which speaker is active based on audio patterns
            if (random > 0.7 && avatarsActive) {
              const newSpeaker = random > 0.85 ? 'avatar2' : 'avatar1';
              if (newSpeaker !== currentSpeaker) {
                setCurrentSpeaker(newSpeaker);
                toast.info(`AI prebacio na ${newSpeaker === 'avatar1' ? 'Marka' : 'Anu'}`);
              }
            }
          }
        }
      }, sceneTransitionSpeed[0]);
      
      return () => clearInterval(interval);
    }
  }, [isLive, aiSceneControl, audioSensitivity, sceneTransitionSpeed, voiceDetectionActive, avatarsActive, currentSpeaker]);

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Initialize AI Audio Analysis
      if (aiSceneControl) {
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        setVoiceDetectionActive(true);
      }
      
      setIsLive(true);
      setIsRecording(true);
      setHostCameraActive(true);
      toast.success("Live podcast počinje! AI Scene Control aktiviran!");
    } catch (error) {
      toast.error("Greška pri pristupanju kameri/mikrofonu");
    }
  };

  const toggleAvatars = () => {
    setAvatarsActive(!avatarsActive);
    if (!avatarsActive) {
      setCurrentSpeaker('avatar1');
      setAvatar1CameraActive(true);
      setAvatar2CameraActive(true);
      toast.success("AI avatari aktivirani! Početno pozdravljanje...");
      
      // Simulate AI greeting sequence
      setTimeout(() => {
        toast.info("Marko: Zdravo! Hvala što ste se pridružili našem podcast-u!");
      }, 2000);
      
      setTimeout(() => {
        setCurrentSpeaker('avatar2');
        toast.info("Ana: Pozdrav svima! Spremni smo za odličnu diskusiju!");
      }, 5000);
      
      setTimeout(() => {
        setCurrentSpeaker('host');
        toast.info("Sada možete postaviti pitanja ili se uključiti u razgovor");
      }, 8000);
    } else {
      setCurrentSpeaker('host');
      setAvatar1CameraActive(false);
      setAvatar2CameraActive(false);
      toast.info("AI avatari pauzirani");
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsLive(false);
    setAvatarsActive(false);
    setVoiceDetectionActive(false);
    setHostCameraActive(false);
    setAvatar1CameraActive(false);
    setAvatar2CameraActive(false);
    
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    toast.success("Snimanje završeno! Priprema za export...");
    // Show save dialog
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 animated-bg relative">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-cyber mb-4">
            Podcast Live
            <Cpu className="inline-block ml-3 w-8 h-8 text-accent animate-pulse" />
          </h1>
          <p className="text-lg text-muted-foreground">
            AI-powered interaktivno snimanje sa naprednim scene kontrolom
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            {isRecording && (
              <Badge variant="destructive" className="animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                LIVE RECORDING
              </Badge>
            )}
            {aiSceneControl && isLive && (
              <Badge variant="secondary" className="cyber-gradient text-white">
                <Brain className="w-3 h-3 mr-1" />
                AI SCENE CONTROL
              </Badge>
            )}
            {voiceDetectionActive && (
              <Badge variant="outline" className="border-accent">
                <Waves className="w-3 h-3 mr-1" />
                VOICE DETECTION: {currentAudioLevel}%
              </Badge>
            )}
          </div>
        </div>

        {/* AI Scene Control Panel */}
        {isLive && (
          <GlassCard variant="accent" className="mb-6">
            <GlassCardHeader>
              <GlassCardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-accent" />
                AI Scene Control & Audio Management
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">AI Scene Control</span>
                    <Switch checked={aiSceneControl} onCheckedChange={setAiSceneControl} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Auto Focus</span>
                    <Switch checked={focusMode === 'auto'} onCheckedChange={(checked) => setFocusMode(checked ? 'auto' : 'manual')} />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Audio Sensitivity</label>
                    <Slider value={audioSensitivity} onValueChange={setAudioSensitivity} max={100} step={1} className="mt-1" />
                    <span className="text-xs text-accent">{audioSensitivity[0]}%</span>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Transition Speed</label>
                    <Slider value={sceneTransitionSpeed} onValueChange={setSceneTransitionSpeed} min={100} max={1000} step={50} className="mt-1" />
                    <span className="text-xs text-accent">{sceneTransitionSpeed[0]}ms</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Background Noise</label>
                    <Slider value={backgroundNoise} onValueChange={setBackgroundNoise} max={50} step={1} className="mt-1" />
                    <span className="text-xs text-accent">{backgroundNoise[0]}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Quality: {audioQuality}
                    </Badge>
                    <Badge variant={voiceDetectionActive ? "default" : "secondary"} className="text-xs">
                      <Activity className="w-3 h-3 mr-1" />
                      {voiceDetectionActive ? "ACTIVE" : "PAUSED"}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button size="sm" variant="outline" className="w-full glass-button">
                    <ScanLine className="w-4 h-4 mr-1" />
                    Analiza Scene
                  </Button>
                  <Button size="sm" variant="outline" className="w-full glass-button">
                    <Gauge className="w-4 h-4 mr-1" />
                    Audio Tuning
                  </Button>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        )}

        {/* Main Live Screen */}
        <GlassCard variant="glow" className="mb-8">
          <GlassCardContent className="p-0">
            <div className="relative aspect-video bg-gradient-to-br from-background-secondary to-background-tertiary rounded-t-2xl overflow-hidden border-2 border-accent/20">
              {!isLive ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Priprema za live podcast</h3>
                    <p className="text-muted-foreground mb-6">Kliknite Start Live da počnete snimanje</p>
                    <Button 
                      onClick={startLive}
                      size="lg"
                      className="cyber-gradient text-white font-semibold px-8 py-3"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Live
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Main Video Display */}
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Enhanced Speaker Indicator */}
                  <div className="absolute top-4 left-4 space-y-2">
                    <Badge variant={currentSpeaker === 'host' ? 'default' : 'secondary'} className="animate-pulse">
                      <Focus className="w-3 h-3 mr-1" />
                      {currentSpeaker === 'host' ? 'Domaćin LIVE' : 
                       currentSpeaker === 'avatar1' ? 'Marko AI' : 'Ana AI'}
                    </Badge>
                    {aiSceneControl && (
                      <Badge variant="outline" className="block bg-background/80">
                        <Zap className="w-3 h-3 mr-1" />
                        AI Auto-Switch
                      </Badge>
                    )}
                  </div>
                  
                  {/* Audio Level Indicator */}
                  <div className="absolute top-4 right-4">
                    <div className="glass p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-accent" />
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-150"
                            style={{ width: `${currentAudioLevel}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-mono">{currentAudioLevel}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Controls Overlay */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-3 glass p-3 rounded-full">
                      <Button
                        size="icon"
                        variant={micEnabled ? "default" : "destructive"}
                        onClick={() => setMicEnabled(!micEnabled)}
                        className="rounded-full"
                      >
                        {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      </Button>
                      
                      <Button
                        size="icon"
                        variant={cameraEnabled ? "default" : "destructive"}
                        onClick={() => setCameraEnabled(!cameraEnabled)}
                        className="rounded-full"
                      >
                        {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                      </Button>

                      <Button
                        size="icon"
                        variant={avatarsActive ? "secondary" : "outline"}
                        onClick={toggleAvatars}
                        className="rounded-full"
                      >
                        <Sparkles className="w-4 h-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={stopRecording}
                        className="rounded-full"
                      >
                        <Square className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Control Panels */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Host Camera */}
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle className="flex items-center gap-2 text-lg">
                <Camera className="w-5 h-5 text-primary" />
                Moja Kamera
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center relative overflow-hidden border border-primary/20">
                {isLive && cameraEnabled && hostCameraActive ? (
                  <div className="w-full h-full bg-background-secondary rounded-lg flex items-center justify-center relative">
                    <Camera className="w-8 h-8 text-primary" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-lg"></div>
                  </div>
                ) : (
                  <div className="text-center">
                    <VideoOff className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Kamera isključena</p>
                  </div>
                )}
                
                {currentSpeaker === 'host' && isLive && hostCameraActive && (
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <Badge variant="secondary" className="text-xs">LIVE</Badge>
                  </div>
                )}
              </div>

              {/* Professional Camera Controls */}
              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Camera Active</span>
                  <Switch checked={hostCameraActive} onCheckedChange={setHostCameraActive} />
                </div>
                
                <div>
                  <label className="text-xs text-muted-foreground">Audio Level</label>
                  <Slider value={hostVolume} onValueChange={setHostVolume} max={100} step={1} className="mt-1" />
                  <span className="text-xs text-primary">{hostVolume[0]}%</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant={hostCameraActive ? "default" : "outline"}
                    className="glass-button"
                    onClick={() => {
                      setHostCameraActive(!hostCameraActive);
                      toast.info(hostCameraActive ? "Kamera OFF" : "Kamera ON");
                    }}
                  >
                    {hostCameraActive ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                    {hostCameraActive ? "ON" : "OFF"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="glass-button"
                    onClick={() => toast.info("Pause kamere...")}
                  >
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="glass-button"
                    onClick={() => toast.info("Konekcija mobilne kamere...")}
                  >
                    <Camera className="w-4 h-4 mr-1" />
                    Mobitel
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="glass-button"
                    onClick={() => toast.info("Konekcija laptop kamere...")}
                  >
                    <Video className="w-4 h-4 mr-1" />
                    Laptop
                  </Button>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Avatar 1 - Marko */}
          <GlassCard variant={avatarsActive && currentSpeaker === 'avatar1' ? "primary" : "default"} className="border-secondary/30">
            <GlassCardHeader>
              <GlassCardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-secondary" />
                  Avatar - Marko AI
                </div>
                {avatar1CameraActive && (
                  <Badge variant="secondary" className="text-xs">
                    <Radio className="w-3 h-3 mr-1" />
                    ACTIVE
                  </Badge>
                )}
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="aspect-video bg-gradient-to-br from-secondary/10 to-accent/10 rounded-lg flex items-center justify-center relative border border-secondary/20">
                {avatarsActive && avatar1CameraActive ? (
                  <div className="w-full h-full cyber-gradient-secondary rounded-lg flex items-center justify-center relative">
                    {avatars[0]?.video ? (
                      <video 
                        src={avatars[0].video} 
                        className="w-full h-full object-cover rounded-lg"
                        autoPlay 
                        loop 
                        muted
                      />
                    ) : avatars[0]?.image ? (
                      <img 
                        src={avatars[0].image} 
                        alt={avatars[0].name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center text-white">
                        <Users className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">{avatars[0]?.name || 'Avatar 1'}</p>
                        <p className="text-xs opacity-80">Profesionalni Govornik</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/30 to-transparent rounded-lg"></div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Avatar neaktivan</p>
                  </div>
                )}
                
                {currentSpeaker === 'avatar1' && avatarsActive && avatar1CameraActive && (
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <div className="w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
                    <Badge variant="secondary" className="text-xs">SPEAKING</Badge>
                  </div>
                )}
              </div>

              {/* Professional Audio Controls */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Camera Active</span>
                  <Switch checked={avatar1CameraActive} onCheckedChange={setAvatar1CameraActive} />
                </div>
                
                <div>
                  <label className="text-xs text-muted-foreground">Voice Level</label>
                  <Slider value={avatar1Volume} onValueChange={setAvatar1Volume} max={100} step={1} className="mt-1" />
                  <span className="text-xs text-secondary">{avatar1Volume[0]}%</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Voice Pattern:</span>
                  <Badge variant="outline">Deep Professional</Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-secondary transition-all duration-300"
                      style={{ width: avatarsActive && currentSpeaker === 'avatar1' ? '70%' : '0%' }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-1">
                  <Button
                    size="sm"
                    variant={avatar1CameraActive ? "default" : "outline"}
                    className="glass-button"
                    onClick={() => setAvatar1CameraActive(!avatar1CameraActive)}
                  >
                    {avatar1CameraActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="glass-button"
                    onClick={() => toast.info("Mute Marko audio")}
                  >
                    <MicOff className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="glass-button"
                    onClick={() => toast.info("Pause Marko")}
                  >
                    <Pause className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Avatar 2 - Ana */}
          <GlassCard variant={avatarsActive && currentSpeaker === 'avatar2' ? "accent" : "default"} className="border-accent/30">
            <GlassCardHeader>
              <GlassCardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" />
                  Avatar - Ana AI
                </div>
                {avatar2CameraActive && (
                  <Badge variant="secondary" className="text-xs bg-accent text-accent-foreground">
                    <Radio className="w-3 h-3 mr-1" />
                    ACTIVE
                  </Badge>
                )}
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="aspect-video bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg flex items-center justify-center relative border border-accent/20">
                {avatarsActive && avatar2CameraActive ? (
                  <div className="w-full h-full cyber-gradient-accent rounded-lg flex items-center justify-center relative">
                    {avatars[1]?.video ? (
                      <video 
                        src={avatars[1].video} 
                        className="w-full h-full object-cover rounded-lg"
                        autoPlay 
                        loop 
                        muted
                      />
                    ) : avatars[1]?.image ? (
                      <img 
                        src={avatars[1].image} 
                        alt={avatars[1].name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center text-white">
                        <Users className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">{avatars[1]?.name || 'Avatar 2'}</p>
                        <p className="text-xs opacity-80">Prijateljski Govornik</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-accent/30 to-transparent rounded-lg"></div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Avatar neaktivan</p>
                  </div>
                )}
                
                {currentSpeaker === 'avatar2' && avatarsActive && avatar2CameraActive && (
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                    <Badge variant="secondary" className="text-xs bg-accent text-accent-foreground">SPEAKING</Badge>
                  </div>
                )}
              </div>

              {/* Professional Audio Controls */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Camera Active</span>
                  <Switch checked={avatar2CameraActive} onCheckedChange={setAvatar2CameraActive} />
                </div>
                
                <div>
                  <label className="text-xs text-muted-foreground">Voice Level</label>
                  <Slider value={avatar2Volume} onValueChange={setAvatar2Volume} max={100} step={1} className="mt-1" />
                  <span className="text-xs text-accent">{avatar2Volume[0]}%</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Voice Pattern:</span>
                  <Badge variant="outline">Warm Friendly</Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent transition-all duration-300"
                      style={{ width: avatarsActive && currentSpeaker === 'avatar2' ? '65%' : '0%' }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-1">
                  <Button
                    size="sm"
                    variant={avatar2CameraActive ? "default" : "outline"}
                    className="glass-button"
                    onClick={() => setAvatar2CameraActive(!avatar2CameraActive)}
                  >
                    {avatar2CameraActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="glass-button"
                    onClick={() => toast.info("Mute Ana audio")}
                  >
                    <MicOff className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="glass-button"
                    onClick={() => toast.info("Pause Ana")}
                  >
                    <Pause className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Enhanced Quick Actions & AI Commands */}
        {isLive && (
          <div className="mt-8 space-y-6">
            {/* Speaker Control */}
            <GlassCard variant="primary">
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-primary" />
                  Scene Control & Speaker Management
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="grid md:grid-cols-4 gap-3">
                  <Button
                    variant={currentSpeaker === 'host' ? "default" : "outline"}
                    onClick={() => {
                      setCurrentSpeaker('host');
                      toast.info("Prebačeno na domaćina");
                    }}
                    className="glass-button"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Ja govorim
                  </Button>
                  <Button
                    variant={currentSpeaker === 'avatar1' ? "secondary" : "outline"}
                    onClick={() => {
                      setCurrentSpeaker('avatar1');
                      setAvatar1CameraActive(true);
                      toast.info("Prebačeno na Marka");
                    }}
                    className="glass-button"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Marko govori
                  </Button>
                  <Button
                    variant={currentSpeaker === 'avatar2' ? "secondary" : "outline"}
                    onClick={() => {
                      setCurrentSpeaker('avatar2');
                      setAvatar2CameraActive(true);
                      toast.info("Prebačeno na Anu");
                    }}
                    className="glass-button"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Ana govori
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Simulate AI conversation between avatars
                      setCurrentSpeaker('avatar1');
                      toast.info("AI Razgovor - Marko i Ana");
                      setTimeout(() => setCurrentSpeaker('avatar2'), 3000);
                      setTimeout(() => setCurrentSpeaker('avatar1'), 6000);
                      setTimeout(() => setCurrentSpeaker('host'), 9000);
                    }}
                    className="glass-button cyber-gradient text-white"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    AI Auto Chat
                  </Button>
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* AI Command Center */}
            <GlassCard variant="accent">
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-accent" />
                  AI Command Center - Napredne Funkcije
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.success("AI analizira govor i automatski prilagođava scene");
                    }}
                    className="glass-button"
                  >
                    <ScanLine className="w-4 h-4 mr-2" />
                    Smart Analysis
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setVoiceDetectionActive(!voiceDetectionActive);
                      toast.info(`Voice Detection ${voiceDetectionActive ? 'OFF' : 'ON'}`);
                    }}
                    className="glass-button"
                  >
                    <Waves className="w-4 h-4 mr-2" />
                    Voice Detection
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.info("AI optimizuje audio kvalitet u realnom vremenu");
                    }}
                    className="glass-button"
                  >
                    <Gauge className="w-4 h-4 mr-2" />
                    Audio Boost
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.success("Tema: 'Tehnologija u 2025' - AI postavlja pitanja");
                    }}
                    className="glass-button"
                  >
                    <Focus className="w-4 h-4 mr-2" />
                    Topic Focus
                  </Button>
                </div>
              </GlassCardContent>
            </GlassCard>

            {/* AI-Powered Real-time Features */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              {/* Real-time AI Transcription & Analysis */}
              <GlassCard variant="secondary">
                <GlassCardHeader>
                  <GlassCardTitle className="flex items-center gap-2">
                    <ScanLine className="w-5 h-5 text-accent" />
                    AI Transkripcija & Analiza
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-4">
                    <div className="h-32 bg-background-secondary/50 rounded-lg p-3 overflow-y-auto border border-accent/20">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="text-xs">Domaćin</Badge>
                          <p className="flex-1">Dobrodošli na naš podcast...</p>
                        </div>
                        {avatarsActive && (
                          <>
                            <div className="flex items-start gap-2">
                              <Badge variant="secondary" className="text-xs">Marko AI</Badge>
                              <p className="flex-1">Zdravo svima! Hvala što ste se pridružili...</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <Badge variant="secondary" className="text-xs">Ana AI</Badge>
                              <p className="flex-1">Pozdrav! Ovo je odličan sadržaj...</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="glass p-2 rounded-lg text-center">
                        <div className="text-lg font-bold text-accent">3:42</div>
                        <div className="text-xs text-muted-foreground">Vreme Razgovora</div>
                      </div>
                      <div className="glass p-2 rounded-lg text-center">
                        <div className="text-lg font-bold text-primary">247</div>
                        <div className="text-xs text-muted-foreground">Reči/Min</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button size="sm" variant="outline" className="w-full glass-button">
                        <Download className="w-3 h-3 mr-1" />
                        Izvoz Transkripcije
                      </Button>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 glass-button">
                          <Brain className="w-3 h-3 mr-1" />
                          AI Rezime
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 glass-button">
                          <Focus className="w-3 h-3 mr-1" />
                          Ključne Teme
                        </Button>
                      </div>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>

              {/* Advanced Broadcasting Controls */}
              <GlassCard variant="accent">
                <GlassCardHeader>
                  <GlassCardTitle className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-accent" />
                    Napredni Broadcasting
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-4">
                    {/* Live Streaming Platforms */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Live Stream Platforme</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {['YouTube', 'Twitch', 'Facebook', 'LinkedIn'].map((platform) => (
                          <div key={platform} className="flex items-center justify-between p-2 glass rounded-lg">
                            <span className="text-xs">{platform}</span>
                            <Switch />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Real-time Metrics */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Metrije u Realnom Vremenu</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="glass p-2 rounded-lg text-center">
                          <div className="text-sm font-bold text-accent">1,247</div>
                          <div className="text-xs text-muted-foreground">Gledaoci</div>
                        </div>
                        <div className="glass p-2 rounded-lg text-center">
                          <div className="text-sm font-bold text-primary">89%</div>
                          <div className="text-xs text-muted-foreground">Engagement</div>
                        </div>
                        <div className="glass p-2 rounded-lg text-center">
                          <div className="text-sm font-bold text-green-500">4.8</div>
                          <div className="text-xs text-muted-foreground">Rating</div>
                        </div>
                        <div className="glass p-2 rounded-lg text-center">
                          <div className="text-sm font-bold text-blue-500">156</div>
                          <div className="text-xs text-muted-foreground">Komentari</div>
                        </div>
                      </div>
                    </div>

                    {/* AI Suggestions */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">AI Predlozi</h4>
                      <div className="glass p-3 rounded-lg border border-accent/20">
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-accent mt-0.5" />
                          <div className="text-xs">
                            <p className="font-medium">Predlog teme:</p>
                            <p className="text-muted-foreground">Razgovarajte o najnovijim trendovima u AI tehnologiji</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </div>

            {/* Dynamic Scene Templates */}
            <div className="mt-8">
              <GlassCard variant="glow">
                <GlassCardHeader>
                  <GlassCardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-accent" />
                    Dinamički Scene Templates
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    {[
                      { name: 'Interview Mode', icon: Users, active: currentSpeaker !== 'host' },
                      { name: 'Presentation', icon: Monitor, active: false },
                      { name: 'Panel Discussion', icon: Users, active: avatarsActive },
                      { name: 'Q&A Session', icon: Activity, active: false }
                    ].map((template) => (
                      <Button
                        key={template.name}
                        variant={template.active ? "default" : "outline"}
                        className={`h-20 flex-col gap-2 glass-button ${template.active ? 'cyber-gradient text-white' : ''}`}
                      >
                        <template.icon className="w-6 h-6" />
                        <span className="text-xs">{template.name}</span>
                      </Button>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <Cpu className="w-3 h-3 mr-1" />
                        AI Auto-Scene
                      </Badge>
                      <Badge variant="secondary">
                        <Eye className="w-3 h-3 mr-1" />
                        Smart Focus
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline" className="glass-button">
                      <Settings className="w-3 h-3 mr-1" />
                      Prilagodi Scene
                    </Button>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}