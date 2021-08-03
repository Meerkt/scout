import {Engine, EngineResult, ParsedResult, SearchEngine} from "../interfaces";
import axios from "axios";
import * as cheerio from "cheerio";

class Yahoo extends Engine {
    #url: URL = new URL('https://search.yahoo.com/search')
    #results: ParsedResult[] = []
    #suggestion?: string

    constructor(query: string) {
        super(query);
        this.#url.searchParams.set('p', 'youtu')
    }

    async search(): Promise<EngineResult> {
        const request = await axios.get(this.#url.toString(),{
            headers: {
                'User-Agent': "User-Agent\", \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
            }
        })
        let $ = cheerio.load(request.data)

        this.#suggestion = $('.stxt > a.fc-blue').first().text().trim()

        $('li > div.dd').each((_, result) => {
            $ = cheerio.load($(result).toString())

            const title = $('h3.title > a').first().text().trim()
            const link = $('span.fz-ms.fw-m').first().text().trim().split(' ')[0]
            const content = $('p.fz-ms').first().text().trim()

            this.#results.push({
                title,
                link,
                content,
                engine: SearchEngine.Yahoo
            })
        })

        return {
            results: this.#results,
            suggestion: this.#suggestion
        }
    }
}

export default Yahoo