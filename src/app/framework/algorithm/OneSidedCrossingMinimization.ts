import {Graph} from "../model/Graph"
import {InducedSubgraph} from "../model/InducedSubgraph";

export class OneSidedCrossingMinimization {

    graph: Graph | InducedSubgraph

    /*
    Linear order of fixed vertices
     */
    fixedVertices: number[]
    /*
    Set of free vertices for which we want to compute order
     */
    freeVertices: number[]

    /*
    key: fixed vertex
    value: position within array
    */
    fixedIndex: Map<number,number[]>

    /*
    Bins:
    key: median value
    value: set of free vertices having same median
     */
    groups: Map<number,number[]>

    /*
    Linear order of free vertices
    Sort bins in an ascending way
     */
    slots: number[]


    constructor(graph: Graph | InducedSubgraph, fixedVertices, freeVertices) {

        this.graph = graph
        this.fixedVertices = fixedVertices
        this.freeVertices = freeVertices
        this.fixedIndex = new Map<number, number[]>()
        this.groups = new Map<number, number[]>()
        this.slots = []

        /*
        1. Pre-Compute Index of each fixedVertex to avoid expensive indexOf calls
         */
        this.createIndexMap(fixedVertices)

        /*
        2. Calculate Median Bins
         */
        this.createGroups(graph.inDegree)

        /*
        3. Sort bins to obtain slots
         */
        this.createSlots()
    }

    createIndexMap(fixedVertices){
        for(let i=0; i < fixedVertices.length; i++){
            this.fixedIndex[fixedVertices[i]]=i
        }
    }

    createSlots(){
        for (const [key,value] of Object.entries(this.groups)) {
           value.forEach( currentID=>{
               this.slots.push(currentID)
           })
        }
    }

    createGroups(indegree){
        this.freeVertices.forEach(freeVertexID =>{
            let median = this.medianAssessment(freeVertexID,indegree)
            if( median in this.groups){
                this.groups[median].push(freeVertexID)
            }
            else{
                this.groups[median] = [freeVertexID]
            }
        })
    }

    medianAssessment(freeVertexID,indegree){

        if( freeVertexID in indegree){
            let neighbours = indegree[freeVertexID]
            let indices = []
            neighbours.forEach(fixedVertexID=>{
                let currentIndex = this.fixedIndex[fixedVertexID]
                indices.push( currentIndex)
            })
            if( indices.length > 1){
                indices.sort( (elem1,elem2) => elem1-elem2)
                let position = Math.floor( (indices.length)/2)
                return indices[position]
            }
            else if( indices.length == 1){
                return indices[0]
            }
        }
        else{
            return -1
        }

    }


}
