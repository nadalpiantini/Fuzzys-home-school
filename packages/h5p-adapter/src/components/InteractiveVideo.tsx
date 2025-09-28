import React, { useState, useRef, useEffect } from 'react';
import { z } from 'zod';
import { InteractiveVideoSchema, H5PEvent } from '../types';

interface InteractiveVideoProps {
  content: z.infer<typeof InteractiveVideoSchema>;
  onEvent?: (event: H5PEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface Interaction {
  id: string;
  time: number;
  duration?: number;
  pauseVideo: boolean;
  displayType: 'button' | 'poster' | 'inline';
  content: {
    type: 'text' | 'mcq' | 'fill-blanks' | 'drag-text';
    question: string;
    answers?: string[];
    correct?: number[];
  };
}

export const InteractiveVideo: React.FC<InteractiveVideoProps> = ({
  content,
  onEvent,
  className = '',
  style = {}
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeInteraction, setActiveInteraction] = useState<Interaction | null>(null);
  const [completedInteractions, setCompletedInteractions] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);

  const { video, interactions } = content.params;

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      const time = videoElement.currentTime;
      setCurrentTime(time);

      // Check for interactions at current time
      const currentInteraction = interactions.find(
        interaction =>
          time >= interaction.time &&
          (!interaction.duration || time <= interaction.time + interaction.duration) &&
          !completedInteractions.has(interaction.id)
      );

      if (currentInteraction && currentInteraction !== activeInteraction) {
        if (currentInteraction.pauseVideo) {
          videoElement.pause();
          setIsPlaying(false);
        }
        setActiveInteraction(currentInteraction);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
    };
  }, [interactions, activeInteraction, completedInteractions]);

  const handleInteractionComplete = (interactionId: string, correct: boolean) => {
    setCompletedInteractions(prev => new Set([...prev, interactionId]));
    setActiveInteraction(null);

    if (correct) {
      setScore(prev => prev + 1);
    }

    onEvent?.({
      type: 'interaction',
      data: {
        correct,
        score: correct ? score + 1 : score,
        maxScore: interactions.length
      }
    });

    // Resume video if it was paused
    if (videoRef.current?.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const renderInteractionContent = (interaction: Interaction) => {
    const { content: interactionContent } = interaction;

    switch (interactionContent.type) {
      case 'mcq':
        return (
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-md">
            <h3 className="font-bold mb-3">{interactionContent.question}</h3>
            <div className="space-y-2">
              {interactionContent.answers?.map((answer, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const correct = interactionContent.correct?.includes(index) ?? false;
                    handleInteractionComplete(interaction.id, correct);
                  }}
                  className="w-full text-left p-2 rounded border hover:bg-gray-50 transition-colors"
                >
                  {answer}
                </button>
              ))}
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-md">
            <p className="mb-3">{interactionContent.question}</p>
            <button
              onClick={() => handleInteractionComplete(interaction.id, true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Continue
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const getInteractionPosition = (interaction: Interaction) => {
    // Position interactions based on display type
    switch (interaction.displayType) {
      case 'inline':
        return 'absolute bottom-20 left-1/2 transform -translate-x-1/2';
      case 'poster':
        return 'absolute inset-0 flex items-center justify-center bg-black bg-opacity-50';
      case 'button':
        return 'absolute top-4 right-4';
      default:
        return 'absolute bottom-20 left-1/2 transform -translate-x-1/2';
    }
  };

  return (
    <div className={`relative w-full h-auto ${className}`} style={style}>
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-auto"
        controls
        src={video.url}
        onEnded={() => {
          onEvent?.({
            type: 'completed',
            data: {
              score,
              maxScore: interactions.length,
              completion: 100
            }
          });
        }}
      >
        Your browser does not support the video tag.
      </video>

      {/* Start Screen */}
      {currentTime === 0 && !video.startScreenOptions.hideStartTitle && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">{video.startScreenOptions.title}</h2>
            <button
              onClick={() => videoRef.current?.play()}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              ▶ Start Video
            </button>
          </div>
        </div>
      )}

      {/* Active Interaction Overlay */}
      {activeInteraction && (
        <div className={getInteractionPosition(activeInteraction)}>
          {renderInteractionContent(activeInteraction)}
        </div>
      )}

      {/* Progress Indicators */}
      <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
        Interactions: {completedInteractions.size}/{interactions.length}
      </div>

      {/* Interaction Timeline */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
        {interactions.map(interaction => (
          <div
            key={interaction.id}
            className={`absolute h-full w-1 ${
              completedInteractions.has(interaction.id)
                ? 'bg-green-500'
                : 'bg-yellow-500'
            }`}
            style={{
              left: `${(interaction.time / (videoRef.current?.duration || 1)) * 100}%`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default InteractiveVideo;