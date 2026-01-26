'use client';

import { useState, useCallback } from 'react';
import { FileSearch, Github } from 'lucide-react';
import { PDFUpload } from '@/components/pdf-upload';
import { PDFViewer } from '@/components/pdf-viewer';
import { APISettings } from '@/components/api-settings';
import { AnalysisPanel } from '@/components/analysis-panel';
import { useApiSettings } from '@/hooks/use-api-settings';
import { parsePDF, ParsedPDF } from '@/lib/pdf-parser';
import { Button } from '@/components/ui/button';

type ExpandedPanel = 'none' | 'left' | 'right';

export default function Home() {
  const { config, isLoaded, isConfigValid, saveConfig } = useApiSettings();
  const [pdfData, setPdfData] = useState<ParsedPDF | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [expandedPanel, setExpandedPanel] = useState<ExpandedPanel>('none');

  const handleFileSelect = useCallback(async (file: File) => {
    setIsLoading(true);
    setParseError(null);
    setFileName(file.name);

    try {
      const parsed = await parsePDF(file);
      setPdfData(parsed);
    } catch (error) {
      console.error('PDF parse error:', error);
      setParseError('PDF 解析失败，请确保文件格式正确');
      setPdfData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleExpandLeft = () => {
    setExpandedPanel(expandedPanel === 'left' ? 'none' : 'left');
  };

  const handleExpandRight = () => {
    setExpandedPanel(expandedPanel === 'right' ? 'none' : 'right');
  };

  // 等待 API 配置加载完成
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <FileSearch className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">AI Interview - 智能面试助手</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              asChild
            >
              <a
                href="https://github.com/ai-graveyard/ai-interview"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="访问 GitHub 仓库"
              >
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </Button>
            <APISettings
              config={config}
              onSave={saveConfig}
              isConfigValid={isConfigValid}
              defaultOpen={!isConfigValid}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-6">
        {!pdfData ? (
          // 上传界面
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold">智能面试助手</h2>
              <p className="text-muted-foreground">
                上传您的简历，AI 将从面试者和面试官两个视角为您提供分析
              </p>
            </div>
            <PDFUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
            {parseError && (
              <p className="text-center text-sm text-destructive">{parseError}</p>
            )}
            {isLoading && (
              <p className="text-center text-sm text-muted-foreground">
                正在解析 PDF...
              </p>
            )}
            <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
              <h3 className="font-medium">功能说明</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">面试者视角</p>
                  <p className="text-xs text-muted-foreground">
                    分析简历中的不足之处，提供 3-5 条改进建议
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">面试官视角</p>
                  <p className="text-xs text-muted-foreground">
                    生成 5-10 个针对性面试问题，帮助您准备面试
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // 分析界面 - 展开/收起
          <div className="h-[calc(100vh-theme(spacing.14)-theme(spacing.12)-theme(spacing.16))]">
            <div className="flex h-full gap-4">
              {/* 左侧：PDF 预览 */}
              {expandedPanel !== 'right' && (
                <div className={`h-full transition-all duration-300 ${expandedPanel === 'left' ? 'w-full' : 'w-1/2'}`}>
                  <PDFViewer 
                    dataUrl={pdfData.dataUrl} 
                    fileName={fileName}
                    isExpanded={expandedPanel === 'left'}
                    onToggleExpand={handleExpandLeft}
                  />
                </div>
              )}
              
              {/* 右侧：分析面板 */}
              {expandedPanel !== 'left' && (
                <div className={`h-full transition-all duration-300 ${expandedPanel === 'right' ? 'w-full' : 'w-1/2'}`}>
                  <AnalysisPanel
                    resumeText={pdfData.text}
                    apiConfig={config}
                    isConfigValid={isConfigValid}
                    isExpanded={expandedPanel === 'right'}
                    onToggleExpand={handleExpandRight}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>AI Interview - 您的简历数据仅在本地处理，不会上传到服务器</p>
        </div>
      </footer>
    </div>
  );
}
