import {
  Engine,
  EngineAutocompleteResult,
  EngineResult,
  ParsedResult,
  SafeSearch,
  SearchEngine
} from '../interfaces';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as xmljs from 'xml-js';
import { Element } from 'xml-js';

const Google_SS = {
  [SafeSearch.Off]: 'off',
  [SafeSearch.Medium]: 'medium',
  [SafeSearch.High]: 'high'
};

class Google extends Engine {
  #url: URL = new URL('https://google.com/search');
  #autocompleteURL = new URL(
    'https://suggestqueries.google.com/complete/search'
  );
  #results: ParsedResult[] = [];
  #suggestion?: string;

  constructor(query: string, page: number, safesearch: SafeSearch) {
    super(query, page, safesearch);
    this.#url.searchParams.set('q', query);
    this.#url.searchParams.set('ie', 'utf8');
    this.#url.searchParams.set('oe', 'utf8');
    this.#url.searchParams.set('safe', Google_SS[safesearch]);
    this.#url.searchParams.set('start', String((page - 1) * 10));
    this.#autocompleteURL.searchParams.set('client', 'toolbar');
    this.#autocompleteURL.searchParams.set('q', query);
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

      this.#suggestion = $('.card-section > a').first().text();

      $('div[class="g"]').each((_, result) => {
        $ = cheerio.load($(result).toString());

        const title = $('h3').first().text().trim();
        const link = $('div[class="yuRUbf"] > a').first().attr('href')?.trim();
        const content = $('div[class="IsZvec"]').first().text().trim();

        this.#results.push({
          title,
          link,
          content,
          engine: SearchEngine.Google
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

      const json = xmljs.xml2js(request.data);

      const result: string[] = [];

      json.elements[0].elements.forEach((el: Element) => {
        if (el.name == 'CompleteSuggestion') {
          el.elements?.forEach((el) => {
            if (el.name == 'suggestion') {
              result.push(<string>el.attributes?.data);
            }
          });
        }
      });

      return {
        results: result,
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

export default Google;
