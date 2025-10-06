import type { SearchResult } from './types';

export const MOCK_SEARCH_RESULTS: SearchResult[] = [
 
];

export const SOURCES = [...new Set(MOCK_SEARCH_RESULTS.map(r => r.source))];
export const TYPES = [...new Set(MOCK_SEARCH_RESULTS.map(r => r.type))];
export const SPECIES = [...new Set(MOCK_SEARCH_RESULTS.flatMap(r => r.species))];
export const EXPERIMENT_TYPES = [...new Set(MOCK_SEARCH_RESULTS.map(r => r.experimentType))];
