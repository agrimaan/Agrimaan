// src/services/ai.ts
import { api } from "../lib/api";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function chat(messages: ChatMessage[], system?: string, temperature = 0.7) {
  return api<{ content: string; usage?: any; model?: string }>("/api/ai/chat", {
    method: "POST",
    body: JSON.stringify({ messages, system, temperature }),
  });
}

// weather-advice can take either fieldId or a full bundle
export type WeatherAdvice = {
  summary: string;
  risks?: string[];
  recommendations?: string[];
  warnings?: string[];
};

export async function getWeatherAdviceByField(fieldId: string) {
  return api<WeatherAdvice>("/api/ai/weather-advice", {
    method: "POST",
    body: JSON.stringify({ fieldId }),
  });
}

export async function getWeatherAdviceByBundle(bundle: any) {
  return api<WeatherAdvice>("/api/ai/weather-advice", {
    method: "POST",
    body: JSON.stringify({ bundle }),
  });
}
