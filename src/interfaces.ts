export enum SearchEngine {
    Google,
    DuckDuckGo,
    Yahoo,
    Qwant,
    Bing
}

export class Engine {
    #results: ParsedResult[] = []
    #suggestion?: string
    #query?: string

    constructor(query: string) {
        this.#query = query
    }
    async search(): Promise<EngineResult> {
        return { results: this.#results, suggestion: this.#suggestion }
    }
}

export interface ParsedResult {
    title: string
    link?: string,
    content: string,
    engine: SearchEngine
}

export interface EngineResult {
    results: ParsedResult[]
    suggestion?: string,
}

export interface Results {
    results: ParsedResult[],
    suggestion?: string
    length: number
    times: string
}