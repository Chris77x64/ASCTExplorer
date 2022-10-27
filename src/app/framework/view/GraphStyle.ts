import {LayoutClass} from "./Layout";
import {
  Properties
} from "../util/Properties";

export class GraphStyle {

    drawingWidth: number
    drawingHeight: number

    vertexSize: number

    labelEnabled: boolean
    labelSize: number
    labelFill: String

    darkMode: boolean

    properties: Properties

    constructor(drawingHeight,drawingWidth,darkMode,properties) {
        this.properties = properties
        this.drawingHeight = Math.max(drawingHeight,this.properties.heightDrawingDIV)
        this.drawingWidth = Math.max(drawingWidth+this.properties.widthRightPadding,this.properties.withDrawingDIV)
        this.darkMode = darkMode

        this.initializeLabelParameter()
    }


    initializeLabelParameter(){
        this.labelEnabled = true
        this.labelSize = this.properties.vertexLabelSize

        if( this.darkMode){
            this.labelFill = "#fff"
        }
        else{
            this.labelFill = "#000"
        }
    }

    toggleLabelEnabled(value: boolean){
        this.labelEnabled = !this.labelEnabled
    }

    exportSpezificationAnimation(spezification,layout){

        let result = spezification

        result.width = this.drawingWidth
        result.height = this.drawingHeight

      let orient = ""
      switch (layout.angle) {
        case 0:{
          orient = "horizontal"
          break
        }
        case 90:{
          orient = "horizontal"
          break
        }
        default:{
          orient = "vertical"
        }
      }


        result.data[1].transform[1].orient = orient

        spezification.marks[2].encode.enter.stroke = {"field": "color"}
        if( this.darkMode) {
            spezification.marks[1].encode.enter.fill = {"value": "#000000"}
            spezification.marks[1].encode.enter.stroke = {"value": "#ffffff"}
            spezification.marks[2].encode.enter.opacity = {"field": "opacity"}
            spezification.marks[3].encode.enter.opacity = {"field": "opacity"}// {"value": 0.8}
            // spezification.marks[1].encode.enter.strokeOpacity = {"field": "opacity"} //{"value": 0.8}
        }
        else{
            spezification.marks[2].encode.enter.opacity = {"value": 0.5}
            spezification.marks[2].encode.enter.strokeOpacity =  {"field": "opacity"}//{"value": 0.85}//{"value": 0.45}
            spezification.marks[3].encode.enter.opacity = {"value": 0.5}
            spezification.marks[3].encode.enter.strokeOpacity =  {"field": "opacity"}//{"value": 0.85}//{"value": 0.45}
        }


        spezification.signals[4].value = [ 1, this.drawingWidth ]
        spezification.signals[5].value = [ this.drawingHeight,1]

        if(this.labelEnabled){


            let obj =

                {
                    "type": "text",
                    "from": {"data": "vertices"},
                    "encode": {
                        "enter": {
                            "fill": {"field": "labelColor"}
                        },
                        "update": {
                            "x": {"field": "x"},
                            "y": {"field": "y"},
                            "lineHeight": 0,
                            "angle": {"field": "angle"},
                            "dy": {"field": "labelOffsetY"},
                            "dx": {"field": "labelOffsetX"},
                            "fontSize": {"value":  this.labelSize},
                            "fillOpacity": {
                                "value" : 1
                            },
                            "strokeOpacity" : {
                                "value" : 1},
                            "align": {"value": "center"}
                        }
                    },
                    "zindex": 2
                }
            result.marks = [ result.marks[1], result.marks[0], result.marks[2],  result.marks[3],obj  ]

        }
        return result
    }

    exportSpezification(spezification,layout){

        let result = spezification

        result.width = this.drawingWidth
        result.height = this.drawingHeight

        let orient = ""
        switch (layout.angle) {
            case 0:{
                orient = "horizontal"
                break
            }
            case 90:{
                orient = "horizontal"
                break
            }
            default:{
                orient = "vertical"
            }
        }


        result.data[1].transform[1].orient = orient

        spezification.marks[2].encode.enter.stroke = {"field": "color"}
        if( this.darkMode) {
            spezification.marks[1].encode.enter.fill = {"value": "#000000"}
            spezification.marks[1].encode.enter.stroke = {"value": "#ffffff"}
            spezification.marks[2].encode.enter.opacity = {"field": "opacity"}
            spezification.marks[3].encode.enter.opacity = {"field": "opacity"}// {"value": 0.8}
           // spezification.marks[1].encode.enter.strokeOpacity = {"field": "opacity"} //{"value": 0.8}
        }
        else{
            spezification.marks[2].encode.enter.opacity = {"value": 0.5}
            spezification.marks[2].encode.enter.strokeOpacity =  {"field": "opacity"}//{"value": 0.85}//{"value": 0.45}
            spezification.marks[3].encode.enter.opacity = {"value": 0.5}
            spezification.marks[3].encode.enter.strokeOpacity =  {"field": "opacity"}//{"value": 0.85}//{"value": 0.45}
        }


        spezification.signals[4].value = [ 1, this.drawingWidth ]
        spezification.signals[5].value = [ this.drawingHeight,1]

        if(this.labelEnabled){


            let sizeV = this.properties.vertexSize
            let param = this.properties.twoLineLabelOffset

            let obj =

        {
                "type": "text",
                "from": {"data": "vertices"},
                "encode": {
                    "enter": {
                        "fill": {"field": "labelColor"},
                        "text": {"field": "label"}
                    },
                    "update": {
                        "text": {"signal": "if(scale('labelSizeScale',20)< 8,' ',datum.label)"},
                        "x": {"field": "x", "scale": "xscale"},
                        "y": {"field": "y", "scale": "yscale"},
                        //"lineHeight": 0,
                        "angle": {"field": "angle"},
                       // "c": { "signal": "scale('xscaleC',datum.labelOffsetY)"}
                        //"dy": {"signal": "if(scale('yscaleLabel',datum.labelOffsetY) > datum.labelOffsetY,datum.labelOffsetY,0.1*scale('yscaleLabel',datum.labelOffsetY))"},
                        //{"signal": "scale('xscaleC',datum.labelOffsetY)"}, //{"signal": "scale('yscaleC',datum.labelOffsetY)/1.8"}, //min(datum.labelOffsetY,scale('yscaleC',datum.labelOffsetY))"}, //{"signal": "datum.labelOffsetY"},
                        "baseline": {"value": "line-top"},
                        //"dy": {"signal": "datum.labelOffsetY"},

                      "dy": {"signal": "if(datum.labelOffsetY == -7,-7,if(datum.labelOffsetY =="+this.properties.oneLineLabelOffset+"|| datum.labelOffsetY =="+this.properties.rootExplorationOneLineLabelOffset+" ,-sqrt(scale('vertexSizeScale',datum.vertexSize)),-14-sqrt(scale('vertexSizeScale',datum.vertexSize))))"},
                       // "dy": {"signal": "if(isNumber(datum.label),datum.labelOffsetY,max("+param+",scale('yscaleC',datum.labelOffsetY)))"},


                            //"dy": {"signal": "if(scale('labelSizeScale',20)< 10,0,max("+param+",scale('yscaleC',datum.labelOffsetY)))"},
                        //"dy": {"signal": "max(datum.labelOffsetY,scale('yscaleC',datum.labelOffsetY))"},
                        //"dx": {"signal": "max(datum.labelOffsetX,scale('xscaleC',datum.labelOffsetX))"},
                       // "fontSize": {"signal": "if(ydom[1] > height/1.2,"+0+","+this.labelSize+")"}, //) "min("+this.labelSize+",scale('labelSizeScale',"+this.labelSize+"))"},
                        //"fontSize": {"signal": "if(scale('labelSizeScale',20)< 10,0,14)"},//  min("+this.labelSize+",scale('labelSizeScale',"+this.labelSize+"))"},
                        "fillOpacity": {"value" : 1 },
                        "strokeOpacity" : {"value" : 1 },
                        "align": {"value": "center"}
                    }
                },
                "zindex": 2
            }
            result.marks = [ result.marks[1], result.marks[0], result.marks[2],  result.marks[3],obj  ]

        }
        return result
    }
}
