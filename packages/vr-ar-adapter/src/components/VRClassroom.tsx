import React, { useEffect, useRef } from 'react';

interface VRClassroomProps {
  sceneUrl?: string;
  onEnter?: () => void;
  onExit?: () => void;
  className?: string;
}

export const VRClassroom: React.FC<VRClassroomProps> = ({
  sceneUrl = '/vr/classroom.html',
  onEnter,
  onExit,
  className = ''
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'vr-enter') {
        onEnter?.();
      } else if (event.data.type === 'vr-exit') {
        onExit?.();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onEnter, onExit]);

  return (
    <div className={`vr-classroom ${className}`}>
      <iframe
        ref={iframeRef}
        src={sceneUrl}
        width="100%"
        height="600px"
        frameBorder="0"
        allow="vr; xr-spatial-tracking"
        title="VR Classroom"
      />
    </div>
  );
};

export default VRClassroom;
