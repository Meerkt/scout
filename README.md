# Scout
### Fast and easy search engine scrapper powering [Meerkt](https://www.meerkt.com).

---
1. [Features](#features)
2. [How to install](#how-to-install)
3. [Basic example](#basic-example)
4. [Autocomplete example](#autocomplete-example)

## Features

- 🚀 Fast and easy to use !
- ✨ Support for multiples search engines (Google, Bing, DuckDuckGo, Qwant, Yahoo, Wikipedia)
- ✅ Safety checks and errors handling
- 🛠 Written in typescript and promise based
- 🍑 Safe search and adult content filtering support


## How to install
``>> npm install --save searchscout``

``>> yarn add searchscout``

## Basic example
```javascript
const Scout = require('searchscout');

(async () => {
    // new Scout('query', page (optional), Safesearche (optional), Language (optional))
    const scout = new Scout('node.js documentation', 1, SafeSearch.None, Language["en-US"])

    const results = await scout.search(); // Return an Results types

    console.log(results)
})();
```

## Autocomplete example
```javascript
const Scout = require('searchscout');

(async () => {
    // new Scout('query')
    const scout = new Scout('node.js documentation')

    const results = await scout.autocomplete() // Return an array of string

    console.log(results)
})();
```

## Support & Pulls request
- If you have any questions or request, please do so by opening an issue on the github.
- If you want to contribute or fix issues, please do so by opening a pull request
