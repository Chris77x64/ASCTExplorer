import {Containment} from "./Containment";
import {InducedSubgraph} from "../model/InducedSubgraph";
import {ASLeaves} from "../algorithm/Anatomical Structures/ASLeaves";

export class ContainmentReordering {

    containment: Containment;
    graph: InducedSubgraph;

    heuristicContainment: Map<number,number>
    asTreeLeafIndex: Map<number,number>

    constructor( containment: Containment, graph: InducedSubgraph) {

        this.containment = containment;
        this.graph = graph;
        this.heuristicContainment = new Map<number, number>()
        this.asTreeLeafIndex = new Map<number, number>()

        /*
        Step 1: pre-compute all positions of AS-Leaves in order to avoid expensive indexOf calls
        */
        this.generateLeafIndex()
        /*
        Step 2: Compute Heuristic for each vertex of adjacency list representation of containment
         */
        this.generateHeuristic(this.containment.root)
        /*
        Step 3: Sort adjacency list representation of containment with respect to heuristic
         */
        this.reorder(this.containment.root)
        /*
        Step 4: Update Containment in order to apply changes
         */
        this.containment.update()

    }


    generateLeafIndex(){
        let leaf = new ASLeaves(this.graph)
        for( let i=0; i < leaf.leaves.length ; i++){
            this.asTreeLeafIndex[leaf.leaves[i]]  = i+1
        }
    }

    calculateMedian(indices){
        if( indices.length == 1){
            return  indices[0]
        }
        else if( indices.length == 0){
            return  0
        }
        else{
            indices.sort( (elem1,elem2) => elem1-elem2)
            let position = Math.floor( (indices.length)/2)
            return  indices[position]
        }
    }

    generateHeuristic(current){

        if( current in this.containment.outDegree){
            let sum = 0
            this.containment.outDegree[current].forEach(id=>{
                this.generateHeuristic(id)
                sum +=  this.heuristicContainment[id]
            })
            this.heuristicContainment[current] = sum

        }
        else{ // we have reached leaf level, so we know that id is a CT vertex
            if( current in this.graph.inDegree){
                // iterate over all corresponding red vertices
                let indices = []
                this.graph.inDegree[current].forEach(asLeaf=>{
                    indices.push(this.asTreeLeafIndex[asLeaf])
                })
                this.heuristicContainment[current] = this.calculateMedian(indices)
            }
            else{
                this.heuristicContainment[current] = 0
            }
        }

    }

    reorder(current){
        if( current in this.containment.outDegree){
            this.containment.outDegree[current].forEach(id=>{
                this.reorder(id)
            })
            this.containment.outDegree[current].sort( (elem1,elem2) => this.heuristicContainment[elem1]-this.heuristicContainment[elem2])
        }
    }

}
