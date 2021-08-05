const Scout = require('../dist');

(async () => {
  const scout = new Scout('youtube');
  const result = await scout.autocomplete();
  console.log(result);
})();
