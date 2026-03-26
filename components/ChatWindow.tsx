'use client';
import { useEffect, useRef } from 'react';
import { ChatMessage } from '@/lib/storage';
import { MessageBubble } from './MessageBubble';

interface ChatWindowProps {
  messages: ChatMessage[];
  localId: string;
}

export function ChatWindow({ messages, localId }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 relative bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgwLCAyNTUsIDI1NSwgMC4wNSkiLz48L3N2Zz4=')]">
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] z-0"></div>
      
      <div className="relative z-10 w-full flex flex-col justify-end min-h-full">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center h-full text-cyber-cyan/50 font-mono tracking-widest uppercase">
            <div className="animate-flicker p-4 border border-cyber-cyan/20 bg-cyber-dark/50 rounded">
              Awaiting transmission...
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === localId} />
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
