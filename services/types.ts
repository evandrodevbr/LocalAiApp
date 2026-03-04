export interface ServerConfig {
    host: string;
    port: number;
    apiKey?: string;
}

export interface LMModel {
    id: string;
    object: string;
    owned_by: string;
}

export interface ModelsResponse {
    data: LMModel[];
}

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatCompletionRequest {
    model: string;
    messages: ChatMessage[];
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
    stop?: string | string[];
    top_p?: number;
    frequency_penalty?: number;
}

export interface ChatCompletionChoice {
    index: number;
    message: ChatMessage;
    finish_reason: string | null;
}

export interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: ChatCompletionChoice[];
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export interface StreamDelta {
    role?: string;
    content?: string;
}

export interface StreamChoice {
    index: number;
    delta: StreamDelta;
    finish_reason: string | null;
}

export interface StreamChunk {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: StreamChoice[];
}

export const DEFAULT_SERVER_CONFIG: ServerConfig = {
    host: 'localhost',
    port: 1234,
    apiKey: '',
};
