import {EdgeReplacement} from "./BiomarkerAugementation";
import {Edge} from "../../model/Edge";
import {Type} from "../../util/Properties";
import {BFS} from "../Search/BFS";

export class CellTypeAugmentation {

    replacements: EdgeReplacementASCT[]
    replacementsMap: Map<number,number>

    indexMapAS: Map<number,number>
    indexMapCTAS: Map<number,number>

    visibleCT :Map<number,boolean>

    constructor(slotsAS, slotsCT,slotsBM, graph, levelDifference,copyBM: boolean,data: number[],leaves,highlightedEdge) {
        this.createIndexMapAS(slotsAS)
        this.createIndexMapCTAS(slotsAS, slotsCT, graph)
        this.initializeReplacements(graph, slotsCT)
        this.calculateReplacements(slotsAS, slotsCT, graph, levelDifference)
        this.updateCT(graph)
        this.updateBM(graph)
        if (!copyBM) {
            this.removeBM(graph,data,leaves,highlightedEdge)
        }
    }

    removeBM(graph,data,leaves,highlightedEdge){
            let reachableLeaves = this.extractLeaves(data,leaves)

            let visible = new Map<number,boolean>()
            this.visibleCT = new Map<number,boolean>()

            graph.verticesBM.forEach(id=> visible[id] = false)
            graph.verticesCT.forEach(id=> this.visibleCT[id] = false)

            reachableLeaves.forEach(id=>{
                let bfs = new BFS(graph,id,graph.outDegree)
                let reachable = bfs.reachable()
                reachable.forEach(r=>{
                    if( graph.vertexType[r] == Type.BM){
                        visible[r] = true
                    }
                    else if( graph.vertexType[r] == Type.CT){
                        this.visibleCT[r] = true
                    }
                })
            })

            let newBM = []
            let newVertices = []

            graph.vertices.forEach(id=>{
                switch (graph.vertexType[id]) {
                    case Type.BM: {
                        if( !visible[id]) {
                            delete graph.inDegree[id]
                            graph.numVertices -=1
                            graph.numVerticesBM -=1
                        }
                        else {
                            if( id in graph.inDegree){
                                let res = []
                                graph.inDegree[id].forEach(n=>{
                                    if( this.visibleCT[n]){
                                        res.push(n)
                                    }
                                })
                                graph.inDegree[id] = res
                            }
                            newBM.push(id)
                            newVertices.push(id)
                        }
                        break
                    }
                    default:
                        newVertices.push(id)
                }
            })
            graph.vertices = newVertices
            graph.verticesBM = newBM

            graph.verticesCT.forEach(id=>{
                if( !this.visibleCT[id]){
                    delete graph.outDegree[id]
                }
            })

        this.initializeHighlights(graph,highlightedEdge)
        reachableLeaves.forEach(l=>{
            if( l in graph.outDegree){
                graph.outDegree[l].forEach(n=>{
                    let key = String(l)+'|'+ String(n)
                    highlightedEdge[key] = true
                    if( n in graph.outDegree){
                        graph.outDegree[n].forEach(b=>{
                            let key2 = String(n)+'|'+ String(b)
                            highlightedEdge[key2] = true
                        })
                    }
                })
            }
        })

        }

    initializeHighlights(graph,highlightedEdge){
        graph.vertices.forEach(id=>{
            if( id in graph.outDegree){
                graph.outDegree[id].forEach(n=>{
                    let key = String(id)+'|'+ String(n)
                    highlightedEdge[key] = false
                })
            }
        })
    }

    extractLeaves(data,vertices){
    let res = []
    data.forEach(id=>{
        if(vertices.includes(id)){
            res.push(id)
        }
    })
        return res
    }

    updateCT(graph){
        this.replacements.forEach(replacement=>{

            graph.vertices.push(replacement.newCT)
            graph.verticesCT.push(replacement.newCT)
            graph.numVertices +=1
            graph.numVerticesCT +=1
            graph.vertexType[replacement.newCT] = Type.CT
            graph.vertexVisible[replacement.newCT] = 1
            graph.vertexSize[replacement.newCT] = graph.vertexSize[replacement.originalCT]

            graph.vertexLabel[replacement.newCT] = graph.vertexLabel[replacement.originalCT]
            graph.vertexColor[replacement.newCT] = graph.vertexColor[replacement.originalCT]

            graph.IDtoOntologyType[replacement.newCT] = graph.IDtoOntologyType[replacement.originalCT]
            graph.IDtoOntologyID[replacement.newCT] = graph.IDtoOntologyID[replacement.originalCT]

            graph.inDegree[replacement.newCT] = [replacement.originalAS]
            graph.outDegree[replacement.originalAS].push(replacement.newCT)


            this.removeByValue(replacement.originalAS,graph.inDegree[replacement.originalCT])
            this.removeByValue(replacement.originalCT,graph.outDegree[replacement.originalAS])
        })
    }

    updateBM( graph){

        this.replacements.forEach(replacement=>{

            for(let i=0; i < replacement.newBM.length; i++){
                let newBMID = replacement.newBM[i]
                let oldBMID = replacement.oldBM[i]

                graph.vertices.push(newBMID)
                graph.verticesBM.push(newBMID)
                graph.vertexVisible[newBMID] = 1

                graph.vertexColor[newBMID] = graph.vertexColor[oldBMID]

                graph.IDtoOntologyType[newBMID] = graph.IDtoOntologyType[oldBMID]
                graph.IDtoOntologyID[newBMID] = graph.IDtoOntologyID[oldBMID]

                graph.vertexSize[newBMID] = graph.vertexSize[oldBMID]

                graph.numVertices +=1
                graph.numVerticesBM +=1

                graph.vertexType[newBMID] = Type.BM
                graph.vertexLabel[newBMID] = graph.vertexLabel[oldBMID]
            }

            replacement.newBM.forEach(newBMID=>{

                if( newBMID in graph.inDegree){
                    graph.inDegree[newBMID].push(replacement.newCT)
                }
                else{
                    graph.inDegree[newBMID] = [replacement.newCT]
                }

                if( replacement.newCT in graph.outDegree){
                    graph.outDegree[replacement.newCT].push(newBMID)
                }
                else{
                    graph.outDegree[replacement.newCT] = [newBMID]
                }
            })
        })

    }

    removeByValue(value,arr){
        let index = arr.indexOf(value)
        arr.splice(index,1)
    }

    replacementEdgeHierarchy(slotsAS, slotsCT, graph){

        let edges = []

        slotsAS.forEach(asID => {
            if (asID in graph.outDegree) {
                let childrenCT = graph.outDegree[asID]
                childrenCT.forEach(child => {
                    edges.push(new Edge(asID, child))
                })
            }
        })

        edges.sort((e1,e2)=>
            Math.abs(this.indexMapAS[e2.source] - this.indexMapCTAS[e2.target]) - Math.abs(this.indexMapAS[e1.source] - this.indexMapCTAS[e1.target])
        )
        return edges
    }

    calculateReplacements(slotsAS, slotsCT, graph, levelDifference) {

        let dummyID = -200000
        let edges = this.replacementEdgeHierarchy(slotsAS, slotsCT, graph)
        if( levelDifference > 0) {
            let numAugmentedEdges = edges.length * (levelDifference/100)
            let count = 0
            edges.forEach(currentEdge =>{
                if( this.replacementsMap[currentEdge.target] > 1 && count < numAugmentedEdges){
                    let newCT = dummyID
                    dummyID = dummyID - 1

                    let newBM = []
                    let oldBM = []
                    if( currentEdge.target in graph.outDegree){
                        graph.outDegree[currentEdge.target].forEach(bmID =>{
                            newBM.push(dummyID)
                            oldBM.push(bmID)
                            dummyID = dummyID - 1
                        })
                    }

                    this.replacements.push(new EdgeReplacementASCT(currentEdge.source, currentEdge.target, newCT,newBM,oldBM))
                    this.replacementsMap[currentEdge.target] = this.replacementsMap[currentEdge.target] - 1
                    dummyID = dummyID - 1
                    count = count+1
                }
            })
        }

    }


    initializeReplacements(graph,slotsCT){
        this.replacements = []
        this.replacementsMap = new Map<number, number>()
        slotsCT.forEach(id => {
            if (id in graph.inDegree) {
                this.replacementsMap[id] = graph.inDegree[id].length
            } else {
                this.replacementsMap[id] = 0
            }
        })
    }

    createIndexMapAS(slotsAS){
        this.indexMapAS = new Map<number, number>()
        for( let i=0; i < slotsAS.length; i++){
            let currentID = slotsAS[i]
            this.indexMapAS[currentID] = i
        }
    }

    calculateASGroupMean(as: number[]){

        if( as.length > 0) {
            let sum = 0

            as.forEach(asID => {
                sum = sum + this.indexMapAS[asID]
            })

            return sum / as.length
        }
        else{
            return 0
        }

    }

    createIndexMapCTAS(slotsAS,slotsCT,graph){

        this.indexMapCTAS = new Map<number, number>()

        slotsCT.forEach(id=>{
            if( id in graph.inDegree ){
                this.indexMapCTAS[id] = this.calculateASGroupMean(graph.inDegree[id])
            }
            else{
                this.indexMapCTAS[id] = Number.POSITIVE_INFINITY
            }
        })
    }


}

export class EdgeReplacementASCT {

    // ctbm edge should not be rendered
    originalAS : number
    originalCT : number

    // create artificial vertex
    newCT: number
    newBM: number[]
    oldBM: number[]

    constructor(originalAS,originalCT, newCT,newBM,oldBM) {
        this.originalAS = originalAS
        this.originalCT = originalCT
        this.newCT = newCT
        this.newBM = newBM
        this.oldBM = oldBM
    }

}
