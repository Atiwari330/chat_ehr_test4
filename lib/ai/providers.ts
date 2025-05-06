import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

// Configure OpenAI with environment variables
// Log API key details for debugging
console.log('OpenAI API Key Debug:', {
  keyExists: !!process.env.OPENAI_API_KEY,
  keyLength: process.env.OPENAI_API_KEY?.length,
  keyStart: process.env.OPENAI_API_KEY?.substring(0, 10) + '...',
});

// The API SDK should automatically use OPENAI_API_KEY from environment
// Let's use different model versions that are definitely available
export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        // Using standard GPT models instead of vision/preview models
        'chat-model': openai('gpt-4'),
        'chat-model-reasoning': wrapLanguageModel({
          model: openai('gpt-4'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': openai('gpt-3.5-turbo'),
        'artifact-model': openai('gpt-3.5-turbo'),
      },
      imageModels: {
        'small-model': openai.image('dall-e-3'),
      },
    });
    
console.log('AI provider configured successfully');
