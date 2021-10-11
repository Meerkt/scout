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

const QWANT_SS = {
  [SafeSearch.Off]: 0,
  [SafeSearch.Medium]: 1,
  [SafeSearch.High]: 2
};

class Qwant extends Engine {
  #url: URL = new URL('https://api.qwant.com/v3/search/web');
  #imageURL: URL = new URL('https://api.qwant.com/v3/search/images');
  #videoURL: URL = new URL('https://api.qwant.com/v3/search/videos');
  #newsURL: URL = new URL('https://api.qwant.com/v3/search/news');
  #autocompleteURL = new URL('https://api.qwant.com/api/suggest');

  constructor(
    query: string,
    page: number,
    safesearch: SafeSearch,
    language: Language
  ) {
    super(query, page, safesearch, language);
    // Language
    let lang = Language[language].toLowerCase();
    if (lang.split('-').length > 1) {
      const split = lang.split('-');
      lang = `${split[0]}_${split[1]}`;
    } else {
      lang = `${lang}_${lang}`;
    }

    this.#url.searchParams.set('count', String(10));
    this.#url.searchParams.set('offset', String((page - 1) * 10));
    this.#url.searchParams.set('locale', lang);
    this.#url.searchParams.set('t', 'images');
    this.#url.searchParams.set('q', query);
    this.#url.searchParams.set('safesearch', String(QWANT_SS[safesearch]));

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

    this.#newsURL.searchParams.set('count', String(10));
    this.#newsURL.searchParams.set('offset', String((page - 1) * 10));
    this.#newsURL.searchParams.set('locale', lang);
    this.#newsURL.searchParams.set('t', 'news');
    this.#newsURL.searchParams.set('q', query);
    this.#newsURL.searchParams.set('safesearch', String(QWANT_SS[safesearch]));

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

      const results: ParsedResult[] = [];

      request.data.data.result.items.mainline.forEach(
        (mainline: {
          type: string;
          items: { title: string; url: string; desc: string }[];
        }) => {
          if (mainline.type === 'web') {
            mainline.items.forEach((item) => {
              results.push({
                title: item.title,
                link: item.url,
                content: item.desc,
                engine: SearchEngine.Qwant
              });
            });
          }
        }
      );

      let suggestion: string | undefined = undefined;

      if (request.data.data.query.queryContext.alteredQuery) {
        suggestion = request.data.data.query.queryContext.alteredQuery;
      }

      return {
        results: results,
        suggestion: suggestion,
        error: false,
        engine: SearchEngine.Qwant
      };
    } catch {
      return {
        results: [],
        suggestion: undefined,
        error: true,
        engine: SearchEngine.Qwant
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
            image: item.media,
            engine: SearchEngine.Qwant
          });
        }
      );

      return { results: results, error: false, engine: SearchEngine.Qwant };
    } catch {
      return { results: [], error: true, engine: SearchEngine.Qwant };
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

      request.data.data.result.items.forEach((item: Videos) => {
        results.push({
          thumbnail: item.thumbnail,
          title: item.title,
          desc: item.desc,
          source: item.source,
          url: item.url,
          engine: SearchEngine.Qwant
        });
      });

      return { results, error: false, engine: SearchEngine.Qwant };
    } catch {
      return { results: [], error: true, engine: SearchEngine.Qwant };
    }
  }

  async search_news(): Promise<EngineNewsResult> {
    try {
      const request = await axios.get(this.#newsURL.toString(), {
        timeout: 2000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
        }
      });

      const results: News[] = [];

      request.data.data.result.items.forEach(
        (
          item: { domain: string; media: { pict: { url: string } }[] } & News
        ) => {
          results.push({
            title: item.title,
            source: item.domain,
            url: item.url,
            thumbnail: item.media[0].pict.url,
            engine: SearchEngine.Qwant
          });
        }
      );

      return { results, error: false, engine: SearchEngine.Qwant };
    } catch {
      return { results: [], error: true, engine: SearchEngine.Qwant };
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

      return { results, error: false, engine: SearchEngine.Qwant };
    } catch {
      return {
        results: [],
        error: true,
        engine: SearchEngine.Qwant
      };
    }
  }
}

export default Qwant;
