import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { calculateDistance } from './geocoding';

const RouteDisplay = ({ optimizedRoute, totalDistance }) => {
  const chartData = optimizedRoute.map((point) => ({
    name: point.address,
    lat: point.coordinates?.[0] || 0,
    lon: point.coordinates?.[1] || 0
  }));

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-right">מסלול אופטימלי:</h3>
        <div className="space-y-2">
          {optimizedRoute.map((point, index) => (
            <div key={point.id} className="flex justify-between items-center border-b pb-2">
              <div className="text-gray-600">
                {index < optimizedRoute.length - 1 && 
                  `${Math.round(calculateDistance(
                    point.coordinates,
                    optimizedRoute[index + 1].coordinates
                  ))} מטרים`}
              </div>
              <div className="text-right">
                <span className="font-medium">{point.address}</span>
                {point.coordinates && (
                  <div className="text-sm text-gray-500">
                    {point.coordinates[0].toFixed(4)}, {point.coordinates[1].toFixed(4)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-right">
          <span className="font-bold">סך הכל מרחק: </span>
          <span>{Math.round(totalDistance)} מטרים</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-right">ויזואליזציה של המסלול</h3>
        <div className="h-96">
          <LineChart
            width={800}
            height={400}
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="lat" stroke="#8884d8" name="קו רוחב" />
            <Line type="monotone" dataKey="lon" stroke="#82ca9d" name="קו אורך" />
          </LineChart>
        </div>
      </div>
    </>
  );
};

export default RouteDisplay;