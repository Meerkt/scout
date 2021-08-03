import Scout from "./engines";


(async() => {
    const result = await new Scout('youtube').search()

    console.log(result)
})()

export * from "./engines"

export {Results} from "./interfaces"