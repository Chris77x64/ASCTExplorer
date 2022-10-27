export class Bend {

    sourceID : number
    middleID: number[]
    targetID: number
    endpointID: number

    edge: object

    constructor(source,middle,target,endpoint) {
        this.sourceID = source
        this.middleID = middle
        this.targetID = target
        this.endpointID = endpoint
        this.edge = {
            "source": source,
            "target": target
        }
    }

}
