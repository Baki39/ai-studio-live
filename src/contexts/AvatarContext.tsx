import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface GeneratedAvatar {
  id: string;
  name: string;
  gender: 'male' | 'female';
  voice: string;
  image: string | null;
  video: string | null;
  audio: string | null;
  description: string;
}

export interface VoiceConfig {
  voiceId: string;
  name: string;
  preview?: string;
}

interface AvatarContextType {
  // Generated content
  generatedScript: string | null;
  setGeneratedScript: (script: string | null) => void;
  
  generatedVoice: string | null;
  setGeneratedVoice: (voice: string | null) => void;
  
  voiceConfig: VoiceConfig | null;
  setVoiceConfig: (config: VoiceConfig | null) => void;
  
  createdAvatarVideo: string | null;
  setCreatedAvatarVideo: (video: string | null) => void;
  
  selectedAvatarImage: string | null;
  setSelectedAvatarImage: (image: string | null) => void;
  
  avatarDescription: string;
  setAvatarDescription: (description: string) => void;
  
  // Avatars collection
  avatars: GeneratedAvatar[];
  setAvatars: (avatars: GeneratedAvatar[]) => void;
  addAvatar: (avatar: GeneratedAvatar) => void;
  
  // Active avatars for Podcast Live
  selectedAvatarsForLive: GeneratedAvatar[];
  setSelectedAvatarsForLive: (avatars: GeneratedAvatar[]) => void;
  addAvatarToLive: (avatar: GeneratedAvatar) => void;
  removeAvatarFromLive: (avatarId: string) => void;
  
  // Clear functions
  clearAll: () => void;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export const useAvatarContext = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatarContext must be used within an AvatarProvider');
  }
  return context;
};

interface AvatarProviderProps {
  children: ReactNode;
}

export const AvatarProvider: React.FC<AvatarProviderProps> = ({ children }) => {
  // Generated content states
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [generatedVoice, setGeneratedVoice] = useState<string | null>(null);
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig | null>(null);
  const [createdAvatarVideo, setCreatedAvatarVideo] = useState<string | null>(null);
  const [selectedAvatarImage, setSelectedAvatarImage] = useState<string | null>(null);
  const [avatarDescription, setAvatarDescription] = useState<string>('');
  
  // Avatars collection
  const [avatars, setAvatars] = useState<GeneratedAvatar[]>([]);
  const [selectedAvatarsForLive, setSelectedAvatarsForLive] = useState<GeneratedAvatar[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('avatarContextData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setGeneratedScript(parsed.generatedScript || null);
        setGeneratedVoice(parsed.generatedVoice || null);
        setVoiceConfig(parsed.voiceConfig || null);
        setCreatedAvatarVideo(parsed.createdAvatarVideo || null);
        setSelectedAvatarImage(parsed.selectedAvatarImage || null);
        setAvatarDescription(parsed.avatarDescription || '');
        setAvatars(parsed.avatars || []);
        setSelectedAvatarsForLive(parsed.selectedAvatarsForLive || []);
      }
    } catch (error) {
      console.error('Error loading avatar context data:', error);
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      generatedScript,
      generatedVoice,
      voiceConfig,
      createdAvatarVideo,
      selectedAvatarImage,
      avatarDescription,
      avatars,
      selectedAvatarsForLive,
    };
    
    try {
      localStorage.setItem('avatarContextData', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving avatar context data:', error);
    }
  }, [
    generatedScript,
    generatedVoice,
    voiceConfig,
    createdAvatarVideo,
    selectedAvatarImage,
    avatarDescription,
    avatars,
    selectedAvatarsForLive,
  ]);

  const addAvatar = (avatar: GeneratedAvatar) => {
    setAvatars(prev => [...prev, avatar]);
  };

  const addAvatarToLive = (avatar: GeneratedAvatar) => {
    setSelectedAvatarsForLive(prev => {
      if (prev.find(a => a.id === avatar.id)) {
        return prev; // Avatar already exists
      }
      return [...prev, avatar];
    });
  };

  const removeAvatarFromLive = (avatarId: string) => {
    setSelectedAvatarsForLive(prev => prev.filter(a => a.id !== avatarId));
  };

  const clearAll = () => {
    setGeneratedScript(null);
    setGeneratedVoice(null);
    setVoiceConfig(null);
    setCreatedAvatarVideo(null);
    setSelectedAvatarImage(null);
    setAvatarDescription('');
    setAvatars([]);
    setSelectedAvatarsForLive([]);
    localStorage.removeItem('avatarContextData');
  };

  return (
    <AvatarContext.Provider
      value={{
        generatedScript,
        setGeneratedScript,
        generatedVoice,
        setGeneratedVoice,
        voiceConfig,
        setVoiceConfig,
        createdAvatarVideo,
        setCreatedAvatarVideo,
        selectedAvatarImage,
        setSelectedAvatarImage,
        avatarDescription,
        setAvatarDescription,
        avatars,
        setAvatars,
        addAvatar,
        selectedAvatarsForLive,
        setSelectedAvatarsForLive,
        addAvatarToLive,
        removeAvatarFromLive,
        clearAll,
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
};