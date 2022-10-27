import {Edge} from "../../model/Edge";
import {Type} from "../../util/Properties";
import {OneSidedCrossingMinimization} from "../OneSidedCrossingMinimization";

export class BiomarkerAugementation {

    replacements: EdgeReplacement[]
    replacementsMap: Map<number,number>

    newSlotsBM: number[]

    indexMapCT: Map<number,number>
    indexMapBMCT: Map<number,number>


    constructor(slotsCT, graph, levelDifference) {

        let minimizationCTBM = new OneSidedCrossingMinimization(graph, slotsCT, graph.verticesBM)
        let slotsBM = minimizationCTBM.slots

        this.createIndexMapCT(slotsCT)
        this.createIndexMapBMCT(slotsCT,slotsBM,graph.inDegree)

        this.calculateReplacements(slotsCT, slotsBM, levelDifference,graph.inDegree,graph.outDegree)
        this.update(graph)
        this.calculateSlots(slotsBM)


    }

    calculateSlots( slotsBM){
        this.newSlotsBM = slotsBM.slice(0)
        this.replacements.forEach(replacement =>{
            this.newSlotsBM.push(replacement.newBM)
        })
    }

    deepClone(target,source,graph,slotsCT,slotsBM){
        graph.verticesAS.forEach(id => {
            if (id in source) {
                target[id] = source[id].slice(0)
            }
        })
        slotsCT.forEach(id => {
            if (id in source) {
                target[id] = source[id].slice(0)
            }
        })
        slotsBM.forEach(id => {
            if (id in source) {
                target[id] = source[id].slice(0)
            }
        })
    }

    update(graph){

        this.replacements.forEach(replacement=>{

            graph.vertices.push(replacement.newBM)
            graph.verticesBM.push(replacement.newBM)
            graph.numVertices +=1
            graph.numVerticesBM +=1
            graph.vertexType[replacement.newBM] = Type.BM
            graph.vertexLabel[replacement.newBM] = graph.vertexLabel[replacement.originalBM]

            graph.IDtoOntologyType[replacement.newBM] = graph.IDtoOntologyType[replacement.originalBM]
            graph.IDtoOntologyID[replacement.newBM] = graph.IDtoOntologyID[replacement.originalBM]
            graph.vertexSize[replacement.newBM] = graph.vertexSize[replacement.originalBM]

            graph.vertexVisible[replacement.newBM] = 1
            graph.vertexColor[replacement.newBM] = graph.vertexColor[replacement.originalBM]
            graph.inDegree[replacement.newBM] = [replacement.originalCT]
            graph.outDegree[replacement.originalCT].push(replacement.newBM)


            this.removeByValue(replacement.originalCT,graph.inDegree[replacement.originalBM])
            this.removeByValue(replacement.originalBM,graph.outDegree[replacement.originalCT])
        })
    }

    createIndexMapCT(slotsCT){
        this.indexMapCT = new Map<number, number>()
        for( let i=0; i < slotsCT.length; i++){
            let currentID = slotsCT[i]
            this.indexMapCT[currentID] = i
        }
    }

    createIndexMapBMCT(slotsCT,slotsBM,prevIndegree){

        this.indexMapBMCT = new Map<number, number>()

        slotsBM.forEach(id=>{
            if( id in prevIndegree ){
                this.indexMapBMCT[id] = this.calculateCTGroupMean(prevIndegree[id])
            }
            else{
                this.indexMapBMCT[id] = Number.POSITIVE_INFINITY
            }
        })
    }


    calculateCTGroupMean(cellType: number[]){

        if( cellType.length > 0) {
            let sum = 0

            cellType.forEach(cellTypeID => {
                sum = sum + this.indexMapCT[cellTypeID]
            })

            return sum / cellType.length
        }
        else{
            return 0
        }

    }

    replacementEdgeHierarchy(slotsCT, prevOutdegree){

        let edges = []

        slotsCT.forEach(ctID => {
            if (ctID in prevOutdegree) {
                let childrenBM = prevOutdegree[ctID]
                childrenBM.forEach(child => {
                    edges.push(new Edge(ctID, child))
                })
            }
        })

        edges.sort((e1,e2)=>
            Math.abs(this.indexMapCT[e2.source] - this.indexMapBMCT[e2.target]) - Math.abs(this.indexMapCT[e1.source] - this.indexMapBMCT[e1.target])
        )
        return edges
    }



    calculateReplacements(slotsCT, slotsBM, levelDifference,prevIndegree,prevOutdegree) {

        this.replacements = []
        this.replacementsMap = new Map<number, number>()
        slotsBM.forEach(id => {
            if (id in prevIndegree) {
                this.replacementsMap[id] = prevIndegree[id].length
            } else {
                this.replacementsMap[id] = 0
            }
        })

        let dummyID = -100000

        let edges = this.replacementEdgeHierarchy(slotsCT, prevOutdegree)


        if( levelDifference > 0) {
            let numAugmentedEdges = edges.length * (levelDifference / 100)
            let count = 0
            edges.forEach(currentEdge => {
                if (this.replacementsMap[currentEdge.target] > 1 && count < numAugmentedEdges) {
                    this.replacements.push(new EdgeReplacement(currentEdge.source, currentEdge.target, dummyID))
                    this.replacementsMap[currentEdge.target] = this.replacementsMap[currentEdge.target] - 1
                    dummyID = dummyID - 1
                    count = count+1
                }
            })
        }
    }

    removeByValue(value,arr){
        let index = arr.indexOf(value)
        arr.splice(index,1)
    }


}

export class EdgeReplacement {

    // ctbm edge should not be rendered
    originalCT : number
    originalBM : number

    // create artificial vertex
    newBM: number

    constructor(originalCT,originalBM, newBM) {
        this.originalCT = originalCT
        this.originalBM = originalBM
        this.newBM = newBM
    }

}


