import {
  Engine,
  EngineAutocompleteResult,
  EngineResult,
  Language,
  ParsedResult,
  SafeSearch,
  SearchEngine
} from '../interfaces';
import axios from 'axios';
import * as cheerio from 'cheerio';

class Qwant extends Engine {
  #url: URL = new URL('https://lite.qwant.com/');
  #autocompleteURL = new URL('https://api.qwant.com/api/suggest');
  #results: ParsedResult[] = [];
  #suggestion?: string;

  constructor(
    query: string,
    page: number,
    safesearch: SafeSearch,
    language: Language
  ) {
    super(query, page);
    this.#url.searchParams.set('q', query);
    this.#url.searchParams.set('p', String(page));
    let lang = Language[language].toLowerCase();
    if (lang.split('-').length > 1) {
      const split = lang.split('-');
      lang = `${split[0]}_${split[1]}`;
    } else {
      lang = `${lang}_${lang}`;
    }
    this.#url.searchParams.set('locale', lang);
    this.#autocompleteURL.searchParams.set('q', query);
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

      $('article.web.result').each((_, result) => {
        $ = cheerio.load($(result).toString());

        const title = $('h2 > a').first().text().trim();
        const link = $('p.url').first().text().trim();
        const content = $('p.desc').first().text().trim();

        this.#results.push({
          title,
          link,
          content,
          engine: SearchEngine.Qwant
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

  async autocomplete(): Promise<EngineAutocompleteResult> {
    try {
      const request = await axios.get(this.#autocompleteURL.toString(), {
        timeout: 500,
        headers: {
          'User-Agent':
            'User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
        }
      });

      const results: string[] = [];

      request.data.data.items.forEach(
        (result: { value: string; suggestType: number }) => {
          results.push(result.value);
        }
      );

      return { results, error: false };
    } catch {
      return {
        results: [],
        error: true
      };
    }
  }
}

export default Qwant;
