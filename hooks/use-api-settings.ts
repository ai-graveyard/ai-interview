'use client';

import { useState, useEffect, useCallback } from 'react';
import { APIConfig } from '@/lib/ai-service';

const STORAGE_KEY = 'ai-interview-api-config';

const DEFAULT_CONFIG: APIConfig = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-5.2-mini',
};

export function useApiSettings() {
  const [config, setConfig] = useState<APIConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  // 从 localStorage 加载配置
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as APIConfig;
        setConfig(parsed);
      }
    } catch (error) {
      console.error('Failed to load API config:', error);
    }
    setIsLoaded(true);
  }, []);

  // 保存配置到 localStorage
  const saveConfig = useCallback((newConfig: APIConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch (error) {
      console.error('Failed to save API config:', error);
    }
  }, []);

  // 更新单个字段
  const updateField = useCallback((field: keyof APIConfig, value: string) => {
    setConfig((prev) => {
      const newConfig = { ...prev, [field]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      } catch (error) {
        console.error('Failed to save API config:', error);
      }
      return newConfig;
    });
  }, []);

  // 重置为默认配置
  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset API config:', error);
    }
  }, []);

  // 检查配置是否完整
  const isConfigValid = Boolean(
    config.baseUrl.trim() && 
    config.apiKey.trim() && 
    config.model.trim()
  );

  return {
    config,
    isLoaded,
    isConfigValid,
    saveConfig,
    updateField,
    resetConfig,
  };
}
