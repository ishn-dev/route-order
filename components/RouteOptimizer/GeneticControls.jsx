import React from 'react';

const GeneticControls = ({ params, onChange }) => {
  return (
    <div className="mb-4 p-4 bg-gray-50 rounded">
      <h4 className="font-semibold mb-2 text-right">פרמטרים לאלגוריתם הגנטי</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-right">גודל אוכלוסייה:</label>
          <input
            type="number"
            value={params.populationSize}
            onChange={(e) => onChange({
              ...params,
              populationSize: parseInt(e.target.value)
            })}
            className="w-full p-2 border rounded text-right"
            min="10"
            max="500"
          />
        </div>
        <div>
          <label className="block text-right">מספר דורות:</label>
          <input
            type="number"
            value={params.generations}
            onChange={(e) => onChange({
              ...params,
              generations: parseInt(e.target.value)
            })}
            className="w-full p-2 border rounded text-right"
            min="10"
            max="1000"
          />
        </div>
        <div>
          <label className="block text-right">שיעור מוטציה:</label>
          <input
            type="number"
            value={params.mutationRate}
            onChange={(e) => onChange({
              ...params,
              mutationRate: parseFloat(e.target.value)
            })}
            className="w-full p-2 border rounded text-right"
            step="0.01"
            min="0"
            max="1"
          />
        </div>
        <div>
          <label className="block text-right">שיעור אליטיזם:</label>
          <input
            type="number"
            value={params.elitismRate}
            onChange={(e) => onChange({
              ...params,
              elitismRate: parseFloat(e.target.value)
            })}
            className="w-full p-2 border rounded text-right"
            step="0.01"
            min="0"
            max="1"
          />
        </div>
      </div>
    </div>
  );
};

export default GeneticControls;