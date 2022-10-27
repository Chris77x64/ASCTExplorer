import {Point2D} from "../model/Point2D";
import {Graph} from "../model/Graph";
import {InducedSubgraph} from "../model/InducedSubgraph";
import {ASLeaves} from "../algorithm/Anatomical Structures/ASLeaves";
import {ASTreeLayoutOriginal} from "../algorithm/Drawing/ASTreeLayoutOriginal";
import {Layout, LayoutClass} from "./Layout";
import {Rotation} from "../model/Rotation";
import { Properties} from "../util/Properties";


export class LayoutOriginal extends Layout{

    constructor(graph: Graph | InducedSubgraph, rotation: Rotation,properties: Properties) {

        super(graph,rotation,properties)
        this.class = LayoutClass.Subgraph

        this.calculateParameter( )
        this.drawBiomarkers(this.graph.verticesBM)
        this.drawCellTypes(this.graph.verticesCT)
        let asTreeLayout = new ASTreeLayoutOriginal(graph,new InducedSubgraph(graph,graph.verticesAS),this.drawing,this.offsetIncrementAS,this.offsetIncrementAS,this.depthMultiplier)

        this.calculateWidthHeight()
        this.applyLinearMap(rotation,new ASLeaves(graph))

     }

    drawBiomarkers(slotsBM: number[]) {
        let offsetBM = this.properties.heightTopPadding

        slotsBM.forEach(vertexID => {
            let currentPoint = new Point2D(this.xPositionBM, offsetBM)
            offsetBM = offsetBM + this.offsetIncrementBM
            this.drawing[vertexID] = currentPoint
        })

    }

    drawCellTypes(slotsCT: number[]) {
            let offsetCT = this.properties.heightTopPadding
            slotsCT.forEach(vertexID => {
                let currentPoint = new Point2D(this.xPositionCT, offsetCT)
                offsetCT = offsetCT + this.offsetIncrementCT
                this.drawing[vertexID] = currentPoint
            })
    }







}



