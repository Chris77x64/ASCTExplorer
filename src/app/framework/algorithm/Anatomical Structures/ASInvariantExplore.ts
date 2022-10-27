import {Type} from "../../util/Properties";
import {InducedSubgraph} from "../../model/InducedSubgraph";

export class ASInvariantExplore {

  dummyID: number
  leafMap: Map<number,boolean>

  constructor( graph) {
    this.dummyID = -9000000
    this.leafMap = new Map<number, boolean>()

    let tree = new InducedSubgraph(graph,graph.verticesAS)
    tree.vertices.forEach(id=>this.leafMap[id] = false)

    let root= this.calculateRoot(tree)
    this.leafWorker(root,tree)
    this.postOrder(root,graph)


  }


  calculateRoot(tree){
    let result = null
    tree.vertices.forEach(id=>{
      if( id in tree.inDegree){

      }
      else{
        result = id
      }
    })
    return result
  }

  leafWorker( current,tree){

    if( current in tree.outDegree){
      tree.outDegree[current].forEach(child =>{
        this.leafWorker(child,tree)
      })
    }
    else{
      this.leafMap[current] = true
    }
  }


  postOrder( current,graph){

    if( current in graph.outDegree){

      let correspondingCT = []
      graph.outDegree[current].forEach(child =>{

        switch (graph.vertexType[child]) {
          case Type.AS:{
            this.postOrder(child,graph)
            break
          }
          case Type.CT :{
            if( ! this.leafMap[current]) correspondingCT.push(child)
            break
          }
        }
      })

      if( correspondingCT.length > 0) this.shrinkGraph(graph,current,correspondingCT)

    }

  }

  shrinkGraph(graph,current,child){

    child.forEach(id=>{
      this.removeByValue(id, graph.outDegree[current])
      this.removeByValue(current,graph.inDegree[id])
    })

  }

  removeByValue(value,arr){
    let index = arr.indexOf(value)
    if( index != -1) {
      arr.splice(index, 1)
    }
  }

}
