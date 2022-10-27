import {Point2D} from "../model/Point2D";
import {Graph} from "../model/Graph";
import {OneSidedCrossingMinimization} from "../algorithm/OneSidedCrossingMinimization"
import {InducedSubgraph} from "../model/InducedSubgraph";
import {CellTypeClipping} from "../algorithm/Drawing/CellTypeClipping";
import {ASLeaves} from "../algorithm/Anatomical Structures/ASLeaves";
import {Layout, LayoutClass} from "./Layout";
import {ContainmentRectanglesVertical} from "../containment/ContainmentRectanglesVertical";
import {Containment} from "../containment/Containment";
import {Rotation} from "../model/Rotation";
import {Properties} from "../util/Properties";
import {ContainmentRectanglesHorizontal} from "../containment/ContainmentRectanglesHorizontal";
import {ASTreeLayout} from "../algorithm/Drawing/ASTreeLayout";


export class LayoutContainment extends Layout{

    containmentRects : ContainmentRectanglesVertical
    containment: Containment
    aid: number

    constructor(graph: Graph | InducedSubgraph, containment: Containment, rotation: Rotation,properties: Properties) {

        super(graph,rotation,properties)
        this.class = LayoutClass.Containment

        let asLeaves = new ASLeaves(graph)

        this.calculateParameter( )

        this.containment = containment

        let slotsCT = containment.containment

        let slotsBM = graph.verticesBM

        let minimizationCTBM = new OneSidedCrossingMinimization(graph, slotsCT, slotsBM)
        slotsBM = minimizationCTBM.slots



        this.initializeHighlights(graph,this.highlightedEdge)

        this.drawBiomarkers(slotsBM)

        this.drawCellTypes(slotsCT)

        if( this.graph.verticesCT.length != this.graph.vertices.length) {
            this.clipBM(slotsBM)
            this.drawCellTypes(slotsCT)
        }



        const asStartY = this.calculateCTSmallestY(slotsCT)
        this.calculateDynamicOffsetIncrementAS(asLeaves,slotsCT)

        let asTreeLayout = new ASTreeLayout(graph,new InducedSubgraph(graph,graph.verticesAS),this.drawing,asStartY,this.offsetIncrementAS,this.depthMultiplier)
          if( asLeaves.leaves.length == 1) this.centerAS()


        this.applyLinearMap(rotation,asLeaves)

        let f = this.calculateFakeOutDeg()

        if( rotation.rotateAngle == 0 || rotation.rotateAngle == 90){
          // requires drawing of ct vertices
         this.containmentRects = new ContainmentRectanglesVertical(containment,this.drawing,this.offsetIncrementCT)
          this.rects = this.containmentRects.rectangles
          this.adjustmentWorker(this.containment.root, null,f)
        }
        else{
          this.containmentRects = new ContainmentRectanglesHorizontal(containment,this.drawing,this.offsetIncrementCT,properties)
          this.rects = this.containmentRects.rectangles

          this.adjustmentWorker(this.containment.root, null,f)
        }
      this.calculateWidthHeight()
    }

  centerAS(){
      let min = Number.POSITIVE_INFINITY
      let max = Number.NEGATIVE_INFINITY


      this.graph.verticesCT.forEach(id=>{
        let y = this.drawing[id].y
        if( y < min) min = y
        if( y > max ) max = y
      })

      let middle = (min+max)/2
      this.graph.verticesAS.forEach(id=>{
        this.drawing[id].y = middle
      })
  }


    formatLabelTwoLines(graph,id) {

        let label = graph.vertexLabel[id]

        if (typeof label === 'string') {
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

    calculateCTSmallestY(slotsCT){
        let result = Number.POSITIVE_INFINITY
        slotsCT.forEach(id=>{
            if( this.drawing[id].y < result && id in this.graph.inDegree){
                result = this.drawing[id].y
            }
        })
        return result
    }

    calculateCTLargestY(slotsCT){
        let result = Number.NEGATIVE_INFINITY
        slotsCT.forEach(id=>{
            if( this.drawing[id].y > result && id in this.graph.inDegree){
                result = this.drawing[id].y
            }
        })
        return result
    }

    adjustmentWorker(current, parent,outDeg) {
        if (current in outDeg) {
          outDeg[current].forEach(n => {
                this.adjustmentWorker(n, current,outDeg)
            })
        } else {


          if( current in this.containment.artificialIDToInnerVertex){

            let corresponding = this.containment.artificialIDToInnerVertex[current][0]
            let rectID = this.containment.artificialIdRectIDMap[corresponding]
            let rect = this.containmentRects.rectangles[rectID]

            this.drawing[current] = new Point2D(rect.positionX + (rect.width / 2), rect.positionY + (rect.height / 2))
          }

        }
    }

    calculateDynamicOffsetIncrementAS(asLeaves,slotsCT){
        let distance = this.calculateCTLargestY(slotsCT) - this.calculateCTSmallestY(slotsCT)
        if( asLeaves.leaves.length > 1) {
            let factor = distance / (asLeaves.leaves.length-1)
            if( factor > this.offsetIncrementAS){
                this.offsetIncrementAS = factor
            }
        }
    }


    clipBM(slotsBM){
        if( slotsBM.length > 1) {

            let bmSameParent = [slotsBM[0]]
            let parent = (this.graph.inDegree[slotsBM[0]])[0]
            let lastPos = 0
            for(let i=1; i < slotsBM.length; i++){
                let bmID = slotsBM[i]
                if( ! (bmID in this.graph.inDegree)){
                    this.drawing[bmID] = new Point2D(this.drawing[bmID].x,this.drawing[slotsBM[i-1]]+this.offsetIncrementBM)
                }
                else if( this.graph.inDegree[bmID].includes(parent)){
                    bmSameParent.push(bmID)
                }
                else{
                    lastPos = this.redrawBM(bmSameParent,parent,lastPos)
                    bmSameParent = [bmID]
                    parent = (this.graph.inDegree[slotsBM[i]])[0]
                }
            }
            this.redrawBM(bmSameParent,parent,lastPos)
        }
    }

    redrawBM(bm,vertexCT,lastPos){
        const positionCT = this.drawing[vertexCT]
        const half = Math.floor(bm.length/2)

        for(let i=0; i < bm.length; i++){
            if( i < half) {
                this.drawing[bm[i]] = new Point2D(this.drawing[bm[i]].x, positionCT.y - ((i +1) * this.offsetIncrementBM))
            }
            else{
                this.drawing[bm[i]] = new Point2D(this.drawing[bm[i]].x,positionCT.y+ (i-half)*this.offsetIncrementBM)
            }
        }
        let smallestY = positionCT.y - (half * this.offsetIncrementBM)
        if( Math.abs(lastPos-smallestY)< this.offsetIncrementBM || smallestY < lastPos ){
            this.drawing[bm[0]] = new Point2D(this.drawing[bm[0]].x,lastPos + this.offsetIncrementBM)
            for(let i=1; i < bm.length; i++){
                this.drawing[bm[i]] = new Point2D(this.drawing[bm[i]].x,this.drawing[bm[i-1]].y + this.offsetIncrementBM)
            }
        }

        return this.drawing[bm[bm.length-1]].y
    }

    spacingCTRectangles(slotsCT){
        let criticalCT = new Map<number,boolean>()
        slotsCT.forEach(id=>criticalCT[id]= false)
        let f= this.calculateFakeOutDeg()

        if( f !=undefined) {
          this.criticalWorker(this.containment.root, this.containment, criticalCT, f)
          this.processCriticalCT(slotsCT, criticalCT)
        }
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



    processCriticalCT(slotsCT,critical){
        for(let i=0; i < slotsCT.length-1; i++){
            let current = slotsCT[i]
            let next = slotsCT[i+1]
            let dist = this.drawing[next].y - this.drawing[current].y
            if( critical[current] && dist < (1.2 * this.offsetIncrementCT) ){
                    this.drawing[next].y = this.drawing[current].y + 1.2 * this.offsetIncrementCT
            }
            else{
                if( dist < this.offsetIncrementCT){
                    this.drawing[next].y = this.drawing[current].y + this.offsetIncrementCT
                }
            }
        }
    }

    criticalWorker(current,containment,critical,outDeg){
        if( current in outDeg){
            let adj = outDeg[current]
            critical[adj[adj.length-1]] = true
            adj.forEach(n=>{
                this.criticalWorker(n,containment,critical,outDeg)
            })
        }
    }

    drawBiomarkers(slotsBM: number[]) {
        let offsetBM = this.offsetIncrementBM
        slotsBM.forEach(vertexID => {
            let currentPoint = new Point2D(this.xPositionBM, offsetBM)
            offsetBM = offsetBM + this.offsetIncrementBM
            this.drawing[vertexID] = currentPoint
        })
    }

    drawCellTypes(slotsCT: number[]) {

        let offsetCT =  this.offsetIncrementCT

        if( this.graph.vertices.length != this.graph.verticesCT.length){
            let clipping = new CellTypeClipping(this,slotsCT,offsetCT)
        }
        else{
            slotsCT.forEach(vertexID => {
                let currentPoint = new Point2D(this.xPositionCT, offsetCT)
                offsetCT = offsetCT + this.offsetIncrementCT
                this.drawing[vertexID] = currentPoint
            })
        }

        this.spacingCTRectangles(slotsCT)

    }







}


