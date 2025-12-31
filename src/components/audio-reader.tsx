"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Loader2,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";
import { generateAudio, VoiceType } from "@/api/openai/generateAudio";
import { useTranslations } from "next-intl";

interface AudioReaderProps {
  text: string;
  language: string;
}

const VOICES: { value: VoiceType; label: string; description: string }[] = [
  { value: "nova", label: "Nova", description: "Female, warm" },
  { value: "alloy", label: "Alloy", description: "Neutral" },
  { value: "echo", label: "Echo", description: "Male, deep" },
  { value: "fable", label: "Fable", description: "British accent" },
  { value: "onyx", label: "Onyx", description: "Male, authoritative" },
  { value: "shimmer", label: "Shimmer", description: "Female, expressive" },
];

const SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

export function AudioReader({ text, language: _language }: AudioReaderProps) {
  const t = useTranslations("AudioReader");

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [voice, setVoice] = useState<VoiceType>("nova");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wordsRef = useRef<HTMLSpanElement[]>([]);
  const textContainerRef = useRef<HTMLDivElement | null>(null);

  // Split text into words
  const words = text.split(/(\s+)/).filter((w) => w.trim().length > 0);

  // Calculate estimated word timing based on audio duration
  const getWordTimings = useCallback(() => {
    if (duration === 0) return [];
    const avgTimePerWord = duration / words.length;
    return words.map((_, index) => ({
      start: index * avgTimePerWord,
      end: (index + 1) * avgTimePerWord,
    }));
  }, [duration, words]);

  // Generate audio
  const handleGenerateAudio = useCallback(async () => {
    if (audioUrl) {
      // Audio already generated, just play
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateAudio({
        text,
        voice,
        speed,
      });

      const audioBlob = new Blob(
        [Uint8Array.from(atob(result.audioBase64), (c) => c.charCodeAt(0))],
        { type: result.contentType }
      );
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (error) {
      console.error("Failed to generate audio:", error);
    } finally {
      setIsLoading(false);
    }
  }, [text, voice, speed, audioUrl]);

  // Play/Pause toggle
  const togglePlayPause = useCallback(async () => {
    if (!audioUrl) {
      await handleGenerateAudio();
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  }, [audioUrl, isPlaying, handleGenerateAudio]);

  // Reset audio
  const handleReset = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentWordIndex(-1);
      setProgress(0);
      setCurrentTime(0);
    }
  }, []);

  // Handle volume change
  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 0.5;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  }, [isMuted, volume]);

  // Handle voice change (regenerate audio)
  const handleVoiceChange = useCallback((newVoice: VoiceType) => {
    setVoice(newVoice);
    setAudioUrl(null); // Force regeneration
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  // Handle speed change
  const handleSpeedChange = useCallback((newSpeed: string) => {
    const speedValue = parseFloat(newSpeed);
    setSpeed(speedValue);
    if (audioRef.current) {
      audioRef.current.playbackRate = speedValue;
    }
  }, []);

  // Handle progress bar seek
  const handleSeek = useCallback(
    (value: number[]) => {
      const seekTime = (value[0] / 100) * duration;
      if (audioRef.current) {
        audioRef.current.currentTime = seekTime;
        setCurrentTime(seekTime);
        setProgress(value[0]);
      }
    },
    [duration]
  );

  // Update word highlighting based on current time
  useEffect(() => {
    if (!isPlaying || duration === 0) return;

    const timings = getWordTimings();
    const currentIndex = timings.findIndex(
      (timing) => currentTime >= timing.start && currentTime < timing.end
    );

    if (currentIndex !== currentWordIndex) {
      setCurrentWordIndex(currentIndex);

      // Scroll within the text container only (not the whole page)
      if (
        currentIndex >= 0 &&
        wordsRef.current[currentIndex] &&
        textContainerRef.current
      ) {
        const container = textContainerRef.current;
        const word = wordsRef.current[currentIndex];
        const containerRect = container.getBoundingClientRect();
        const wordRect = word.getBoundingClientRect();

        // Calculate if word is outside visible area of container
        const wordTop = wordRect.top - containerRect.top + container.scrollTop;
        const targetScroll = wordTop - container.clientHeight / 2;

        container.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: "smooth",
        });
      }
    }
  }, [currentTime, isPlaying, duration, getWordTimings, currentWordIndex]);

  // Audio event listeners
  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    });

    audio.addEventListener("play", () => {
      setIsPlaying(true);
    });

    audio.addEventListener("pause", () => {
      setIsPlaying(false);
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentWordIndex(-1);
    });

    // Auto-play when audio is loaded
    audio.play();

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [audioUrl]);

  // Cleanup URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className='p-6'>
      {/* Text Display with Word Highlighting */}
      {isTextVisible && (
        <div
          ref={textContainerRef}
          className='bg-muted/30 mb-6 max-h-64 overflow-y-auto rounded-lg p-4'
        >
          <p className='whitespace-pre-wrap text-lg leading-relaxed'>
            {words.map((word, index) => (
              <span key={index}>
                <span
                  ref={(el) => {
                    if (el) wordsRef.current[index] = el;
                  }}
                  className={`inline transition-all duration-150 ${
                    index === currentWordIndex
                      ? "bg-primary text-primary-foreground rounded px-1"
                      : index < currentWordIndex
                        ? "text-muted-foreground"
                        : ""
                  }`}
                >
                  {word}
                </span>
                {index < words.length - 1 && " "}
              </span>
            ))}
          </p>
        </div>
      )}

      {/* Progress Bar */}
      <div className='mb-4'>
        <Slider
          value={[progress]}
          max={100}
          step={0.1}
          onValueChange={handleSeek}
          className='cursor-pointer'
        />
        <div className='text-muted-foreground mt-1 flex justify-between text-xs'>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className='flex items-center justify-center gap-4'>
        <Button
          variant='outline'
          size='icon'
          onClick={handleReset}
          disabled={isLoading}
        >
          <RotateCcw className='h-4 w-4' />
        </Button>

        <Button
          size='lg'
          className='h-14 w-14 rounded-full'
          onClick={togglePlayPause}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className='h-6 w-6 animate-spin' />
          ) : isPlaying ? (
            <Pause className='h-6 w-6' />
          ) : (
            <Play className='h-6 w-6 pl-1' />
          )}
        </Button>

        <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
          <PopoverTrigger asChild>
            <Button variant='outline' size='icon'>
              <Settings className='h-4 w-4' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-72' align='end' sideOffset={8}>
            <div className='space-y-4'>
              {/* Voice Selection */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>{t("voice")}</label>
                <Select value={voice} onValueChange={handleVoiceChange}>
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICES.map((v) => (
                      <SelectItem key={v.value} value={v.value}>
                        <span className='flex flex-col'>
                          <span>{v.label}</span>
                          <span className='text-muted-foreground text-xs'>
                            {v.description}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Speed Selection */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>{t("speed")}</label>
                <Select
                  value={speed.toString()}
                  onValueChange={handleSpeedChange}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPEEDS.map((s) => (
                      <SelectItem key={s} value={s.toString()}>
                        {s}x
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Volume Control */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>{t("volume")}</label>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 shrink-0'
                    onClick={toggleMute}
                  >
                    {isMuted ? (
                      <VolumeX className='h-4 w-4' />
                    ) : (
                      <Volume2 className='h-4 w-4' />
                    )}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className='flex-1'
                  />
                </div>
              </div>

              {/* Text Visibility Toggle */}
              <div className='flex items-center justify-between border-t pt-2'>
                <span className='text-sm font-medium'>{t("showText")}</span>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setIsTextVisible(!isTextVisible)}
                  className='h-8 gap-2'
                >
                  {isTextVisible ? (
                    <>
                      <EyeOff className='h-4 w-4' />
                      {t("hide")}
                    </>
                  ) : (
                    <>
                      <Eye className='h-4 w-4' />
                      {t("show")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </Card>
  );
}
