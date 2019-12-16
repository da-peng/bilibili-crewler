import db from "../model/db-connect"
import BilibliSearchCrewler from "../crewler/bilibili-search-crewler"


describe("test crewler", () => {
    describe("crewler", () => {
        it("crewler", () => {
            let a = new BilibliSearchCrewler('11')
            a.run()
        })
    })
})