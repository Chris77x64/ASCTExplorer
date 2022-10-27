import {InducedSubgraph} from "../../model/InducedSubgraph";
import {OneSidedCrossingMinimization} from "../OneSidedCrossingMinimization";
import {ASLeaves} from "./ASLeaves";

export class ASBalancingV3 {

    /*
    keys are vertices of as tree, true if vertex is adjacent to any ct vertex or if vertex has a descendant that is adjacent
     */
    hasLeaf: Map<number,boolean>

    /*
    keys are vertices of as tree and value is the sum of ctIndexes
     */
    heuristicAS: Map<number,number>

    /*
    order of ct vertices computed by OCM heuristic
     */
    slotsCT: number[]

    /*
    key: vertex of slotCT
    value: index in slotCTMap
     */
    slotIndexMap: Map<number,number>

    constructor(graph) {

        /*
        Compute induced subtree of AS Vertices and obtain its root
        (vertex with indegree 0 )
         */
        let tree = new InducedSubgraph(graph,graph.verticesAS)
        let root = this.calculateRoot(tree)

        /*
        Compute OCM Heuristic to obtain ordering of CT Vertices ( called slotsCT )
         */
        let anatomicalLeaves = new ASLeaves(graph)
        let minimizationASCT = new OneSidedCrossingMinimization(graph,anatomicalLeaves.leaves,graph.verticesCT)
        this.slotsCT = minimizationASCT.slots

        /*
        Avoid expensive indexOf calls
         */
        this.slotIndexMap = new Map<number, number>()
        this.calculateIndexMap()
        /*
        Leaf map is function f: V_AS -> {true,false} for all AS Vertices
        that tells if either it or its descendants have edges to CT Vertices.
        Output: true if exists at least one descendant adjacent to a CT Vertices.
         */
        this.hasLeaf = new Map<number, boolean>()
        this.calculateLeafMap(root,graph,tree)


        /*
        Main Heuristic that is used in order to sort adjacency lists of non leaf vertices
        Leaf Level: 1 for no ctEdge and -10 for ctEdge
        General: Sum values computed at leaf level
         */
        this.heuristicAS = new Map<number, number>()
        this.calculateASHeuristic(root,graph,tree)

        /*
        Reorder adjacency lists in two ways:
        Apply specific heuristic at leaf level
        Use AS_Heuristic score of a vertex to sort non-leaf level
         */
        this.balancing(root,graph,tree)


    }


    calculateIndexMap(){
        for(let i=0; i < this.slotsCT.length; i++){
            this.slotIndexMap[this.slotsCT[i]] = i
        }
    }

    balancing(current,graph,tree){
        if( current in tree.outDegree){
            let ctEdge = []
            let noCTEdge = []
            let flag = false
            tree.outDegree[current].forEach(n=>{
                if( this.hasLeaf[n]) ctEdge.push(n)
                else noCTEdge.push(n)
                flag = this.balancing(n, graph, tree)
            })
            if( flag) this.leafProcessing(current,graph)
            else graph.outDegree[current].sort( (elem1,elem2) => this.heuristicAS[elem1]-this.heuristicAS[elem2])
            return false
        }
        else return true
    }


    leafProcessing(parentID,graph){
        let sortID = []
        let noCTEdge = []
        graph.outDegree[parentID].forEach(n=>{
            if( this.hasLeaf[n]){
                sortID.push(n)
            }
            else{
                noCTEdge.push(n)
            }
        })

        sortID.sort( (elem1,elem2) => this.medianSlotHeuristic(elem1,graph) - this.medianSlotHeuristic(elem2,graph))
        graph.outDegree[parentID] = sortID.concat(noCTEdge)
    }

    medianSlotHeuristic(vertex,graph){
        let neighbourIndex = []
        graph.outDegree[vertex].forEach(id=>{
            neighbourIndex.push(this.slotIndexMap[id])
        })
        return this.calculateMedian(neighbourIndex)
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


    calculateY(graph,drawing,leafID){
        let sum = 0
        graph.outDegree[leafID].forEach(id=>sum += drawing[id].y)
        return sum / graph.outDegree[leafID].length
    }


    calculateASHeuristic(current,graph,tree){

        if( current in tree.outDegree){
            let sum = 0
            tree.outDegree[current].forEach(n=>{
                this.calculateASHeuristic(n,graph,tree)
                sum += this.heuristicAS[n]

            })
            this.heuristicAS[current] = sum
        }
        else{
            if( current in graph.outDegree) this.heuristicAS[current] = -10
            else this.heuristicAS[current] = 1
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
