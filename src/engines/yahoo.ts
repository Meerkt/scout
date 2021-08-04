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

class Yahoo extends Engine {
  #url: URL = new URL('https://search.yahoo.com/search');
  #results: ParsedResult[] = [];
  #suggestion?: string;

  constructor(
    query: string,
    page: number,
    safesearch: SafeSearch,
    language: Language
  ) {
    super(query, page);
    this.#url.searchParams.set('p', query);
    this.#url.searchParams.set('b', String((page - 1) * 10 + 1));
    let lang = Language[language];
    if (lang.split('-').length > 1) {
      lang = `lang_${lang.split('-')[0]}`;
    } else {
      lang = `lang_${lang}`;
    }
    this.#url.searchParams.set('vl', lang);
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

      this.#suggestion = $('.stxt > a.fc-blue').first().text().trim();

      $('li > div.dd').each((_, result) => {
        $ = cheerio.load($(result).toString());

        const title = $('h3.title > a').first().text().trim();
        const link = $('span.fz-ms.fw-m').first().text().trim().split(' ')[0];
        const content = $('p.fz-ms').first().text().trim();

        this.#results.push({
          title,
          link,
          content,
          engine: SearchEngine.Yahoo
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

export default Yahoo;
