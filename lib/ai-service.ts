import { getIntervieweePrompt, getInterviewerPrompt } from './prompts';

export interface APIConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface AnalysisResult {
  content: string;
  error?: string;
}

/**
 * 调用 AI API 分析简历
 */
export async function analyzeResume(
  resumeText: string,
  type: 'interviewer' | 'interviewee',
  config: APIConfig,
  customPrompt?: string
): Promise<AnalysisResult> {
  const prompt = type === 'interviewer' 
    ? getInterviewerPrompt(resumeText, customPrompt)
    : getIntervieweePrompt(resumeText, customPrompt);

  try {
    // 确保 baseUrl 末尾没有斜杠
    const baseUrl = config.baseUrl.replace(/\/$/, '');
    
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || 
        `API 请求失败: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('API 返回内容为空');
    }

    return { content };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      content: '',
      error: errorMessage,
    };
  }
}

/**
 * 验证 API 配置是否完整
 */
export function validateAPIConfig(config: APIConfig): string | null {
  if (!config.baseUrl.trim()) {
    return '请填写 API Base URL';
  }
  if (!config.apiKey.trim()) {
    return '请填写 API Key';
  }
  if (!config.model.trim()) {
    return '请填写 Model Name';
  }
  
  // 验证 URL 格式
  try {
    new URL(config.baseUrl);
  } catch {
    return 'API Base URL 格式不正确';
  }
  
  // 验证 temperature 范围
  if (config.temperature < 0 || config.temperature > 2) {
    return 'Temperature 必须在 0 到 2 之间';
  }
  
  // 验证 maxTokens 范围
  if (config.maxTokens < 1 || !Number.isInteger(config.maxTokens)) {
    return 'Max Tokens 必须是大于 0 的整数';
  }
  
  return null;
}
