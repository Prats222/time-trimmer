import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Image,
  Video,
  Music,
  Text,
  Settings,
  Plus,
  Zap,
  Check,
  Search,
  Move,
  ArrowDownToLine,
  Scissors
} from 'lucide-react';
import MediaCanvas from './MediaCanvas';
import MediaPanel from './MediaPanel';
import Timeline from './Timeline';
import SidebarNav from './SidebarNav';

const MediaEditor: React.FC = () => {
  // State for managing the current media element
  const [selectedMedia, setSelectedMedia] = useState<{
    id: string;
    type: 'image' | 'video';
    src: string;
    width: number;
    height: number;
    startTime: number;
    endTime: number;
    position: { x: number, y: number };
  } | null>(null);
  
  // State for all media elements on canvas
  const [mediaElements, setMediaElements] = useState<Array<{
    id: string;
    type: 'image' | 'video';
    src: string;
    width: number;
    height: number;
    startTime: number;
    endTime: number;
    position: { x: number, y: number };
  }>>([]);

  // State for playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(19.2); // Default duration
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      alert('Please upload an image or video file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      
      if (isVideo) {
        // Create a temporary video element to get the duration
        const tempVideo = document.createElement('video');
        tempVideo.src = src;
        
        tempVideo.onloadedmetadata = () => {
          const videoDuration = tempVideo.duration;
          console.log("Detected video duration:", videoDuration);
          setDuration(videoDuration);
          
          const newMedia = {
            id: `media-${Date.now()}`,
            type: 'video' as const,
            src,
            width: 300,
            height: 400,
            startTime: 0,
            endTime: Math.min(videoDuration, 5), // Default to 5 seconds or video duration if shorter
            position: { x: 100, y: 100 }
          };
          
          setMediaElements(prev => [...prev, newMedia]);
          setSelectedMedia(newMedia);
        };
        
        // Handle loading error
        tempVideo.onerror = () => {
          console.error("Error loading video for duration detection");
          
          const newMedia = {
            id: `media-${Date.now()}`,
            type: 'video' as const,
            src,
            width: 300,
            height: 400,
            startTime: 0,
            endTime: 5,
            position: { x: 100, y: 100 }
          };
          
          setMediaElements(prev => [...prev, newMedia]);
          setSelectedMedia(newMedia);
        };
      } else {
        // For images, use default duration
        const newMedia = {
          id: `media-${Date.now()}`,
          type: 'image' as const,
          src,
          width: 300,
          height: 400,
          startTime: 0,
          endTime: 5, // Default to 5 seconds
          position: { x: 100, y: 100 }
        };
        
        setMediaElements(prev => [...prev, newMedia]);
        setSelectedMedia(newMedia);
      }
    };
    
    reader.readAsDataURL(file);
  };

  // Handle play/pause
  const togglePlayback = () => {
    setIsPlaying(prev => !prev);
  };

  // Update media properties
  const updateMediaProperties = (id: string, properties: Partial<typeof selectedMedia>) => {
    setMediaElements(prev => 
      prev.map(media => 
        media.id === id 
          ? { ...media, ...properties } 
          : media
      )
    );
    
    if (selectedMedia?.id === id) {
      setSelectedMedia(prev => prev ? { ...prev, ...properties } : null);
    }
  };

  // Handle playback timer
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          if (newTime >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return newTime;
        });
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, duration]);

  // Format time display (00:00.0)
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const tenths = Math.floor((timeInSeconds % 1) * 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`;
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Top navigation bar */}
      <header className="h-14 flex items-center justify-between px-4 border-b bg-white z-10">
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-md">
            <ChevronLeft size={20} />
          </button>
          <h1 className="font-medium">Add Media</h1>
        </div>
        
        <div className="flex items-center">
          <span className="text-gray-500 mr-4">Snapchat-49509510</span>
          <span className="text-gray-500 mr-4">Log in to save progress</span>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm"><ChevronLeft size={16} /></Button>
            <Button variant="ghost" size="sm"><ChevronRight size={16} /></Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">Save your project for later —</span>
          <Button variant="link" size="sm" className="text-blue-600">sign up</Button>
          <span className="text-gray-500">or</span>
          <Button variant="link" size="sm" className="text-blue-600">log in</Button>
          
          <Button variant="default" size="sm" className="ml-2 bg-veed-orange hover:bg-orange-600 flex items-center">
            Upgrade <Zap className="ml-1" size={16} />
          </Button>
          
          <Button variant="default" size="sm" className="bg-veed-gray-900 hover:bg-veed-gray-800 flex items-center">
            Done <Check className="ml-1" size={16} />
          </Button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-16 bg-white border-r flex flex-col items-center py-4">
          <SidebarNav />
        </div>
        
        {/* Media options panel */}
        <div className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-4">
            {/* File upload box */}
            <div 
              className="border-2 border-dashed border-gray-200 rounded-md p-8 text-center cursor-pointer hover:border-gray-300 transition-colors mb-4"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileUpload}
                accept="image/*,video/*"
              />
              <div className="inline-flex justify-center items-center w-12 h-12 bg-gray-100 rounded-full mb-2">
                <Upload className="text-gray-500" />
              </div>
              <h3 className="font-medium mb-1">Upload a File</h3>
              <p className="text-sm text-gray-500">Drag & drop a file</p>
            </div>
            
            {/* Feature options */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button className="flex items-center justify-center p-3 border rounded-md hover:bg-gray-50 relative">
                <span className="absolute right-2 top-2 bg-veed-orange text-white p-0.5 rounded">
                  <Zap size={14} />
                </span>
                <div className="text-center">
                  <Image className="mx-auto mb-1" size={20} />
                  <span className="text-sm">Brand Kits</span>
                </div>
              </button>
              
              <button className="flex items-center justify-center p-3 border rounded-md hover:bg-gray-50 relative">
                <span className="absolute right-2 top-2 bg-veed-orange text-white p-0.5 rounded">
                  <Zap size={14} />
                </span>
                <div className="text-center">
                  <Text className="mx-auto mb-1" size={20} />
                  <span className="text-sm">Text To Speech</span>
                </div>
              </button>
              
              <button className="flex items-center justify-center p-3 border rounded-md hover:bg-gray-50 relative">
                <div className="relative flex-shrink-0">
                  <Music className="mx-auto mb-1" size={20} />
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded-md">NEW</span>
                </div>
                <span className="text-sm">Voice Clone</span>
              </button>
              
              <button className="flex items-center justify-center p-3 border rounded-md hover:bg-gray-50">
                <div className="text-center">
                  <Video className="mx-auto mb-1" size={20} />
                  <span className="text-sm">Voiceover</span>
                </div>
              </button>
            </div>
            
            {/* Stock music section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Stock Music</h3>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search" 
                    className="pl-8 pr-2 py-1 text-sm border rounded-md w-40 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                </div>
              </div>
              
              <div className="flex space-x-2 overflow-x-auto pb-2 mb-2">
                <button className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 whitespace-nowrap">
                  R&B
                </button>
                <button className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 whitespace-nowrap">
                  Jazz
                </button>
                <button className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 whitespace-nowrap">
                  Blues
                </button>
                <button className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 whitespace-nowrap">
                  Pop
                </button>
                <button className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 whitespace-nowrap">
                  More
                </button>
              </div>
              
              <div className="border rounded-md p-3 hover:bg-gray-50">
                <div className="flex items-center">
                  <button className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <Play size={16} className="text-white ml-0.5" />
                  </button>
                  <div>
                    <h4 className="text-sm font-medium">Lofi Background Vlog Hip Hop</h4>
                    <p className="text-xs text-gray-500">2:01</p>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-gray-400 h-full w-full opacity-50" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNIDAgMiBMIDIgMCBMIDQgMyBMIDYgMSBMIDggNCBMIDEwIDIgTCAxMiA1IEwgMTQgMCBMIDE2IDMgTCAxOCAxIEwgMjAgNCBMIDIyIDIgTCAyNCA1IEwgMjYgMCBMIDI4IDMgTCAzMCAxIEwgMzIgNCBMIDM0IDIgTCAzNiA1IEwgMzggMCBMIDQwIDMgTCA0MiAxIEwgNDQgNCBMIDQ2IDIgTCA0OCA1IEwgNTAgMCBMIDUyIDMgTCA1NCAxIEwgNTYgNCBMIDU4IDIgTCA2MCA1IEwgNjIgMCBMIDY0IDMgTCA2NiAxIEwgNjggNCBMIDcwIDIgTCA3MiA1IEwgNzQgMCBMIDc2IDMgTCA3OCAxIEwgODAgNCBMIDgyIDIgTCA4NCA1IEwgODYgMCBMIDg4IDMgTCA5MCAxIEwgOTIgNCBMIDk0IDIgTCA5NiA1IEwgOTggMCBMIDEwMCAzIEwgMTAyIDEgTCAxMDQgNCBMIDEwNiAyIEwgMTA4IDUgTCAxMTAgMCBMIDExMiAzIEwgMTE0IDEgTCAxMTYgNCBMIDExOCAyIEwgMTIwIDUgTCAxMjIgMCBMIDEyNCAzIEwgMTI2IDEgTCAxMjggNCBMIDEzMCAyIEwgMTMyIDUgTCAxMzQgMCBMIDEzNiAzIEwgMTM4IDEgTCAxNDAgNCBMIDE0MiAyIEwgMTQ0IDUgTCAxNDYgMCBMIDE0OCAzIEwgMTUwIDEgTCAxNTIgNCBMIDE1NCAyIEwgMTU2IDUgTCAxNTggMCBMIDE2MCAzIEwgMTYyIDEgTCAxNjQgNCBMIDE2NiAyIEwgMTY4IDUgTCAxNzAgMCBMIDE3MiAzIEwgMTc0IDEgTCAxNzYgNCBMIDE3OCAyIEwgMTgwIDUgTCAxODIgMCBMIDE4NCAzIEwgMTg2IDEgTCAxODggNCBMIDE5MCAyIEwgMTkyIDUgTCAxOTQgMCBMIDE5NiAzIEwgMTk4IDEgTCAyMDAgNCBMIDIwMCAyMCBMIDAgMjAgWiIgZmlsbD0iIzYwNjA2MCIgLz4KPC9zdmc+Cg==')" }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Media properties panel - shown when a media is selected */}
            {selectedMedia && (
              <div className="mt-4 p-4 border rounded-md bg-gray-50 media-panel">
                <h3 className="font-medium mb-3">Media Properties</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                    <Input 
                      type="number" 
                      value={selectedMedia.width}
                      onChange={(e) => updateMediaProperties(selectedMedia.id, { width: parseInt(e.target.value) || 0 })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                    <Input 
                      type="number" 
                      value={selectedMedia.height}
                      onChange={(e) => updateMediaProperties(selectedMedia.id, { height: parseInt(e.target.value) || 0 })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time (sec)</label>
                    <Input 
                      type="number" 
                      value={selectedMedia.startTime}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        updateMediaProperties(selectedMedia.id, { 
                          startTime: Math.max(0, Math.min(value, selectedMedia.endTime)) 
                        });
                      }}
                      min={0}
                      max={selectedMedia.endTime}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time (sec)</label>
                    <Input 
                      type="number" 
                      value={selectedMedia.endTime}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        updateMediaProperties(selectedMedia.id, { 
                          endTime: Math.max(selectedMedia.startTime, Math.min(value, duration)) 
                        });
                      }}
                      min={selectedMedia.startTime}
                      max={duration}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Main editor area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas area */}
          <div className="flex-1 relative bg-gray-100 flex items-center justify-center overflow-hidden">
            <MediaCanvas 
              mediaElements={mediaElements}
              selectedMedia={selectedMedia}
              setSelectedMedia={setSelectedMedia}
              updateMediaProperties={updateMediaProperties}
              currentTime={currentTime}
              isPlaying={isPlaying}
            />
          </div>
          
          {/* Timeline */}
          <div className="h-56 border-t bg-white">
            <div className="flex items-center justify-between p-2 border-b">
              <div className="flex items-center space-x-2">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Scissors size={18} />
                </button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <ArrowDownToLine size={16} className="mr-1" /> Download Section
                </Button>
                <span className="text-xs text-gray-500">(0:00 - 0:19)</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <SkipBack size={18} />
                </button>
                <button 
                  className="p-1.5 bg-veed-blue text-white rounded-full hover:bg-blue-600"
                  onClick={togglePlayback}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <SkipForward size={18} />
                </button>
                <div className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
              
              <div className="flex items-center">
                <Button variant="ghost" size="sm">
                  Fit
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings size={16} />
                </Button>
              </div>
            </div>
            
            <Timeline 
              mediaElements={mediaElements}
              currentTime={currentTime}
              duration={duration}
              setCurrentTime={setCurrentTime}
              selectedMedia={selectedMedia}
              setSelectedMedia={setSelectedMedia}
              updateMediaProperties={updateMediaProperties}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaEditor;
