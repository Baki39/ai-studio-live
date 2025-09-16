import { Globe, Mic, Video } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

export function NavHeader() {
  const navigate = useNavigate();
  
  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "bs", name: "Bosanski", flag: "🇧🇦" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "it", name: "Italiano", flag: "🇮🇹" },
    { code: "pt", name: "Português", flag: "🇵🇹" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-glass-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg cyber-gradient flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse-glow"></div>
          </div>
          <span className="text-xl font-bold text-gradient">PodCast.AI</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Button variant="ghost" className="glass-hover" onClick={() => navigate('/create-avatar')}>
            <Video className="w-4 h-4 mr-2" />
            Create Avatar
          </Button>
          <Button variant="ghost" className="glass-hover" onClick={() => navigate('/podcast-live')}>
            <Mic className="w-4 h-4 mr-2" />
            Podcast Live
          </Button>
        </nav>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          {/* Language Selector */}
          <Select defaultValue="en">
            <SelectTrigger className="w-[140px] glass border-glass-border">
              <Globe className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass border-glass-border">
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <span className="mr-2">{lang.flag}</span>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}