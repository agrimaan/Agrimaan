// src/services/ai.ts
import { api } from "../lib/api";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function chat(messages: ChatMessage[], system?: string, temperature = 0.7) {
  return api<{ content: string; usage?: any; model?: string }>("/api/ai/chat", {
    method: "POST",
    body: JSON.stringify({ messages, system, temperature }),
  });
}

// weather-advice can take either FieldsId or a full bundle
export type WeatherAdvice = {
  summary: string;
  risks?: string[];
  recommendations?: string[];
  warnings?: string[];
};

export async function getWeatherAdviceByFields(FieldsId: string) {
  return api<WeatherAdvice>("/api/ai/weather-advice", {
    method: "POST",
    body: JSON.stringify({ FieldsId }),
  });
}

export async function getWeatherAdviceByBundle(bundle: any) {
  return api<WeatherAdvice>("/api/ai/weather-advice", {
    method: "POST",
    body: JSON.stringify({ bundle }),
  });
}
