// backend/routes/ai.routes.js
const express = require('express');
const router = express.Router();
const { gptWeatherAdvice, gptChat } = require('../services/ai.service');
const Fields = require('../models/Fields');
const weatherService = require('../services/weather.service');

// Health probe for this router
router.get('/health', (_req, res) => {
  res.json({ ok: true, model: process.env.OPENAI_MODEL || 'gpt-4o-mini' });
});

// Generic chat proxy
// POST /api/ai/chat  { messages:[{role,user|system|assistant,content}], system?:string, temperature?:number }
// POST /api/ai/weather-advice
router.post('/weather-advice', async (req, res) => {
  try {
    let bundle = req.body?.bundle;
    if (!bundle) {
      const { FieldsId } = req.body || {};
      if (!FieldsId) return res.status(400).json({ message: 'Provide FieldsId or bundle' });
      const Fields = await Fields.findById(FieldsId).select('location name').lean();
      if (!Fields || !Fields.location) return res.status(404).json({ message: 'Fields not found' });
      const svc = await weatherService.getCurrentWeather(Fields.location.lat, Fields.location.lng);
      bundle = {
        current: { ...svc.current, temperatureUnit: '°C', windUnit: 'km/h', station: svc.location?.name },
        forecast: svc.forecast,
        historical: [],
        meta: svc.meta,
      };
    }
    const advice = await gptWeatherAdvice(bundle);  // now auto-falls back on 429
    return res.json(advice);
  } catch (e) {
    // If it reaches here, it's a non-quota error
    const status = e?.status && Number.isFinite(e.status) ? e.status : 500;
    console.error('AI /weather-advice error:', e?.responseBody || e?.message || e);
    return res.status(status).json({
      message: 'AI advice failed',
      detail: e?.message || 'unknown',
    });
  }
});


// Weather advice (your existing pattern)
// POST /api/ai/weather-advice  { FieldsId?: string, bundle?: object }
router.post('/weather-advice', async (req, res) => {
  try {
    let bundle = req.body?.bundle;

    if (!bundle) {
      const { FieldsId } = req.body || {};
      if (!FieldsId) return res.status(400).json({ message: 'Provide FieldsId or bundle' });

      const Fields = await Fields.findById(FieldsId).select('location name').lean();
      if (!Fields || !Fields.location) return res.status(404).json({ message: 'Fields not found' });

      const svc = await weatherService.getCurrentWeather(Fields.location.lat, Fields.location.lng);

      bundle = {
        current: {
          ...svc.current,
          temperatureUnit: '°C',
          windUnit: 'km/h',
          station: svc.location?.name,
        },
        forecast: svc.forecast,
        historical: [],
        meta: svc.meta,
      };
    }

    const advice = await gptWeatherAdvice(bundle);
    return res.json(advice);
  } catch (e) {
    console.error('AI /weather-advice error:', e?.response?.data || e);
    return res.status(500).json({ message: 'AI advice failed', detail: e?.message || 'unknown' });
  }
});

module.exports = router;
