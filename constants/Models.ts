export type AIModel = {
  id: string;
  name: string;
  parameters: string;
  huggingFaceUrl: string;
  description: string;
};

export const QWEN_MODELS: AIModel[] = [
  {
    id: "qwen1.5-0.5b-chat",
    name: "Qwen 1.5 Chat",
    parameters: "0.5B",
    huggingFaceUrl: "https://huggingface.co/Qwen/Qwen1.5-0.5B-Chat",
    description: "Ultra-lightweight model, extremely fast for basic tasks.",
  },
  {
    id: "qwen1.5-1.8b-chat",
    name: "Qwen 1.5 Chat",
    parameters: "1.8B",
    huggingFaceUrl: "https://huggingface.co/Qwen/Qwen1.5-1.8B-Chat",
    description: "Good balance of speed and reasoning for mobile devices.",
  },
  {
    id: "qwen1.5-4b-chat",
    name: "Qwen 1.5 Chat",
    parameters: "4B",
    huggingFaceUrl: "https://huggingface.co/Qwen/Qwen1.5-4B-Chat",
    description: "Highest local quality, requires more RAM and processing power.",
  }
];

export const DEFAULT_MODEL = QWEN_MODELS[0];
