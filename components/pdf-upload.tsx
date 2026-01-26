'use client';

import { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PDFUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export function PDFUpload({ onFileSelect, isLoading }: PDFUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      
      if (file.type !== 'application/pdf') {
        setError('请上传 PDF 格式的文件');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('文件大小不能超过 10MB');
        return;
      }

      setSelectedFile(file);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setError(null);
  }, []);

  return (
    <Card
      className={`relative border-2 border-dashed transition-colors ${
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
      } ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleInputChange}
        className="absolute inset-0 cursor-pointer opacity-0"
        disabled={isLoading}
      />
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        {selectedFile ? (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              disabled={isLoading}
            >
              <X className="mr-1 h-4 w-4" />
              重新选择
            </Button>
          </>
        ) : (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">上传您的简历</p>
              <p className="text-sm text-muted-foreground">
                拖拽 PDF 文件到此处，或点击选择文件
              </p>
              <p className="text-xs text-muted-foreground">
                支持 PDF 格式，最大 10MB
              </p>
            </div>
          </>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </Card>
  );
}
