import {Point2D} from "../model/Point2D";
import {Rotation} from "../model/Rotation";


export class LinearMap {

    matrix11: number
    matrix12: number
    matrix21: number
    matrix22: number

    minX : number
    maxX : number
    minY : number
    maxY : number

    constructor(drawing: Map<number,Point2D>, rotation: Rotation ) {

        if( rotation.rotate){
          console.log('ROTATION INTERNAL',rotation.rotateAngle)
            if( rotation.rotateAngle == 90){
                this.apply90Rot(drawing,90)

            }
            else if( rotation.rotateAngle == 180){
                this.applyXYSwap(drawing)
            }
            else if( rotation.rotateAngle == 270){
                this.applyXYSwap(drawing)
                this.apply90Rot(drawing,270)
            }

            this.updateDimensions(drawing)
        }


    }

    applyXYSwap(drawing){

        Object.keys(drawing).forEach( key =>{
            let point = drawing[parseFloat(key)]
            point = new Point2D(point.y+20,point.x+20)
            drawing[parseFloat(key)] = point
        } )
    }

    translateMap(drawing: Map<number,Point2D>){
        Object.keys(drawing).forEach( key =>{
            drawing[parseFloat(key)] = this.translate(drawing[parseFloat(key)],Math.abs(this.minX),Math.abs(this.minY))
        } )
    }


    translate(point: Point2D,tx,ty){
        return new Point2D(point.x+tx,point.y+ty)
    }

    scaleXY(factorX,factorY){
        this.matrix11 = factorX
        this.matrix12 = 0
        this.matrix21 = 0
        this.matrix22 = factorY
    }

    rotate(angle){
        let radiansAngle = (angle * Math.PI) / 180
      this.matrix11 = Math.cos(radiansAngle)
      this.matrix12 = -Math.sin(radiansAngle)
      this.matrix21 = Math.sin(radiansAngle)
      this.matrix22 = Math.cos(radiansAngle)
    }

    calculateMap( point: Point2D){
        let newX = this.matrix11*point.x + this.matrix21*point.y
        let newY = this.matrix12*point.x + this.matrix22*point.y
        return new Point2D(newX,newY)
    }

    apply90Rot(drawing: Map<number,Point2D>,angle){

        let angleR = angle
        this.rotate(angleR)

        Object.keys(drawing).forEach( key =>{
            let point = drawing[parseFloat(key)]
            point = this.calculateMap(point)
            drawing[parseFloat(key)] = point
        } )
        this.updateDimensions(drawing)

        Object.keys(drawing).forEach( key =>{
            let point = drawing[parseFloat(key)]

            let tx= 20
            let ty= 20
            if( this.minX < 0){
                tx = tx + Math.abs(this.minX)
            }
            if( this.minY < 0){
                ty = ty + Math.abs(this.minY)
            }
            point = this.translate(point,tx,ty)

            drawing[parseFloat(key)] = new Point2D(point.y,point.x)
        } )

    }

    applyMap(drawing: Map<number,Point2D>){
        Object.keys(drawing).forEach( key =>{
            drawing[parseFloat(key)] = this.calculateMap(drawing[parseFloat(key)])
        } )
    }

    updateDimensions(drawing: Map<number,Point2D>){
        let minX = Number.MAX_VALUE
        let maxX = Number.MIN_VALUE
        let minY = Number.MAX_VALUE
        let maxY = Number.MIN_VALUE

        Object.keys(drawing).forEach( key =>{
            let point = drawing[key]
            if( point.x < minX){
                minX = point.x
            }
            if( point.x > maxX){
                maxX = point.x
            }
            if( point.y < minY){
                minY = point.y
            }
            if( point.y > maxY){
                maxY = point.y
            }

        } )
        this.minX = minX
        this.maxX = maxX
        this.minY = minY
        this.maxY = maxY
    }

}
