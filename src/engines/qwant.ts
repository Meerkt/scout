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
const QWANT_SS = {
  [SafeSearch.Off]: 0,
  [SafeSearch.Medium]: 1,
  [SafeSearch.High]: 2
};

class Qwant extends Engine {
  #url: URL = new URL('https://lite.qwant.com/');
  #imageURL: URL = new URL('https://api.qwant.com/v3/search/images');
  #videoURL: URL = new URL('https://api.qwant.com/v3/search/videos');
  #autocompleteURL = new URL('https://api.qwant.com/api/suggest');
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
    this.#url.searchParams.set('p', String(page));
    let lang = Language[language].toLowerCase();
    if (lang.split('-').length > 1) {
      const split = lang.split('-');
      lang = `${split[0]}_${split[1]}`;
    } else {
      lang = `${lang}_${lang}`;
    }
    this.#url.searchParams.set('locale', lang);

    this.#imageURL.searchParams.set('count', String(10));
    this.#imageURL.searchParams.set('offset', String((page - 1) * 10));
    this.#imageURL.searchParams.set('locale', lang);
    this.#imageURL.searchParams.set('t', 'images');
    this.#imageURL.searchParams.set('q', query);
    this.#imageURL.searchParams.set('safesearch', String(QWANT_SS[safesearch]));

    this.#videoURL.searchParams.set('count', String(10));
    this.#videoURL.searchParams.set('offset', String((page - 1) * 10));
    this.#videoURL.searchParams.set('locale', lang);
    this.#videoURL.searchParams.set('t', 'videos');
    this.#videoURL.searchParams.set('q', query);
    this.#videoURL.searchParams.set('safesearch', String(QWANT_SS[safesearch]));

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

  async search_image(): Promise<EngineImagesResult> {
    try {
      const request = await axios.get(this.#imageURL.toString(), {
        timeout: 2000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
        }
      });

      const results: Images[] = [];

      request.data.data.result.items.forEach(
        (item: { media: string } & Images) => {
          results.push({
            url: item.url,
            title: item.title,
            thumbnail: item.thumbnail,
            image: item.media
          });
        }
      );

      return { results: results, error: false };
    } catch {
      return { results: [], error: true };
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

      const results: Videos[] = [];

      request.data.data.result.items.forEach((item: Video) => {
        results.push({
          thumbnail: item.thumbnail,
          title: item.title,
          desc: item.desc,
          source: item.source,
          url: item.url
        });
      });

      return { results, error: false };
    } catch {
      return { results: [], error: true };
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
