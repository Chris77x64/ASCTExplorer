import {Layout, LayoutClass} from "./Layout";
import {Point2D} from "../model/Point2D";
import {Graph} from "../model/Graph";
import {InducedSubgraph} from "../model/InducedSubgraph";
import {ASLeaves} from "../algorithm/Anatomical Structures/ASLeaves";
import {OneSidedCrossingMinimization} from "../algorithm/OneSidedCrossingMinimization";
import {ASTreeLayoutClipping} from "../algorithm/Drawing/ASTreeLayoutClipping";
import {CellTypeClipping} from "../algorithm/Drawing/CellTypeClipping";
import {Rotation} from "../model/Rotation";
import {Properties} from "../util/Properties";

export class LayoutPartial extends Layout{

    constructor(graph: Graph | InducedSubgraph, clickedVertex, rotation: Rotation,properties: Properties) {
        super(graph,rotation,properties)
        this.class = LayoutClass.Partial


        let asLeaves = new ASLeaves(graph)
        let anatomicalTreeLeaves =  asLeaves.leaves

        let depth = this.calculateDepth()
        this.calculateParameter()

        let minimizationASCT = new OneSidedCrossingMinimization(graph, anatomicalTreeLeaves, graph.verticesCT)
        this.slotsCT = minimizationASCT.slots

        let minimizationCTBM = new OneSidedCrossingMinimization(graph, this.slotsCT, graph.verticesBM)
        this.slotsBM = minimizationCTBM.slots

        this.drawCellTypes(this.slotsCT)

        if( this.graph.verticesBM.length > 0){
            let offsetBM = this.calculateMinY()
            this.slotsBM.forEach(vertexID => {
                let currentPoint = new Point2D(this.xPositionBM, offsetBM)
                offsetBM = offsetBM + this.offsetIncrementBM
                this.drawing[vertexID] = currentPoint
            })
            let clipping = new CellTypeClipping(this,this.slotsCT, this.offsetIncrementCT)
        }

        // draw layout of anatomical tree
        let asTreeLayout = new ASTreeLayoutClipping(graph,this.drawing,this.depth,this.depthMultiplier,this.offsetIncrementAS)

        this.calculateWidthHeight()

        this.applyLinearMap(rotation,asLeaves)

        this.updateHighlights(clickedVertex)


    }

    updateHighlights(current){
        if( current in this.graph.outDegree){
            this.graph.outDegree[current].forEach(id=>{
                this.updateHighlights(id)
                let key = String(current)+'|'+ String(id)
                this.highlightedEdge[key] = 1
            })
        }
    }


    calculateMinY(){
        let minY = Number.POSITIVE_INFINITY
        this.graph.verticesBM.forEach(id=>{
            if( id in this.graph.inDegree){
                this.graph.inDegree[id].forEach(ct=>{
                    if( this.drawing[ct].y < minY){
                        minY = this.drawing[ct].y
                    }
                })
            }
        })
        return minY
    }




    calculateRoot(tree){
        let res = null
        tree.vertices.forEach(id=>{
            if( ! (id in tree.inDegree) ){
                res = id
            }
        })
        return res
    }


    drawCellTypes(slotsCT: number[]) {
        let offsetCT = this.properties.heightTopPadding

        slotsCT.forEach(vertexID => {
            let currentPoint = new Point2D(this.xPositionCT, offsetCT)
            offsetCT = offsetCT + this.offsetIncrementCT
            this.drawing[vertexID] = currentPoint
        })
    }

    drawBiomarkers(slotsBM: number[]) {
        let offsetBM = this.properties.heightTopPadding

        slotsBM.forEach(vertexID => {
            let currentPoint = new Point2D(this.xPositionBM, offsetBM)
            offsetBM = offsetBM + this.offsetIncrementBM
            this.drawing[vertexID] = currentPoint
        })


    }




}
