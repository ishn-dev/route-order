export default async function handler(req, res) {
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }
  
    try {
      // Add rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      const fullAddress = `${address}, Israel`;
      const encodedAddress = encodeURIComponent(fullAddress);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
        {
          headers: {
            'Accept-Language': 'he',
            'User-Agent': 'RouteOptimizer/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Nominatim API error');
      }
  
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Geocoding error:', error);
      res.status(500).json({ error: 'Failed to fetch coordinates' });
    }
  }