'use client';

import { useState } from 'react';
import { Settings, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { APIConfig } from '@/lib/ai-service';

interface APISettingsProps {
  config: APIConfig;
  onSave: (config: APIConfig) => void;
  isConfigValid: boolean;
  defaultOpen?: boolean;
}

export function APISettings({ config, onSave, isConfigValid, defaultOpen = false }: APISettingsProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [localConfig, setLocalConfig] = useState<APIConfig>(config);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setLocalConfig(config);
    }
    setOpen(isOpen);
  };

  const handleSave = () => {
    onSave(localConfig);
    setOpen(false);
  };

  const updateField = (field: keyof APIConfig, value: string | number) => {
    setLocalConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">API 设置</span>
          {!isConfigValid && (
            <span className="h-2 w-2 rounded-full bg-destructive" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>API 配置</DialogTitle>
          <DialogDescription>
            配置您的 AI API 信息，支持 OpenAI 兼容的 API 服务。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="baseUrl">API Base URL</Label>
            <Input
              id="baseUrl"
              placeholder="https://api.openai.com/v1"
              value={localConfig.baseUrl}
              onChange={(e) => updateField('baseUrl', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              OpenAI 兼容的 API 地址，例如 OpenAI、Azure、本地部署等
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                placeholder="sk-..."
                value={localConfig.apiKey}
                onChange={(e) => updateField('apiKey', e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              您的 API 密钥，将安全存储在本地浏览器中
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model Name</Label>
            <Input
              id="model"
              placeholder="gpt-5.2-mini"
              value={localConfig.model}
              onChange={(e) => updateField('model', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              使用的模型名称，例如 gpt-5.2-mini、claude-4.5-sonnet 等
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature: {localConfig.temperature}</Label>
            <Input
              id="temperature"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={localConfig.temperature}
              onChange={(e) => updateField('temperature', parseFloat(e.target.value))}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              控制输出的随机性，值越高回答越有创意，值越低回答越稳定（推荐 0.7）
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxTokens">Max Tokens</Label>
            <Input
              id="maxTokens"
              type="number"
              min="256"
              max="128000"
              step="256"
              placeholder="4096"
              value={localConfig.maxTokens}
              onChange={(e) => updateField('maxTokens', parseInt(e.target.value) || 4096)}
            />
            <p className="text-xs text-muted-foreground">
              最大输出 token 数量，根据模型支持的上限设置（默认 4096）
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
