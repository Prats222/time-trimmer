
import React, { useRef, useEffect, useState } from 'react';
import { Move } from 'lucide-react';

interface MediaCanvasProps {
  mediaElements: Array<{
    id: string;
    type: 'image' | 'video';
    src: string;
    width: number;
    height: number;
    startTime: number;
    endTime: number;
    position: { x: number, y: number };
  }>;
  selectedMedia: {
    id: string;
    type: 'image' | 'video';
    src: string;
    width: number;
    height: number;
    startTime: number;
    endTime: number;
    position: { x: number, y: number };
  } | null;
  setSelectedMedia: React.Dispatch<React.SetStateAction<{
    id: string;
    type: 'image' | 'video';
    src: string;
    width: number;
    height: number;
    startTime: number;
    endTime: number;
    position: { x: number, y: number };
  } | null>>;
  updateMediaProperties: (id: string, properties: Partial<{
    id: string;
    type: 'image' | 'video';
    src: string;
    width: number;
    height: number;
    startTime: number;
    endTime: number;
    position: { x: number, y: number };
  }>) => void;
  currentTime: number;
  isPlaying: boolean;
}

const MediaCanvas: React.FC<MediaCanvasProps> = ({
  mediaElements,
  selectedMedia,
  setSelectedMedia,
  updateMediaProperties,
  currentTime,
  isPlaying
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{[key: string]: HTMLVideoElement | null}>({});
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  
  // Handle element selection
  const handleSelectMedia = (id: string) => {
    const media = mediaElements.find(m => m.id === id);
    if (media) {
      setSelectedMedia(media);
    }
  };
  
  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    if (!e.currentTarget.classList.contains('resizer')) {
      handleSelectMedia(id);
      setIsDragging(true);
      setStartPos({ 
        x: e.clientX, 
        y: e.clientY 
      });
      
      const media = mediaElements.find(m => m.id === id);
      if (media) {
        setStartPos({
          x: e.clientX - media.position.x,
          y: e.clientY - media.position.y
        });
      }
    }
  };
  
  // Handle mouse down for resizing
  const handleResizeStart = (e: React.MouseEvent, id: string, direction: string) => {
    e.stopPropagation();
    handleSelectMedia(id);
    setIsResizing(true);
    setResizeDirection(direction);
    setStartPos({ x: e.clientX, y: e.clientY });
    
    const media = mediaElements.find(m => m.id === id);
    if (media) {
      setStartSize({ width: media.width, height: media.height });
    }
  };
  
  // Control video playback based on isPlaying state
  useEffect(() => {
    mediaElements.forEach(media => {
      if (media.type === 'video') {
        const videoElement = videoRefs.current[media.id];
        if (videoElement) {
          if (isPlaying && currentTime >= media.startTime && currentTime <= media.endTime) {
            // Calculate where to seek within the video
            const videoTimeOffset = Math.max(0, currentTime - media.startTime);
            videoElement.currentTime = videoTimeOffset;
            videoElement.play().catch(err => console.error("Error playing video:", err));
          } else {
            videoElement.pause();
          }
        }
      }
    });
  }, [isPlaying, currentTime, mediaElements]);

  // Handle mouse move for dragging or resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && selectedMedia) {
        const newX = Math.max(0, e.clientX - startPos.x);
        const newY = Math.max(0, e.clientY - startPos.y);
        
        updateMediaProperties(selectedMedia.id, {
          position: { x: newX, y: newY }
        });
      } else if (isResizing && selectedMedia && resizeDirection) {
        const deltaX = e.clientX - startPos.x;
        const deltaY = e.clientY - startPos.y;
        
        let newWidth = startSize.width;
        let newHeight = startSize.height;
        
        // Handle resizing based on the direction
        if (resizeDirection.includes('e')) {
          newWidth = Math.max(50, startSize.width + deltaX);
        }
        if (resizeDirection.includes('w')) {
          newWidth = Math.max(50, startSize.width - deltaX);
        }
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(50, startSize.height + deltaY);
        }
        if (resizeDirection.includes('n')) {
          newHeight = Math.max(50, startSize.height - deltaY);
        }
        
        updateMediaProperties(selectedMedia.id, {
          width: newWidth,
          height: newHeight
        });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };
    
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, selectedMedia, startPos, startSize, resizeDirection, updateMediaProperties]);
  
  // Clear selection when clicking the canvas background
  const handleCanvasClick = () => {
    setSelectedMedia(null);
  };
  
  return (
    <div 
      ref={canvasRef} 
      className="w-full h-full relative overflow-hidden"
      onClick={handleCanvasClick}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-4/5 h-4/5 border border-gray-300 bg-white shadow-sm rounded-md overflow-hidden flex items-center justify-center">
          {/* Render media elements */}
          {mediaElements.map((media) => {
            // Check if the media should be visible at the current time
            const isVisible = currentTime >= media.startTime && currentTime <= media.endTime;
            
            if (!isVisible) return null;
            
            const isSelected = selectedMedia?.id === media.id;
            
            return (
              <div
                key={media.id}
                className={`absolute resizable ${isSelected ? 'ring-2 ring-blue-500' : ''} element-appear`}
                style={{
                  left: `${media.position.x}px`,
                  top: `${media.position.y}px`,
                  width: `${media.width}px`,
                  height: `${media.height}px`,
                  cursor: isDragging ? 'grabbing' : 'grab',
                  zIndex: isSelected ? 10 : 1
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => handleMouseDown(e, media.id)}
              >
                {media.type === 'image' ? (
                  <img 
                    src={media.src} 
                    alt="Media content" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video 
                    ref={el => videoRefs.current[media.id] = el}
                    src={media.src}
                    className="w-full h-full object-cover"
                    autoPlay={false}
                    controls={false}
                    muted={false}
                    playsInline
                  />
                )}
                
                {isSelected && (
                  <>
                    {/* Resize handles */}
                    <div 
                      className="resizer nw" 
                      onMouseDown={(e) => handleResizeStart(e, media.id, 'nw')}
                    />
                    <div 
                      className="resizer ne" 
                      onMouseDown={(e) => handleResizeStart(e, media.id, 'ne')}
                    />
                    <div 
                      className="resizer sw" 
                      onMouseDown={(e) => handleResizeStart(e, media.id, 'sw')}
                    />
                    <div 
                      className="resizer se" 
                      onMouseDown={(e) => handleResizeStart(e, media.id, 'se')}
                    />
                    
                    {/* Drag handle */}
                    <div className="absolute top-2 left-2 bg-white p-1 rounded-full shadow-md">
                      <Move size={16} className="text-blue-500" />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MediaCanvas;
