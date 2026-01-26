'use client';

import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_INTERVIEWEE_PROMPT, DEFAULT_INTERVIEWER_PROMPT } from '@/lib/prompts';

const STORAGE_KEY = 'ainterview-prompts';

export interface PromptsConfig {
  interviewee: string;
  interviewer: string;
}

const DEFAULT_PROMPTS: PromptsConfig = {
  interviewee: DEFAULT_INTERVIEWEE_PROMPT,
  interviewer: DEFAULT_INTERVIEWER_PROMPT,
};

export function usePrompts() {
  const [prompts, setPrompts] = useState<PromptsConfig>(DEFAULT_PROMPTS);
  const [isLoaded, setIsLoaded] = useState(false);

  // 从 localStorage 加载提示词
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PromptsConfig;
        setPrompts({
          interviewee: parsed.interviewee || DEFAULT_INTERVIEWEE_PROMPT,
          interviewer: parsed.interviewer || DEFAULT_INTERVIEWER_PROMPT,
        });
      }
    } catch (error) {
      console.error('Failed to load prompts:', error);
    }
    setIsLoaded(true);
  }, []);

  // 更新提示词
  const updatePrompt = useCallback((type: 'interviewee' | 'interviewer', value: string) => {
    setPrompts((prev) => {
      const newPrompts = { ...prev, [type]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrompts));
      } catch (error) {
        console.error('Failed to save prompts:', error);
      }
      return newPrompts;
    });
  }, []);

  // 重置为默认提示词
  const resetPrompt = useCallback((type: 'interviewee' | 'interviewer') => {
    const defaultValue = type === 'interviewee' ? DEFAULT_INTERVIEWEE_PROMPT : DEFAULT_INTERVIEWER_PROMPT;
    updatePrompt(type, defaultValue);
  }, [updatePrompt]);

  // 重置所有提示词
  const resetAllPrompts = useCallback(() => {
    setPrompts(DEFAULT_PROMPTS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset prompts:', error);
    }
  }, []);

  return {
    prompts,
    isLoaded,
    updatePrompt,
    resetPrompt,
    resetAllPrompts,
  };
}
