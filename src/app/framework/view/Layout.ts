import {Point2D} from "../model/Point2D";
import {Graph} from "../model/Graph";
import {InducedSubgraph} from "../model/InducedSubgraph";
import {LinearMap} from "../algorithm/LinearMap";
import {Rectangle} from "../model/Rectangle";
import {Rotation} from "../model/Rotation";
import {Properties} from "../util/Properties";

export abstract class Layout {

    graph: Graph | InducedSubgraph
    class: LayoutClass

    drawing: Map<number, Point2D>


    xPositionCT: number
    xPositionBM: number

    offsetIncrementCT: number
    offsetIncrementBM: number

    offsetIncrementAS: number
    depthMultiplier: number
    depth: number

    angle: number
    rotate: boolean

    offsetCTBM: number

    maximumWidth: number
    maximumHeight: number

    abstract drawBiomarkers(data: number[]): void
    abstract drawCellTypes(data: number[]): void

    slotsCT: number[]
    slotsBM: number[]

    highlightedEdge: Map<string,boolean>
    rects: Rectangle[]

    labelPosition: Map<number,string>

    properties: Properties

    rotation: Rotation

    constructor(graph,rotation: Rotation,properties: Properties) {
        this.graph = graph
        this.drawing = new Map<number, Point2D>()
        this.highlightedEdge = new Map<string, boolean>()
        this.rects = []
        this.labelPosition = new Map<number, string>()
        this.graph.vertices.forEach(id=>this.labelPosition[id] = '0')
        this.angle = rotation.rotateAngle
        this.rotate = rotation.rotate
        this.rotation = rotation
        this.properties = properties
    }

    initializeHighlights(graph,highlightedEdge){
        graph.vertices.forEach(id=>{
            if( id in graph.outDegree){
                graph.outDegree[id].forEach(n=>{
                    let key = String(id)+'|'+ String(n)
                    highlightedEdge[key] = false
                })
            }
        })
    }

    rotateAngle(angle,asLeaves){
        asLeaves.leaves.forEach(id=> {
            this.labelPosition[id] = angle
            if( id in this.graph.inDegree) {
                this.graph.inDegree[id].forEach(n => this.labelPosition[n] = angle)
            }
        })
        this.graph.verticesCT.forEach(id => this.labelPosition[id] = angle)
        this.graph.verticesBM.forEach(id => this.labelPosition[id] = angle)
    }

    calculateWidthHeight() {

        this.maximumWidth = 0
        this.maximumHeight = 0
        this.graph.vertices.forEach(id=>{
            if( this.drawing[id].y > this.maximumHeight) this.maximumHeight = this.drawing[id].y
            if( this.drawing[id].x > this.maximumWidth) this.maximumWidth = this.drawing[id].x
        })
        this.maximumHeight += Math.max(this.offsetIncrementAS,this.offsetIncrementBM,this.offsetIncrementCT)
    }

    calculateDepth(){
        let anatomicalTree = new InducedSubgraph(this.graph,this.graph.verticesAS)
        let root = null
        anatomicalTree.vertices.forEach(id=>{
            if( ! (id in anatomicalTree.inDegree) ){
                root = id
            }
        })
        return this.calculateDepthWorker(anatomicalTree,root)
    }

    calculateDepthWorker(tree,current){
        if( current in tree.outDegree){
            let max = Number.NEGATIVE_INFINITY
            tree.outDegree[current].forEach(id=>{
                let currHeight = this.calculateDepthWorker(tree,id)
                if( currHeight > max) max = currHeight
            })
            return max + 1
        }
        else return 1
    }

    calculateParameter(){



        this.depth = this.calculateDepth()-1

      if( this.rotation.rotateAngle == 0 || this.rotation.rotateAngle == 90){
        if( this.depth == 0) this.depthMultiplier = (this.properties.totalWidth/3)
        else this.depthMultiplier = (this.properties.totalWidth/3) / this.depth
        this.offsetCTBM = this.properties.totalWidth/3
        this.xPositionCT =  this.properties.totalWidth-this.offsetCTBM
        this.xPositionBM = this.properties.totalWidth
      }
      else{
        if( this.depth == 0) this.depthMultiplier = ((this.properties.heightDrawingDIV * 0.90)/3)
        else this.depthMultiplier = ((this.properties.heightDrawingDIV * 0.90)/3) / this.depth
        this.offsetCTBM = (this.properties.heightDrawingDIV * 0.90)/3
        this.xPositionCT =  (this.properties.heightDrawingDIV * 0.90)-this.offsetCTBM
        this.xPositionBM = (this.properties.heightDrawingDIV * 0.90)
      }


        if( this.class == LayoutClass.Containment){
            this.offsetIncrementAS = this.properties.offsetIncrementTwoLines
            this.offsetIncrementCT = 2* this.offsetIncrementAS
            this.offsetIncrementBM = this.properties.offsetIncrementTwoLines
        }
        else{
            this.offsetIncrementCT = this.properties.offsetIncrementTwoLines
            this.offsetIncrementBM = this.properties.offsetIncrementTwoLines
            this.offsetIncrementAS = this.properties.offsetIncrementTwoLines
        }

    }
    feasibleClippingCT(){
        return this.graph.verticesCT.length > 0  && this.graph.verticesBM.length > 0
    }

    applyLinearMap(rotation: Rotation,asLeaves){
        let map = new LinearMap(this.drawing,rotation)
        if( rotation.rotate){
            this.maximumHeight = map.maxY+30
            this.maximumWidth = map.maxX+30
        }
        if( rotation.rotate && rotation.rotateAngle == 180) {
            this.rotateAngle(-90,asLeaves)
        }
        else if(rotation.rotate && rotation.rotateAngle == 270 ){
            this.rotateAngle(-90,asLeaves)
        }
    }


}

export enum LayoutClass {
    Partial,
    Subgraph,
    Exploration,
    Containment
}



