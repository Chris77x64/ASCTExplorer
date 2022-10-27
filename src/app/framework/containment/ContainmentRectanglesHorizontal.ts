
import {Containment} from "./Containment";
import {Rectangle} from "../model/Rectangle";
import {Point2D} from "../model/Point2D";
import {Properties} from "../util/Properties";
import {min} from "rxjs/operators";

export class ContainmentRectanglesHorizontal {


  containment : Containment
  drawing: Map<number,Point2D>
  rectangles: Rectangle[]
  offset: number


  smallestWidth: number

  recursionSteps: number
  offsetCT : number

  properties: Properties
  aid: number

  constructor( containment: Containment, drawing, offsetIncrementCT,properties: Properties ) {
    this.containment = containment
    this.drawing = drawing
    this.offset = 50

    this.rectangles = []
    this.properties = properties

    this.smallestWidth = this.properties.heightDrawingDIV /14

    this.recursionSteps = 0

    this.recursionSteps = 0
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
        this.worker(n,this.recursionSteps,outDeg)
      })
    }
  }

  worker(current,h,outDeg){

    if( current in outDeg){

      let smallestPoint = this.workerSmallestX(current,outDeg)
      let largestPoint = this.workerLargestX(current,outDeg)

      let widthIncrementOverTime =  (((this.offsetCT/2.5))/this.recursionSteps) *h

      let height = this.smallestWidth * Math.exp((h/this.recursionSteps))


      let decrementXOverTime = (  (this.offsetCT/5) / this.recursionSteps )* h


      let positionX = smallestPoint.x + this.properties.twoLineLabelOffset - widthIncrementOverTime //- decrementXOverTime -this.properties.twoLineLabelOffset
      let positionY =  smallestPoint.y -height/2  //(smallestPoint.x - ( this.properties.twoLineLabelOffset)) - incrementYOverTime


      let minimumWidth =  (largestPoint.x - smallestPoint.x) + ( smallestPoint.x- positionX)
      widthIncrementOverTime =  (((this.offsetCT/2.5))/this.recursionSteps) *h

      let width =  minimumWidth+ widthIncrementOverTime //( smallestPoint.x-positionX)//+ h*decrementXOverTime//- 2*this.properties.twoLineLabelOffset + decrementXOverTime


      this.rectangles.push(new Rectangle(positionX ,positionY,width,height))

      outDeg[current].forEach(n=>{
        this.worker(n,h-1,outDeg)
      })
    }
  }


  workerSmallestX(current,outDeg): Point2D{
    if( current in outDeg){
      let point = new Point2D(Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY)
      outDeg[current].forEach(n=>{
        let currentPoint = this.workerSmallestX(n,outDeg)
        if( currentPoint.x < point.x){
          point = currentPoint
        }
      })
      return point
    }
    else{
      return this.drawing[current]
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


  workerLargestX(current,outDeg){
    if( current in outDeg){
      let point = new Point2D(Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY)
      outDeg[current].forEach(n=>{
        let currentPoint = this.workerLargestX(n,outDeg)
        if( currentPoint.x > point.x){
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
