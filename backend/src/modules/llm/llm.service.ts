import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface LLMResponse {
  content: string;
  tokenCount: number;
  processingTime: number;
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly minDelay: number;
  private readonly maxDelay: number;

  constructor(private readonly configService: ConfigService) {
    this.minDelay = this.configService.get<number>('llm.minDelay', 2000);
    this.maxDelay = this.configService.get<number>('llm.maxDelay', 5000);
  }

  async generateResponse(userMessage: string): Promise<LLMResponse> {
    const startTime = Date.now();
    
    // Simulate random delay between 10-20 seconds
    const delay = Math.floor(Math.random() * (this.maxDelay - this.minDelay + 1)) + this.minDelay;
    
    this.logger.log(`Simulating LLM processing for ${delay}ms for message: "${userMessage.substring(0, 50)}..."`);
    
    // Simulate async processing
    await this.simulateAsyncProcessing(delay);
    
    // Generate simulated response based on user input
    const response = this.generateSimulatedResponse(userMessage);
    const processingTime = Date.now() - startTime;
    
    this.logger.log(`LLM response generated in ${processingTime}ms`);
    
    return {
      content: response,
      tokenCount: this.estimateTokenCount(response),
      processingTime,
    };
  }

  private async simulateAsyncProcessing(delay: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
  }

  private generateSimulatedResponse(userMessage: string): string {
    // Simulate different types of responses based on user input
    const responses = [
      `I understand you're asking about "${userMessage}". This is a simulated AI response that demonstrates how the frontend handles long-running LLM requests. In a real implementation, this would be connected to an actual language model like GPT-4 or Claude. The response includes multiple sentences to show how streaming or progressive loading might work in the user interface.`,
      
      `Thank you for your message: "${userMessage}". This simulated response is designed to test the asynchronous handling of AI-generated content in our ChatGPT clone application. The backend introduces a realistic delay to mimic the processing time of actual language models, which typically take 10-20 seconds to generate comprehensive responses. This helps ensure the frontend gracefully handles loading states and prevents duplicate requests.`,
      
      `Your question about "${userMessage}" is interesting! This is a multi-sentence simulated AI reply that demonstrates the complete integration between our NestJS backend and the frontend application. The system is designed to handle long-running requests without blocking other operations, and this response serves as a proof of concept for the real-time chat functionality. The delay you experienced is intentionally implemented to replicate actual LLM processing times.`,
      
      `I see you mentioned "${userMessage}". This simulated response showcases how our chat application manages asynchronous AI interactions. In production, this service would integrate with external APIs like OpenAI, Anthropic, or other language model providers. The current implementation focuses on demonstrating proper error handling, request queuing, and user experience during the waiting period. Each response is unique and contextually relevant to your input.`,
    ];

    // Select a random response
    const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Add some variation based on message length
    if (userMessage.length > 100) {
      return selectedResponse + ` I notice your message was quite detailed, which allows for more comprehensive responses. This additional context helps in providing more relevant and useful information.`;
    }
    
    return selectedResponse;
  }

  private estimateTokenCount(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  async generateTitle(firstMessage: string): Promise<string> {
    // Simulate a shorter delay for title generation
    const delay = Math.floor(Math.random() * 2000) + 1000; // 1-3 seconds
    await this.simulateAsyncProcessing(delay);
    
    // Generate a simple title based on the first message
    const words = firstMessage.split(' ').slice(0, 5);
    return words.join(' ') + (firstMessage.split(' ').length > 5 ? '...' : '');
  }
}