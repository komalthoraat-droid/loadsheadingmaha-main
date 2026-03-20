/**
 * WEATHER-BASED ELECTRICITY OUTAGE PREDICTION API
 * 
 * This edge function provides outage risk predictions for villages
 * based on real-time weather data from Open-Meteo (free, no API key needed).
 * 
 * Endpoint: GET /outage-risk?village_id=<uuid>
 * 
 * Features:
 * - Rule-based prediction logic (ML-ready structure for future)
 * - 30-minute weather data caching
 * - Risk levels: Low (0-30%), Medium (31-60%), High (61-100%)
 * - Detailed explanations for predictions
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Simple in-memory cache for weather data (30 minutes TTL)
const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// ============= TYPE DEFINITIONS =============

interface WeatherData {
  temperature: number;        // Current temperature in Celsius
  humidity: number;           // Relative humidity percentage
  precipitation: number;      // Current precipitation in mm
  rainProbability: number;    // Probability of rain (0-100)
  windSpeed: number;          // Wind speed in km/h
  windGusts: number;          // Wind gusts in km/h
  weatherCode: number;        // WMO weather code
  isThunderstorm: boolean;    // Thunderstorm indicator
}

interface PredictionResult {
  village: string;
  village_id: string;
  outage_risk_percent: number;
  risk_level: "Low" | "Medium" | "High";
  reason: string;
  factors: RiskFactor[];
  weather: WeatherData;
  cached: boolean;
  prediction_time: string;
}

interface RiskFactor {
  factor: string;
  contribution: number;  // Percentage contribution to total risk
  severity: "low" | "medium" | "high";
}

// ============= RULE-BASED PREDICTION ENGINE =============
// 
// This module contains the core prediction logic.
// Structured for easy replacement with ML model in future.
//
// Current approach: Weighted scoring based on weather parameters
// Each factor contributes to a cumulative risk score.

class OutagePredictionEngine {

  /**
   * Calculate outage risk based on weather parameters
   * Returns: risk percentage (0-100) and contributing factors
   * 
   * RULE SET (based on typical power grid vulnerabilities):
   * 1. Thunderstorms: Highest risk due to lightning strikes
   * 2. Heavy Rain + Wind: Tree falls, flooding of equipment
   * 3. Extreme Heat: Transformer overload, cable sag
   * 4. High Winds alone: Line damage, debris
   * 5. Moderate Rain: Some risk from water ingress
   */
  static calculateRisk(weather: WeatherData): {
    riskPercent: number;
    factors: RiskFactor[];
    reason: string
  } {
    const factors: RiskFactor[] = [];
    let totalRisk = 0;
    const reasons: string[] = [];

    // ===== FACTOR 1: THUNDERSTORM (Highest Priority) =====
    // WMO codes 95-99 indicate thunderstorms
    if (weather.isThunderstorm || weather.weatherCode >= 95) {
      const contribution = 40;
      totalRisk += contribution;
      factors.push({
        factor: "Thunderstorm Activity",
        contribution,
        severity: "high"
      });
      reasons.push("Active thunderstorm detected");
    }

    // ===== FACTOR 2: HEAVY RAIN =====
    // Heavy rain (>10mm/hr) or high probability (>70%)
    if (weather.precipitation > 10 || weather.rainProbability > 70) {
      const intensity = Math.min(weather.precipitation / 20, 1); // Normalize
      const probFactor = weather.rainProbability / 100;
      const contribution = Math.round(25 * Math.max(intensity, probFactor));
      totalRisk += contribution;
      factors.push({
        factor: "Heavy Rainfall",
        contribution,
        severity: contribution > 15 ? "high" : "medium"
      });
      reasons.push(`Heavy rain (${weather.precipitation.toFixed(1)}mm, ${weather.rainProbability}% probability)`);
    }
    // Moderate rain
    else if (weather.precipitation > 2 || weather.rainProbability > 40) {
      const contribution = Math.round(12 * (weather.rainProbability / 100));
      totalRisk += contribution;
      factors.push({
        factor: "Moderate Rainfall",
        contribution,
        severity: "medium"
      });
      reasons.push(`Moderate rain expected (${weather.rainProbability}% probability)`);
    }

    // ===== FACTOR 3: HIGH WINDS =====
    // Wind speed thresholds based on power line vulnerability
    if (weather.windSpeed > 50 || weather.windGusts > 70) {
      const contribution = 30;
      totalRisk += contribution;
      factors.push({
        factor: "Dangerous Wind Speed",
        contribution,
        severity: "high"
      });
      reasons.push(`Very strong winds (${weather.windSpeed} km/h, gusts ${weather.windGusts} km/h)`);
    }
    else if (weather.windSpeed > 30 || weather.windGusts > 45) {
      const contribution = 18;
      totalRisk += contribution;
      factors.push({
        factor: "Strong Winds",
        contribution,
        severity: "medium"
      });
      reasons.push(`Strong winds detected (${weather.windSpeed} km/h)`);
    }
    else if (weather.windSpeed > 20) {
      const contribution = 8;
      totalRisk += contribution;
      factors.push({
        factor: "Moderate Winds",
        contribution,
        severity: "low"
      });
    }

    // ===== FACTOR 4: EXTREME HEAT =====
    // High temperatures cause transformer overload and cable issues
    if (weather.temperature > 44) {
      const contribution = 25;
      totalRisk += contribution;
      factors.push({
        factor: "Extreme Heat",
        contribution,
        severity: "high"
      });
      reasons.push(`Extreme temperature (${weather.temperature}°C)`);
    }
    else if (weather.temperature > 40) {
      const contribution = 15;
      totalRisk += contribution;
      factors.push({
        factor: "High Temperature",
        contribution,
        severity: "medium"
      });
      reasons.push(`High temperature (${weather.temperature}°C)`);
    }

    // ===== FACTOR 5: HUMIDITY + HEAT COMBO =====
    // High humidity with high temp stresses equipment
    if (weather.humidity > 85 && weather.temperature > 35) {
      const contribution = 10;
      totalRisk += contribution;
      factors.push({
        factor: "High Humidity Stress",
        contribution,
        severity: "low"
      });
    }

    // ===== CALCULATE FINAL RISK =====
    // Cap at 95% - never claim 100% certainty
    const finalRisk = Math.min(Math.round(totalRisk), 95);

    // Default reason for low risk
    if (reasons.length === 0) {
      reasons.push("Weather conditions are favorable");
    }

    return {
      riskPercent: finalRisk,
      factors,
      reason: reasons.join(". ")
    };
  }

  /**
   * Determine risk level category from percentage
   */
  static getRiskLevel(percent: number): "Low" | "Medium" | "High" {
    if (percent >= 60) return "High";
    if (percent >= 30) return "Medium";
    return "Low";
  }
}

// ============= WEATHER API SERVICE =============

class WeatherService {

  /**
   * Fetch weather data from Open-Meteo API (FREE, no API key)
   * Uses caching to prevent API overuse
   */
  static async getWeather(lat: number, lon: number): Promise<{ data: WeatherData; cached: boolean }> {
    const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;

    // Check cache first
    const cached = weatherCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
      console.log(`[WeatherService] Cache hit for ${cacheKey}`);
      return { data: cached.data, cached: true };
    }

    console.log(`[WeatherService] Fetching fresh data for ${cacheKey}`);

    // Fetch from Open-Meteo API
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", lat.toString());
    url.searchParams.set("longitude", lon.toString());
    url.searchParams.set("current", [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "wind_gusts_10m"
    ].join(","));
    url.searchParams.set("hourly", "precipitation_probability");
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", "1");

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;

    // Get current hour's rain probability from hourly data
    const currentHour = new Date().getHours();
    const rainProbability = data.hourly?.precipitation_probability?.[currentHour] ?? 0;

    // Check if current weather code indicates thunderstorm (95-99)
    const weatherCode = current.weather_code ?? 0;
    const isThunderstorm = weatherCode >= 95 && weatherCode <= 99;

    const weatherData: WeatherData = {
      temperature: current.temperature_2m ?? 0,
      humidity: current.relative_humidity_2m ?? 0,
      precipitation: current.precipitation ?? 0,
      rainProbability,
      windSpeed: current.wind_speed_10m ?? 0,
      windGusts: current.wind_gusts_10m ?? 0,
      weatherCode,
      isThunderstorm
    };

    // Update cache
    weatherCache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now()
    });

    return { data: weatherData, cached: false };
  }
}

// ============= MAIN REQUEST HANDLER =============

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse village_id from query params
    const url = new URL(req.url);
    const villageId = url.searchParams.get("village_id");

    if (!villageId) {
      return new Response(
        JSON.stringify({
          error: "Missing village_id parameter",
          usage: "GET /outage-risk?village_id=<uuid>"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`[OutageRisk] Processing request for village: ${villageId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch village from database
    const { data: village, error: villageError } = await supabase
      .from("villages")
      .select("id, name, latitude, longitude, substation_id")
      .eq("id", villageId)
      .single();

    if (villageError || !village) {
      console.error(`[OutageRisk] Village not found: ${villageId}`, villageError);
      return new Response(
        JSON.stringify({
          error: "Village lookup failed",
          details: villageError,
          village_id: villageId
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Use village coordinates or default to Pune district center
    const lat = village.latitude ?? 18.52;
    const lon = village.longitude ?? 73.85;

    console.log(`[OutageRisk] Village: ${village.name}, Coords: ${lat}, ${lon}`);

    // Fetch weather data (with caching)
    const { data: weather, cached } = await WeatherService.getWeather(lat, lon);

    console.log(`[OutageRisk] Weather data:`, JSON.stringify(weather));

    // Calculate prediction using rule-based engine
    const { riskPercent, factors, reason } = OutagePredictionEngine.calculateRisk(weather);
    const riskLevel = OutagePredictionEngine.getRiskLevel(riskPercent);

    console.log(`[OutageRisk] Prediction: ${riskPercent}% (${riskLevel}) - ${reason}`);

    // Build response
    const result: PredictionResult = {
      village: village.name,
      village_id: village.id,
      outage_risk_percent: riskPercent,
      risk_level: riskLevel,
      reason,
      factors,
      weather,
      cached,
      prediction_time: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("[OutageRisk] Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
