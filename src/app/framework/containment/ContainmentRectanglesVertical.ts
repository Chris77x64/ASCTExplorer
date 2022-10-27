
import {Containment} from "./Containment";
import {Rectangle} from "../model/Rectangle";
import {Point2D} from "../model/Point2D";

export class ContainmentRectanglesVertical {


    containment : Containment
    drawing: Map<number,Point2D>
    rectangles: Rectangle[]
    offset: number


    smallestWidth: number

    recursionSteps: number
    offsetCT : number

    aid: number

    constructor( containment: Containment, drawing, offsetIncrementCT ) {
        this.containment = containment
        this.drawing = drawing
        this.offset = 50

        this.rectangles = []


        this.smallestWidth = window.screen.width /14

        this.recursionSteps = 0

        this.recursionSteps = 0

        this.aid = -800000
        let f = this.calculateFakeOutDeg()


        this.calculateHeight(this.containment.root,1,f)
        this.recursionSteps -= 1
        this.offsetCT = offsetIncrementCT

        this.parseRectangles(f)

    }

    calculateFakeOutDeg(){
      this.aid = -800000
      let f = new Map<number,number[]>()
      this.worker2(this.containment.root,f)
      f[this.containment.root] = this.containment.outDegree[this.containment.root]
      return f
    }

  worker2( id,f){

    if( id in this.containment.outDegree){
      if( this.containment.containerState[id] == true) {
        this.containment.outDegree[id].forEach(n=>{
          this.worker2(n,f)
        })
        f[id] = this.containment.outDegree[id]
      }
      else{
        this.aid = this.aid - 1
        f[id] = [this.aid]
      }
    }

  }


    parseRectangles(outDeg){
        let root = this.containment.root

        if( root in outDeg){
          outDeg[root].forEach(n=>{
                  this.worker(n,outDeg,this.recursionSteps)
            })
        }
    }

    worker(current,outDeg,h){
        if( current in outDeg){

            let smallestPoint = this.workerSmallestY(current,outDeg)
            let largestPoint = this.workerLargestY(current,outDeg)
            let width = this.smallestWidth * Math.exp((h/this.recursionSteps))

            let incrementYOverTime = (  (this.offsetCT/5) / this.recursionSteps )* h

            let positionX = smallestPoint.x - width/2
            let sizeV = Math.sqrt((window.screen.height*window.screen.height)+(window.screen.width*window.screen.width))/2
            let positionY = (smallestPoint.y - ( 5*  0.3 * Math.sqrt(sizeV)) ) - incrementYOverTime



            let minimumHeight =  (largestPoint.y - smallestPoint.y) + ( smallestPoint.y-positionY)
            let heightIncrementOverTime =  (((this.offsetCT/2.5))/this.recursionSteps) *h
            let height = minimumHeight + heightIncrementOverTime

            this.rectangles.push(new Rectangle(positionX ,positionY,width,height))

          outDeg[current].forEach(n=>{
                this.worker(n,outDeg,h-1)
            })
        }
    }

    workerSmallestY(current,outDeg): Point2D{
        if( current in outDeg){
            let point = new Point2D(Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY)
            outDeg[current].forEach(n=>{
                let currentPoint = this.workerSmallestY(n,outDeg)
                if( currentPoint.y < point.y){
                    point = currentPoint
                }
            })
            return point
        }
        else{
            return this.drawing[current]
        }
    }

    workerLargestY(current,outDeg){
        if( current in outDeg){
            let point = new Point2D(Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY)
          outDeg[current].forEach(n=>{
                let currentPoint = this.workerLargestY(n,outDeg)
                if( currentPoint.y > point.y){
                    point = currentPoint
                }
            })
            return point
        }
        else{
            return this.drawing[current]
        }
    }

    calculateHeight(current,h,outDeg){
        if( current in outDeg){
          outDeg[current].forEach(n=>{
                this.calculateHeight(n,h+1,outDeg)
            })
        }
        else{
            if( h > this.recursionSteps){
                this.recursionSteps = h
            }
        }
    }

}
