// backend/routes/public.weather.routes.js
const express = require("express");
const router = express.Router();
const Field = require("../models/Field");
const weatherService = require("../services/weather.service");

// GET /api/fields  -> [{ id, name, lat, lon }]
router.get("/fields", async (_req, res) => {
  try {
    // Return a minimal public list. If you want to restrict, add auth here.
    const fields = await Field.find().select("name location").limit(20).lean();
    const out = fields
      .filter((f) => f.location?.lat != null && f.location?.lng != null)
      .map((f) => ({
        id: String(f._id),
        name: f.name || "Unnamed field",
        lat: f.location.lat,
        lon: f.location.lng, // note: UI expects `lon`
      }));
    return res.json(out);
  } catch (e) {
    console.error(e);
    // Safe fallback: expose one Melbourne sample so the UI still renders
    return res.json([{ id: "melb", name: "Melbourne (sample)", lat: -37.8136, lon: 144.9631 }]);
  }
});

// GET /api/weather?fieldId=... -> { current, forecast, historical?, meta }
router.get("/weather", async (req, res) => {
  try {
    const { fieldId } = req.query;
    let lat, lng, name;

    if (fieldId && fieldId !== "melb") {
      const field = await Field.findById(fieldId).select("name location").lean();
      if (!field || !field.location) return res.status(404).json({ message: "Field not found" });
      lat = field.location.lat;
      lng = field.location.lng;
      name = field.name;
    } else {
      // sample or ?lat=&lon= pass-through
      lat = Number(req.query.lat ?? -37.8136);
      lng = Number(req.query.lon ?? 144.9631);
      name = "Melbourne (sample)";
    }

    const svc = await weatherService.getCurrentWeather(lat, lng);

    const bundle = {
      current: { ...svc.current, temperatureUnit: "°C", windUnit: "km/h", station: svc.location?.name },
      forecast: svc.forecast,
      historical: [], // plug in your DB snapshots if you want
      meta: svc.meta,
    };

    return res.json(bundle);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Failed to load weather" });
  }
});

module.exports = router;
