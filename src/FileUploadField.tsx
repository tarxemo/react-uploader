import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import classNames from 'classnames';

export interface FileUploadFieldProps {
    endpoint: string;
    token: string;
    uploadPath?: string;
    onUploadComplete?: (urls: string[]) => void;
    onUploadError?: (error: string) => void;
    accept?: string;
    multiple?: boolean;
    label?: string;
    className?: string;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
    endpoint,
    token,
    uploadPath = '',
    onUploadComplete,
    onUploadError,
    accept = 'image/*',
    multiple = false,
    label = 'Click to upload or drag & drop',
    className
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;
        await uploadFiles(Array.from(selectedFiles));
    };

    const uploadFiles = async (files: File[]) => {
        setIsUploading(true);
        setStatus('uploading');
        setProgress(0);
        setErrorMsg('');

        try {
            // 1. Initialize session
            const initRes = await axios.post(`${endpoint}/api/upload/init`, {
                token,
                uploadPath,
                files: files.map(f => f.name)
            });
            const { sessionId } = initRes.data;

            // 2. Upload files in chunks/streams
            const formData = new FormData();
            formData.append('sessionId', sessionId);
            files.forEach(file => {
                formData.append('files', file);
            });

            await axios.post(`${endpoint}/api/upload/stream`, formData, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setProgress(percentCompleted);
                }
            });

            // 3. Complete session
            const completeRes = await axios.post(`${endpoint}/api/upload/complete`, {
                sessionId,
                token
            });

            const uploadedUrls = completeRes.data.files.map((f: any) => f.url || f.path);
            setStatus('success');
            onUploadComplete?.(uploadedUrls);
        } catch (err: any) {
            const msg = err.response?.data?.error || err.message || 'Upload failed';
            setStatus('error');
            setErrorMsg(msg);
            onUploadError?.(msg);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={classNames("w-full", className)}>
            <label
                className={classNames(
                    "relative group flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all min-h-[160px]",
                    {
                        "border-[var(--color-primary)] bg-[var(--color-primary)]/5": status === 'idle',
                        "border-[var(--color-primary)] bg-[var(--color-primary)]/10": status === 'uploading',
                        "border-[var(--color-success)] bg-[var(--color-success)]/5": status === 'success',
                        "border-red-500 bg-red-500/5": status === 'error'
                    }
                )}
            >
                <input
                    type="file"
                    className="hidden"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileChange}
                    disabled={isUploading}
                    ref={fileInputRef}
                />

                {status === 'idle' && (
                    <>
                        <div className="h-12 w-12 bg-[var(--color-surface)] rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                            <Upload size={24} className="text-[var(--color-primary)]" />
                        </div>
                        <span className="font-bold text-sm text-[var(--color-text)] mb-1 text-center">{label}</span>
                        <span className="text-xs text-[var(--color-text-muted)] text-center">Support for single or multiple files</span>
                    </>
                )}

                {status === 'uploading' && (
                    <div className="w-full max-w-xs flex flex-col items-center">
                        <Loader2 size={32} className="text-[var(--color-primary)] animate-spin mb-4" />
                        <div className="w-full bg-[var(--color-surface)] rounded-full h-1.5 mb-2 overflow-hidden">
                            <div
                                className="bg-[var(--color-primary)] h-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-xs font-bold text-[var(--color-primary)]">Uploading... {progress}%</span>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <CheckCircle2 size={40} className="text-[var(--color-success)] mb-2" />
                        <span className="font-bold text-sm text-[var(--color-text)]">Upload Complete!</span>
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setStatus('idle'); }}
                            className="mt-3 text-xs font-bold text-[var(--color-primary)] hover:underline"
                        >
                            Upload another
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <AlertCircle size={40} className="text-red-500 mb-2" />
                        <span className="font-bold text-sm text-red-600">Upload Failed</span>
                        <span className="text-xs text-red-500/80 text-center max-w-[200px] mb-3">{errorMsg}</span>
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setStatus('idle'); }}
                            className="px-4 py-1.5 bg-red-500 text-white rounded-full text-xs font-bold shadow-sm"
                        >
                            Retry
                        </button>
                    </div>
                )}
            </label>
        </div>
    );
};
