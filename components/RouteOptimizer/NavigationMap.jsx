import React from 'react';
import { Button } from "../ui/button";
import { Map } from 'lucide-react';

const NavigationMap = ({ optimizedRoute }) => {
  const openGoogleMaps = () => {
    const waypoints = optimizedRoute.map(point => {
      if (point.coordinates) {
        const [lat, lng] = point.coordinates;
        return `${lat},${lng}`;
      }
      return null;
    }).filter(Boolean);

    if (waypoints.length < 2) return;

    const origin = waypoints[0];
    const destination = waypoints[waypoints.length - 1];
    const middlePoints = waypoints.slice(1, -1);

    let url = `https://www.google.com/maps/dir/?api=1`;
    url += `&origin=${origin}`;
    url += `&destination=${destination}`;
    
    if (middlePoints.length > 0) {
      url += `&waypoints=${middlePoints.join('|')}`;
    }

    url += '&travelmode=driving';
    window.open(url, '_blank');
  };

  return (
    <Button
      onClick={openGoogleMaps}
      className="flex items-center gap-2"
      disabled={!optimizedRoute || optimizedRoute.length < 2}
    >
      <Map className="h-4 w-4" />
      פתח ניווט במפות Google
    </Button>
  );
};

export default NavigationMap;