import { Button } from "@/components/ui/button";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  Video, 
  Brain, 
  Sparkles, 
  Users, 
  Zap, 
  Globe,
  Camera,
  ArrowRight,
  Play
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  const features = [
    {
      icon: Brain,
      title: "AI Avatar Kreiranje",
      description: "Generirajte jedinstvene AI avatare sa prilagođenim glasovima",
      color: "text-primary",
      gradient: "from-primary/20 to-secondary/20"
    },
    {
      icon: Video,
      title: "Live Podcast Studio",
      description: "Profesionalno live snimanje sa real-time AI interakcijom",
      color: "text-secondary",
      gradient: "from-secondary/20 to-accent/20"
    },
    {
      icon: Sparkles,
      title: "Inteligentni Razgovori",
      description: "AI avatari razumiju kontekst i pružaju prirodne odgovore",
      color: "text-accent",
      gradient: "from-accent/20 to-primary/20"
    }
  ];

  const stats = [
    { label: "AI Modela", value: "50+", icon: Brain },
    { label: "Glasova", value: "100+", icon: Mic },
    { label: "Jezika", value: "25+", icon: Globe },
    { label: "Korisnika", value: "10K+", icon: Users }
  ];

  return (
    <div className="min-h-screen pt-20 animated-bg relative">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-6 glass border-primary/20">
            <Sparkles className="w-4 h-4 mr-2" />
            Najmoderniji AI Podcast Studio 2026
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-cyber">Kreiraj</span>
            <br />
            <span className="text-gradient">AI Podcast</span>
            <br />
            <span className="text-foreground">Budućnosti</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Revolucionarni AI studio za kreiranje interaktivnih podcast avatara sa naprednim 
            glasovnim tehnologijama i real-time razgovorima.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/create-avatar">
              <Button size="lg" className="cyber-gradient text-white font-semibold px-8 py-4 text-lg">
                <Brain className="w-5 h-5 mr-2" />
                Kreiraj Avatar
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/podcast-live">
              <Button size="lg" variant="outline" className="glass-button px-8 py-4 text-lg">
                <Play className="w-5 h-5 mr-2" />
                Live Studio
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <GlassCard key={index} className="text-center p-4">
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold text-gradient">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-gradient mb-4">
            Napredne Funkcionalnosti
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sve što trebate za kreiranje profesionalnih podcast sadržaja sa AI tehnologijama
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <GlassCard key={index} variant="primary" className="group hover:scale-105 transition-all duration-300">
              <GlassCardHeader>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <GlassCardTitle className="text-xl">{feature.title}</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-gradient mb-4">
            Kako Funkcioniše
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Unesite Koncept",
                description: "Opišite temu vašeg podcasta i dodajte relevantne linkove",
                icon: Brain,
                color: "primary"
              },
              {
                step: "02", 
                title: "Generiraj Avatare",
                description: "AI kreira jedinstvene avatare sa prilagođenim glasovima",
                icon: Users,
                color: "secondary"
              },
              {
                step: "03",
                title: "Live Snimanje",
                description: "Interaktivno snimanje sa real-time AI razgovorima",
                icon: Camera,
                color: "accent"
              },
              {
                step: "04",
                title: "Dijeli Sadržaj",
                description: "Izvezite i podijelite na društvenim mrežama",
                icon: Globe,
                color: "success"
              }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 rounded-full cyber-gradient flex items-center justify-center text-white font-bold text-lg`}>
                    {item.step}
                  </div>
                </div>
                <GlassCard className="flex-1">
                  <GlassCardContent className="flex items-center gap-4 py-4">
                    <item.icon className={`w-8 h-8 text-${item.color}`} />
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </GlassCardContent>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <GlassCard variant="glow" className="text-center max-w-3xl mx-auto">
          <GlassCardContent className="py-12">
            <Zap className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-4">
              Spremni za Budućnost Podcasta?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Pridružite se revoluciji AI podcast kreiranja i kreirajte sadržaj koji će označiti 2026. godinu
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/create-avatar">
                <Button size="lg" className="cyber-gradient text-white font-semibold px-8 py-4">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Počni Besplatno
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="glass-button px-8 py-4">
                <Video className="w-5 h-5 mr-2" />
                Pogledaj Demo
              </Button>
            </div>
          </GlassCardContent>
        </GlassCard>
      </section>
    </div>
  );
}