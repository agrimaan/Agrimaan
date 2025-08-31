// backend/services/ai.service.js
require('dotenv').config();
const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// Detect 429 / quota / rate-limit from various shapes
function isQuotaError(err) {
  const msg = (err?.message || '').toLowerCase();
  const details = (err?.response?.data?.error?.message || '').toLowerCase();
  return (
    err?.status === 429 ||
    err?.code === 'insufficient_quota' ||
    msg.includes('insufficient_quota') ||
    msg.includes('exceeded your current quota') ||
    msg.includes('rate limit') ||
    details.includes('insufficient_quota') ||
    details.includes('exceeded your current quota') ||
    details.includes('rate limit')
  );
}

// Lightweight rule-based fallback (no AI call)
function heuristicWeatherAdvice(bundle = {}) {
  const current = bundle.current || {};
  const fc = Array.isArray(bundle.forecast) ? bundle.forecast : [];
  const three = fc.slice(0, 3).map(d => ({
    max: d?.day?.maxtemp_c ?? d?.max_c,
    min: d?.day?.mintemp_c ?? d?.min_c,
    rain: d?.day?.totalprecip_mm ?? d?.rain_mm ?? 0,
    wind: d?.day?.maxwind_kph ?? d?.wind_kph ?? 0,
    cond: d?.day?.condition?.text ?? d?.condition?.text ?? d?.summary ?? '—',
  }));

  const nums = (v, def) => (Number.isFinite(+v) ? +v : def);
  const maxTemp = Math.max(...three.map(x => nums(x.max, -Infinity)));
  const minTemp = Math.min(...three.map(x => nums(x.min, +Infinity)));
  const rainSum = three.reduce((s, x) => s + nums(x.rain, 0), 0);
  const windMax = Math.max(...three.map(x => nums(x.wind, 0)));

  const risks = [];
  const recs = [];
  const warns = [];

  if (windMax >= 35) risks.push('Strong wind risk (≥35 km/h) for spraying/harvest.');
  if (rainSum >= 10) risks.push(`Rain expected (~${Math.round(rainSum)} mm) — field access may be limited.`);
  if (maxTemp >= 35) risks.push('Heat stress risk in afternoons (≥35°C).');
  if (minTemp <= 2)  risks.push('Possible frost early mornings (≤2°C).');

  if (windMax < 20) recs.push('Prefer spraying in the calm window (<20 km/h).');
  if (rainSum === 0) recs.push('Irrigate in cool hours if soil moisture is low.');
  if (rainSum > 0)  recs.push('Avoid spraying close to rain; aim for dry breaks.');
  recs.push('Plan harvest/field work in driest, light-wind periods.');

  const station = current.station || bundle?.meta?.station || 'local station';
  const nowTemp = current.temp_c ?? current.temperature ?? '—';
  const nowWind = current.wind_kph ?? current.windSpeed ?? '—';

  const summary =
    `Now: ${nowTemp}°C, wind ${nowWind} km/h @ ${station}. ` +
    `Next 2–3 days: max ${Number.isFinite(maxTemp) ? Math.round(maxTemp) : '—'}°C / ` +
    `min ${Number.isFinite(minTemp) ? Math.round(minTemp) : '—'}°C, ` +
    `rain ≈ ${Math.round(rainSum)} mm, winds up to ${Math.round(windMax)} km/h.`;

  return { summary, risks: risks.length ? risks : undefined, recommendations: recs, warnings: warns, _fallback: 'heuristic' };
}

function buildWeatherMessages(bundle) {
  return [
    {
      role: 'system',
      content:
        "You are Agrimaan's agronomy assistant for Australian farms. Be concise and practical. Use °C, km/h, mm.",
    },
    {
      role: 'user',
      content:
        "Given this weather bundle JSON, produce advice as JSON with keys: summary, risks[], recommendations[], warnings[] (omit empty). Keep summary <180 words.\n\n" +
        JSON.stringify(bundle),
    },
  ];
}

async function gptChat({ messages = [], system, temperature = 0.7 }) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY missing');
  const result = await client.chat.completions.create({
    model: MODEL,
    messages: [...(system ? [{ role: 'system', content: system }] : []), ...messages],
    temperature,
  });
  return {
    content: result.choices?.[0]?.message?.content ?? '',
    usage: result.usage || null,
    model: result.model,
  };
}

async function gptWeatherAdvice(bundle) {
  // No key? Go straight to heuristic
  if (!process.env.OPENAI_API_KEY) {
    return heuristicWeatherAdvice(bundle);
  }

  try {
    const resp = await client.chat.completions.create({
      model: MODEL,
      messages: buildWeatherMessages(bundle),
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });
    const text = resp.choices?.[0]?.message?.content?.trim() || '{}';
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data.risks) && data.risks.length === 0) delete data.risks;
      if (Array.isArray(data.recommendations) && data.recommendations.length === 0) delete data.recommendations;
      if (Array.isArray(data.warnings) && data.warnings.length === 0) delete data.warnings;
      return data;
    } catch {
      return { summary: text };
    }
  } catch (err) {
    // ⬇️ key line: convert quota/rate-limit into a fallback response (HTTP 200)
    if (isQuotaError(err)) {
      console.warn('[AI] quota/rate-limit hit — returning heuristic fallback');
      return heuristicWeatherAdvice(bundle);
    }
    // Anything else bubbles up to the route (to become 4xx/5xx)
    throw err;
  }
}

module.exports = { gptChat, gptWeatherAdvice, isQuotaError, heuristicWeatherAdvice };
