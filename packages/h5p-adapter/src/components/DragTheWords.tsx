import React from 'react';
import { H5PEvent } from '../types';

interface DragTheWordsProps {
  content: any;
  onEvent?: (event: H5PEvent) => void;
  className?: string;
}

export const DragTheWords: React.FC<DragTheWordsProps> = ({
  content,
  onEvent,
  className = ''
}) => {
  return (
    <div className={`h5p-drag-the-words ${className}`}>
      <div className="p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Drag the Words</h3>
        <p className="text-gray-600">This is a placeholder for the Drag the Words component.</p>
        <p className="text-sm text-gray-500 mt-2">Content ID: {content?.id || 'N/A'}</p>
      </div>
    </div>
  );
};