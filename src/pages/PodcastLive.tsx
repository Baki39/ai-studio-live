import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
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
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

export default function PodcastLive() {
  const [isLive, setIsLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [avatarsActive, setAvatarsActive] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [currentSpeaker, setCurrentSpeaker] = useState<'host' | 'avatar1' | 'avatar2'>('host');
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const avatars = [
    {
      id: 1,
      name: "Marko",
      gender: "male",
      isActive: false,
      avatar: "male-avatar"
    },
    {
      id: 2,
      name: "Ana", 
      gender: "female",
      isActive: false,
      avatar: "female-avatar"
    }
  ];

  const startLive = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsLive(true);
      setIsRecording(true);
      toast.success("Live podcast počinje!");
    } catch (error) {
      toast.error("Greška pri pristupanju kameri/mikrofonu");
    }
  };

  const toggleAvatars = () => {
    setAvatarsActive(!avatarsActive);
    if (!avatarsActive) {
      setCurrentSpeaker('avatar1');
      toast.success("AI avatari aktivirani!");
    } else {
      setCurrentSpeaker('host');
      toast.info("AI avatari pauzirali");
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsLive(false);
    setAvatarsActive(false);
    
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    
    toast.success("Snimanje završeno!");
    // Show save dialog
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 animated-bg relative">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-cyber mb-4">
            Podcast Live
          </h1>
          <p className="text-lg text-muted-foreground">
            Interaktivno live snimanje sa AI avatarima
          </p>
          {isRecording && (
            <Badge variant="destructive" className="mt-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
              LIVE RECORDING
            </Badge>
          )}
        </div>

        {/* Main Live Screen */}
        <GlassCard variant="glow" className="mb-8">
          <GlassCardContent className="p-0">
            <div className="relative aspect-video bg-gradient-to-br from-background-secondary to-background-tertiary rounded-t-2xl overflow-hidden">
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
                  
                  {/* Speaker Indicator */}
                  <div className="absolute top-4 left-4">
                    <Badge variant={currentSpeaker === 'host' ? 'default' : 'secondary'}>
                      {currentSpeaker === 'host' ? 'Domaćin' : 
                       currentSpeaker === 'avatar1' ? 'Marko' : 'Ana'}
                    </Badge>
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
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center relative overflow-hidden">
                {isLive && cameraEnabled ? (
                  <div className="w-full h-full bg-background-secondary rounded-lg flex items-center justify-center">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="text-center">
                    <VideoOff className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Kamera isključena</p>
                  </div>
                )}
                
                {currentSpeaker === 'host' && isLive && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-2 mt-4">
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
            </GlassCardContent>
          </GlassCard>

          {/* Avatar 1 */}
          <GlassCard variant={avatarsActive && currentSpeaker === 'avatar1' ? "primary" : "default"}>
            <GlassCardHeader>
              <GlassCardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-secondary" />
                Avatar - Marko
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="aspect-video bg-gradient-to-br from-secondary/10 to-accent/10 rounded-lg flex items-center justify-center relative">
                {avatarsActive ? (
                  <div className="w-full h-full cyber-gradient-secondary rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <Users className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Marko AI</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Avatar neaktivan</p>
                  </div>
                )}
                
                {currentSpeaker === 'avatar1' && avatarsActive && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Glas:</span>
                  <Badge variant="outline">Muški - Profesionalni</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-secondary transition-all duration-300"
                      style={{ width: avatarsActive && currentSpeaker === 'avatar1' ? '70%' : '0%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Avatar 2 */}
          <GlassCard variant={avatarsActive && currentSpeaker === 'avatar2' ? "accent" : "default"}>
            <GlassCardHeader>
              <GlassCardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-accent" />
                Avatar - Ana
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="aspect-video bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg flex items-center justify-center relative">
                {avatarsActive ? (
                  <div className="w-full h-full cyber-gradient-accent rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <Users className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Ana AI</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Avatar neaktivan</p>
                  </div>
                )}
                
                {currentSpeaker === 'avatar2' && avatarsActive && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Glas:</span>
                  <Badge variant="outline">Ženski - Prijateljski</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent transition-all duration-300"
                      style={{ width: avatarsActive && currentSpeaker === 'avatar2' ? '65%' : '0%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Quick Actions */}
        {isLive && (
          <div className="mt-8 flex justify-center">
            <GlassCard>
              <GlassCardContent className="flex items-center gap-4 py-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentSpeaker('avatar1');
                    toast.info("Prebačeno na Marka");
                  }}
                  className="glass-button"
                >
                  Marko govori
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentSpeaker('avatar2');
                    toast.info("Prebačeno na Anu");
                  }}
                  className="glass-button"
                >
                  Ana govori
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentSpeaker('host');
                    toast.info("Prebačeno na domaćina");
                  }}
                  className="glass-button"
                >
                  Ja govorim
                </Button>
              </GlassCardContent>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}