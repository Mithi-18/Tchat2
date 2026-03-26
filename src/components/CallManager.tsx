'use client';
import { Phone, PhoneOff, PhoneIncoming, PhoneOutgoing } from 'lucide-react';

interface CallManagerProps {
  callingFlag: 'none' | 'incoming' | 'outgoing' | 'active';
  onAccept: () => void;
  onReject: () => void;
  onEndCall: () => void;
}

export function CallManager({ callingFlag, onAccept, onReject, onEndCall }: CallManagerProps) {
  if (callingFlag === 'none') return null;

  if (callingFlag === 'incoming') {
    return (
      <div className="absolute top-4 right-4 bg-cyber-dark/95 border border-cyber-pink p-4 rounded-lg shadow-[0_0_20px_#ff00ff] z-50 animate-pulse flex flex-col gap-4 backdrop-blur">
        <div className="flex items-center gap-3 text-cyber-pink">
          <PhoneIncoming size={24} className="animate-bounce" />
          <span className="font-mono tracking-widest text-sm">INCOMING TRANSMISSION</span>
        </div>
        <div className="flex gap-2 text-xs">
          <button onClick={onAccept} className="flex-1 bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan p-2 rounded hover:bg-cyber-cyan hover:text-black transition-colors font-mono cursor-pointer">ACCEPT</button>
          <button onClick={onReject} className="flex-1 bg-red-500/20 text-red-500 border border-red-500 p-2 rounded hover:bg-red-500 hover:text-black transition-colors font-mono cursor-pointer">REJECT</button>
        </div>
      </div>
    );
  }

  if (callingFlag === 'outgoing') {
    return (
      <div className="absolute top-4 right-4 bg-cyber-dark/95 border border-cyber-cyan p-4 rounded-lg shadow-[0_0_15px_#00ffff] z-50 flex flex-col gap-4 backdrop-blur">
        <div className="flex items-center gap-3 text-cyber-cyan">
          <PhoneOutgoing size={24} className="animate-pulse" />
          <span className="font-mono tracking-widest text-sm">ESTABLISHING LINK...</span>
        </div>
        <button onClick={onEndCall} className="w-full text-xs bg-red-500/20 text-red-500 border border-red-500 p-2 rounded hover:bg-red-500 hover:text-black transition-colors flex items-center justify-center gap-2 font-mono cursor-pointer">
          <PhoneOff size={14} /> CANCEL
        </button>
      </div>
    );
  }

  if (callingFlag === 'active') {
    return (
      <div className="absolute top-4 right-4 bg-cyber-dark/95 border border-cyber-cyan p-4 rounded-lg shadow-[0_0_20px_#00ffff] z-50 flex flex-col gap-4 backdrop-blur">
        <div className="flex items-center gap-3 text-cyber-cyan">
          <Phone size={24} className="animate-pulse" />
          <span className="font-mono tracking-widest text-sm">VOICE LINK ACTIVE</span>
        </div>
        <button onClick={onEndCall} className="w-full text-xs bg-red-500/20 text-red-500 border border-red-500 p-2 rounded hover:bg-red-500 hover:text-black transition-colors flex items-center justify-center gap-2 font-mono cursor-pointer">
          <PhoneOff size={14} /> TERMINATE
        </button>
      </div>
    );
  }

  return null;
}
