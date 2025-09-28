import React, { useState, useEffect, useRef } from 'react';
import { z } from 'zod';
import { CoursePresentationSchema, H5PEvent } from '../types';

interface CoursePresentationProps {
  content: z.infer<typeof CoursePresentationSchema>;
  onEvent?: (event: H5PEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface Slide {
  id: string;
  elements: Array<{
    type: 'text' | 'image' | 'video' | 'mcq' | 'fill-blanks' | 'drag-drop';
    x: number;
    y: number;
    width: number;
    height: number;
    content?: any;
  }>;
  background?: {
    color?: string;
    image?: string;
  };
}

interface SlideElement {
  type: 'text' | 'image' | 'video' | 'mcq' | 'fill-blanks' | 'drag-drop';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: any;
}

export const CoursePresentation: React.FC<CoursePresentationProps> = ({
  content,
  onEvent,
  className = '',
  style = {}
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideProgress, setSlideProgress] = useState<Set<string>>(new Set());
  const [elementScores, setElementScores] = useState<Record<string, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const { title, slides, settings } = content.params;
  const currentSlide = slides[currentSlideIndex];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!settings.enableKeyboardNavigation) return;

      switch (event.key) {
        case 'ArrowLeft':
          goToPreviousSlide();
          break;
        case 'ArrowRight':
          goToNextSlide();
          break;
        case 'Home':
          setCurrentSlideIndex(0);
          break;
        case 'End':
          setCurrentSlideIndex(slides.length - 1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, slides.length, settings.enableKeyboardNavigation]);

  const goToNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      updateProgress();
    }
  };

  const goToPreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index);
      updateProgress();
    }
  };

  const updateProgress = () => {
    const newProgress = new Set(slideProgress);
    newProgress.add(currentSlide.id);
    setSlideProgress(newProgress);

    onEvent?.({
      type: 'progress',
      data: {
        completion: (newProgress.size / slides.length) * 100
      }
    });

    // Check if presentation is completed
    if (newProgress.size === slides.length) {
      onEvent?.({
        type: 'completed',
        data: {
          completion: 100,
          score: Object.values(elementScores).reduce((a, b) => a + b, 0),
          maxScore: slides.reduce((total, slide) =>
            total + slide.elements.filter(el =>
              ['mcq', 'fill-blanks', 'drag-drop'].includes(el.type)
            ).length, 0
          )
        }
      });
    }
  };

  const handleElementInteraction = (elementId: string, score: number, maxScore: number) => {
    setElementScores(prev => ({ ...prev, [elementId]: score }));

    onEvent?.({
      type: 'interaction',
      data: {
        score,
        maxScore,
        correct: score === maxScore
      }
    });
  };

  const renderSlideElement = (element: SlideElement, elementIndex: number) => {
    const elementId = `${currentSlide.id}-${elementIndex}`;
    const elementStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${element.x}%`,
      top: `${element.y}%`,
      width: `${element.width}%`,
      height: `${element.height}%`,
    };

    switch (element.type) {
      case 'text':
        return (
          <div
            key={elementId}
            style={elementStyle}
            className="p-2 text-gray-800"
            dangerouslySetInnerHTML={{ __html: element.content?.text || '' }}
          />
        );

      case 'image':
        return (
          <img
            key={elementId}
            src={element.content?.url}
            alt={element.content?.alt || ''}
            style={elementStyle}
            className="object-contain rounded"
          />
        );

      case 'video':
        return (
          <video
            key={elementId}
            src={element.content?.url}
            controls
            style={elementStyle}
            className="rounded"
          />
        );

      case 'mcq':
        return (
          <div key={elementId} style={elementStyle} className="bg-white p-4 rounded shadow">
            <h4 className="font-bold mb-2">{element.content?.question}</h4>
            <div className="space-y-2">
              {element.content?.answers?.map((answer: string, index: number) => (
                <button
                  key={index}
                  onClick={() => {
                    const correct = element.content?.correct?.includes(index) ?? false;
                    handleElementInteraction(elementId, correct ? 1 : 0, 1);
                  }}
                  className="w-full text-left p-2 border rounded hover:bg-gray-50 transition-colors"
                >
                  {answer}
                </button>
              ))}
            </div>
          </div>
        );

      case 'fill-blanks':
        return (
          <div key={elementId} style={elementStyle} className="bg-white p-4 rounded shadow">
            <p className="mb-2">{element.content?.text}</p>
            <input
              type="text"
              placeholder="Fill in the blank..."
              className="w-full p-2 border rounded"
              onBlur={(e) => {
                const correct = e.target.value.toLowerCase() === element.content?.correct?.toLowerCase();
                handleElementInteraction(elementId, correct ? 1 : 0, 1);
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const getSlideBackground = (slide: Slide): React.CSSProperties => {
    const bg: React.CSSProperties = {};

    if (slide.background?.color) {
      bg.backgroundColor = slide.background.color;
    }

    if (slide.background?.image) {
      bg.backgroundImage = `url(${slide.background.image})`;
      bg.backgroundSize = 'cover';
      bg.backgroundPosition = 'center';
    }

    return bg;
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`} style={style}>
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 rounded-t-lg">
        <h1 className="text-xl font-bold">{title}</h1>
        {settings.showProgressBar && (
          <div className="mt-2 bg-gray-600 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentSlideIndex + 1) / slides.length) * 100}%`
              }}
            />
          </div>
        )}
      </div>

      {/* Slide Container */}
      <div
        ref={containerRef}
        className="relative bg-white"
        style={{
          height: '600px',
          ...getSlideBackground(currentSlide)
        }}
      >
        {/* Slide Elements */}
        {currentSlide.elements.map((element, index) =>
          renderSlideElement(element, index)
        )}

        {/* Navigation Buttons */}
        <button
          onClick={goToPreviousSlide}
          disabled={currentSlideIndex === 0}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full disabled:opacity-30 hover:bg-opacity-75 transition-all"
        >
          ←
        </button>

        <button
          onClick={goToNextSlide}
          disabled={currentSlideIndex === slides.length - 1}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full disabled:opacity-30 hover:bg-opacity-75 transition-all"
        >
          →
        </button>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 p-4 rounded-b-lg flex justify-between items-center">
        {/* Slide Navigation */}
        <div className="flex space-x-1">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlideIndex
                  ? 'bg-blue-500'
                  : slideProgress.has(slides[index].id)
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
              title={`Slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Slide Counter */}
        <span className="text-sm text-gray-600">
          {currentSlideIndex + 1} / {slides.length}
        </span>

        {/* Summary Button */}
        {settings.showSummarySlide && currentSlideIndex === slides.length - 1 && (
          <button
            onClick={() => {
              onEvent?.({
                type: 'completed',
                data: {
                  completion: 100,
                  score: Object.values(elementScores).reduce((a, b) => a + b, 0)
                }
              });
            }}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            View Summary
          </button>
        )}
      </div>

      {/* Keyboard Navigation Help */}
      {settings.enableKeyboardNavigation && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Use arrow keys to navigate • Home/End for first/last slide
        </div>
      )}
    </div>
  );
};

export default CoursePresentation;