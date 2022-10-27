import {Point2D} from "../../model/Point2D";
import {InducedSubgraph} from "../../model/InducedSubgraph";
import {OneSidedCrossingMinimization} from "../OneSidedCrossingMinimization";
import {Type} from "../../util/Properties";
import {Edge} from "../../model/Edge";
import {BiomarkerAugementation} from "./BiomarkerAugementation";
import {HeightEqualization} from "../Drawing/HeightEqualization";
import {ASTreeLayoutClipping} from "../Drawing/ASTreeLayoutClipping";

export class AbstractDrawingBM {

    drawing: Map<number,Point2D>
    graph: InducedSubgraph

    slotsCT: number[]
    slotsBM: number[]


    biomarkerX: number
    cellTypeX: number


    offsetIncrementCT: number
    offsetIncrementBM: number


    feasible: boolean
    angleThreshold : number

    constructor(graph,percentage,slotsCT,biomarkerX,cellTypeX,offsetIncrementCT,offsetIncrementBM) {
        this.drawing = new Map<number, Point2D>()
        this.graph = new InducedSubgraph(graph,graph.vertices)

        this.biomarkerX = biomarkerX
        this.cellTypeX = cellTypeX
        this.angleThreshold = 55
        this.feasible = true

        this.augment(slotsCT,percentage)
        this.draw(offsetIncrementBM,offsetIncrementCT)
        this.isFeasible()

    }

    isFeasible(){
        this.graph.verticesCT.forEach(id=>{
            if( id in this.graph.outDegree){
                this.graph.outDegree[id].forEach(n=>{
                    let pointCT = this.drawing[id]
                    let pointBM = this.drawing[n]
                    if( this.calculateAngle(pointCT,pointBM) > this.angleThreshold) this.feasible = false
                   // console.log(pointCT,pointBM,this.calculateAngle(pointCT,pointBM),this.calculateLengthEdge(pointCT,pointBM))
                })
            }
        })
    }

    augment(slotsCT,percentage){
        this.slotsCT = slotsCT
        let minimizationCTBM = new OneSidedCrossingMinimization(this.graph, this.slotsCT, this.graph.verticesBM)
        this.slotsBM = minimizationCTBM.slots
        let augmentationBM = new BiomarkerAugementation(this.slotsCT,this.graph, percentage)
        let minimizationCTBM2 = new OneSidedCrossingMinimization(this.graph, this.slotsCT, this.graph.verticesBM)
        this.slotsBM = minimizationCTBM2.slots
    }

    draw(offsetIncrementBM,offsetIncrementCT){
        let offsetBM = 0
        this.slotsBM.forEach(vertexID => {
            let currentPoint = new Point2D(this.biomarkerX, offsetBM)
            offsetBM = offsetBM + offsetIncrementBM
            this.drawing[vertexID] = currentPoint
        })
        this.averageSpacingCT(this.slotsCT, 0,offsetIncrementCT)
        this.maintainMinimumDistanceCT(this.slotsCT,offsetIncrementCT)

        
    }

    calculateNeighborYMean(vertexID){

        let sum = 0
        if( vertexID in this.graph.outDegree){
            let divisor = 0
            this.graph.outDegree[vertexID].forEach(biomarkerID=>{
                if( this.graph.vertexType[biomarkerID] == Type.BM && this.graph.inDegree[biomarkerID].length == 1) {
                    sum = sum + this.drawing[biomarkerID].y
                    divisor += 1
                }
            })
            if( divisor !== 0) return sum/divisor
            else return -1
        }
        else{
            return  -1
        }

    }

    averageSpacingCT(slotsCT,offsetCT,offsetIncrementCT){
        slotsCT.forEach(vertexID => {
            let average = this.calculateNeighborYMean(vertexID)

            if( average == -1){
                let currentPoint = new Point2D(this.cellTypeX, offsetCT+offsetIncrementCT)
                offsetCT = currentPoint.y
                this.drawing[vertexID] = currentPoint
            }
            else{
                let currentPoint = new Point2D(this.cellTypeX,average)
                offsetCT = currentPoint.y
                this.drawing[vertexID] = currentPoint
            }
        })
    }

    maintainMinimumDistanceCT(slotsCT,offsetIncrementCT){


        if( slotsCT.length > 0) {
            let newOffset = this.drawing[slotsCT[0]].y

            for (let k = 1; k < slotsCT.length; k++) {

                let currentID = slotsCT[k]
                let prevID = slotsCT[k - 1]

                let currentPoint = this.drawing[currentID]

                if (currentPoint.y - newOffset < offsetIncrementCT) {
                    let newX = this.drawing[prevID].x
                    let newY = newOffset + offsetIncrementCT
                    newOffset = newY
                    this.drawing[currentID] = new Point2D(newX, newY)
                } else {
                    newOffset = currentPoint.y
                }

            }
        }
    }

    calculateAngle( start: Point2D, end: Point2D){
        let angle = Math.atan2(end.y-start.y,end.x-start.x)* (180/Math.PI)
        return Math.abs(angle)
    }
    calculateLengthEdge(start: Point2D, end: Point2D){
        return Math.sqrt( (end.x-start.x)*(end.x-start.x) + (end.y-start.y)*(end.y-start.y)  )
    }


}
