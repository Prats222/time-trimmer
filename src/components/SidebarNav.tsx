
import React from 'react';
import { Search, Settings, Video, Text, Image, Music } from 'lucide-react';

const SidebarNav: React.FC = () => {
  return (
    <div className="flex flex-col items-center space-y-6 py-2 w-full">
      <button className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-gray-100 w-full">
        <Search size={20} className="mb-1" />
        <span className="text-xs">Search</span>
      </button>

      <button className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-gray-100 w-full">
        <Settings size={20} className="mb-1" />
        <span className="text-xs">Settings</span>
      </button>

      <button className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-gray-100 w-full">
        <div className="relative">
          <Image size={20} className="mb-1" />
        </div>
        <span className="text-xs">Brand Kits</span>
      </button>

      <button className="flex flex-col items-center justify-center p-2 rounded-md bg-gray-100 w-full">
        <Video size={20} className="mb-1 text-blue-500" />
        <span className="text-xs font-medium">Media</span>
      </button>

      <button className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-gray-100 w-full">
        <Music size={20} className="mb-1" />
        <span className="text-xs">Audio</span>
      </button>

      <button className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-gray-100 w-full">
        <Text size={20} className="mb-1" />
        <span className="text-xs">Text</span>
      </button>
    </div>
  );
};

export default SidebarNav;
