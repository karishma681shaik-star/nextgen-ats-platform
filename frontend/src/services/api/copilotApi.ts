import { apiClient } from './apiClient';

export interface CopilotChatRequest {
  message: string;
  context?: Record<string, string>;
}

export interface CopilotChatResponse {
  success: boolean;
  message: string;
  role: string | null;
}

/**
 * Send a message to the TalentPilot Copilot backend.
 * The backend reads the user's identity and role from the JWT —
 * we never send role or API keys from the frontend.
 */
export const sendCopilotMessage = async (
  message: string,
  context?: Record<string, string>
): Promise<CopilotChatResponse> => {
  return apiClient<CopilotChatResponse>('/copilot/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      context: context || {},
    } satisfies CopilotChatRequest),
  });
};
