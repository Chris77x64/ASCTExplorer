import {EdgeReplacement} from "../Vertex Replicating/BiomarkerAugementation";
import {Point2D} from "../../model/Point2D";
import {Layout} from "../../view/Layout";
import {Type} from "../../util/Properties";

export class CellTypeClipping {

    layout: Layout
    finalOffset: number

    constructor(layout: Layout,slotsCT,offsetCT) {
        this.layout = layout
        this.averageSpacingCT(slotsCT, offsetCT)
        this.maintainMinimumDistanceCT(slotsCT)

    }

    calculateNeighborYMean(vertexID){

        let sum = 0
        if( vertexID in this.layout.graph.outDegree){
            let divisor = 0
            this.layout.graph.outDegree[vertexID].forEach(biomarkerID=>{
                    if( this.layout.graph.vertexType[biomarkerID] == Type.BM && this.layout.graph.inDegree[biomarkerID].length == 1) {
                        sum = sum + this.layout.drawing[biomarkerID].y
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

    averageSpacingCT(slotsCT,offsetCT){
        slotsCT.forEach(vertexID => {
            let average = this.calculateNeighborYMean(vertexID)

            if( average == -1){
                let currentPoint = new Point2D(this.layout.xPositionCT, offsetCT+this.layout.offsetIncrementCT)
                offsetCT = currentPoint.y
                this.layout.drawing[vertexID] = currentPoint
            }
            else{
                let currentPoint = new Point2D(this.layout.xPositionCT,average)
                offsetCT = currentPoint.y
                this.layout.drawing[vertexID] = currentPoint

            }
        })
    }

    maintainMinimumDistanceCT(slotsCT) {

        if (slotsCT.length > 0) {
            let newOffset = this.layout.drawing[slotsCT[0]].y

            for (let k = 1; k < slotsCT.length; k++) {

                let currentID = slotsCT[k]
                let prevID = slotsCT[k - 1]

                let currentPoint = this.layout.drawing[currentID]

                if (currentPoint.y - newOffset < this.layout.offsetIncrementCT) {
                    let newX = this.layout.drawing[prevID].x
                    let newY = newOffset + this.layout.offsetIncrementCT
                    newOffset = newY
                    this.layout.drawing[currentID] = new Point2D(newX, newY)
                } else {
                    newOffset = currentPoint.y
                }

            }
            this.finalOffset = newOffset + this.layout.offsetIncrementCT
        }
    }

}
