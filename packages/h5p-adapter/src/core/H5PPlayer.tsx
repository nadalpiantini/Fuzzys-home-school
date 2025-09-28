import React from 'react';
import { H5PComponentProps } from '../types';

export const H5PPlayer: React.FC<H5PComponentProps> = ({
  content,
  onEvent,
  className = '',
  style
}) => {
  return (
    <div className={`h5p-player ${className}`} style={style}>
      <div className="p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">H5P Player</h3>
        <p className="text-gray-600">This is a placeholder for the H5P Player component.</p>
        <p className="text-sm text-gray-500 mt-2">Content ID: {content?.id || 'N/A'}</p>
      </div>
    </div>
  );
};

export default H5PPlayer;