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

class Bing extends Engine {
  #url: URL = new URL('https://www.bing.com/search');
  #imageURL: URL = new URL('https://www.bing.com/images/search');
  #videoURL: URL = new URL('https://www.bing.com/videos/search');
  #results: ParsedResult[] = [];
  #suggestion?: string;

  constructor(
    query: string,
    page: number,
    safesearch: SafeSearch,
    language: Language
  ) {
    super(query, page, safesearch, language);

    let lang = Language[language];
    if (lang.split('-').length > 1) {
      lang = lang.split('-')[0].toUpperCase();
    } else {
      lang = lang.toUpperCase();
    }

    this.#url.searchParams.set('q', `language:${lang} ${query}`);
    this.#url.searchParams.set('first', String((page - 1) * 10 + 1));

    this.#imageURL.searchParams.set('q', `language:${lang} ${query}`);
    this.#imageURL.searchParams.set('first', String((page - 1) * 10 + 1));
    this.#imageURL.searchParams.set('tsc', 'ImageHoverTitle');

    this.#videoURL.searchParams.set('q', `language:${lang} ${query}`);
    this.#videoURL.searchParams.set('first', String((page - 1) * 10 + 1));
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

  async search_image(): Promise<EngineImagesResult> {
    // Bing return NSFW/nonsense stuff, so skipping for now
    /*try {
      const request = await axios.get(this.#imageURL.toString(), {
        timeout: 2000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (MSIE 10.0; Windows NT 6.1; Trident/5.0)'
        }
      });

      const $ = cheerio.load(request.data);

      $('div.item').each((_, result) => {
        const $$ = cheerio.load($(result).toString());

        const image = $$('a.thumb').first().attr('href');
        const thumbnail = $$('img').first().attr('src');
        const link = $$('a.tit').first().attr('href');
        const title = $$('div.des').first().text().trim();

        console.log(title);
      });

      return { results: [], error: false };
    } catch {
      return { results: [], error: true };
    }*/
    return { results: [], error: false };
  }

  async search_video(): Promise<EngineVideosResult> {
    // Bing return NSFW/nonsense stuff, so skipping for now
    /*try {
      const request = await axios.get(this.#videoURL.toString(), {
        timeout: 2000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (MSIE 10.0; Windows NT 6.1; Trident/5.0)'
        }
      });

      const $ = cheerio.load(request.data);

      $('td.resultCell').each((_, result) => {
        const $$ = cheerio.load($(result).toString());

        const title = $$('div.title').first().text().trim();

        console.log(title);
      });

      return { results: [], error: false };
    } catch {
      return { results: [], error: true };
    }*/
    return { results: [], error: false };
  }

  async search_news(): Promise<EngineNewsResult> {
    // Bing return NSFW/nonsense stuff, so skipping for now
    return { results: [], error: false };
  }

  async autocomplete(): Promise<EngineAutocompleteResult> {
    return { results: [], error: false };
  }
}

export default Bing;
