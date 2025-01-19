import { calculateDistance } from './geocoding';
import _ from 'lodash';

export const findRouteNearestNeighbor = (points, startPoint) => {
  const validPoints = points.filter(p => p.coordinates);
  if (validPoints.length < 2) return { route: validPoints, totalDistance: 0 };

  // Start with the start point
  const route = [startPoint];
  const unvisited = validPoints.filter(p => p.id !== startPoint.id);
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

// Genetic Algorithm Functions
const createInitialPopulation = (points, startPoint, size) => {
  const population = [];
  const otherPoints = points.filter(p => p.id !== startPoint.id);
  
  for (let i = 0; i < size; i++) {
    // Always start with the start point
    population.push([startPoint, ..._.shuffle([...otherPoints])]);
  }
  return population;
};

const calculateFitness = (route) => {
  let totalDist = 0;
  for (let i = 0; i < route.length - 1; i++) {
    totalDist += calculateDistance(route[i].coordinates, route[i + 1].coordinates);
  }
  return 1 / totalDist; // Higher fitness for shorter routes
};

const crossover = (parent1, parent2) => {
  // Keep the start point fixed
  const startPoint = parent1[0];
  const otherPoints1 = parent1.slice(1);
  const otherPoints2 = parent2.slice(1);
  
  const crossoverPoint = Math.floor(Math.random() * (otherPoints1.length));
  const childOtherPoints = [...otherPoints1.slice(0, crossoverPoint)];
  
  // Add remaining points from parent2 in their order
  for (const point of otherPoints2) {
    if (!childOtherPoints.includes(point)) {
      childOtherPoints.push(point);
    }
  }
  
  return [startPoint, ...childOtherPoints];
};

const mutate = (route, mutationRate) => {
  if (Math.random() < mutationRate) {
    // Only mutate points after the start point
    const idx1 = Math.floor(Math.random() * (route.length - 1)) + 1;
    const idx2 = Math.floor(Math.random() * (route.length - 1)) + 1;
    [route[idx1], route[idx2]] = [route[idx2], route[idx1]];
  }
  return route;
};

export const findRouteGenetic = (points, startPoint, params) => {
  let population = createInitialPopulation(points, startPoint, params.populationSize);
  let bestRoute = null;
  let bestDistance = Infinity;

  for (let gen = 0; gen < params.generations; gen++) {
    const populationWithFitness = population.map(route => ({
      route,
      fitness: calculateFitness(route)
    }));

    populationWithFitness.sort((a, b) => b.fitness - a.fitness);

    const currentBestDistance = 1 / populationWithFitness[0].fitness;
    if (currentBestDistance < bestDistance) {
      bestDistance = currentBestDistance;
      bestRoute = [...populationWithFitness[0].route];
    }

    const eliteSize = Math.floor(params.populationSize * params.elitismRate);
    const newPopulation = populationWithFitness
      .slice(0, eliteSize)
      .map(({ route }) => [...route]);

    while (newPopulation.length < params.populationSize) {
      const parent1 = _.sample(populationWithFitness.slice(0, params.populationSize / 2)).route;
      const parent2 = _.sample(populationWithFitness.slice(0, params.populationSize / 2)).route;
      let child = crossover(parent1, parent2);
      child = mutate(child, params.mutationRate);
      newPopulation.push(child);
    }

    population = newPopulation;
  }

  return { 
    route: bestRoute || [startPoint, ...points.filter(p => p.id !== startPoint.id)],
    totalDistance: bestDistance === Infinity ? 0 : bestDistance
  };
};