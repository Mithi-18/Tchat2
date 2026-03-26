import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { ChatWindow } from '@/components/ChatWindow';
import { InputBox } from '@/components/InputBox';
import { CallManager } from '@/components/CallManager';
import { WebRTCService, ConnectionState } from '@/lib/webrtc';
import { ChatMessage, saveMessage, getMessages } from '@/lib/storage';

export default function ChatApp() {
  const [localId, setLocalId] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [remoteId, setRemoteId] = useState('peer'); // simplified for single peer
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [localSdp, setLocalSdp] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Call states
  const [callingFlag, setCallingFlag] = useState<'none'|'incoming'|'outgoing'|'active'>('none');
  
  const wrtc = useRef<WebRTCService | null>(null);

  useEffect(() => {
    let id = localStorage.getItem('tunnelchat_id');
    if (!id) {
      id = uuidv4().split('-')[0];
      localStorage.setItem('tunnelchat_id', id);
    }
    setLocalId(id);

    // Load offline messages from IndexedDB
    getMessages('peer').then(setMessages);

    // Initialize WebRTC
    const w = new WebRTCService();
    wrtc.current = w;

    w.onConnectionStateChange = (state) => setConnectionState(state);
    w.onIceCandidateGatheringComplete = (sdp) => setLocalSdp(sdp);
    
    w.onMessage = async (data) => {
      // Check if it's signaling for a call
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'call_request') {
             setCallingFlag('incoming');
             return;
          }
          if (parsed.type === 'call_accept') {
             setCallingFlag('active');
             startAudioStream();
             return;
          }
          if (parsed.type === 'call_reject' || parsed.type === 'call_end') {
             endCallUI();
             return;
          }
        } catch { /* normal string message */ }
      }

      // It's a regular chat message
      const isBlob = data instanceof Blob || data instanceof ArrayBuffer;
      const msgType = isBlob ? (data instanceof Blob && data.type.startsWith('audio') ? 'voice' : 'image') : 'text';
      
      const incomingMsg: ChatMessage = {
        id: uuidv4(),
        chatId: 'peer',
        senderId: 'peer',
        type: msgType,
        content: isBlob ? new Blob([data]) : (data as string),
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, incomingMsg]);
      await saveMessage(incomingMsg);
    };

    return () => w.close();
  }, []);

  const handleSend = async (type: 'text'|'image'|'voice', content: string|Blob) => {
    // Save to local IndexedDB and update state (Offline-first approach)
    const newMsg: ChatMessage = {
      id: uuidv4(),
      chatId: 'peer',
      senderId: localId,
      type,
      content,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMsg]);
    await saveMessage(newMsg);

    // Send via WebRTC DataChannel (service handles readiness check)
    wrtc.current?.sendMessage(content);
  };

  // --- Call Management ---
  const startAudioStream = async () => {
     alert("P2P Audio Stream requires renegotiation SDP. For this serverless demo, using voice messages is recommended.");
  };

  const endCallUI = () => setCallingFlag('none');

  const acceptCall = () => {
    wrtc.current?.sendMessage(JSON.stringify({ type: 'call_accept' }));
    setCallingFlag('active');
    startAudioStream();
  };
  const rejectCall = () => {
    wrtc.current?.sendMessage(JSON.stringify({ type: 'call_reject' }));
    endCallUI();
  };
  const endCall = () => {
    wrtc.current?.sendMessage(JSON.stringify({ type: 'call_end' }));
    endCallUI();
  };

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-cyber-dark text-cyber-cyan overflow-hidden">
       {/* Sidebar connection manager */}
       <div className={`${connectionState === 'connected' ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-shrink-0 h-full relative z-30`}>
         <Sidebar 
         localId={localId}
         connectionState={connectionState}
         generateOffer={() => wrtc.current?.createOffer()}
         acceptOffer={(sdp: string) => wrtc.current?.receiveOfferAndCreateAnswer(sdp)}
         acceptAnswer={(sdp: string) => wrtc.current?.receiveAnswer(sdp)}
         localSdp={localSdp}
       />
       </div>
       
       {/* Main Chat Engine */}
       <div className={`${connectionState !== 'connected' ? 'hidden md:flex' : 'flex'} flex-col flex-1 relative min-w-0 h-full md:border-l border-cyber-cyan/30`}>
          <div className="p-4 border-b border-cyber-cyan/30 flex justify-between items-center bg-cyber-dark/80 backdrop-blur z-20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
             <div className="flex items-center gap-3">
                <button 
                  className="md:hidden p-2 text-cyber-pink hover:bg-cyber-pink/20 border border-cyber-pink/30 hover:border-cyber-pink rounded transition-colors active:scale-95" 
                  onClick={() => {
                    wrtc.current?.close();
                    setConnectionState('disconnected');
                  }}
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                   <h2 className="font-mono text-base md:text-lg text-cyber-cyan" style={{textShadow: "0 0 5px #00ffff"}}>Encrypted Channel</h2>
                   <div className="text-[10px] text-cyber-cyan/50 tracking-widest uppercase hidden sm:block">PEER-TO-PEER DATA STREAM</div>
                </div>
             </div>
             
             {connectionState === 'connected' && (
                <button onClick={() => {
                  setCallingFlag('outgoing');
                  wrtc.current?.sendMessage(JSON.stringify({ type: 'call_request' }));
                }} className="p-2 border border-cyber-pink text-cyber-pink rounded hover:bg-cyber-pink hover:text-black hover:shadow-[0_0_15px_#ff00ff] transition-all font-mono text-sm cursor-pointer z-50">
                   INITIATE VOICE LINK
                </button>
             )}
          </div>

          <ChatWindow messages={messages} localId={localId} />
          <InputBox onSend={handleSend} />
          
          <CallManager 
            callingFlag={callingFlag} 
            onAccept={acceptCall} 
            onReject={rejectCall} 
            onEndCall={endCall} 
          />
       </div>
    </div>
  );
}
