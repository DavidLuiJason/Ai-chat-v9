import { Provider, AIAccount, AuthType } from '../types/index.ts';

export const INITIAL_PROVIDERS: Provider[] = [
  {
    id: 'google-ai-studio',
    name: 'Google AI Studio',
    vendor: 'Google',
    description: 'Direct server-side integration powered by @google/genai with full multimodal and artifact exchange capabilities.',
    supportedModes: ['api', 'file_exchange', 'external'],
    supportedAuth: ['server_environment', 'api_key'],
    iconKey: 'google-ai-studio',
    isCustom: false,
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    vendor: 'OpenAI',
    description: 'GPT-4o & o1 family models. Supports conversational workflows, file artifact exchange, and browser sessions.',
    supportedModes: ['api', 'web_session', 'file_exchange', 'external'],
    supportedAuth: ['google_oauth', 'email_password', 'api_key'],
    iconKey: 'chatgpt',
    isCustom: false,
  },
  {
    id: 'claude',
    name: 'Claude',
    vendor: 'Anthropic',
    description: 'Claude 3.7 Sonnet & Opus models. Exceptional code synthesis, architectural reasoning, and detailed report generation.',
    supportedModes: ['api', 'web_session', 'file_exchange', 'external'],
    supportedAuth: ['google_oauth', 'email_password', 'api_key'],
    iconKey: 'claude',
    isCustom: false,
  },
  {
    id: 'gemini',
    name: 'Gemini',
    vendor: 'Google DeepMind',
    description: 'Gemini 3.8 Flash & Pro models with high context windows, real-time reasoning, and structured output formatting.',
    supportedModes: ['api', 'web_session', 'file_exchange'],
    supportedAuth: ['google_oauth', 'api_key'],
    iconKey: 'gemini',
    isCustom: false,
  },
  {
    id: 'grok',
    name: 'Grok',
    vendor: 'xAI',
    description: 'Grok 2 and Grok 3 models with real-time web awareness, fast execution, and frank analytical problem-solving.',
    supportedModes: ['api', 'web_session', 'external'],
    supportedAuth: ['api_key', 'web_session' as any, 'email_password'],
    iconKey: 'grok',
    isCustom: false,
  },
];

/**
 * Computes the next automatic account number for a provider.
 * Follows the strict requirement:
 * The number is an IDENTITY, NOT A QUALITY RANKING.
 * "ChatGPT 1", "ChatGPT 2", "ChatGPT 3"...
 */
export function getNextAccountNumber(providerId: string, existingAccounts: AIAccount[]): number {
  const providerAccounts = existingAccounts.filter((a) => a.providerId === providerId);
  if (providerAccounts.length === 0) return 1;
  const maxNumber = Math.max(...providerAccounts.map((a) => a.identityNumber || 0));
  return maxNumber + 1;
}

export function generateCanonicalName(provider: Provider, identityNumber: number): string {
  return `${provider.name} ${identityNumber}`;
}

export interface ServerStatusResponse {
  googleAiStudio: {
    hasKey: boolean;
    model: string;
    status: 'CONNECTED' | 'NOT_CONFIGURED';
  };
  version: string;
  timestamp: string;
}

export async function checkServerProvidersStatus(): Promise<ServerStatusResponse | null> {
  try {
    const res = await fetch('/api/providers/status');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Could not contact server providers status endpoint:', err);
    return null;
  }
}

export async function callGeminiGenerate(
  prompt: string,
  systemInstruction?: string
): Promise<{ text: string; model: string } | { error: string; notConnected?: boolean }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemInstruction }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json();
    if (!res.ok) {
      return {
        error: data.error || 'Request to Gemini failed',
        notConnected: !!data.notConnected,
      };
    }
    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    return {
      error: err.name === 'AbortError' ? 'Gemini API call timed out' : (err.message || 'Network error calling backend Gemini service'),
      notConnected: true,
    };
  }
}
