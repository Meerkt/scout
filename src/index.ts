import Scout from './engines';
import { Language, SafeSearch } from './interfaces';

(async () => {
  const result = await new Scout(
    'youtube',
    1,
    SafeSearch.Off,
    Language['fr-CA']
  ).search();
  //const result = await new Scout('youtube').autocomplete();

  console.log(result);
})();

export * from './engines';

export * from './interfaces';
