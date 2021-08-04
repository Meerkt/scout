import Scout from './engines';

(async () => {
  const result = await new Scout('youtube').search();
  //const result = await new Scout('youtube').autocomplete();

  console.log(result);
})();

export * from './engines';

export { Results } from './interfaces';
