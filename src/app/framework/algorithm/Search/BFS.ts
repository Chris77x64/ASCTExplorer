import {Graph} from "../../model/Graph"
import {Queue} from "./Queue"
import {InducedSubgraph} from "../../model/InducedSubgraph";

export class BFS{

    graph: Graph | InducedSubgraph
    queue: Queue

    visited: boolean[]
    level: number[]

    verticesNEW: number[]

    constructor(graph: Graph  | InducedSubgraph, startID: number,outDegree) {

        this.graph = graph
        this.queue = new Queue()
        this.verticesNEW = []

        this.visited = new Array(this.graph.numVertices).fill(false);
        this.level = new Array(this.graph.numVertices).fill(-1);

        this.breathFirstSearch(startID,outDegree)
    }

    breathFirstSearch(startID: number,outDegree){

        this.visited[startID] = true
        this.level[startID] = 0

        this.verticesNEW.push(startID)
        this.queue.enqueue(startID)

        while( !this.queue.isEmpty()){

            let currentID = this.queue.dequeue()

            if( currentID in outDegree) {

                let currentOutDegree = outDegree[currentID]

                currentOutDegree.forEach(neighborID => {
                    if (!this.visited[neighborID]) {
                        this.visited[neighborID] = true
                        this.level[neighborID] = this.level[currentID] + 1
                        this.queue.enqueue(neighborID)
                        this.verticesNEW.push(neighborID)
                    }
                })
            }

        }
    }

    createLevels(){
        let bfsLayers = []
        this.verticesNEW.forEach(vertexID=> {

            let currentLevel = this.level[vertexID]
            if( currentLevel != -1) {
                if (!(typeof currentLevel === 'undefined')) {

                    if (typeof bfsLayers[currentLevel] === 'undefined') {
                        bfsLayers.push([vertexID])
                    } else {
                        bfsLayers[currentLevel].push(vertexID)
                    }
                }
            }
        })
        return bfsLayers
    }

    reachable(){

        let result = []
        this.verticesNEW.forEach(vertexID=> {

            let currentLevel = this.level[vertexID]
            if( currentLevel != -1) {
                if (!(typeof currentLevel === 'undefined')) {
                        result.push([vertexID])
                }
            }
        })
        return result
    }

}
