import {InducedSubgraph} from "../model/InducedSubgraph";

interface Edge {
  source: number,
  target: number
}

export class BipartiteCrossings {

  graph: InducedSubgraph

  vFixed: number[]
  vFree: number[]

  orderFixed: Map<number,number>
  orderFree: Map<number,number>

  bipartiteEdges: Edge[]
  crossings: number
  crossings2: number

  constructor(graph: InducedSubgraph,vFixed: number[],vFree: number[]) {
    this.graph = graph
    this.vFixed = vFixed
    this.vFree = vFree
    this.calculateLinearOrders()
    this.calculateEdges()
    this.calculateCrossings()
  }

  calculateLinearOrders(){
    this.orderFixed = new Map<number, number>()
    for( let i=0; i < this.vFixed.length; i++){
      this.orderFixed[this.vFixed[i]]=i+1
    }
    this.orderFree = new Map<number,number>()
    for( let i=0; i < this.vFree.length; i++){
      this.orderFree[this.vFree[i]]=i+1
    }
  }

  calculateEdges(){
    this.bipartiteEdges = []
    this.vFixed.forEach(id=>{
      if( id in this.graph.outDegree){
        this.graph.outDegree[id].forEach(n=>{
          if( this.vFree.includes(n)) {
            this.bipartiteEdges.push({
              source: id,
              target: n
            })
          }
        })
      }
    })
  }

  calculateCrossings(){
    this.crossings = 0
    this.bipartiteEdges.forEach(edge1=>{
      this.bipartiteEdges.forEach(edge2=>{
        if( edge1.source == edge2.source && edge1.target == edge2.target){

        }
        else{
          if( this.isCrossing(edge1,edge2)) this.crossings +=1
        }
      })
    })
    this.crossings = this.crossings * 0.5
  }

  isCrossing(edge1: Edge, edge2: Edge): boolean{
    if( (this.orderFixed[edge1.source]-this.orderFixed[edge2.source]) * (this.orderFree[edge1.target]-this.orderFree[edge2.target]) < 0){
      return true
    }
    else return false
  }


}
