
import React, { useRef, useState } from 'react';
import { Send, Paperclip, X, FileIcon, Loader2, Shield } from 'lucide-react';
import { FileAttachment, ThemeMode } from '../types';
import { useTranslation } from 'react-i18next';

interface InputAreaProps {
  onSendMessage: (text: string, files: FileAttachment[]) => void;
  disabled: boolean;
  themeMode: ThemeMode;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, disabled, themeMode }) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPro = themeMode === 'PRO';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingFiles(true);
    const newAttachments: FileAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        alert(t('input.file_large', { name: file.name }));
        continue;
      }
      try {
        const base64 = await fileToBase64(file);
        newAttachments.push({ name: file.name, type: file.type, data: base64 });
      } catch (err) { console.error(err); }
    }
    setAttachments(prev => [...prev, ...newAttachments]);
    setIsProcessingFiles(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && attachments.length === 0) || disabled || isProcessingFiles) return;
    const sanitized = text.replace(/<[^>]*>?/gm, '').substring(0, 1000);
    onSendMessage(sanitized, attachments);
    setText('');
    setAttachments([]);
  };

  return (
    <div className="bg-white border-t border-slate-100 p-4 pb-6">
      
      {/* Prévisualisation des pièces jointes */}
      {attachments.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-2 px-2">
          {attachments.map((file, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2 relative group min-w-[120px]">
              <FileIcon size={14} className="text-slate-400" />
              <span className="text-[10px] font-medium text-slate-700 truncate max-w-[80px]">{file.name}</span>
              <button 
                onClick={() => removeAttachment(idx)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-3 max-w-5xl mx-auto">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          multiple 
          className="hidden" 
          accept="image/*,application/pdf"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isProcessingFiles}
          className="p-3 mb-1 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          {isProcessingFiles ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
        </button>

        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:bg-white focus-within:border-[#FF9F1C]/50 focus-within:ring-2 focus-within:ring-[#FF9F1C]/10 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('input.placeholder')}
            className="w-full bg-transparent outline-none text-[#051229] placeholder:text-slate-400 text-sm font-medium"
            disabled={disabled || isProcessingFiles}
          />
        </div>
        
        <button
          type="submit"
          disabled={disabled || isProcessingFiles || (!text.trim() && attachments.length === 0)}
          className={`p-3 mb-1 rounded-xl text-[#051229] shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none ${
             isPro 
             ? 'bg-blue-600 hover:bg-blue-700 text-white' 
             : 'bg-[#FF9F1C] hover:bg-amber-400'
          }`}
        >
          <Send size={20} />
        </button>
      </form>
      
      <div className="flex justify-center mt-3">
         <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest flex items-center gap-1.5">
           <Shield size={10} /> {t('input.secure')}
         </p>
      </div>
    </div>
  );
};

export default InputArea;
