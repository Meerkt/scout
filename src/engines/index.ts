import Google from './google';
import {
  AutocompleteResults,
  EngineAutocompleteResult,
  EngineResult,
  Infobox,
  Language,
  ParsedResult,
  Results,
  SafeSearch
} from '../interfaces';
import * as _ from 'lodash';
import DuckDuckGo from './duckduckgo';
import Qwant from './qwant';
import Bing from './bing';
import Yahoo from './yahoo';

class Scout {
  #engines: (
    | typeof Google
    | typeof DuckDuckGo
    | typeof Qwant
    | typeof Bing
    | typeof Yahoo
  )[] = [Google, DuckDuckGo, Qwant, Bing, Yahoo];
  #query = '';
  #page = 1;
  #safesearch = SafeSearch.Off;
  #language = Language.en;

  constructor(
    query: string,
    page = 1,
    safesearch = SafeSearch.Off,
    language = Language.en
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
    results = _.filter(results, (result) => {
      return (
        result.title.length != 0 &&
        result.link?.length != 0 &&
        result.content.length != 0
      );
    });

    return {
      results,
      suggestion: suggestion,
      times: `${new Date().valueOf() - executionTime.valueOf()} ms`,
      length: results.length,
      infobox
    };
  }

  async autocomplete(): Promise<AutocompleteResults> {
    const executionTime = new Date();
    const promiseArray: Promise<EngineAutocompleteResult>[] = [];
    this.#engines.forEach((engine) => {
      promiseArray.push(
        new engine(this.#query, 1, SafeSearch.Off, Language.en).autocomplete()
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
