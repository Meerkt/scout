import {
  Engine,
  EngineAutocompleteResult,
  EngineImagesResult,
  EngineNewsResult,
  EngineResult,
  EngineVideosResult,
  Language,
  ParsedResult,
  SafeSearch,
  SearchEngine
} from '../interfaces';
import axios from 'axios';
import * as cheerio from 'cheerio';

class DuckDuckGo extends Engine {
  #url: URL = new URL('https://html.duckduckgo.com/html');
  #autocompleteURL = new URL('https://ac.duckduckgo.com/ac/');
  #results: ParsedResult[] = [];
  #suggestion?: string;

  constructor(
    query: string,
    page: number,
    safesearch: SafeSearch,
    language: Language
  ) {
    super(query, page, safesearch, language);
    this.#url.searchParams.set('q', query);
    let lang = Language[language].toLowerCase();
    if (lang.split('-').length > 1) {
      const split = lang.split('-');
      lang = `${split[1]}-${split[0]}`;
    } else {
      lang = `${lang}-${lang}`;
    }
    this.#url.searchParams.set('kl', lang);
    this.#autocompleteURL.searchParams.set('q', query);
    this.#autocompleteURL.searchParams.set('type', 'list');
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

      let $ = cheerio.load(request.data);

      $('div.result').each((_, result) => {
        $ = cheerio.load($(result).toString());

        const title = $('h2.result__title').first().text().trim();
        const link = $('a.result__url').first().attr('href');
        const content = $('a.result__snippet').first().text().trim();

        this.#results.push({
          title,
          link,
          content,
          engine: SearchEngine.DuckDuckGo
        });
      });

      return {
        results: this.#results,
        suggestion: this.#suggestion,
        error: false
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
    try {
      const request = await axios.get(this.#autocompleteURL.toString(), {
        timeout: 500,
        headers: {
          'User-Agent':
            'User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
        }
      });

      return {
        results: request.data[1],
        error: false
      };
    } catch {
      return {
        results: [],
        error: true
      };
    }
  }
}

export default DuckDuckGo;
