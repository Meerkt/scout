import {Engine, EngineResult, ParsedResult, SearchEngine} from "../interfaces";
import axios from "axios";
import * as cheerio from "cheerio";

class Google extends Engine {
    #url: URL =  new URL('https://google.com/search')
    #results: ParsedResult[] = []
    #suggestion?: string

    constructor(query: string) {
        super(query)
        this.#url.searchParams.set('q', query)
        this.#url.searchParams.set('ie', 'utf8')
        this.#url.searchParams.set('oe', 'utf8')
    }

    async search(): Promise<EngineResult> {
        const request = await axios.get(this.#url.toString(), {
            headers: {
                'User-Agent': "User-Agent\", \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
            }
        })

        let $ = cheerio.load(request.data)

        this.#suggestion = $('.card-section > a').first().text()

        $('div[class="g"]').each((_, result) =>  {
            $ = cheerio.load($(result).toString())

            const title = $('h3').first().text().trim()
            const link = $('div[class="yuRUbf"] > a').first().attr('href')?.trim()
            const content = $('div[class="IsZvec"]').first().text().trim()

            this.#results.push({
                title,
                link,
                content,
                engine: SearchEngine.Google
            })
        })

        return {
            results: this.#results,
            suggestion: this.#suggestion
        }
    }
}

export default Google