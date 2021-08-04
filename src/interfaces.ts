export enum SearchEngine {
  Google,
  DuckDuckGo,
  Yahoo,
  Qwant,
  Bing
}

export enum SafeSearch {
  Off,
  Medium,
  High
}

export class Engine {
  #results: ParsedResult[] = [];
  #suggestion?: string;
  #query?: string;
  #page?: number;
  #safesearch: SafeSearch;

  constructor(query: string, page = 1, safesearch = SafeSearch.Off) {
    this.#query = query;
    this.#page = page;
    this.#safesearch = safesearch;
  }
  async search(): Promise<EngineResult> {
    console.error('Not implemented !');
    return {
      results: this.#results,
      suggestion: this.#suggestion,
      error: false
    };
  }
  async autocomplete(): Promise<EngineAutocompleteResult> {
    console.error('Not implemented ! ');
    return { results: [], error: false };
  }
}

export interface ParsedResult {
  title: string;
  link?: string;
  content: string;
  engine: SearchEngine;
}

export interface EngineResult {
  results: ParsedResult[];
  suggestion?: string;
  error: boolean;
}

export interface EngineAutocompleteResult {
  results: string[];
  error: boolean;
}

export interface Results {
  results: ParsedResult[];
  suggestion?: string;
  length: number;
  times: string;
}

export interface AutocompleteResults {
  results: string[];
  times: string;
  length: number;
}
