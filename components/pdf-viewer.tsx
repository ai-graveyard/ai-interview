'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ChevronRight, ChevronLeft } from 'lucide-react';

interface PDFViewerProps {
  dataUrl: string | null;
  fileName?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function PDFViewer({ dataUrl, fileName, isExpanded, onToggleExpand }: PDFViewerProps) {
  if (!dataUrl) {
    return (
      <Card className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <FileText className="h-16 w-16" />
          <p>上传简历后在此预览</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden py-0 gap-0">
      {/* Header - 与右侧保持一致 */}
      <div className="shrink-0 border-b bg-muted/50 px-4 py-3 h-12 flex items-center justify-between">
        <p className="truncate text-sm font-medium">{fileName || '简历预览'}</p>
        {onToggleExpand && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpand}
            className="h-7 px-2"
          >
            {isExpanded ? (
              <>
                <ChevronLeft className="h-4 w-4 mr-1" />
                收起
              </>
            ) : (
              <>
                展开
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <iframe
          src={dataUrl}
          className="h-full w-full"
          title="PDF Preview"
        />
      </div>
    </Card>
  );
}
