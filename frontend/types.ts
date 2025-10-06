
export interface SearchResult {
  id: number;
  title: string;
  url: string;
  description: string;
  summary?: string;
  source: string;
  tags: string[];
  publicationDate: string;
  authors: string[];
  type: string;
  species: string[];
  experimentType: string;
  citationCount: number;
  status: 'Completed' | 'Ongoing' | null;
  journal?: string;
  isLoading?: boolean;
}

export interface AIResponseData {
  feedback: string;
  recommendations: {
    id: number;
    reason: string;
  }[];
}

// FIX: Export the 'ChatMessage' type to be used in the ChatBot component.
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
  recommendations?: {
    id: number;
    title: string;
  }[];
}