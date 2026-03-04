import { Platform } from 'react-native';
import {
    ChatCompletionRequest,
    ChatCompletionResponse,
    ChatMessage,
    LMModel,
    ModelsResponse,
    ServerConfig,
    StreamChunk,
} from './types';

function buildBaseUrl(config: ServerConfig): string {
    const host = config.host.replace(/\/+$/, '');
    const protocol = host.startsWith('http') ? '' : 'http://';
    return `${protocol}${host}:${config.port}/v1`;
}

function buildHeaders(config: ServerConfig): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
    }
    return headers;
}

export async function testConnection(config: ServerConfig): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(`${buildBaseUrl(config)}/models`, {
            headers: buildHeaders(config),
            signal: controller.signal,
        });

        clearTimeout(timeout);
        return res.ok;
    } catch {
        return false;
    }
}

export async function getModels(config: ServerConfig): Promise<LMModel[]> {
    const res = await fetch(`${buildBaseUrl(config)}/models`, {
        headers: buildHeaders(config),
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch models: ${res.status} ${res.statusText}`);
    }

    const data: ModelsResponse = await res.json();
    return data.data ?? [];
}

export async function chatCompletion(
    config: ServerConfig,
    model: string,
    messages: ChatMessage[],
    options?: Partial<Omit<ChatCompletionRequest, 'model' | 'messages' | 'stream'>>,
): Promise<ChatCompletionResponse> {
    const body: ChatCompletionRequest = {
        model,
        messages,
        stream: false,
        temperature: 0.7,
        max_tokens: 2048,
        ...options,
    };

    const res = await fetch(`${buildBaseUrl(config)}/chat/completions`, {
        method: 'POST',
        headers: buildHeaders(config),
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        throw new Error(`Chat completion failed: ${res.status} ${res.statusText}`);
    }

    return res.json();
}

// Parse SSE lines from a text buffer
function parseSSELines(
    buffer: string,
    onChunk: (content: string) => void,
    onDone: () => void,
): { remaining: string; isDone: boolean } {
    const lines = buffer.split('\n');
    const remaining = lines.pop() ?? '';
    let isDone = false;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const payload = trimmed.slice(6);
        if (payload === '[DONE]') {
            isDone = true;
            onDone();
            return { remaining: '', isDone: true };
        }

        try {
            const chunk: StreamChunk = JSON.parse(payload);
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
                onChunk(content);
            }
        } catch {
            // skip malformed chunks
        }
    }

    return { remaining, isDone };
}

// Native streaming using XMLHttpRequest (works on React Native)
function streamWithXHR(
    url: string,
    headers: Record<string, string>,
    body: string,
    onChunk: (content: string) => void,
    onDone: () => void,
    onError: (error: Error) => void,
): { abort: () => void } {
    const xhr = new XMLHttpRequest();
    let buffer = '';
    let lastIndex = 0;

    xhr.open('POST', url);
    Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
    });

    xhr.onprogress = () => {
        const newData = xhr.responseText.substring(lastIndex);
        lastIndex = xhr.responseText.length;
        buffer += newData;

        const result = parseSSELines(buffer, onChunk, onDone);
        buffer = result.remaining;
    };

    xhr.onload = () => {
        // Process any remaining buffer
        if (buffer.trim()) {
            parseSSELines(buffer + '\n', onChunk, onDone);
        }
        onDone();
    };

    xhr.onerror = () => {
        onError(new Error(`XHR streaming failed: ${xhr.status} ${xhr.statusText}`));
    };

    xhr.ontimeout = () => {
        onError(new Error('Request timed out'));
    };

    xhr.send(body);

    return {
        abort: () => {
            try { xhr.abort(); } catch { }
        },
    };
}

// Web streaming using ReadableStream (works in browsers)
async function streamWithFetch(
    url: string,
    headers: Record<string, string>,
    body: string,
    onChunk: (content: string) => void,
    onDone: () => void,
    onError: (error: Error) => void,
    signal: AbortSignal,
): Promise<void> {
    const res = await fetch(url, {
        method: 'POST',
        headers,
        body,
        signal,
    });

    if (!res.ok) {
        throw new Error(`Stream failed: ${res.status} ${res.statusText}`);
    }

    const reader = res.body?.getReader();
    if (!reader) {
        throw new Error('ReadableStream not supported');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const result = parseSSELines(buffer, onChunk, onDone);
        buffer = result.remaining;
        if (result.isDone) return;
    }
    onDone();
}

export function chatCompletionStream(
    config: ServerConfig,
    model: string,
    messages: ChatMessage[],
    onChunk: (content: string) => void,
    onDone: () => void,
    onError: (error: Error) => void,
    options?: Partial<Omit<ChatCompletionRequest, 'model' | 'messages' | 'stream'>>,
): { abort: () => void } {
    const body: ChatCompletionRequest = {
        model,
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
        ...options,
    };

    const url = `${buildBaseUrl(config)}/chat/completions`;
    const headers = buildHeaders(config);
    const bodyStr = JSON.stringify(body);

    let doneEmitted = false;
    const safeOnDone = () => {
        if (!doneEmitted) {
            doneEmitted = true;
            onDone();
        }
    };

    if (Platform.OS === 'web') {
        // Web: use fetch + ReadableStream
        const controller = new AbortController();

        streamWithFetch(url, headers, bodyStr, onChunk, safeOnDone, onError, controller.signal)
            .catch((err) => {
                if ((err as Error).name !== 'AbortError') {
                    onError(err as Error);
                }
            });

        return { abort: () => controller.abort() };
    } else {
        // Native: use XMLHttpRequest
        return streamWithXHR(url, headers, bodyStr, onChunk, safeOnDone, onError);
    }
}
