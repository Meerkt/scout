import {
  Engine,
  EngineAutocompleteResult,
  EngineImagesResult,
  EngineNewsResult,
  EngineResult,
  EngineVideosResult,
  Infobox,
  Language,
  SafeSearch,
  SearchEngine
} from '../interfaces';
import axios from 'axios';

class Wikipedia extends Engine {
  #url: URL = new URL('https://en.wikipedia.org/api/rest_v1/page/summary/');

  constructor(
    query: string,
    page: number,
    safesearch: SafeSearch,
    language: Language
  ) {
    super(query, page, safesearch, language);
    let lang = Language[language];
    if (lang.split('-').length > 1) {
      lang = lang.split('-')[0];
    }
    this.#url = new URL(
      `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${query}`
    );
  }

  async search(): Promise<EngineResult> {
    try {
      const request = await axios.get(this.#url.toString(), {
        timeout: 2000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
        }
      });
      const infobox: Infobox = {
        title: request.data.title,
        content: request.data.extract,
        link: request.data.content_urls.desktop.page,
        source: 'Wikipedia',
        engine: SearchEngine.Wikipedia
      };

      return {
        results: [],
        suggestion: undefined,
        error: false,
        infobox
      };
    } catch {
      return {
        results: [],
        suggestion: undefined,
        error: true
      };
    }
  }

  async search_image(): Promise<EngineImagesResult> {
    return { results: [], error: false };
  }

  async search_video(): Promise<EngineVideosResult> {
    return { results: [], error: false };
  }

  async search_news(): Promise<EngineNewsResult> {
    return { results: [], error: false };
  }

  async autocomplete(): Promise<EngineAutocompleteResult> {
    return { results: [], error: false };
  }
}

export default Wikipedia;
