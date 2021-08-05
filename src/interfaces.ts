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

export enum Language {
  'af-ZA',
  'ar-EG',
  'be-BY',
  'bg-BG',
  'ca-ES',
  'cs-CZ',
  'da-DK',
  'de',
  'de-AT',
  'de-CH',
  'de-DE',
  'el-GR',
  'en',
  'en-AU',
  'en-CA',
  'en-GB',
  'en-IE',
  'en-IN',
  'en-NZ',
  'en-US',
  'es',
  'es-AR',
  'es-CL',
  'es-ES',
  'es-MX',
  'et-EE',
  'fa-IR',
  'fi-FI',
  'fr',
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
  'nl',
  'nl-BE',
  'nl-NL',
  'pl-PL',
  'pt',
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
  'zh',
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
    language = Language.en
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
}

export interface EngineResult {
  results: ParsedResult[];
  suggestion?: string;
  infobox?: Infobox;
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
}

export interface EngineImagesResult {
  results: Images[];
  error: boolean;
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
}

export interface EngineVideosResult {
  results: Videos[];
  error: boolean;
}

export interface VideoResults {
  results: Videos[];
  times: string;
  length: number;
}
