import {Engine, EngineResult, ParsedResult, SearchEngine} from "../interfaces";
import axios from "axios";
import * as cheerio from "cheerio";

class Bing extends Engine {
    #url: URL = new URL('https://www.bing.com/search')
    #results: ParsedResult[] = []
    #suggestion?: string

    constructor(query: string) {
        super(query);
        this.#url.searchParams.set('q', query)
    }

    async search(): Promise<EngineResult> {
        const request = await axios.get(this.#url.toString(),{
            headers: {
                'User-Agent': "User-Agent\", \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
            }
        })

        let $ = cheerio.load(request.data)


        $('li.b_algo').each((_, result) => {
            $ = cheerio.load($(result).toString())

            const title = $('h2').first().text().trim()
            const link = $('div.b_attribution').first().text().trim()
            const content = $('p').first().text().trim()

            this.#results.push({
                title,
                link,
                content,
                engine: SearchEngine.Bing
            })
        })

        return {
            results: this.#results,
            suggestion: this.#suggestion
        }
    }
}

export default Bing