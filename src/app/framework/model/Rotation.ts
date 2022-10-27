export class Rotation {

    rotateAngle : number
    rotate: boolean

    constructor(rotateAngle) {

        this.rotateAngle = this.rotateStringToNumber(rotateAngle)
        if( this.rotateAngle == 0){
            this.rotate = false
        }
        else{
            this.rotate = true
        }

    }

    rotateStringToNumber(angle){
        switch (angle) {
            case "90 Degree":
                return 180
            case "180 Degree":
                return 90
            case "270 Degree":
                return 270
          default:
                return 0
        }
    }

}
