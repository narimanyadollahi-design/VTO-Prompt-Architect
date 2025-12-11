import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { UploadSlot } from '../types';

interface ImageUploaderProps {
  slot: UploadSlot;
  onUpload: (id: string, file: File) => void;
  onClear: (id: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ slot, onUpload, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(slot.id, e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(slot.id, e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-300">{slot.type}</span>
        {slot.previewUrl && (
          <button 
            onClick={() => onClear(slot.id)}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div
        className={`relative w-full aspect-[3/4] rounded-xl border-2 border-dashed transition-all duration-300 overflow-hidden group
          ${slot.previewUrl 
            ? 'border-indigo-500/50 bg-slate-800' 
            : 'border-slate-700 hover:border-indigo-500 bg-slate-800/50 hover:bg-slate-800'
          }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {slot.previewUrl ? (
          <>
            <img 
              src={slot.previewUrl} 
              alt={slot.type} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium hover:bg-white/20"
              >
                Change Image
              </button>
            </div>
          </>
        ) : (
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="p-4 rounded-full bg-slate-700/50 mb-3 group-hover:scale-110 transition-transform duration-300">
              {slot.type.includes('Model') ? <Upload size={24} /> : <ImageIcon size={24} />}
            </div>
            <span className="text-xs font-medium uppercase tracking-wider opacity-70">Click or Drag</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;