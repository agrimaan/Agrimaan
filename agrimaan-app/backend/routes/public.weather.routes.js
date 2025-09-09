// backend/routes/public.weather.routes.js
const express = require("express");
const router = express.Router();
const Fields = require("../models/Fields");
const weatherService = require("../services/weather.service");

// GET /api/fields  -> [{ id, name, lat, lon }]
router.get("/fields", async (_req, res) => {
  try {
    // Return a minimal public list. If you want to restrict, add auth here.
    const fields = await Fields.find().select("name location").limit(20).lean();
    const out = fields
      .filter((f) => f.location?.lat != null && f.location?.lng != null)
      .map((f) => ({
        id: String(f._id),
        name: f.name || "Unnamed Fields",
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

// GET /api/weather?FieldsId=... -> { current, forecast, historical?, meta }
router.get("/weather", async (req, res) => {
  try {
    const { FieldsId } = req.query;
    let lat, lng, name;

    if (FieldsId && FieldsId !== "melb") {
      const Fields = await Fields.findById(FieldsId).select("name location").lean();
      if (!Fields || !Fields.location) return res.status(404).json({ message: "Fields not found" });
      lat = Fields.location.lat;
      lng = Fields.location.lng;
      name = Fields.name;
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
