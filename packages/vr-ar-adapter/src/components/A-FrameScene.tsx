import React, { useEffect, useRef } from 'react';

// Declare A-Frame JSX elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-box': any;
      'a-sphere': any;
      'a-cylinder': any;
      'a-plane': any;
      'a-camera': any;
      'a-light': any;
      'a-entity': any;
    }
  }
}

interface AFrameSceneProps {
  scene: string;
  vrMode?: boolean;
  arMode?: boolean;
  onSceneLoad?: () => void;
  className?: string;
}

export const AFrameScene: React.FC<AFrameSceneProps> = ({
  scene,
  vrMode = false,
  arMode = false,
  onSceneLoad,
  className = ''
}) => {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.innerHTML = scene;
      onSceneLoad?.();
    }
  }, [scene, onSceneLoad]);

  const vrAttributes = vrMode ? 'vr-mode-ui' : '';
  const arAttributes = arMode ? 'arjs' : '';

  return (
    <div className={`a-frame-scene ${className}`}>
      <a-scene
        ref={sceneRef}
        embedded
        vr-mode-ui={vrMode}
        arjs={arMode}
        style={{ height: '400px', width: '100%' }}
      >
        {/* Scene content will be inserted here */}
      </a-scene>
    </div>
  );
};

export default AFrameScene;
