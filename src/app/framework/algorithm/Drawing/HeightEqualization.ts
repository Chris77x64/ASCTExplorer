import {Point2D} from "../../model/Point2D";
import {InducedSubgraph} from "../../model/InducedSubgraph";

export class HeightEqualization {

    drawing: Map<number,Point2D>
    graph: InducedSubgraph

    incrementCT: number
    incrementBM: number

    angleThreshold: number

    lastBMY: number
    flag : boolean

    usedBM: Map<number,boolean>

    constructor(graph,drawing) {

        this.graph = graph
        this.drawing = drawing

        let tree = new InducedSubgraph(graph,graph.verticesAS)
        let root = this.calculateRoot(tree)
        this.incrementCT = 0
        this.incrementBM = 0
        this.angleThreshold = -15

        this.lastBMY = -1
        this.flag = false
        this.usedBM = new Map<number, boolean>()
        this.graph.verticesBM.forEach(id=> this.usedBM[id]=false)
        this.calculateBlocks(root,tree,graph)


    }


    calculateBlocks(current,tree,graph) {
        if (current in tree.outDegree) {
            let flag = false
            tree.outDegree[current].forEach(id => {
                flag = this.calculateBlocks(id, tree, graph)
            })
            if (flag) {
                let asBlock = tree.outDegree[current]

                let currentCT = []
                let currentBM = []


                asBlock.forEach(as => {
                    if (as in graph.outDegree) {

                        graph.outDegree[as].forEach(ct => {
                            currentCT.push(ct)
                        })
                    }
                })

                let setCurrentCT = new Set(currentCT)
                currentCT = Array.from(setCurrentCT)

                currentCT.forEach(ct => {
                    if (ct in graph.outDegree) {
                        graph.outDegree[ct].forEach(bm => {
                            currentBM.push(bm)
                        })
                    }
                })
                let setCurrentBM = new Set(currentBM)
                currentBM = Array.from(setCurrentBM)

                if (currentCT.length > 0) {



                    currentCT.forEach(id => {
                        this.drawing[id].y += this.incrementCT
                    })
                    currentBM.forEach(id => {
                        this.drawing[id].y += this.incrementBM
                         // if( !this.usedBM[id]) this.drawing[id].y += this.incrementBM
                    })

                    let firstAS = this.calculateSmallest(asBlock, this.drawing)
                    let firstCT = this.calculateSmallest(currentCT, this.drawing)
                    const angle = this.calculateAngle(firstAS, firstCT)

                    if (angle < this.angleThreshold && asBlock.length > 1) {

                        let diffCT = Math.abs(firstAS.y - firstCT.y)
                        currentCT.forEach(id => {
                            this.drawing[id].y += diffCT
                        })
                        this.incrementCT += diffCT

                        if (currentBM.length > 0) {
                            let bmflag = false
                            currentBM.forEach(id => {
                                if( !this.usedBM[id]){
                                    this.drawing[id].y += diffCT
                                    this.usedBM[id] = true
                                    bmflag = true
                                }
                            })
                            if( bmflag) this.incrementBM += diffCT
                        }
                    }
                }
        }
        return false
    }
        else return true

    }

    calculateSmallest(set,drawing){
        let smallestY = Number.POSITIVE_INFINITY
        let smallestPoint = null
        set.forEach(id=>{
            if( drawing[id].y < smallestY){
                smallestY = drawing[id].y
                smallestPoint = drawing[id]
            }
        })
        return smallestPoint
    }


    calculateAngle( start: Point2D, end: Point2D){
        let angle = Math.atan2(end.y-start.y,end.x-start.x)* (180/Math.PI)
        return angle
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



}
