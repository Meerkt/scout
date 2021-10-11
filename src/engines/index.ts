import Google from './google';
import {
  AutocompleteResults,
  EngineAutocompleteResult,
  EngineImagesResult,
  EngineNewsResult,
  EngineResult,
  EngineVideosResult,
  ImageResults,
  Images,
  Infobox,
  Language,
  News,
  NewsResults,
  ParsedResult,
  Results,
  SafeSearch,
  VideoResults,
  Videos
} from '../interfaces';
import * as _ from 'lodash';
import DuckDuckGo from './duckduckgo';
import Qwant from './qwant';
import Bing from './bing';
import Yahoo from './yahoo';
import Wikipedia from './wikipedia';

class Scout {
  #engines: (
    | typeof Google
    | typeof DuckDuckGo
    | typeof Qwant
    | typeof Bing
    | typeof Yahoo
    | typeof Wikipedia
  )[] = [Google, DuckDuckGo, Qwant, Yahoo, Wikipedia];
  #query = '';
  #page = 1;
  #safesearch = SafeSearch.Off;
  #language = Language['en-US'];

  constructor(
    query: string,
    page = 1,
    safesearch = SafeSearch.Off,
    language = Language['en-US']
  ) {
    this.#query = query;
    this.#page = page;
    this.#safesearch = safesearch;
    this.#language = language;
  }

  async search(): Promise<Results> {
    const executionTime = new Date();
    const promiseArray: Promise<EngineResult>[] = [];
    this.#engines.forEach((engine) => {
      promiseArray.push(
        new engine(
          this.#query,
          this.#page,
          this.#safesearch,
          this.#language
        ).search()
      );
    });

    const promiseResult = await Promise.all(promiseArray);

    let results: ParsedResult[] = [];
    let suggestion: string | undefined;
    let infobox: Infobox | undefined;

    promiseResult.forEach((prom) => {
      if (!prom.error) {
        results = results.concat(prom.results);
        if (!suggestion) {
          if (prom.suggestion || prom.suggestion?.length !== 0) {
            suggestion = prom.suggestion;
          }
        }
        if (!infobox) {
          if (prom.infobox !== undefined) {
            infobox = prom.infobox;
          }
        }
      } else {
        console.error(prom);
      }
    });

    results = _.uniqBy(results, 'link');
    results = _.uniqBy(results, 'title');
    results = _.filter(results, (result: ParsedResult) => {
      return (
        !!result.title &&
        !!result.link &&
        !!result.content &&
        result.title.length != 0 &&
        result.link?.length != 0 &&
        result.content.length != 0
      );
    });

    return {
      results,
      suggestion: suggestion,
      infobox,
      times: `${new Date().valueOf() - executionTime.valueOf()} ms`,
      length: results.length
    };
  }

  async search_image(): Promise<ImageResults> {
    const executionTime = new Date();
    const promiseArray: Promise<EngineImagesResult>[] = [];
    this.#engines.forEach((engine) => {
      promiseArray.push(
        new engine(
          this.#query,
          this.#page,
          this.#safesearch,
          this.#language
        ).search_image()
      );
    });

    const promiseResult = await Promise.all(promiseArray);

    let results: Images[] = [];

    promiseResult.forEach((prom) => {
      results = results.concat(prom.results);
    });

    results = _.uniqBy(results, 'url');
    results = _.filter(results, (result: Images) => {
      return (
        !!result.title &&
        !!result.url &&
        !!result.thumbnail &&
        result.title.length != 0 &&
        result.url?.length != 0 &&
        result.thumbnail?.length != 0
      );
    });

    return {
      results: results,
      times: `${new Date().valueOf() - executionTime.valueOf()} ms`,
      length: results.length
    };
  }

  async search_video(): Promise<VideoResults> {
    const executionTime = new Date();
    const promiseArray: Promise<EngineVideosResult>[] = [];
    this.#engines.forEach((engine) => {
      promiseArray.push(
        new engine(
          this.#query,
          this.#page,
          this.#safesearch,
          this.#language
        ).search_video()
      );
    });

    const promiseResult = await Promise.all(promiseArray);

    let results: Videos[] = [];

    promiseResult.forEach((prom) => {
      results = results.concat(prom.results);
    });

    results = _.uniqBy(results, 'url');
    results = _.filter(results, (result: Videos) => {
      return (
        !!result.title &&
        !!result.url &&
        !!result.thumbnail &&
        result.title.length != 0 &&
        result.url?.length != 0 &&
        result.thumbnail.length != 0
      );
    });

    return {
      results: results,
      times: `${new Date().valueOf() - executionTime.valueOf()} ms`,
      length: results.length
    };
  }

  async search_news(): Promise<NewsResults> {
    const executionTime = new Date();
    const promiseArray: Promise<EngineNewsResult>[] = [];
    this.#engines.forEach((engine) => {
      promiseArray.push(
        new engine(
          this.#query,
          this.#page,
          this.#safesearch,
          this.#language
        ).search_news()
      );
    });

    const promiseResult = await Promise.all(promiseArray);

    let results: News[] = [];

    promiseResult.forEach((prom) => {
      results = results.concat(prom.results);
    });

    results = _.uniqBy(results, 'url');
    results = _.filter(results, (result: News) => {
      return (
        !!result.title &&
        !!result.url &&
        !!result.thumbnail &&
        result.title.length != 0 &&
        result.url?.length != 0 &&
        result.thumbnail.length != 0 &&
        !result.thumbnail.startsWith('data:')
      );
    });

    return {
      results: results,
      times: `${new Date().valueOf() - executionTime.valueOf()} ms`,
      length: results.length
    };
  }

  async autocomplete(): Promise<AutocompleteResults> {
    const executionTime = new Date();
    const promiseArray: Promise<EngineAutocompleteResult>[] = [];
    this.#engines.forEach((engine) => {
      promiseArray.push(
        new engine(
          this.#query,
          1,
          SafeSearch.Off,
          Language['en-US']
        ).autocomplete()
      );
    });

    let results: string[] = [];

    const promiseResult = await Promise.all(promiseArray);

    promiseResult.forEach((prom) => {
      if (!prom.error) {
        results = results.concat(prom.results);
      }
    });

    results = _.uniq(results);

    return {
      results,
      times: `${new Date().valueOf() - executionTime.valueOf()} ms`,
      length: results.length
    };
  }
}

export default Scout;
