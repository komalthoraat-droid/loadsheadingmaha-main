/**
 * Custom hook for fetching outage risk predictions from the backend API.
 * 
 * Features:
 * - Automatic fetching when village changes
 * - Loading and error states
 * - Refetch capability
 * - Type-safe response handling
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ============= TYPE DEFINITIONS =============

export interface WeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  rainProbability: number;
  windSpeed: number;
  windGusts: number;
  weatherCode: number;
  isThunderstorm: boolean;
}

export interface RiskFactor {
  factor: string;
  contribution: number;
  severity: "low" | "medium" | "high";
}

export interface OutagePrediction {
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

interface UseOutagePredictionResult {
  prediction: OutagePrediction | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch outage prediction for a specific village
 * 
 * @param villageId - UUID of the village to get prediction for
 * @returns Prediction data, loading state, error, and refetch function
 * 
 * @example
 * const { prediction, isLoading, error } = useOutagePrediction(selectedVillageId);
 */
export function useOutagePrediction(villageId: string | null): UseOutagePredictionResult {
  const [prediction, setPrediction] = useState<OutagePrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrediction = useCallback(async () => {
    if (!villageId) {
      setPrediction(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("[useOutagePrediction] Fetching for village:", villageId);

      // We use fetch with the full URL to safely pass the village_id parameter
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${projectUrl}/functions/v1/outage-risk?village_id=${villageId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const predictionData: OutagePrediction = await response.json();
      console.log("[useOutagePrediction] Received:", predictionData);

      setPrediction(predictionData);
    } catch (err) {
      console.error("[useOutagePrediction] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch prediction");
      setPrediction(null);
    } finally {
      setIsLoading(false);
    }
  }, [villageId]);

  // Fetch on village change
  useEffect(() => {
    fetchPrediction();
  }, [fetchPrediction]);

  return {
    prediction,
    isLoading,
    error,
    refetch: fetchPrediction,
  };
}
