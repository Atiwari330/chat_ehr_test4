import { smoothStream, streamText } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { updateDocumentPrompt } from '@/lib/ai/prompts';

export const textDocumentHandler = createDocumentHandler<'text'>({
  kind: 'text',
  onCreateDocument: async ({ title, dataStream, content: contentFromTool }) => {
    let draftContent = '';
    console.log('[textDocumentHandler] onCreateDocument called. Content from tool:', contentFromTool ? `${contentFromTool.substring(0, 50)}...` : 'Not provided'); // Server log

    if (contentFromTool) {
      // If content is provided directly from the tool, use it and stream it
      draftContent = contentFromTool;
      // Stream the content in chunks to simulate the original streaming behavior
      // This helps the client-side rendering if it expects deltas.
      // A more sophisticated chunking might be needed for very large content.
      const chunkSize = 50; // characters
      for (let i = 0; i < draftContent.length; i += chunkSize) {
        const chunk = draftContent.substring(i, i + chunkSize);
        dataStream.writeData({
          type: 'text-delta',
          content: chunk,
        });
        // Add a small delay to simulate streaming if necessary, or remove for faster processing
        await new Promise(resolve => setTimeout(resolve, 10)); // Optional delay
      }
    } else {
      // Original behavior: generate content using LLM
      const { fullStream } = streamText({
        model: myProvider.languageModel('artifact-model'),
        system:
          'Write about the given topic. Markdown is supported. Use headings wherever appropriate.',
        experimental_transform: smoothStream({ chunking: 'word' }),
        prompt: title,
      });

      for await (const delta of fullStream) {
        const { type } = delta;

        if (type === 'text-delta') {
          const { textDelta } = delta;
          draftContent += textDelta;
          dataStream.writeData({
            type: 'text-delta',
            content: textDelta,
          });
        }
      }
    }
    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamText({
      model: myProvider.languageModel('artifact-model'),
      system: updateDocumentPrompt(document.content, 'text'),
      experimental_transform: smoothStream({ chunking: 'word' }),
      prompt: description,
      experimental_providerMetadata: {
        openai: {
          prediction: {
            type: 'content',
            content: document.content,
          },
        },
      },
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'text-delta') {
        const { textDelta } = delta;

        draftContent += textDelta;
        dataStream.writeData({
          type: 'text-delta',
          content: textDelta,
        });
      }
    }

    return draftContent;
  },
});
