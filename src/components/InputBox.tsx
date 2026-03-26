'use client';
import { useState, useRef } from 'react';
import { Send, Image as ImageIcon, Mic } from 'lucide-react';

export function InputBox({ onSend }: { onSend: (type: 'text'|'image'|'voice', content: string|Blob) => void }) {
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const handleSendText = () => {
    if (text.trim()) {
      onSend('text', text);
      setText('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSend('image', file);
    }
    // reset input
    e.target.value = '';
  };

  const toggleRecording = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        chunksRef.current = [];

        recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          onSend('voice', blob);
          stream.getTracks().forEach(t => t.stop());
          setRecording(false);
        };
        
        recorder.start();
        mediaRecorderRef.current = recorder;
        setRecording(true);
      } catch (e) {
        alert("Microphone permission denied");
      }
    }
  };

  return (
    <div className="p-4 bg-cyber-dark border-t border-cyber-cyan/30 flex items-center gap-2 flex-shrink-0">
      <label className="p-2 text-cyber-cyan hover:bg-cyber-cyan/20 rounded cursor-pointer transition-colors active:scale-95 border border-transparent hover:border-cyber-cyan">
        <ImageIcon size={20} />
        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
      </label>

      <button onClick={toggleRecording} className={`p-2 rounded transition-colors active:scale-95 border ${recording ? 'text-cyber-pink bg-cyber-pink/20 border-cyber-pink animate-pulse shadow-[0_0_10px_#ff00ff]' : 'text-cyber-cyan hover:bg-cyber-cyan/20 border-transparent hover:border-cyber-cyan'}`}>
        <Mic size={20} />
      </button>

      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSendText()}
        placeholder="ENTER TRANSMISSION..."
        className="flex-1 bg-black/50 border border-cyber-cyan/30 text-cyber-cyan placeholder-cyber-cyan/50 p-3 rounded font-mono focus:outline-none focus:border-cyber-cyan focus:shadow-[0_0_10px_rgba(0,255,255,0.2)] transition-all"
      />

      <button onClick={handleSendText} className="p-3 bg-cyber-cyan/20 text-cyber-cyan hover:bg-cyber-cyan/40 border border-cyber-cyan rounded transition-colors active:scale-95 shadow-[0_0_5px_rgba(0,255,255,0.2)]">
        <Send size={20} />
      </button>
    </div>
  );
}
