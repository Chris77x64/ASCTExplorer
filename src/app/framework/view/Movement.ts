import {Graph} from "../model/Graph";
import {Point2D} from "../model/Point2D";

export class Movement {

    verticesToMove: number[]

    ticks: number
    drawing: Map<number,Point2D>

    animation: any[]

    constructor( drawing: Map<number,Point2D>,
                 sourceVertices: Point2D[],
                 verticesToMove: number[],
                 targetVertices : Point2D[],
                 ticks: number) {

        this.drawing = drawing
        this.verticesToMove = verticesToMove
        this.ticks = ticks

        this.animation = []


        for( let i=1; i < ticks+1; i++){

            let newMap = new Map<number,number[]>()
            let currentMovement = (1/ticks) * i


            Object.keys(drawing).forEach(key=>{
                newMap[key] = this.drawing[key]
            })

            for( let k=0; k < sourceVertices.length; k++){
                let sourcePoint = sourceVertices[k]
                let targetPoint = targetVertices[k]
                 let newPoint = new Point2D(
                   sourcePoint.x*(1-currentMovement)+targetPoint.x*currentMovement,
                   sourcePoint.y*(1-currentMovement)+targetPoint.y*currentMovement )
                 newMap[verticesToMove[k]] = newPoint
            }

            this.animation.push(newMap)
        }

    }


}
