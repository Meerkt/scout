import {
  Engine,
  EngineAutocompleteResult,
  EngineImagesResult,
  EngineResult,
  EngineVideosResult,
  Images,
  Language,
  ParsedResult,
  SafeSearch,
  SearchEngine,
  Videos
} from '../interfaces';
import axios from 'axios';
import * as cheerio from 'cheerio';

class Yahoo extends Engine {
  #url: URL = new URL('https://search.yahoo.com/search');
  #imageURL: URL = new URL('https://images.search.yahoo.com/images/search');
  #videoURL: URL = new URL('https://video.search.yahoo.com/search/video');
  #results: ParsedResult[] = [];
  #suggestion?: string;

  constructor(
    query: string,
    page: number,
    safesearch: SafeSearch,
    language: Language
  ) {
    super(query, page, safesearch, language);
    this.#url.searchParams.set('p', query);
    this.#url.searchParams.set('b', String((page - 1) * 10 + 1));
    let lang = Language[language];
    if (lang.split('-').length > 1) {
      lang = `lang_${lang.split('-')[0]}`;
    } else {
      lang = `lang_${lang}`;
    }
    this.#url.searchParams.set('vl', lang);

    this.#imageURL.searchParams.set('p', query);
    this.#imageURL.searchParams.set('b', String((page - 1) * 10 + 1));
    this.#imageURL.searchParams.set('vl', lang);

    this.#videoURL.searchParams.set('p', query);
    this.#videoURL.searchParams.set('b', String((page - 1) * 10 + 1));
    this.#videoURL.searchParams.set('vl', lang);
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

  async search_image(): Promise<EngineImagesResult> {
    try {
      const request = await axios.get(this.#imageURL.toString(), {
        timeout: 2000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
        }
      });

      const $ = cheerio.load(request.data);

      const results: Images[] = [];

      $('li.ld').each((_, result) => {
        const data = JSON.parse(result.attribs['data']);
        results.push({
          url: data.rurl,
          title: data.alt,
          thumbnail: data.ith,
          image: data.iurl
        });
      });

      return {
        results: results,
        error: false
      };
    } catch {
      return {
        results: [],
        error: true
      };
    }
  }

  async search_video(): Promise<EngineVideosResult> {
    try {
      const request = await axios.get(this.#videoURL.toString(), {
        timeout: 2000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
        }
      });

      const $ = cheerio.load(request.data);

      const results: Videos[] = [];

      $('li.vr').each((_, result) => {
        const $$ = cheerio.load($(result).toString());
        const vid = $$('a').first();

        const url = vid.attr('data-rurl') || '';
        const title = vid.attr('aria-label') || '';
        const thumbnail = $$('img').first().attr('src') || '';
        const source = $$('cite.url').first().text().trim();
        const desc = $$('div.v-age').first().text().trim();

        results.push({
          url,
          title,
          thumbnail,
          source,
          desc
        });
      });

      return {
        results: results,
        error: false
      };
    } catch {
      return {
        results: [],
        error: true
      };
    }
  }

  async autocomplete(): Promise<EngineAutocompleteResult> {
    return { results: [], error: false };
  }
}

export default Yahoo;
