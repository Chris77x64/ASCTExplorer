import {InducedSubgraph} from "../../model/InducedSubgraph";

export class ASContainment {

    /*
    keys are vertices of as tree, true if vertex is adjacent to any ct vertex or if vertex has a descendant that is adjacent
     */
    hasLeaf: Map<number,boolean>

    /*
    keys are ct vertices and value is its position within slotsCT
     */
    idMapCT: Map <number,number>

    /*
    keys are vertices of as tree and value is the sum of ctIndexes
     */
    heuristicAS: Map<number,number>

    constructor(graph,slotsCT) {
        let tree = new InducedSubgraph(graph,graph.verticesAS)
        let root = this.calculateRoot(tree)

        this.hasLeaf = new Map<number, boolean>()
        this.idMapCT = new Map<number, number>()
        this.heuristicAS = new Map<number, number>()

        this.calculateLeafMap(root,graph,tree)
        this.initializeCTMap(slotsCT)
        this.calculateASHeuristic(root,graph,tree)
        this.balancing(root,graph,tree)


    }

    balancing(current,graph,tree){
        if( current in tree.outDegree){
            let sortID = []
            let noCTEdge = []

            tree.outDegree[current].forEach(n=>{
                if( this.hasLeaf[n]){
                    sortID.push(n)
                }
                else{
                    noCTEdge.push(n)
                }
                this.balancing(n, graph, tree)
            })

            sortID.sort( (elem1,elem2) => this.heuristicAS[elem1]-this.heuristicAS[elem2])
            graph.outDegree[current] = sortID.concat(noCTEdge)

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

    calculateASHeuristic(current,graph,tree){

        let indices = []
        if( current in tree.outDegree){
            tree.outDegree[current].forEach(n=>{
                this.calculateASHeuristic(n,graph,tree)
                indices.push(this.heuristicAS[n])
            })
        }
        else{
            if( current in graph.outDegree){
                graph.outDegree[current].forEach(n=>{
                    indices.push(this.idMapCT[n])
                })
            }
        }
        this.heuristicAS[current] = this.calculateMedian(indices)
    }

    initializeCTMap(slotsCT){
        for(let i=0; i < slotsCT.length; i++){
            this.idMapCT[slotsCT[i]] = i
        }
    }

    calculateRoot(tree){

        let res = null
        tree.vertices.forEach(id=>{
            if( ! (id in tree.inDegree) ){
                res = id
            }
        })
        return res
    }

    calculateLeafMap(current,graph,tree){
        if( current in tree.outDegree){
            let flag = false
            tree.outDegree[current].forEach(n=>{
                this.calculateLeafMap(n,graph,tree)
                if( this.hasLeaf[n]){
                    flag = true
                }
            })
            this.hasLeaf[current] = flag
        }
        else{
            this.hasLeaf[current] = current in graph.outDegree;
        }
    }



}
