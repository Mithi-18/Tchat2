'use client';
import { ChatMessage } from '@/lib/storage';
import { useEffect, useState } from 'react';

export function MessageBubble({ message, isOwn }: { message: ChatMessage, isOwn: boolean }) {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (message.content instanceof Blob) {
      objectUrl = URL.createObjectURL(message.content);
      setMediaUrl(objectUrl);
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [message.content]);

  const timeString = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex w-full mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] rounded-lg p-3 relative group
        ${isOwn 
          ? 'bg-cyber-pink/10 border border-cyber-pink/40 text-cyber-pink rounded-br-none shadow-[0_0_10px_rgba(255,0,255,0.1)]' 
          : 'bg-cyber-cyan/10 border border-cyber-cyan/40 text-cyber-cyan rounded-bl-none shadow-[0_0_10px_rgba(0,255,255,0.1)]'}
      `}>
        {/* Glow effect on hover */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg
           ${isOwn ? 'shadow-[0_0_15px_rgba(255,0,255,0.3)]' : 'shadow-[0_0_15px_rgba(0,255,255,0.3)]'}
        `}></div>

        {/* Content */}
        <div className="relative z-10 break-words">
          {message.type === 'text' && (
            <p className="text-sm font-sans tracking-wide text-gray-200">
              {message.content as string}
            </p>
          )}

          {message.type === 'image' && mediaUrl && (
            <img src={mediaUrl} alt="Received image" className="max-w-full rounded border border-white/10" />
          )}

          {message.type === 'voice' && mediaUrl && (
            <audio controls src={mediaUrl} className="h-8 max-w-[200px]" />
          )}
        </div>

        {/* Timestamp */}
        <div className={`text-[10px] mt-1 font-mono opacity-60 ${isOwn ? 'text-right' : 'text-left'}`}>
          {timeString}
        </div>
      </div>
    </div>
  );
}
