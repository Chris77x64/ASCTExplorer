import {InducedSubgraph} from "../../model/InducedSubgraph";
import {Point2D} from "../../model/Point2D";
import {Graph} from "../../model/Graph";

export class ASTreeLayout {

  /*
Credits go to: https://llimllib.github.io/pymag-trees/ for basic idea of post-order traversal on trees
Retrieved 20.05.2022
 */

  nextYonLayer: number[]

  nextConnnectedComponentOffset: number

  depthMultiplier: number
  offsetsX: number[]
  maximumX: number

  offsetIncrementAS: number

  constructor(graph,tree,drawing, startY,offsetIncrementAS,depthMultiplier ) {

    this.offsetsX = [ ]
    this.offsetIncrementAS = offsetIncrementAS
    this.depthMultiplier = depthMultiplier
    this.nextConnnectedComponentOffset = startY
    this.maximumX = 0

    let roots = this.calculatePossibleRoots(graph)

    roots.forEach(rootID=>{
      this.nextYonLayer = []
      this.drawLayout(rootID,0,graph,tree,drawing)
      this.nextConnnectedComponentOffset = this.nextYonLayer[this.nextYonLayer.length-1]
      let currentWidth = (this.nextYonLayer.length-1)*this.depthMultiplier
      if( currentWidth > this.maximumX ){
        this.maximumX = currentWidth
      }
    })

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

  drawLayout(currentID, recursionDepth, graph, tree, drawing){

    if( typeof this.nextYonLayer[recursionDepth] === 'undefined'){
      this.nextYonLayer.push(this.nextConnnectedComponentOffset)
    }

    let currentX = recursionDepth * this.depthMultiplier+ 50
    let currentY : number

    // exists children of node currentID
    if( currentID in tree.outDegree) {
      let children = tree.outDegree[currentID]
      children.forEach(currentChildID => {
        this.drawLayout(currentChildID, recursionDepth + 1, graph,tree,drawing)
      })
    }

    if( currentID in tree.outDegree) {
      let children = tree.outDegree[currentID]
      if ( children.length == 1){
        currentY = drawing[children[0]].y
      }
      else{
        let leftmostChild = children[0]
        let rightmostChild = children[children.length-1]
        let leftmostY = drawing[leftmostChild].y
        let rightmostY = drawing[rightmostChild].y
        currentY = (leftmostY+rightmostY) / 2
      }
    }
    else{
      currentY = this.nextYonLayer[recursionDepth]
    }

    drawing[currentID] = new Point2D( currentX,currentY)
    this.nextYonLayer[recursionDepth] = this.nextYonLayer[recursionDepth] + this.offsetIncrementAS

  }
}
