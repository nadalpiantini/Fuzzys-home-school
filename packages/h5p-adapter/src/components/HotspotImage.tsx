import React from 'react';
import { HotspotImageSchema, H5PEvent } from '../types';

interface HotspotImageProps {
  content: any;
  onEvent?: (event: H5PEvent) => void;
  className?: string;
}

export const HotspotImage: React.FC<HotspotImageProps> = ({
  content,
  onEvent,
  className = ''
}) => {
  return (
    <div className={`h5p-hotspot-image ${className}`}>
      <div className="p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Hotspot Image Component</h3>
        <p className="text-gray-600">This is a placeholder for the Hotspot Image component.</p>
        <p className="text-sm text-gray-500 mt-2">Content ID: {content?.id || 'N/A'}</p>
      </div>
    </div>
  );
};