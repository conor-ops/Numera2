
import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageSquare, BrainCircuit, Paperclip, Loader2, PlusCircle, CheckCircle, Crown, User, Mic, MicOff, Volume2, FileText } from 'lucide-react';
import { sendChatMessage, ChatResponse } from '../services/geminiService';
import { triggerHaptic } from '../services/hapticService';
import { ImpactStyle } from '@capacitor/haptics';
import { Transaction } from '../types';

interface ChatBotProps {
  isPro: boolean;
  onShowPaywall: () => void;
  onPostTransaction: (tx: Transaction) => void;
  currentDataSummary: string;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  proposedTransaction?: Partial<Transaction>;
  filePreview?: string;
  fileName?: string;
  fileMimeType?: string;
  isAudio?: boolean;
}

const ChatBot: React.FC<ChatBotProps> = ({ isPro, onShowPaywall, onPostTransaction, currentDataSummary }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm your Solventless Co-pilot. I can analyze your BNE, process receipts, or help with accounting questions. Try saying: 'I spent fifty dollars at Starbucks' or upload a receipt." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ data: string, mimeType: string, preview: string, name: string } | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (audioData?: { data: string, mimeType: string }) => {
    const hasInput = input.trim() || selectedFile || audioData;
    if (!hasInput || isLoading) return;

    const userMsg: Message = { 
      role: 'user', 
      text: audioData ? "Voice Command Attached" : (input.trim() || "Analyzing attached document..."), 
      filePreview: selectedFile?.preview,
      fileName: selectedFile?.name,
      fileMimeType: selectedFile?.mimeType,
      isAudio: !!audioData
    };
    
    // History should only contain the messages BEFORE this turn to ensure role alternation
    const chatHistory = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    const currentFile = selectedFile;

    setInput('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    setIsLoading(true);
    triggerHaptic(ImpactStyle.Light);

    const contextPrompt = `[INTERNAL CONTEXT: User's financial snapshot: ${currentDataSummary}] User request: ${audioData ? "(Voice processing)" : currentInput}. If a document is attached, analyze it for business transactions.`;

    const payload = audioData || (currentFile ? { data: currentFile.data, mimeType: currentFile.mimeType } : undefined);

    const response = await sendChatMessage(
      contextPrompt,
      chatHistory.slice(-6), 
      payload
    );

    setMessages(prev => [...prev, { 
      role: 'model', 
      text: response.text, 
      proposedTransaction: response.proposedTransaction 
    }]);
    
    setIsLoading(false);
    triggerHaptic(ImpactStyle.Medium);
  };

  const startRecording = async () => {
    if (!isPro) {
      onShowPaywall();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          handleSend({ data: base64, mimeType: 'audio/webm' });
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      triggerHaptic(ImpactStyle.Medium);
      
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
            stopRecording();
        }
      }, 5000);

    } catch (err) {
      console.error("Recording failed", err);
      alert("Mic permission required for Voice Commands.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      triggerHaptic(ImpactStyle.Light);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isPro) {
      onShowPaywall();
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      const isImage = file.type.startsWith('image/');
      setSelectedFile({
        data: base64,
        mimeType: file.type,
        name: file.name,
        preview: isImage ? URL.createObjectURL(file) : ''
      });
    };
    reader.readAsDataURL(file);
  };

  const applyTransaction = (proposed: Partial<Transaction>) => {
    if (!proposed.amount || !proposed.name || !proposed.type) return;
    
    const fullTx: Transaction = {
      id: crypto.randomUUID(),
      name: proposed.name,
      amount: proposed.amount,
      type: proposed.type as 'INCOME' | 'EXPENSE',
      date_occurred: new Date().toISOString()
    };

    onPostTransaction(fullTx);
    triggerHaptic(ImpactStyle.Heavy);
    setMessages(prev => [...prev, { 
      role: 'model', 
      text: `✅ Posted ${fullTx.type.toLowerCase()} of $${fullTx.amount.toFixed(2)} to your ledger.` 
    }]);
  };

  return (
    <>
      <button 
        onClick={() => { setIsOpen(!isOpen); triggerHaptic(ImpactStyle.Medium); }}
        className={`fixed bottom-6 right-6 z-[60] p-4 rounded-none border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 ${isOpen ? 'bg-red-500 text-white' : 'bg-brand-blue text-white'}`}
      >
        {isOpen ? <X size={28} strokeWidth={2.5} /> : <BrainCircuit size={28} strokeWidth={2.5} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[60] w-[90vw] md:w-[400px] h-[70vh] bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          
          <div className="p-4 border-b-4 border-black bg-black text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BrainCircuit size={20} className="text-brand-blue" />
              <h3 className="font-black uppercase text-sm tracking-widest">Co-pilot Intelligence</h3>
            </div>
            {!isPro && <div className="flex items-center gap-1 bg-brand-blue text-white text-[9px] font-black px-2 py-0.5 uppercase"><Crown size={10} /> Free</div>}
          </div>

          <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-6 bg-gray-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-bold uppercase ${m.role === 'user' ? 'text-gray-400' : 'text-brand-blue'}`}>
                    {m.role === 'user' ? 'You' : 'Co-pilot'}
                  </span>
                </div>
                
                <div className={`max-w-[85%] p-3 border-2 border-black font-medium text-sm leading-relaxed ${m.role === 'user' ? 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-brand-blue text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]'}`}>
                  {m.isAudio && (
                     <div className="flex items-center gap-2 mb-1 opacity-60">
                        <Volume2 size={14} /> <span className="text-[10px] uppercase font-bold">Voice Command</span>
                     </div>
                  )}
                  {m.filePreview ? (
                    <img src={m.filePreview} alt="upload" className="w-full h-32 object-cover border-2 border-black mb-2" />
                  ) : m.fileName ? (
                    <div className={`flex items-center gap-2 mb-2 p-2 border-2 ${m.role === 'user' ? 'border-black bg-gray-50' : 'border-white bg-blue-700'} `}>
                       <FileText size={16} />
                       <span className="text-[10px] font-mono truncate">{m.fileName}</span>
                    </div>
                  ) : null}
                  {m.text}
                </div>

                {m.proposedTransaction && (
                  <div className="mt-3 w-full max-w-[90%] border-2 border-black bg-white p-3 shadow-swiss animate-in zoom-in-95">
                    <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase text-brand-blue">
                      <PlusCircle size={14} /> Proposed Entry
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-xs font-bold uppercase truncate max-w-[120px]">{m.proposedTransaction.name}</p>
                        <p className="text-[10px] font-mono text-gray-400">{m.proposedTransaction.type}</p>
                      </div>
                      <p className="text-lg font-mono font-black">${m.proposedTransaction.amount?.toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => applyTransaction(m.proposedTransaction!)}
                      className="w-full py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={14} /> Post to Ledger
                    </button>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-brand-blue font-mono text-[10px] animate-pulse">
                <Loader2 className="animate-spin" size={14} /> 
                <span>Processing multi-modal intelligence...</span>
              </div>
            )}
          </div>

          <div className="p-4 border-t-4 border-black bg-white space-y-2">
            {selectedFile && (
              <div className="flex items-center justify-between p-2 bg-gray-50 border-2 border-black border-dashed animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 overflow-hidden">
                   {selectedFile.preview ? (
                     <img src={selectedFile.preview} className="w-8 h-8 object-cover border" />
                   ) : (
                     <div className="p-1 border bg-white"><FileText size={20} /></div>
                   )}
                   <span className="text-[10px] font-bold uppercase truncate">{selectedFile.name}</span>
                </div>
                <button onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="text-red-500 hover:scale-110 transition-transform"><X size={16} /></button>
              </div>
            )}
            
            <div className="flex gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 border-2 border-black hover:bg-gray-100 transition-colors shrink-0"
                title="Attach Document"
              >
                <Paperclip size={20} />
              </button>
              <button 
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={`p-2 border-2 border-black transition-all shrink-0 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-gray-100'}`}
                title="Hold to Speak"
              >
                {isRecording ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              <input 
                type="file" 
                hidden 
                ref={fileInputRef} 
                onChange={handleFileChange}
                accept="image/*,application/pdf"
              />
              <input 
                type="text" 
                placeholder={isRecording ? "Listening..." : "Message co-pilot..."}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                className="flex-grow p-2 border-2 border-black font-mono text-sm outline-none focus:border-brand-blue"
                disabled={isRecording}
              />
              <button 
                onClick={() => handleSend()}
                disabled={isLoading || isRecording || (!input.trim() && !selectedFile)}
                className="p-2 bg-black text-white border-2 border-black hover:bg-brand-blue transition-colors disabled:opacity-50 shrink-0"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;

