import {Graph} from "../../model/Graph";
import {InducedSubgraph} from "../../model/InducedSubgraph";
import {Point2D} from "../../model/Point2D";
import {ASLeaves} from "../Anatomical Structures/ASLeaves";

export class ASTreeLayoutClipping {

    /*
    Credits go to: https://llimllib.github.io/pymag-trees/ for basic idea of post-order traversal on trees
    Retrieved 20.05.2022
     */

    nextYonLayer: number[]

    nextConnnectedComponentOffset: number

    depthMultiplier: number
    offsetsX: number[]

    maximumX: number
    maximumY: number

    neighbourMAP: Map<number,number[]>

    offsetIncrementAS: number

    constructor(graph,drawing,depth,depthMultiplier,offsetIncrementAS) {

        this.offsetsX = [ ]
        this.offsetIncrementAS = offsetIncrementAS
        this.depthMultiplier = depthMultiplier
        this.nextConnnectedComponentOffset = 0
        this.maximumX = 0

        let tree = new InducedSubgraph(graph,graph.verticesAS)
        let asLeaves = new ASLeaves(graph)
        let leaves = asLeaves.leaves

        let roots = this.calculatePossibleRoots(graph)

        this.neighbourMAP = new Map<number,number[]>()

        let prev = 0

        leaves.forEach(leafID=>{
            if( leafID in graph.outDegree){

                let sum = 0
                graph.outDegree[leafID].forEach(id=>sum += drawing[id].y)
                sum /= graph.outDegree[leafID].length

                drawing[leafID] = new Point2D((depth)*depthMultiplier+50,sum)
                prev = sum

            }
            else{
                drawing[leafID] = new Point2D((depth)*depthMultiplier+50,prev+offsetIncrementAS)
                prev = prev+offsetIncrementAS
            }
        })
        this.maintainMinimumDistanceAS(leaves,drawing,offsetIncrementAS)

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
            drawing[currentID] = new Point2D( currentX,currentY)
        }

        this.nextYonLayer[recursionDepth] = this.nextYonLayer[recursionDepth] + this.offsetIncrementAS

    }


    maintainMinimumDistanceAS(slotsAS,drawing,offsetIncrementAS) {

        if (slotsAS.length > 0) {
            let newOffset = drawing[slotsAS[0]].y

            for (let k = 1; k < slotsAS.length; k++) {

                let currentID = slotsAS[k]
                let prevID = slotsAS[k - 1]

                let currentPoint = drawing[currentID]
                if (currentPoint.y - newOffset < offsetIncrementAS) {
                    let newX = drawing[prevID].x
                    let newY = newOffset + offsetIncrementAS
                    newOffset = newY
                    drawing[currentID] = new Point2D(newX, newY)
                } else {
                    newOffset = currentPoint.y
                }

            }
            this.maximumY = newOffset
        }
    }
}
