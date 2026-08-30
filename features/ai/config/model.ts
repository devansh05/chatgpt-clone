import { openai, type OpenAILanguageModelResponsesOptions } from '@ai-sdk/openai';
import { generateText } from 'ai';

const DEFAULT_CHAT_MODEL = "gpt-4o-mini";
const SYSTEM_CONTEXT = ""

export const getChatModel = (model: string | null) => {
    return openai(model || DEFAULT_CHAT_MODEL)
}

export const getData = async (model: string, userPrompt: string) => {

    if (userPrompt) {
        const result = await generateText({
            model: openai(model || DEFAULT_CHAT_MODEL),
            prompt: `${SYSTEM_CONTEXT} User Question: ${userPrompt}`,
            providerOptions: {
                openai: {
                    reasoningEffort: 'low', // 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh'
                } satisfies OpenAILanguageModelResponsesOptions,
            },
        });
    }
}

