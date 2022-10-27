import {Containment} from "./Containment";
import {InducedSubgraph} from "../model/InducedSubgraph";
import {ASLeaves} from "../algorithm/Anatomical Structures/ASLeaves";
import {BipartiteCrossings} from "../algorithm/BipartiteCrossings";

export class ContainmentReordering2 {

  containment: Containment;
  graph: InducedSubgraph;

  heuristicContainment: Map<number,number>
  asTreeLeafIndex: Map<number,number>

  vFixed : number[]

  constructor( containment: Containment, graph: InducedSubgraph) {

    this.containment = containment;
    this.graph = graph;

    this.vFixed = new ASLeaves(this.graph).leaves
    let reorder = this.reorder(this.containment.root)
    this.containment.update()

  }

/*
implementation of heaps algorithm for permutations
all credit to https://www.30secondsofcode.org/js/s/permutations
 */
  permutations = arr => {
    if (arr.length <= 2) return arr.length === 2 ? [arr, [arr[1], arr[0]]] : arr;
    return arr.reduce(
      (acc, item, i) =>
        acc.concat(
          this.permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map(val => [
            item,
            ...val,
          ])
        ),
      []
    );
  }

  reorder(current){
    if( current in this.containment.outDegree){

      let set = []
      this.containment.outDegree[current].forEach(id=>{
        set.push(this.reorder(id))
      })

      let indices = Array.from(set.keys())

      let permutations = this.permutations(indices)

      let minIndexPermutation = []
      let minPermutation = []
      let minCrossings = Number.POSITIVE_INFINITY

      for(let i=0; i < permutations.length; i++){
        let currentPermutation = permutations[i]

        let linearOrder = []
        currentPermutation.forEach(index=>linearOrder = linearOrder.concat(set[index]))
        let crossings = new BipartiteCrossings(this.graph,this.vFixed,linearOrder).crossings
        if( crossings < minCrossings){
          minCrossings = crossings
          minIndexPermutation = currentPermutation
          minPermutation = linearOrder
        }

      }

      let newAdjacencyList = []
      minIndexPermutation.forEach(index => newAdjacencyList.push((this.containment.outDegree[current])[index]))
      this.containment.outDegree[current] = newAdjacencyList

      return minPermutation
    }
    else{
      return [current]
    }
  }

}
