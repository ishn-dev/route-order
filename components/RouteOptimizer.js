import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Plus, Trash2 } from 'lucide-react';

const RouteOptimizer = () => {
  const [addresses, setAddresses] = useState([
    { id: 1, address: '', coordinates: null }
  ]);
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);

  const handleAddressChange = (id, value) => {
    setAddresses(prevAddresses => 
      prevAddresses.map(addr => 
        addr.id === id ? { ...addr, address: value } : addr
      )
    );
  };

  const findCoordinates = async (address) => {
    try {
      // Add ", Israel" to improve accuracy for Israeli addresses
      const fullAddress = `${address}, Israel`;
      const encodedAddress = encodeURIComponent(fullAddress);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
        {
          headers: {
            'Accept-Language': 'he', // Prefer Hebrew results
            'User-Agent': 'RouteOptimizer/1.0' // It's good practice to identify your application
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      } else {
        console.warn('No coordinates found for address:', address);
        return null;
      }
    } catch (error) {
      console.error('Error finding coordinates:', error);
      return null;
    }
  };

  const handleAddAddress = () => {
    const newId = Math.max(...addresses.map(addr => addr.id)) + 1;
    setAddresses(prev => [...prev, { id: newId, address: '', coordinates: null }]);
  };

  const handleRemoveAddress = (id) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  const [loadingStates, setLoadingStates] = useState({});

  const handleFindCoordinates = async (id) => {
    const address = addresses.find(addr => addr.id === id);
    if (address && address.address.trim()) {
      setLoadingStates(prev => ({ ...prev, [id]: true }));
      try {
        const coordinates = await findCoordinates(address.address);
        if (coordinates) {
          setAddresses(prev => 
            prev.map(addr => 
              addr.id === id ? { ...addr, coordinates, error: null } : addr
            )
          );
        } else {
          setAddresses(prev => 
            prev.map(addr => 
              addr.id === id ? { ...addr, coordinates: null, error: 'לא נמצאו קואורדינטות לכתובת זו' } : addr
            )
          );
        }
      } catch (error) {
        setAddresses(prev => 
          prev.map(addr => 
            addr.id === id ? { ...addr, coordinates: null, error: 'שגיאה בחיפוש הכתובת' } : addr
          )
        );
      } finally {
        setLoadingStates(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (coord1, coord2) => {
    if (!coord1 || !coord2) return 0;
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // Find shortest route using Nearest Neighbor algorithm
  const findShortestRoute = (points) => {
    const validPoints = points.filter(p => p.coordinates);
    if (validPoints.length < 2) return { route: validPoints, totalDistance: 0 };

    const route = [validPoints[0]];
    const unvisited = validPoints.slice(1);
    let totalDist = 0;

    while (unvisited.length > 0) {
      let currentPoint = route[route.length - 1];
      let shortestDistance = Infinity;
      let nextPoint = null;
      let nextPointIndex = null;

      unvisited.forEach((point, index) => {
        const dist = calculateDistance(currentPoint.coordinates, point.coordinates);
        if (dist < shortestDistance) {
          shortestDistance = dist;
          nextPoint = point;
          nextPointIndex = index;
        }
      });

      if (nextPoint) {
        route.push(nextPoint);
        totalDist += shortestDistance;
        unvisited.splice(nextPointIndex, 1);
      }
    }

    return { route, totalDistance: totalDist };
  };

  useEffect(() => {
    const validAddresses = addresses.filter(addr => addr.coordinates);
    if (validAddresses.length >= 2) {
      const { route, totalDistance } = findShortestRoute(validAddresses);
      setOptimizedRoute(route);
      setTotalDistance(totalDistance);
    } else {
      setOptimizedRoute([]);
      setTotalDistance(0);
    }
  }, [addresses]);

  const chartData = optimizedRoute.map((point, index) => ({
    name: point.address,
    lat: point.coordinates[0],
    lon: point.coordinates[1]
  }));

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-right">אופטימיזציית מסלול</h2>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-right">הזנת כתובות:</h3>
        
        <div className="space-y-4">
          {addresses.map(addr => (
            <div key={addr.id} className="flex gap-4 items-center">
              <button 
                onClick={() => handleRemoveAddress(addr.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 size={20} />
              </button>
              
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={addr.address}
                    onChange={(e) => handleAddressChange(addr.id, e.target.value)}
                    onBlur={() => handleFindCoordinates(addr.id)}
                    placeholder="הכנס כתובת..."
                    className={`w-full p-2 border rounded text-right ${addr.error ? 'border-red-500' : ''}`}
                  />
                  {loadingStates[addr.id] && (
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                  )}
                  {addr.error && (
                    <div className="text-red-500 text-sm mt-1 text-right">{addr.error}</div>
                  )}
                </div>
              </div>
              
              {addr.coordinates && (
                <div className="text-sm text-gray-500 text-right">
                  {addr.coordinates[0].toFixed(4)}, {addr.coordinates[1].toFixed(4)}
                </div>
              )}
            </div>
          ))}
        </div>

        <button 
          onClick={handleAddAddress}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <Plus size={20} />
          הוסף כתובת
        </button>
      </div>

      {optimizedRoute.length >= 2 && (
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
                    <div className="text-sm text-gray-500">
                      {point.coordinates[0].toFixed(4)}, {point.coordinates[1].toFixed(4)}
                    </div>
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
      )}
    </div>
  );
};

export default RouteOptimizer;