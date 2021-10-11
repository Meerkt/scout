import {
  Engine,
  EngineAutocompleteResult,
  EngineImagesResult,
  EngineNewsResult,
  EngineResult,
  EngineVideosResult,
  Images,
  Language,
  News,
  ParsedResult,
  SafeSearch,
  SearchEngine,
  Videos
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

  constructor(
    query: string,
    page: number,
    safesearch: SafeSearch,
    language: Language
  ) {
    super(query, page, safesearch, language);
    this.#url.searchParams.set('q', query);
    this.#url.searchParams.set('ie', 'utf8');
    this.#url.searchParams.set('oe', 'utf8');
    this.#url.searchParams.set('safe', Google_SS[safesearch]);
    this.#url.searchParams.set('start', String((page - 1) * 10));

    let lang = Language[language];
    if (lang.split('-').length > 1) {
      lang = `lang_${lang.split('-')[0]}`;
    } else {
      lang = `lang_${lang}`;
    }

    this.#url.searchParams.set('lr', lang);
    this.#url.searchParams.set('hl', lang.split('_')[1]);
    this.#autocompleteURL.searchParams.set('client', 'toolbar');
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

      const $ = cheerio.load(request.data);

      this.#suggestion = $('.card-section > a').first().text();

      /*
      const infobox = $('div.osrp-blk').first();

      let infobox_result: Infobox | undefined = undefined;

      if (infobox.length === 1) {
        const $$ = cheerio.load($(infobox).toString());

        const title = $$('h2 > span').first().text().trim();
        const content = $$('.kno-rdesc > span').first().text().trim();
        const source = $$('.kno-rdesc > span > a').first().text().trim();
        const link = $$('.kno-rdesc > span > a').first().attr('href')?.trim();

        infobox_result = {
          title,
          content,
          source,
          link
        };
      }*/

      $('div[class="g"]').each((_, result) => {
        const $$ = cheerio.load($(result).toString());

        const title = $$('h3').first().text().trim();
        const link = $$('div[class="yuRUbf"] > a').first().attr('href')?.trim();
        const content = $$('div[class="IsZvec"]').first().text().trim();

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
        error: false,
        engine: SearchEngine.Google
      };
    } catch {
      return {
        results: [],
        suggestion: undefined,
        error: true,
        engine: SearchEngine.Google
      };
    }
  }

  async search_image(): Promise<EngineImagesResult> {
    this.#url.searchParams.set('tbm', 'isch');
    try {
      const request = await axios.get(this.#url.toString(), {
        timeout: 2000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (MSIE 10.0; Windows NT 6.1; Trident/5.0)'
        }
      });

      const $ = cheerio.load(request.data);
      const results: Images[] = [];

      $('td.e3goi').each((_, result) => {
        const $$ = cheerio.load($(result).toString());

        const title = $$('span.fYyStc').first().text().trim();
        const thumbnail = $$('img.yWs4tf').first().attr('src');
        const link = $$('a').first().attr('href');
        const url =
          new URL(`https://google.com${link}`).searchParams.get('url') ||
          undefined;
        results.push({
          url: url,
          title: title,
          thumbnail: thumbnail,
          image: thumbnail,
          engine: SearchEngine.Google
        });
      });
      return { results: results, error: false, engine: SearchEngine.Google };
    } catch {
      return { results: [], error: true, engine: SearchEngine.Google };
    }
  }

  async search_video(): Promise<EngineVideosResult> {
    this.#url.searchParams.set('tbm', 'vid');
    try {
      const request = await axios.get(this.#url.toString(), {
        timeout: 2000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (MSIE 10.0; Windows NT 6.1; Trident/5.0)'
        }
      });

      const $ = cheerio.load(request.data);
      const results: Videos[] = [];

      $('div.ezO2md').each((_, result) => {
        const $$ = cheerio.load($(result).toString());

        const title = $$('span.CVA68e').first().text().trim();
        const link = $$('a.fuLhoc').first().attr('href');
        const url =
          new URL(`https://google.com${link}`).searchParams.get('url') ||
          undefined;
        const thumbnail = $$('img.iUhyd').first().attr('src') || '';
        const source = $$('span.fYyStc').first().text().trim().split(' ')[0];

        results.push({
          title,
          url,
          thumbnail,
          source,
          desc: source,
          engine: SearchEngine.Google
        });
      });
      return { results: results, error: false, engine: SearchEngine.Google };
    } catch {
      return { results: [], error: true, engine: SearchEngine.Google };
    }
  }

  async search_news(): Promise<EngineNewsResult> {
    this.#url.searchParams.set('tbm', 'nws');
    try {
      const request = await axios.get(this.#url.toString(), {
        timeout: 2000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (MSIE 10.0; Windows NT 6.1; Trident/5.0)'
        }
      });

      const $ = cheerio.load(request.data);
      const results: News[] = [];

      $('div.ezO2md').each((_, result) => {
        const $$ = cheerio.load($(result).toString());

        const title = $$('span.CVA68e').first().text().trim();
        const thumbnail = $$('img.iUhyd').first().attr('src') || '';
        const link = $$('a.fuLhoc').first().attr('href');
        const url =
          new URL(`https://google.com${link}`).searchParams.get('url') ||
          undefined;
        const source = $$('span.fYyStc').first().text().trim();

        results.push({
          title,
          source,
          url,
          thumbnail,
          engine: SearchEngine.Google
        });
      });
      return { results: results, error: false, engine: SearchEngine.Google };
    } catch {
      return { results: [], error: true, engine: SearchEngine.Google };
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
        error: false,
        engine: SearchEngine.Google
      };
    } catch {
      return {
        results: [],
        error: true,
        engine: SearchEngine.Google
      };
    }
  }
}

export default Google;
