'use client';
import { useState } from 'react';
import { Copy, Check, Link, Plug } from 'lucide-react';
import { ConnectionState } from '@/lib/webrtc';

interface SidebarProps {
  localId: string;
  connectionState: ConnectionState;
  generateOffer: () => void;
  acceptOffer: (sdp: string) => void;
  acceptAnswer: (sdp: string) => void;
  localSdp: string;
}

export function Sidebar({ localId, connectionState, generateOffer, acceptOffer, acceptAnswer, localSdp }: SidebarProps) {
  const [remoteSdp, setRemoteSdp] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(localSdp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = () => {
    if (!remoteSdp) return;
    try {
      const parsed = JSON.parse(remoteSdp);
      if (parsed.type === 'offer') acceptOffer(remoteSdp);
      else if (parsed.type === 'answer') acceptAnswer(remoteSdp);
    } catch {
      alert("Invalid SDP format");
    }
  };

  return (
    <div className="w-full h-full bg-cyber-dark flex flex-col text-cyber-cyan font-sans relative overflow-hidden flex-shrink-0">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none opacity-50"></div>
      
      <div className="p-4 border-b border-cyber-cyan/30 bg-cyber-dark/80 backdrop-blur z-10 flex items-center justify-between">
         <h1 className="font-mono text-xl tracking-wider text-cyber-pink animate-flicker" style={{textShadow: "0 0 5px #ff00ff"}}>TUNNEL<span className="text-cyber-cyan">CHAT</span></h1>
         <div className={`w-3 h-3 rounded-full ${connectionState === 'connected' ? 'bg-cyber-cyan shadow-[0_0_10px_#00ffff]' : 'bg-cyber-pink shadow-[0_0_10px_#ff00ff]'}`}></div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto z-10 space-y-6">
         {/* Profile */}
         <div>
            <h2 className="text-xs uppercase tracking-widest text-cyber-purple mb-2">Local Identity</h2>
            <div className="bg-cyber-gray/50 p-3 rounded border border-cyber-purple/30 text-sm break-all font-mono text-gray-300">
               {localId || "Loading..."}
            </div>
         </div>

         {/* Connection Status */}
         <div>
            <h2 className="text-xs uppercase tracking-widest text-cyber-purple mb-2">Neural Link</h2>
            <div className="flex items-center gap-2 text-sm bg-cyber-dark/50 p-2 rounded border border-cyber-cyan/20">
               <Plug size={16} className={connectionState === 'connected' ? 'text-cyber-cyan animate-pulse' : 'text-cyber-gray'} />
               <span className="capitalize">{connectionState}</span>
            </div>
         </div>

         {/* Manual Signaling */}
         {connectionState !== 'connected' && (
           <div className="space-y-4">
              <div className="space-y-2">
                 <button onClick={generateOffer} className="w-full bg-cyber-cyan/10 hover:bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan p-2 rounded flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-95">
                    <Link size={16} /> Generate Invite (Offer)
                 </button>
                 
                 {localSdp && (
                   <div className="relative animate-in fade-in zoom-in duration-300">
                      <textarea readOnly value={localSdp} className="w-full h-20 bg-black/50 border border-cyber-cyan/30 text-xs text-cyber-cyan/70 p-2 rounded resize-none focus:outline-none focus:border-cyber-cyan transition-colors" />
                      <button onClick={handleCopy} className="absolute right-2 top-2 p-1 bg-cyber-dark border border-cyber-cyan/50 text-cyber-cyan rounded hover:bg-cyber-cyan hover:text-black cursor-pointer">
                         {copied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                   </div>
                 )}
              </div>

              <div className="pt-4 border-t border-cyber-purple/30 space-y-2">
                 <h2 className="text-xs uppercase tracking-widest text-cyber-purple mb-2">Connect to Peer</h2>
                 <textarea 
                   placeholder="Paste Offer or Answer here..." 
                   value={remoteSdp}
                   onChange={e => setRemoteSdp(e.target.value)}
                   className="w-full h-20 bg-black/50 border border-cyber-pink/30 focus:border-cyber-pink outline-none text-xs text-cyber-pink/70 p-2 rounded resize-none transition-colors" 
                 />
                 <button onClick={handleConnect} disabled={!remoteSdp} className="w-full bg-cyber-pink/20 hover:bg-cyber-pink/30 disabled:opacity-50 disabled:cursor-not-allowed border border-cyber-pink text-cyber-pink p-2 rounded transition-colors font-mono tracking-wider cursor-pointer active:scale-95">
                    ESTABLISH LINK
                 </button>
              </div>
           </div>
         )}
      </div>
    </div>
  );
}
