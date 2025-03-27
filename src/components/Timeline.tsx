
import React, { useRef, useEffect, useState } from 'react';

interface TimelineProps {
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
  currentTime: number;
  duration: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
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
}

const Timeline: React.FC<TimelineProps> = ({
  mediaElements,
  currentTime,
  duration,
  setCurrentTime,
  selectedMedia,
  setSelectedMedia,
  updateMediaProperties
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDraggingMarker, setIsDraggingMarker] = useState(false);
  const [isDraggingClip, setIsDraggingClip] = useState(false);
  const [isResizingClip, setIsResizingClip] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<'start' | 'end' | null>(null);
  
  // Generate tick marks at regular intervals
  const generateTicks = () => {
    const ticks = [];
    const interval = 2; // 2 second intervals
    
    for (let i = 0; i <= duration; i += interval) {
      const position = (i / duration) * 100;
      ticks.push(
        <div key={i} className="timeline-tick" style={{ left: `${position}%` }}>
          <span className="timeline-tick-label">{formatTickTime(i)}</span>
        </div>
      );
    }
    
    return ticks;
  };
  
  // Format time for tick labels (seconds)
  const formatTickTime = (timeInSeconds: number) => {
    const seconds = Math.floor(timeInSeconds);
    return `${seconds}s`;
  };
  
  // Handle timeline click to seek
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = offsetX / rect.width;
    const newTime = percentage * duration;
    
    setCurrentTime(Math.max(0, Math.min(newTime, duration)));
  };
  
  // Handle marker drag
  const handleMarkerMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingMarker(true);
  };
  
  // Handle clip selection
  const handleClipClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const media = mediaElements.find(m => m.id === id);
    if (media) {
      setSelectedMedia(media);
    }
  };
  
  // Handle clip drag start
  const handleClipMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const media = mediaElements.find(m => m.id === id);
    if (media) {
      setSelectedMedia(media);
      setIsDraggingClip(true);
    }
  };
  
  // Handle clip resize
  const handleClipResizeStart = (e: React.MouseEvent, id: string, direction: 'start' | 'end') => {
    e.stopPropagation();
    const media = mediaElements.find(m => m.id === id);
    if (media) {
      setSelectedMedia(media);
      setIsResizingClip(true);
      setResizeDirection(direction);
    }
  };
  
  // Handle mouse move for marker or clip drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!timelineRef.current) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const percentage = offsetX / rect.width;
      
      if (isDraggingMarker) {
        const newTime = percentage * duration;
        setCurrentTime(Math.max(0, Math.min(newTime, duration)));
      } 
      else if (isDraggingClip && selectedMedia) {
        const newStartTime = percentage * duration - (selectedMedia.endTime - selectedMedia.startTime) / 2;
        const newEndTime = newStartTime + (selectedMedia.endTime - selectedMedia.startTime);
        
        if (newStartTime >= 0 && newEndTime <= duration) {
          updateMediaProperties(selectedMedia.id, {
            startTime: newStartTime,
            endTime: newEndTime
          });
        }
      }
      else if (isResizingClip && selectedMedia && resizeDirection) {
        const newTime = percentage * duration;
        
        if (resizeDirection === 'start' && newTime < selectedMedia.endTime) {
          updateMediaProperties(selectedMedia.id, {
            startTime: Math.max(0, newTime)
          });
        } 
        else if (resizeDirection === 'end' && newTime > selectedMedia.startTime) {
          updateMediaProperties(selectedMedia.id, {
            endTime: Math.min(duration, newTime)
          });
        }
      }
    };
    
    const handleMouseUp = () => {
      setIsDraggingMarker(false);
      setIsDraggingClip(false);
      setIsResizingClip(false);
    };
    
    if (isDraggingMarker || isDraggingClip || isResizingClip) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDraggingMarker, 
    isDraggingClip, 
    isResizingClip, 
    selectedMedia, 
    resizeDirection, 
    duration, 
    setCurrentTime, 
    updateMediaProperties
  ]);
  
  return (
    <div className="relative h-32 p-2">
      {/* Timeline area */}
      <div 
        ref={timelineRef}
        className="relative w-full h-24 mt-4 bg-gray-100 rounded cursor-pointer"
        onClick={handleTimelineClick}
      >
        {/* Tick marks */}
        {generateTicks()}
        
        {/* Current time marker */}
        <div 
          className="timeline-marker"
          style={{ left: `${(currentTime / duration) * 100}%` }}
          onMouseDown={handleMarkerMouseDown}
        >
          <div className="w-4 h-4 bg-blue-500 rounded-full -ml-2 -mt-2 cursor-ew-resize" />
        </div>
        
        {/* Media clips */}
        {mediaElements.map((media) => {
          const startPercentage = (media.startTime / duration) * 100;
          const endPercentage = (media.endTime / duration) * 100;
          const width = endPercentage - startPercentage;
          const isSelected = selectedMedia?.id === media.id;
          
          return (
            <div
              key={media.id}
              className={`absolute h-16 bg-blue-200 rounded-md ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
              style={{
                left: `${startPercentage}%`,
                width: `${width}%`,
                top: '4px'
              }}
              onClick={(e) => handleClipClick(e, media.id)}
              onMouseDown={(e) => handleClipMouseDown(e, media.id)}
            >
              <div className="flex items-center h-full px-2 overflow-hidden">
                <div className="w-8 h-8 bg-blue-300 rounded-md mr-2 flex-shrink-0 overflow-hidden">
                  {media.type === 'image' ? (
                    <img src={media.src} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-blue-400 flex items-center justify-center">
                      <span className="text-xs text-white">Video</span>
                    </div>
                  )}
                </div>
                <div className="text-xs truncate">{media.id}</div>
              </div>
              
              {/* Resize handles */}
              {isSelected && (
                <>
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize"
                    onMouseDown={(e) => handleClipResizeStart(e, media.id, 'start')}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                  </div>
                  <div 
                    className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize"
                    onMouseDown={(e) => handleClipResizeStart(e, media.id, 'end')}
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                  </div>
                </>
              )}
            </div>
          );
        })}
        
        {/* Timeline waveform */}
        <div className="absolute bottom-0 left-0 right-0 h-8 opacity-30 pointer-events-none">
          <div className="w-full h-full bg-blue-200" style={{ 
            backgroundImage: "linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
            backgroundSize: "calc(100% / 20) 100%"
          }}></div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
