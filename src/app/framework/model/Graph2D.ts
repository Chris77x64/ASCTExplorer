import {Graph} from "./Graph";
import {
  Type,
  Properties
} from "../util/Properties";
import {Point2D} from "./Point2D";
import {defaultSpecification} from "../util/Specification";
import {GraphStyle} from "../view/GraphStyle"
import {Layout, LayoutClass} from "../view/Layout"
import {InducedSubgraph} from "./InducedSubgraph";
import {switchAll} from "rxjs/operators";

export class Graph2D{

    graph: Graph | InducedSubgraph
    layout: Layout
    vertexPosition: Map<number,Point2D>
    graphStyle: GraphStyle
    properties: Properties

    constructor(graph: Graph | InducedSubgraph, layout: Layout,properties: Properties) {
        this.graph = graph
        this.layout = layout
        this.properties = properties
        this.graphStyle = new GraphStyle(layout.maximumHeight,layout.maximumWidth,true,properties)
        this.vertexPosition = layout.drawing
    }


    exportSpecification(animation: boolean){

        let result = JSON.parse(JSON.stringify(defaultSpecification))

        let vertexData = []
        let edgeData = []
        let edgeDataStraightLines = []
        let rectData = []

        let edgeColor : String

        if( this.graphStyle.darkMode) edgeColor = "white"
        else edgeColor= "black"

        this.applyLayoutSpecifics(rectData)
        this.processGraph(vertexData,edgeData,edgeDataStraightLines,edgeColor)


        result.data[0].values = vertexData
        result.data[1].values = edgeData
        result.data[2].values = rectData
        result.data[3].values = edgeDataStraightLines

        if( animation) return this.graphStyle.exportSpezificationAnimation(result,this.layout)
        else return this.graphStyle.exportSpezification(result,this.layout)
    }

    applyLayoutSpecifics(rectData){
        switch (this.layout.class) {
            case LayoutClass.Partial:
                break;
            case LayoutClass.Subgraph:
                break;
            case LayoutClass.Exploration:
                break;
            case LayoutClass.Containment:{
                //this.normalizationString(this.graph)
                this.processContainment(rectData)
            }
        }
    }


    formatLabelTwoLines(graph,id){

            let label = graph.vertexLabel[id]


            if(typeof label === 'string') {
                let words = label.split(' ')


                let newLabel1 = ""
                let newLabel2 = ""

                let countLetters = 0

                words.forEach(word => {

                    if (countLetters > (label.length / 3)) {
                        newLabel2 = newLabel2 + " " + word
                    } else {
                        newLabel1 = newLabel1 + " " + word
                    }
                    countLetters += word.length

                })

                if (newLabel2.length > 0) {
                    return [newLabel1, newLabel2]
                } else {
                    return [newLabel1]
                }
            }
            else return label

    }

    processContainment(rectangleData){
        if( this.layout.rects.length > 0){
            this.layout.rects.forEach(rectangle=>{
                rectangleData.push(
                    {
                        "x": rectangle.positionX,
                        "y": rectangle.positionY,
                        "w": rectangle.width,
                        "h": rectangle.height
                    })
            })
        }
    }

    processGraph(vertexData,edgeData,edgeDataStraightLines,edgeColor){


        this.graph.vertices.forEach(vertexID => {


            if( ! (vertexID in this.vertexPosition)){
                console.log("IDDDD",vertexID,console.log(this.graph.vertexType[vertexID]))
            }

            const currentPosition = this.vertexPosition[vertexID]


            let vertexShape = "circle"
            let currentLabel = this.calculateVertexLabel(vertexID)
            this.graph.vertexLabel[vertexID] = currentLabel


            let vertexSize = this.graph.vertexSize[vertexID]


            let labelColor : String
            if( this.graphStyle.darkMode){
                labelColor = "#fff"
            }
            else{
                labelColor = "#000"
            }

            if( this.layout.class == LayoutClass.Containment &&
                (this.graph.vertexType[vertexID] == Type.CT || this.graph.vertexType[vertexID] == Type.AS)){

                if( this.graph.vertexColor[vertexID] == "black"){
                    //vertexShape = "square"
                    if( this.graphStyle.darkMode){
                        labelColor = "#000"
                    }
                    else{
                        labelColor = "#fff"
                    }
                }
            }

            let labelOffsetX = 0
            let labelOffsetY = this.calculateLabelOffset(vertexID)
            let currentColor = this.graph.vertexColor[vertexID]


            if( this.graphStyle.darkMode && currentColor == "black" ){
                currentColor = "white"
            }



            let currentVisibility = this.graph.vertexVisible[vertexID]
          let angle: number

          if(this.layout.rotation.rotateAngle == 0 || this.layout.rotation.rotateAngle == 90){
            angle = 0
          }
          else{
            angle = 270
          }
         // angle = //this.layout.labelPosition[vertexID]




           // console.log('HEIGHT',window.screen.height,window.screen.width,Math.sqrt((window.screen.height*window.screen.height)+(window.screen.width*window.screen.width)))

          let vertexType: String
          switch(this.graph.vertexType[vertexID]){
              case Type.AS:{
                vertexType = 'Anatomical Structure'
                break
              }
              case Type.CT:{
                vertexType = 'Cell Type'
                break
              }
            case Type.BM:{
              vertexType = 'Biomarker'
                break
              }
            }

            vertexData.push(
                {
                    "id": vertexID,
                    "x": currentPosition.x,
                    "y": currentPosition.y,
                    "color": currentColor,
                    "label": currentLabel,
                    "visible": currentVisibility,
                    "labelOffsetX": labelOffsetX,
                    "labelOffsetY": labelOffsetY,
                    "labelColor":  labelColor,
                    "vertexSize": vertexSize,
                    "vertexShape": vertexShape,
                    "vertexType": vertexType,
                    "angle": angle
                })

            if (vertexID in this.graph.outDegree) {
                let neighborhood = this.graph.outDegree[vertexID]
                neighborhood.forEach(neighborID => {

                    let key = String(vertexID)+'|'+ String(neighborID)
                    let opacity: number
                    if(this.layout.highlightedEdge[key]){
                        opacity = 1
                    }
                    else{
                        opacity = 0.4
                    }


                    if( this.graph.vertexType[vertexID] == Type.AS && this.graph.vertexType[neighborID] == Type.AS ){
                        //(this.graph.vertexVisible[vertexID] == 0 && this.graph.vertexType[vertexID] == Type.AS && this.graph.vertexType[neighborID] == Type.CT) ) {
                        edgeData.push(
                            {
                                "source": vertexID,
                                "target": neighborID,
                                "color": edgeColor,
                                "opacity": opacity
                            })
                    }
                    else{
                        edgeDataStraightLines.push(
                            {
                                "source": vertexID,
                                "target": neighborID,
                                "color": edgeColor,
                                "opacity": opacity
                            })
                    }

                })
            }
        })
    }




    calculateVertexLabel(vertexID){
        let vertexLabel: any

        let oneLineLabel = this.graph.vertexLabel[vertexID]
        let twoLineLabel = this.formatLabelTwoLines(this.graph,vertexID)
        switch (this.layout.class) {
            case LayoutClass.Containment:
                switch (this.graph.vertexType[vertexID]) {
                    case Type.AS:
                        vertexLabel = twoLineLabel
                        break
                    case Type.CT:
                        vertexLabel = twoLineLabel
                        break
                    case Type.BM:
                        vertexLabel = oneLineLabel
                        break
                }
                break
            default:
                switch (this.graph.vertexType[vertexID]) {
                    case Type.AS:
                        vertexLabel = twoLineLabel
                        break
                    case Type.CT:
                        vertexLabel = oneLineLabel
                        break
                    case Type.BM:
                        vertexLabel = oneLineLabel
                        break
                }
                break
        }
        return vertexLabel
    }


    calculateLabelOffset(vertexID){
        let labelOffsetY: number
        let currentLabel = this.graph.vertexLabel[vertexID]
        if( currentLabel == null) return 0

        switch (this.layout.class) {
            case LayoutClass.Containment:
                switch (this.graph.vertexType[vertexID]) {
                    case Type.BM:
                        labelOffsetY = this.properties.oneLineLabelOffset
                        break
                    default:
                        if( currentLabel.length == 2){
                            labelOffsetY =  this.properties.twoLineLabelOffset
                        }
                        else{
                            labelOffsetY = this.properties.oneLineLabelOffset
                        }
                        if(this.graph.vertexColor[vertexID] == "black"){
                            let vertexSize = this.graph.vertexSize[vertexID]
                            labelOffsetY = this.properties.collapsedCTLabelOffset
                        }
                        break
                }
                break
            case LayoutClass.Exploration:
                switch (this.graph.vertexType[vertexID]) {
                    case Type.AS:
                        if(currentLabel.length == 2) {
                            labelOffsetY = this.properties.twoLineLabelOffset
                            if( this.graph.vertexSize[vertexID] == this.properties.rootExplorationVertexSize){
                                labelOffsetY = this.properties.rootExplorationTwoLineLabelOffset
                            }
                        }
                        else {
                            labelOffsetY =  this.properties.oneLineLabelOffset
                            if( this.graph.vertexSize[vertexID] == this.properties.rootExplorationVertexSize){
                                labelOffsetY = this.properties.rootExplorationOneLineLabelOffset
                            }
                        }
                        break
                    default:
                        labelOffsetY =  this.properties.oneLineLabelOffset
                        break

                }
                break
            default:
                if( currentLabel.length == 2){
                    labelOffsetY =  this.properties.twoLineLabelOffset
                }
                else{
                    labelOffsetY =  this.properties.oneLineLabelOffset
                }
                break
        }
        return labelOffsetY
    }


}
