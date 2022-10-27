import {Graph} from "../../model/Graph";
import {InducedSubgraph} from "../../model/InducedSubgraph";

export class ASLeaves {

    leaves: number[]

    constructor( graph) {
        let roots = this.calculatePossibleRoots(graph)
        let tree = new InducedSubgraph(graph,graph.verticesAS)
        this.leaves = [ ]
        roots.forEach(rootID=>{
            this.worker(rootID,tree)
        })
    }

    worker(vertexID,tree){
        if( vertexID in tree.outDegree){
            let neighborhood = tree.outDegree[vertexID]
            neighborhood.forEach(neighbor =>{
                this.worker(neighbor,tree)
            })
        }
        else{
            this.leaves.push(vertexID)
        }
    }

    calculatePossibleRoots(graph: Graph| InducedSubgraph){
        let result = []
        graph.verticesAS.forEach(vertexID=>{
            if( !(vertexID in graph.inDegree)){
                result.push(vertexID)
            }
        })
        return result
    }

}
