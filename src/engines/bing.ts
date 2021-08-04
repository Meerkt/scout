import {
  Engine,
  EngineAutocompleteResult,
  EngineResult,
  ParsedResult,
  SearchEngine
} from '../interfaces';
import axios from 'axios';
import * as cheerio from 'cheerio';

class Bing extends Engine {
  #url: URL = new URL('https://www.bing.com/search');
  #results: ParsedResult[] = [];
  #suggestion?: string;

  constructor(query: string, page: number) {
    super(query, page);
    this.#url.searchParams.set('q', query);
    this.#url.searchParams.set('offset', String((page - 1) * 10 + 1));
  }

  async search(): Promise<EngineResult> {
    try {
      const request = await axios.get(this.#url.toString(), {
        timeout: 2000,
        headers: {
          'User-Agent':
            'User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
        }
      });

      let $ = cheerio.load(request.data);

      $('li.b_algo').each((_, result) => {
        $ = cheerio.load($(result).toString());

        const title = $('h2').first().text().trim();
        const link = $('div.b_attribution').first().text().trim();
        const content = $('p').first().text().trim();

        this.#results.push({
          title,
          link,
          content,
          engine: SearchEngine.Bing
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
    return { results: [], error: false };
  }
}

export default Bing;
