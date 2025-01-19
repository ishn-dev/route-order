import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Settings } from 'lucide-react';
import { Button } from "../ui/button"
import GeneticControls from './GeneticControls';
import RouteDisplay from './RouteDisplay';
import AlgorithmSelector from './AlgorithmSelector';
import NavigationMap from './NavigationMap';
import { findRouteNearestNeighbor, findRouteGenetic } from './algorithms';
import { findCoordinates } from './geocoding';

const RouteOptimizer = () => {
  const [addresses, setAddresses] = useState([
    { id: 1, address: '', coordinates: null, isStartPoint: true }
  ]);
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [algorithm, setAlgorithm] = useState('nearest');
  const [showGeneticControls, setShowGeneticControls] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const [geneticParams, setGeneticParams] = useState({
    populationSize: 100,
    generations: 100,
    mutationRate: 0.01,
    elitismRate: 0.1
  });

  const handleAddressChange = (id, value) => {
    setAddresses(prev => 
      prev.map(addr => addr.id === id ? { ...addr, address: value } : addr)
    );
  };

  const handleAddAddress = () => {
    const newId = Math.max(...addresses.map(addr => addr.id)) + 1;
    setAddresses(prev => [...prev, { 
      id: newId, 
      address: '', 
      coordinates: null, 
      isStartPoint: false 
    }]);
  };

  const handleRemoveAddress = (id) => {
    const addressToRemove = addresses.find(addr => addr.id === id);
    if (addressToRemove?.isStartPoint) return; // Prevent removing start point
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  const handleFindCoordinates = async (id) => {
    const address = addresses.find(addr => addr.id === id);
    if (!address?.address.trim()) return;

    setLoadingStates(prev => ({ ...prev, [id]: true }));
    
    try {
      const coordinates = await findCoordinates(address.address);
      setAddresses(prev => prev.map(addr => 
        addr.id === id 
          ? { 
              ...addr, 
              coordinates, 
              error: coordinates ? null : 'לא נמצאו קואורדינטות לכתובת זו'
            }
          : addr
      ));
    } catch (error) {
      setAddresses(prev => prev.map(addr => 
        addr.id === id 
          ? { ...addr, coordinates: null, error: 'שגיאה בחיפוש הכתובת' }
          : addr
      ));
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  useEffect(() => {
    const validAddresses = addresses.filter(addr => addr.coordinates);
    const startPoint = addresses.find(addr => addr.isStartPoint && addr.coordinates);
    
    if (validAddresses.length >= 2 && startPoint) {
      const result = algorithm === 'genetic' 
        ? findRouteGenetic(validAddresses, startPoint, geneticParams)
        : findRouteNearestNeighbor(validAddresses, startPoint);
      
      setOptimizedRoute(result.route);
      setTotalDistance(result.totalDistance);
    } else {
      setOptimizedRoute([]);
      setTotalDistance(0);
    }
  }, [addresses, algorithm, geneticParams]);

  return (
    <div className="p-4 max-w-4xl mx-auto" dir="rtl">
      <h2 className="text-2xl font-bold mb-4">אופטימיזציית מסלול</h2>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <AlgorithmSelector 
            value={algorithm}
            onValueChange={setAlgorithm}
          />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowGeneticControls(!showGeneticControls)}
            className={algorithm === 'genetic' ? 'bg-blue-100' : ''}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {showGeneticControls && algorithm === 'genetic' && (
          <GeneticControls 
            params={geneticParams} 
            onChange={setGeneticParams}
          />
        )}

        <div className="space-y-4">
          {addresses.map(addr => (
            <div key={addr.id} className="flex gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={addr.address}
                    onChange={(e) => handleAddressChange(addr.id, e.target.value)}
                    onBlur={() => handleFindCoordinates(addr.id)}
                    placeholder={addr.isStartPoint ? "נקודת התחלה..." : "הכנס כתובת..."}
                    className={`w-full p-2 border rounded ${addr.error ? 'border-red-500' : ''} ${addr.isStartPoint ? 'bg-blue-50' : ''}`}
                  />
                  {loadingStates[addr.id] && (
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                    </div>
                  )}
                  {addr.error && (
                    <div className="text-red-500 text-sm mt-1">{addr.error}</div>
                  )}
                </div>
              </div>
              
              {addr.coordinates && (
                <div className="text-sm text-gray-500">
                  {addr.coordinates[0].toFixed(4)}, {addr.coordinates[1].toFixed(4)}
                </div>
              )}

              {!addr.isStartPoint && (
                <button 
                  onClick={() => handleRemoveAddress(addr.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-4">
          <Button
            onClick={handleAddAddress}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            הוסף כתובת
          </Button>

          {optimizedRoute.length >= 2 && (
            <NavigationMap optimizedRoute={optimizedRoute} />
          )}
        </div>
      </div>

      {optimizedRoute.length >= 2 && (
        <RouteDisplay
          optimizedRoute={optimizedRoute}
          totalDistance={totalDistance}
        />
      )}
    </div>
  );
};

export default RouteOptimizer;