"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
import {
  generateCacheKey,
  generateProgressKey,
  getCachedAudio,
  setCachedAudio,
  savePlaybackProgress,
  getPlaybackProgress,
  clearPlaybackProgress,
} from "@/lib/audioCache";
import { useTranslations } from "next-intl";

interface AudioReaderProps {
  text: string;
  language: string;
  preload?: boolean;
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

export function AudioReader({
  text,
  language: _language,
  preload = true,
}: AudioReaderProps) {
  const t = useTranslations("AudioReader");

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
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
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wordsRef = useRef<HTMLSpanElement[]>([]);
  const textContainerRef = useRef<HTMLDivElement | null>(null);
  const preloadStartedRef = useRef(false);
  const progressKeyRef = useRef(generateProgressKey(text));
  const currentTimeRef = useRef(0); // Track current time for saving on unmount
  const displayedTimeRef = useRef(0);
  const isSeekingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  // Split text into words once per text change.
  const words = useMemo(
    () => text.split(/(\s+)/).filter((word) => word.trim().length > 0),
    [text]
  );

  // Estimate spoken time from the word's length rather than giving every word
  // an equal slice. Punctuation adds a small weight for natural speech pauses.
  const wordTimings = useMemo(() => {
    if (duration === 0 || words.length === 0) return [];

    const weights = words.map((word) => {
      const characters = (word.match(/[\p{L}\p{N}]/gu) ?? []).length;
      const shortPauses = (word.match(/[,;:—–-]/g) ?? []).length * 2;
      const longPauses = (word.match(/[.!?…]/g) ?? []).length * 4;

      return Math.max(1, characters) + shortPauses + longPauses;
    });
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let elapsed = 0;

    return weights.map((weight) => {
      const start = elapsed;
      elapsed += (weight / totalWeight) * duration;
      return { start, end: elapsed };
    });
  }, [duration, words]);

  // Generate audio (with caching)
  const handleGenerateAudio = useCallback(
    async (isPreload = false) => {
      if (audioUrl) {
        // Audio already generated, just play
        return;
      }

      const cacheKey = generateCacheKey(text, voice, speed);

      // Check cache first
      const cachedAudio = getCachedAudio(cacheKey);
      if (cachedAudio) {
        // Use cached audio
        const audioBlob = new Blob(
          [
            Uint8Array.from(atob(cachedAudio.audioBase64), (c) =>
              c.charCodeAt(0)
            ),
          ],
          { type: cachedAudio.contentType }
        );
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        if (!isPreload) {
          setShouldAutoPlay(true);
        }
        return;
      }

      if (isPreload) {
        setIsPreloading(true);
      } else {
        setIsLoading(true);
        setShouldAutoPlay(true); // Only auto-play when user explicitly clicks play
      }

      try {
        const result = await generateAudio({
          text,
          voice,
          speed,
        });

        // Store in cache for future use
        setCachedAudio(cacheKey, result.audioBase64, result.contentType);

        const audioBlob = new Blob(
          [Uint8Array.from(atob(result.audioBase64), (c) => c.charCodeAt(0))],
          { type: result.contentType }
        );
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      } catch (error) {
        console.error("Failed to generate audio:", error);
      } finally {
        if (isPreload) {
          setIsPreloading(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [text, voice, speed, audioUrl]
  );

  // Preload audio when component mounts
  useEffect(() => {
    if (preload && !preloadStartedRef.current) {
      preloadStartedRef.current = true;
      handleGenerateAudio(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount, ref prevents duplicate calls

  // Play/Pause toggle
  const togglePlayPause = useCallback(async () => {
    // If preloading is in progress, wait for it
    if (isPreloading) {
      return;
    }

    if (!audioUrl) {
      await handleGenerateAudio(false);
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  }, [audioUrl, isPlaying, isPreloading, handleGenerateAudio]);

  // Reset audio
  const handleReset = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      currentTimeRef.current = 0;
      displayedTimeRef.current = 0;
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
    preloadStartedRef.current = false; // Allow new preload with new voice
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

  // Keep the thumb responsive while it is dragged. Applying currentTime on every
  // pointer movement makes the browser repeatedly seek and can make it jump.
  const handleSeekPreview = useCallback(
    (value: number[]) => {
      const nextProgress = value[0] ?? 0;
      const nextTime = (nextProgress / 100) * duration;
      isSeekingRef.current = true;
      displayedTimeRef.current = nextTime;
      setProgress(nextProgress);
      setCurrentTime(nextTime);
    },
    [duration]
  );

  const handleSeekCommit = useCallback(
    (value: number[]) => {
      const nextProgress = value[0] ?? 0;
      const seekTime = (nextProgress / 100) * duration;
      if (audioRef.current) {
        audioRef.current.currentTime = seekTime;
        currentTimeRef.current = seekTime;
      }
      displayedTimeRef.current = seekTime;
      setCurrentTime(seekTime);
      setProgress(nextProgress);
      isSeekingRef.current = false;
    },
    [duration]
  );

  // Update word highlighting based on current time
  useEffect(() => {
    if (!isPlaying || duration === 0) return;

    const currentIndex = wordTimings.findIndex(
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
  }, [currentTime, isPlaying, duration, wordTimings, currentWordIndex]);

  // Audio event listeners
  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const syncPlaybackPosition = () => {
      if (!isSeekingRef.current && Number.isFinite(audio.duration)) {
        const nextTime = audio.currentTime;
        currentTimeRef.current = nextTime;
        // Reading the clock on every animation frame avoids the coarse and
        // browser-dependent `timeupdate` cadence. Limit React updates to 30fps
        // so the text rendering cannot make the control itself feel sluggish.
        if (Math.abs(nextTime - displayedTimeRef.current) >= 1 / 30) {
          displayedTimeRef.current = nextTime;
          setCurrentTime(nextTime);
          setProgress((nextTime / audio.duration) * 100);
        }
      }

      if (!audio.paused && !audio.ended) {
        animationFrameRef.current = requestAnimationFrame(syncPlaybackPosition);
      }
    };

    const startPositionSync = () => {
      if (animationFrameRef.current === null) {
        animationFrameRef.current = requestAnimationFrame(syncPlaybackPosition);
      }
    };

    const stopPositionSync = () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);

      // Restore saved playback progress
      const savedProgress = getPlaybackProgress(progressKeyRef.current);
      if (savedProgress !== null && savedProgress > 0) {
        audio.currentTime = savedProgress;
        currentTimeRef.current = savedProgress;
        displayedTimeRef.current = savedProgress;
        setCurrentTime(savedProgress);
        setProgress((savedProgress / audio.duration) * 100);
      }
    });

    audio.addEventListener("play", () => {
      setIsPlaying(true);
      startPositionSync();
    });

    audio.addEventListener("pause", () => {
      stopPositionSync();
      syncPlaybackPosition();
      setIsPlaying(false);
      // Save progress when paused
      savePlaybackProgress(progressKeyRef.current, audio.currentTime);
    });

    audio.addEventListener("ended", () => {
      stopPositionSync();
      setIsPlaying(false);
      setCurrentWordIndex(-1);
      // Clear progress when finished
      clearPlaybackProgress(progressKeyRef.current);
    });

    // Only auto-play when user explicitly requested playback (not on preload)
    if (shouldAutoPlay) {
      audio.play();
      setShouldAutoPlay(false);
    }

    return () => {
      stopPositionSync();
      audio.pause();
      audio.src = "";
    };
  }, [audioUrl, shouldAutoPlay]);

  // Cleanup URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Save playback progress on unmount (when switching modes)
  useEffect(() => {
    const progressKey = progressKeyRef.current;
    return () => {
      // Save current playback position when component unmounts
      if (currentTimeRef.current > 0) {
        savePlaybackProgress(progressKey, currentTimeRef.current);
      }
    };
  }, []);

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
          onValueChange={handleSeekPreview}
          onValueCommit={handleSeekCommit}
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
          {isLoading || isPreloading ? (
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
