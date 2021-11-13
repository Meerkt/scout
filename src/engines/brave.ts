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

const Brave_SS = {
  [SafeSearch.Off]: 'off',
  [SafeSearch.Medium]: 'moderate',
  [SafeSearch.High]: 'strict'
};

class Brave extends Engine {
  #url: URL = new URL('https://search.brave.com/search');
  #autocompleteURL = new URL('https://search.brave.com/api/suggest');
  #imageURL = new URL('https://search.brave.com/api/images');
  #videoURL = new URL('https://search.brave.com/videos');
  #newsURL = new URL('https://search.brave.com/news');
  #results: ParsedResult[] = [];
  #suggestion?: string;
  #lang = 'en-us';
  #safesearch = 'off';

  constructor(
    query: string,
    page: number,
    safesearch: SafeSearch,
    language: Language
  ) {
    super(query, page, safesearch, language);
    this.#url.searchParams.set('q', query);
    this.#imageURL.searchParams.set('q', query);
    this.#videoURL.searchParams.set('q', query);
    this.#newsURL.searchParams.set('q', query);

    this.#lang = Language[language];
    this.#safesearch = Brave_SS[safesearch];

    this.#autocompleteURL.searchParams.set('q', query);
  }

  async search(): Promise<EngineResult> {
    try {
      const request = await axios.get(this.#url.toString(), {
        timeout: 2000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
          Cookie: `safesearch=${this.#safesearch};ul_lang=${this.#lang}`
        }
      });

      const $ = cheerio.load(request.data);

      this.#suggestion = $('div[class="altered-query-text text-gray"] > a')
        .first()
        .text();

      $('div[class="snippet fdb"]').each((_, result) => {
        const $$ = cheerio.load($(result).toString());

        const title = $$('span[class="snippet-title"]').first().text().trim();
        const link = $$('a[class="result-header"]')
          .first()
          .attr('href')
          ?.trim();
        const content = $$('p[class="snippet-description"]')
          .first()
          .text()
          .trim();

        this.#results.push({
          title,
          link,
          content,
          engine: SearchEngine.Brave
        });
      });

      return {
        results: this.#results,
        suggestion: this.#suggestion,
        error: false,
        engine: SearchEngine.Brave
      };
    } catch {
      return {
        results: [],
        suggestion: undefined,
        error: true,
        engine: SearchEngine.Brave
      };
    }
  }

  async search_image(): Promise<EngineImagesResult> {
    try {
      const request = await axios.get(this.#imageURL.toString(), {
        timeout: 2000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (MSIE 10.0; Windows NT 6.1; Trident/5.0)'
        }
      });

      const results: Images[] = [];

      request.data.results.forEach(
        (image: {
          url: string;
          title: string;
          thumbnail: { src: string };
          properties: { url: string };
        }) => {
          results.push({
            url: image.url,
            title: image.title,
            thumbnail: image.thumbnail.src,
            image: image.properties.url,
            engine: SearchEngine.Brave
          });
        }
      );

      return { results: results, error: false, engine: SearchEngine.Brave };
    } catch {
      return { results: [], error: true, engine: SearchEngine.Brave };
    }
  }

  async search_video(): Promise<EngineVideosResult> {
    try {
      const request = await axios.get(this.#videoURL.toString(), {
        timeout: 2000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (MSIE 10.0; Windows NT 6.1; Trident/5.0)',
          Cookie: `safesearch=${this.#safesearch};ul_lang=${this.#lang}`
        }
      });

      const $ = cheerio.load(request.data);

      const results: Videos[] = [];

      $('div[class="card"]').each((_, result) => {
        const $$ = cheerio.load($(result).toString());

        const url = $$('a').first().attr('href')?.trim();
        const source = $$(
          'div[class="text-sm center-horizontally mb-6 anchor"]'
        )
          .first()
          .text()
          .trim();
        const title = $$('div[class="color-primary title"]')
          .first()
          .text()
          .trim();
        const thumbnail =
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          $$('div[class="img-bg"]')
            .first()
            .css('background-image')
            ?.trim()
            .match(/url\(["']?([^"']*)["']?\)/)[1] || '';
        const desc = $$('div[class="card-footer"]').first().text().trim();

        results.push({
          thumbnail: thumbnail,
          title: title,
          desc: desc,
          source: source,
          url: url,
          engine: SearchEngine.Brave
        });
      });

      return { results: results, error: false, engine: SearchEngine.Brave };
    } catch {
      return { results: [], error: true, engine: SearchEngine.Brave };
    }
  }

  async search_news(): Promise<EngineNewsResult> {
    try {
      const request = await axios.get(this.#newsURL.toString(), {
        timeout: 2000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (MSIE 10.0; Windows NT 6.1; Trident/5.0)',
          Cookie: `safesearch=${this.#safesearch};ul_lang=${this.#lang}`
        }
      });

      const $ = cheerio.load(request.data);
      const results: News[] = [];
      $('div[class="snippet"]').each((_, result) => {
        const $$ = cheerio.load($(result).toString());

        const title = $$('span[class="snippet-title"]').first().text().trim();
        const description = $$('p[class="snippet-description"]')
          .first()
          .text()
          .trim();
        const url = $$('a').first().attr('href')?.trim();
        const thumbnail =
          $$('img[class="thumb"]').first().attr('src')?.trim() || '';
        const source = $$('span[class="netloc"]').first().text().trim();

        results.push({
          title: title,
          source: source,
          url: url,
          thumbnail: thumbnail,
          engine: SearchEngine.Brave,
          description: description
        });
      });

      return { results: results, error: false, engine: SearchEngine.Brave };
    } catch {
      return { results: [], error: true, engine: SearchEngine.Brave };
    }
  }

  async autocomplete(): Promise<EngineAutocompleteResult> {
    try {
      const request = await axios.get(this.#autocompleteURL.toString(), {
        timeout: 500,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
          accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
        }
      });

      return {
        results: request.data[1],
        error: false,
        engine: SearchEngine.Brave
      };
    } catch (e) {
      return {
        results: [],
        error: true,
        engine: SearchEngine.Brave
      };
    }
  }
}

export default Brave;
