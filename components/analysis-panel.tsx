'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, RefreshCw, User, Users, AlertCircle, ChevronLeft, ChevronRight, Play, FileEdit, RotateCcw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { analyzeResume, APIConfig, AnalysisResult } from '@/lib/ai-service';
import { usePrompts } from '@/hooks/use-prompts';

interface AnalysisPanelProps {
  resumeText: string | null;
  apiConfig: APIConfig;
  isConfigValid: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function AnalysisPanel({
  resumeText,
  apiConfig,
  isConfigValid,
  isExpanded,
  onToggleExpand,
}: AnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<'interviewee' | 'interviewer'>('interviewee');
  const [intervieweeResult, setIntervieweeResult] = useState<AnalysisResult | null>(null);
  const [interviewerResult, setInterviewerResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  
  const { prompts, updatePrompt, resetPrompt } = usePrompts();
  const [editingPrompt, setEditingPrompt] = useState('');

  const currentResult = activeTab === 'interviewee' ? intervieweeResult : interviewerResult;

  const handleAnalyze = async () => {
    if (!resumeText || !isConfigValid) return;

    setIsAnalyzing(true);
    
    try {
      const customPrompt = activeTab === 'interviewee' ? prompts.interviewee : prompts.interviewer;
      const result = await analyzeResume(resumeText, activeTab, apiConfig, customPrompt);
      
      if (activeTab === 'interviewee') {
        setIntervieweeResult(result);
      } else {
        setInterviewerResult(result);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTabChange = (value: string) => {
    const newTab = value as 'interviewee' | 'interviewer';
    setActiveTab(newTab);
  };

  const handleOpenPromptDialog = () => {
    setEditingPrompt(activeTab === 'interviewee' ? prompts.interviewee : prompts.interviewer);
    setIsPromptDialogOpen(true);
  };

  const handleSavePrompt = () => {
    updatePrompt(activeTab, editingPrompt);
    setIsPromptDialogOpen(false);
  };

  const handleResetPrompt = () => {
    resetPrompt(activeTab);
    setEditingPrompt(activeTab === 'interviewee' ? prompts.interviewee : prompts.interviewer);
  };

  const handleDownload = () => {
    if (!currentResult?.content) return;
    
    const fileName = activeTab === 'interviewee' 
      ? '简历分析-面试者视角.md' 
      : '面试问题-面试官视角.md';
    
    const blob = new Blob([currentResult.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    if (!resumeText) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
          <User className="h-12 w-12" />
          <p className="text-center">
            上传简历后，AI 将自动分析并提供建议
          </p>
        </div>
      );
    }

    if (!isConfigValid) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
          <AlertCircle className="h-12 w-12" />
          <p className="text-center">
            请先配置 API 信息
          </p>
          <p className="text-sm text-center">
            点击右上角「API 设置」按钮进行配置
          </p>
        </div>
      );
    }

    if (isAnalyzing) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">AI 正在分析中...</p>
        </div>
      );
    }

    if (!currentResult) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
          <Play className="h-12 w-12" />
          <p className="text-center">
            点击右下角「开始分析」按钮开始
          </p>
        </div>
      );
    }

    if (currentResult.error) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-center text-destructive">{currentResult.error}</p>
          <Button variant="outline" onClick={handleAnalyze}>
            <RefreshCw className="mr-2 h-4 w-4" />
            重试
          </Button>
        </div>
      );
    }

    return (
      <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground">
        <ReactMarkdown>{currentResult.content}</ReactMarkdown>
      </div>
    );
  };

  return (
    <Card className="relative flex h-full flex-col overflow-hidden py-0 gap-0">
      {/* Header - 与左侧保持一致 */}
      <div className="shrink-0 border-b bg-muted/50 px-4 py-3 h-12 flex items-center justify-between">
        {onToggleExpand && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpand}
            className="h-7 px-2"
          >
            {isExpanded ? (
              <>
                收起
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-1" />
                展开
              </>
            )}
          </Button>
        )}
        <p className="text-sm font-medium">分析结果</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          disabled={!currentResult?.content}
          className="h-7 px-2"
          title="下载分析结果"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex h-full flex-col"
      >
        {/* Tabs */}
        <div className="shrink-0 px-4 pt-3">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="interviewee" className="gap-2">
              <User className="h-4 w-4" />
              面试者视角
            </TabsTrigger>
            <TabsTrigger value="interviewer" className="gap-2">
              <Users className="h-4 w-4" />
              面试官视角
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 pb-20">
          <TabsContent value="interviewee" className="mt-0 h-full">
            <div className="rounded-lg bg-muted/30 p-1 mb-4">
              <p className="text-xs text-muted-foreground text-center">
                发现简历中的不足之处，帮助您完善简历
              </p>
            </div>
            {activeTab === 'interviewee' && renderContent()}
          </TabsContent>
          <TabsContent value="interviewer" className="mt-0 h-full">
            <div className="rounded-lg bg-muted/30 p-1 mb-4">
              <p className="text-xs text-muted-foreground text-center">
                生成针对性的面试问题，帮助您准备面试
              </p>
            </div>
            {activeTab === 'interviewer' && renderContent()}
          </TabsContent>
        </div>
      </Tabs>

      {/* 悬浮按钮 */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenPromptDialog}
          className="shadow-md"
        >
          <FileEdit className="h-4 w-4 mr-1" />
          提示词
        </Button>
        <Button
          size="sm"
          onClick={handleAnalyze}
          disabled={!resumeText || !isConfigValid || isAnalyzing}
          className="shadow-md"
        >
          {isAnalyzing ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-1" />
          )}
          {isAnalyzing ? '分析中...' : '开始分析'}
        </Button>
      </div>

      {/* 提示词编辑对话框 */}
      <Dialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              编辑{activeTab === 'interviewee' ? '面试者' : '面试官'}视角提示词
            </DialogTitle>
            <DialogDescription>
              自定义 AI 分析时使用的提示词。使用 <code className="bg-muted px-1 rounded">{'{{resume}}'}</code> 作为简历内容的占位符。
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <Textarea
              value={editingPrompt}
              onChange={(e) => setEditingPrompt(e.target.value)}
              className="h-[400px] resize-none font-mono text-sm"
              placeholder="输入提示词..."
            />
          </div>
          <div className="flex justify-between pt-4">
            <Button variant="ghost" size="sm" onClick={handleResetPrompt}>
              <RotateCcw className="h-4 w-4 mr-1" />
              恢复默认
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsPromptDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSavePrompt}>
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
