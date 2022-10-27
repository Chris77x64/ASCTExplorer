import {Mode} from "./Mode";
import {GraphController} from "../GraphController";
import {Graph2D} from "../../model/Graph2D";
import * as vega from "vega";
import {BFS} from "../../algorithm/Search/BFS";
import {LayoutPartial} from "../../view/LayoutPartial";
import {Point2D} from "../../model/Point2D";
import {InducedSubgraph} from "../../model/InducedSubgraph";
import {Movement} from "../../view/Movement";
import {ASInvariant} from "../../algorithm/Anatomical Structures/ASInvariant";
import {ASAugmentation} from "../../algorithm/Anatomical Structures/ASAugmentation";
import {CommonSubtreeReplicating} from "../../algorithm/Vertex Replicating/CommonSubtreeReplicating";
import {ASBalancingV3} from "../../algorithm/Anatomical Structures/ASBalancingV3";
import {BMSubtreeProperty} from "../../algorithm/Vertex Replicating/BMSubtreeProperty";
import {Rotation} from "../../model/Rotation";
import {OneSidedCrossingMinimization} from "../../algorithm/OneSidedCrossingMinimization";
import {ParamEstimatorBM} from "../../algorithm/Vertex Replicating/ParamEstimatorBM";
import {BiomarkerAugementation} from "../../algorithm/Vertex Replicating/BiomarkerAugementation";
import {ASLeaves} from "../../algorithm/Anatomical Structures/ASLeaves";

export class ModePartial extends Mode{

    augmentedGraph: InducedSubgraph

    previousDrawing: Map<number,Point2D>

    // number of animation steps
    frames: number
    // time till next step (ms)
    frameTime: number

    lastClick: number

  renderRestoreGraphContext(): Promise<vega.View> {
      this.currentView = null
      return this.render(this.lastClick)
  }


    constructor(controller: GraphController) {
        super(controller,'Partial');
        this.previousDrawing = new Map<number, Point2D>()
        this.frames = 10
        this.frameTime = 800
    }

    initializeGraph(){
        let currentGraph = this.controller.graphs[this.controller.currentOrgan]
        this.augmentedGraph = new InducedSubgraph(currentGraph,currentGraph.vertices)
        let anatomicalInvariant = new ASInvariant(this.augmentedGraph)
        let treeAugmentation = new ASAugmentation(this.augmentedGraph)

        let commonSubtreeAugmentation = new CommonSubtreeReplicating(this.augmentedGraph)
        let anatomicalBalancing = new ASBalancingV3(this.augmentedGraph)
        let subtreeBM = new BMSubtreeProperty(this.augmentedGraph)

        let asLeaves = new ASLeaves(this.augmentedGraph)

        let minimizationASCT = new OneSidedCrossingMinimization(this.augmentedGraph, asLeaves.leaves, this.augmentedGraph.verticesCT)
        let slotsCT = minimizationASCT.slots


        let totalWidth = this.controller.properties.totalWidth
        let offsetCTBM = totalWidth/3
        let xPositionCT =  totalWidth-offsetCTBM
        let xPositionBM = totalWidth
        let offsetIncrementCT = this.controller.properties.offsetIncrementTwoLines
        let offsetIncrementBM = this.controller.properties.offsetIncrementTwoLines
        let estimator = new ParamEstimatorBM(this.augmentedGraph,slotsCT,xPositionBM,xPositionCT,offsetIncrementCT,offsetIncrementBM)
        let augmentationBM = new BiomarkerAugementation(slotsCT, this.augmentedGraph, estimator.parameterReplication)

    }


    calculateLayoutGraph(clickedVertex: number): InducedSubgraph{
        let inducedSet = this.augmentedGraph.verticesAS.slice(0).concat(this.augmentedGraph.verticesCT.slice(0))
        if( clickedVertex != null){
            let search = new BFS(this.augmentedGraph,clickedVertex,this.augmentedGraph.outDegree)
            let levels = search.createLevels()
            inducedSet = inducedSet.concat(levels[levels.length-1])
            let levelCT = levels[levels.length-2]

            let result = new InducedSubgraph(this.augmentedGraph,inducedSet)
            result.verticesCT.forEach(ct=>{
                if( ct in result.outDegree && !levelCT.includes(ct)){
                    result.outDegree[ct].forEach(bm=>{
                      this.removeByValue(ct,result.inDegree[bm])
                    })
                    delete result.outDegree[ct]
                }
            })
            this.lastClick = clickedVertex
            return result
        }
        else return new InducedSubgraph(this.augmentedGraph,inducedSet)
    }


    renderRestoreViewContext(){
      if( this.lastClick != null) this.render(this.lastClick)
      else this.render(null)
    }

    render(clickedVertex: number):  Promise<vega.View> {
        let currentGraph = this.controller.graphs[this.controller.currentOrgan]

        if( currentGraph.ready) {

            if( this.firstTime){
                this.initializeGraph()
            }

            let layoutGraph = this.calculateLayoutGraph(clickedVertex)
            return this.renderPartial(layoutGraph,clickedVertex).then(()=> this.firstTime = false).then()
        }
        else return null
    }

    renderPartial(currentGraph,clickedVertex): Promise<vega.View>{

        let rotateAngle: String = this.controller.gui.selectedRotation
        let layout = new LayoutPartial(currentGraph,clickedVertex,new Rotation(rotateAngle),this.controller.properties)

        let graph2D = new Graph2D(currentGraph,layout,this.controller.properties)

        this.setGraph2DParameter(
            graph2D
        )

            let specification = graph2D.exportSpecification(false)

            let view: any
            // @ts-ignore

            if( this.currentView != null) {
                return this.animation(currentGraph,layout,graph2D)
            }
            else{
                view = new vega.View(vega.parse(specification))
                    .renderer('svg')
                    .initialize(document.querySelector('#drawing'))
                    .addEventListener('click', (event, item) => this.displayBM(event, item))//originalGraph))
                    .addEventListener('mouseover', (event, item) => this.toolTip.compute(event,item,currentGraph),
                    )
                this.currentView = view
                this.setBackground(this.currentView)
                return this.currentView.runAsync().then( ()=> this.previousDrawing = layout.drawing).then()
            }
    }

    animationTick(count,movement,graph2D,currentGraph): Promise<vega.View>{
      if (count == movement.animation.length - 1) {
        this.setGraph2DParameter(
          graph2D
        )
        let specification = graph2D.exportSpecification(false)
        // @ts-ignore
        let view = new vega.View(vega.parse(specification))
          .renderer('svg')
          .initialize(document.querySelector('#drawing'))
          .addEventListener('click', (event, item) => this.displayBM(event, item))
          .addEventListener('mouseover', (event, item) => this.toolTip.compute(event, item, currentGraph))

        this.updateView(view,this.currentView)

        this.currentView = view
        this.setBackground(this.currentView)
        return this.currentView.runAsync()
      } else {

        graph2D.graphStyle.labelEnabled = false
        let specification = graph2D.exportSpecification(true)

        // @ts-ignore
        let view = new vega.View(vega.parse(specification))
          .renderer('svg')
          .initialize(document.querySelector('#drawing'))

        this.updateView(view,this.currentView)
        this.currentView = view
        this.setBackground(this.currentView)
        return this.currentView.runAsync()
      }
    }



    animation(currentGraph,layout,graph2D): Promise<vega.View> {
        let vertices2Move = this.calculateVertices2Move(currentGraph, layout.drawing, this.previousDrawing)
        let movement = new Movement(layout.drawing, this.calculateSourcePoints(vertices2Move, this.previousDrawing), vertices2Move, this.calculateTargetPoints(vertices2Move, layout.drawing), this.frames)
        let promiseArr = []
        for (let count = 0; count < this.frames; count++) {
            setTimeout(() => {
                graph2D.vertexPosition = movement.animation[count]
                promiseArr.push(this.animationTick(count,movement,graph2D,currentGraph))
            }, this.frameTime)
        }
      return Promise.all(promiseArr).then()
    }


    removeByValue(value,arr){
        let index = arr.indexOf(value)
        if( index != -1) arr.splice(index,1)
    }

    displayBM(event, item){
        if( event != undefined && item !=undefined && item.datum !=undefined) {
            let startID = item.datum.id
            if (!this.augmentedGraph.verticesBM.includes(startID)) this.render(startID)
        }
    }

    reset(): void {
        this.firstTime = true
        this.lastClick = null
        this.currentView = null
    }

  calculateSourcePoints( vertices,previousDrawing){
    let result = []
    vertices.forEach(id=>result.push(previousDrawing[id]))
    return result
  }

  calculateTargetPoints(vertices,currentDrawing){
    let result = []
    vertices.forEach(id=>result.push(currentDrawing[id]))
    return result
  }

  calculateVertices2Move(graph,currentDrawing,previousDrawing){
    let vertices2Move = []
    graph.verticesCT.forEach(id=>{
      if( id in previousDrawing && id in currentDrawing) {
        if (previousDrawing[id].x != currentDrawing[id].x || previousDrawing[id].y != currentDrawing[id].y) {
          vertices2Move.push(id)
        }
      }
    })
    return vertices2Move
  }
}
