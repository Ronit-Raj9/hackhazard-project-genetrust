import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { getLatestSensorData } from '../services/iot.service';
import { getSensorInsights } from '../services/groq.service';

/**
 * Get latest sensor data
 */
export const getLatestData = asyncHandler(async (req: Request, res: Response) => {
  const result = await getLatestSensorData();

  if (!result.success || !result.data) {
    throw new ApiError(404, result.message || 'Failed to get sensor data');
  }

  // Return response
  return res.status(200).json(
    new ApiResponse(
      200,
      { sensorData: result.data },
      'Sensor data fetched successfully'
    )
  );
});

/**
 * Get insights for current sensor data
 */
export const getSensorDataInsights = asyncHandler(async (req: Request, res: Response) => {
  const result = await getLatestSensorData();

  if (!result.success || !result.data) {
    throw new ApiError(404, result.message || 'Failed to get sensor data');
  }

  // Get latest temperature and humidity readings
  const latestTemp = result.data.temperature && result.data.temperature.length > 0 
    ? result.data.temperature[result.data.temperature.length - 1].value 
    : null;
  
  const latestHumidity = result.data.humidity && result.data.humidity.length > 0
    ? result.data.humidity[result.data.humidity.length - 1].value
    : null;

  if (latestTemp === null || latestHumidity === null) {
    throw new ApiError(404, 'No temperature or humidity data available');
  }

  // Get insights
  const insights = await getSensorInsights(latestTemp, latestHumidity);

  if (!insights.success) {
    throw new ApiError(500, 'Failed to get insights from Groq');
  }

  // Return response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        insights: insights.message,
        currentData: {
          temperature: latestTemp,
          humidity: latestHumidity,
        },
      },
      'Sensor insights fetched successfully'
    )
  );
}); 