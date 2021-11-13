export enum SearchEngine {
  Google,
  DuckDuckGo,
  Yahoo,
  Qwant,
  Bing,
  Wikipedia,
  Brave
}

export enum SafeSearch {
  Off,
  Medium,
  High
}

export enum Language {
  'af-ZA',
  'ar-EG',
  'be-BY',
  'bg-BG',
  'ca-ES',
  'cs-CZ',
  'da-DK',
  'de-AT',
  'de-CH',
  'de-DE',
  'el-GR',
  'en-AU',
  'en-CA',
  'en-GB',
  'en-IE',
  'en-IN',
  'en-NZ',
  'en-US',
  'es-AR',
  'es-CL',
  'es-ES',
  'es-MX',
  'et-EE',
  'fa-IR',
  'fi-FI',
  'fr-BE',
  'fr-CA',
  'fr-CH',
  'fr-FR',
  'he-IL',
  'hr-HR',
  'hu-HU',
  'hy-AM',
  'id-ID',
  'is-IS',
  'it-IT',
  'ja-JP',
  'ko-KR',
  'lt-LT',
  'lv-LV',
  'nb-NO',
  'nl-BE',
  'nl-NL',
  'pl-PL',
  'pt-BR',
  'pt-PT',
  'ro-RO',
  'ru-RU',
  'sk-SK',
  'sl-SI',
  'sr-RS',
  'sv-SE',
  'sw-TZ',
  'th-TH',
  'tr-TR',
  'uk-UA',
  'vi-VN',
  'zh-CN',
  'zh-HK',
  'zh-TW'
}

export class Engine {
  #query?: string;
  #page?: number;
  #safesearch: SafeSearch;
  #language: Language;

  constructor(
    query: string,
    page = 1,
    safesearch = SafeSearch.Off,
    language = Language['en-US']
  ) {
    this.#query = query;
    this.#page = page;
    this.#safesearch = safesearch;
    this.#language = language;
  }
  async search(): Promise<EngineResult> {
    console.error('Not implemented !');
    return {
      results: [],
      suggestion: undefined,
      error: false
    };
  }

  async search_image(): Promise<EngineImagesResult> {
    console.error('Not implemented !');
    return { results: [], error: false };
  }

  async search_video(): Promise<EngineVideosResult> {
    console.error('Not implemented !');
    return { results: [], error: false };
  }

  async search_news(): Promise<EngineNewsResult> {
    console.error('Not implemented !');
    return { results: [], error: false };
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

export interface Infobox {
  title: string;
  content: string;
  source: string;
  link?: string;
  engine: SearchEngine;
}

export interface EngineResult {
  results: ParsedResult[];
  suggestion?: string;
  infobox?: Infobox;
  error: boolean;
  engine?: SearchEngine;
}

export interface EngineAutocompleteResult {
  results: string[];
  error: boolean;
  engine?: SearchEngine;
}

export interface Results {
  results: ParsedResult[];
  suggestion?: string;
  length: number;
  times: string;
  infobox?: Infobox;
}

export interface AutocompleteResults {
  results: string[];
  times: string;
  length: number;
}

export interface Images {
  title: string;
  thumbnail?: string;
  image?: string;
  url?: string;
  engine: SearchEngine;
}

export interface EngineImagesResult {
  results: Images[];
  error: boolean;
  engine?: SearchEngine;
}

export interface ImageResults {
  results: Images[];
  times: string;
  length: number;
}

export interface Videos {
  thumbnail: string;
  url?: string;
  title: string;
  source: string;
  desc: string;
  engine: SearchEngine;
}

export interface EngineVideosResult {
  results: Videos[];
  error: boolean;
  engine?: SearchEngine;
}

export interface VideoResults {
  results: Videos[];
  times: string;
  length: number;
}

export interface News {
  thumbnail: string;
  url?: string;
  title: string;
  source: string;
  description: string;
  engine: SearchEngine;
}

export interface EngineNewsResult {
  results: News[];
  error: boolean;
  engine?: SearchEngine;
}

export interface NewsResults {
  results: News[];
  times: string;
  length: number;
}
