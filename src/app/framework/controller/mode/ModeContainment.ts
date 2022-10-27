import {Mode} from "./Mode";
import {GraphController} from "../GraphController";
import {Graph2D} from "../../model/Graph2D";
import * as vega from "vega";
import {LayoutContainment} from "../../view/LayoutContainment";
import {Point2D} from "../../model/Point2D";
import {Rectangle} from "../../model/Rectangle";
import {InducedSubgraph} from "../../model/InducedSubgraph";
import {Movement} from "../../view/Movement";
import {ContainmentManager} from "../../containment/ContainmentManager";
import {ContainmentReordering} from "../../containment/ContainmentReordering";
import {Rotation} from "../../model/Rotation";
import {ContainmentManagerPartial} from "../../containment/ContainmentManagerPartial";
import {ContainmentReordering2} from "../../containment/ContainmentReordering2";

export class ModeContainment extends Mode {

    previousDrawing: Map<number, Point2D>

    containmentGraph: InducedSubgraph

    // number of animation steps
    frames: number
    // time till next step (ms)
    frameTime: number

    manager: ContainmentManager | ContainmentManagerPartial

    hideBM: boolean

    constructor(controller: GraphController, hideBM: boolean) {
        super(controller,'Containment')
        this.frames = 25
        this.frameTime = 700
        this.controller = controller
        this.hideBM = hideBM

    }

  renderRestoreGraphContext(): Promise<vega.View> {
      this.currentView = null
    return this.render(null)
  }

    renderRestoreViewContext(){
        this.firstTime = false
        this.render(null).then()
    }

    render(clickedVertex): Promise<vega.View>{
        let currentGraph = this.controller.graphs[this.controller.currentOrgan]
        if (currentGraph.ready) {
            return this.renderSubgraph(currentGraph)
        }
        else return Promise.reject()
    }


    animationTick(count,movement,graph2D,currentGraph,layout): Promise<vega.View>{

      if (count == movement.animation.length - 1) {
        graph2D.graphStyle.labelEnabled = this.controller.gui.appearance[0].sel
        let specification = graph2D.exportSpecification(false)

        // @ts-ignore
        let view = new vega.View(vega.parse(specification))
          .renderer('svg')
          .initialize(document.querySelector('#drawing'))
          .addEventListener('click', (event, item) => this.calculateContainer(event, item, layout))
          .addEventListener('mouseover', (event, item) => this.toolTip.compute(event, item, currentGraph))
        this.setBackground(this.currentView)
        this.updateView(view,this.currentView)

        this.currentView = view
        return this.currentView.runAsync()
      } else {

        graph2D.graphStyle.labelEnabled = false
        let specification = graph2D.exportSpecification(false)
        // @ts-ignore
        let view = new vega.View(vega.parse(specification))
          .renderer('svg')
          .initialize(document.querySelector('#drawing'))
        this.setBackground(view)
        this.updateView(view,this.currentView)
        this.currentView = view
        return view.runAsync()
      }
    }


    renderSubgraph(currentGraph) : Promise<vega.View>{

        if (this.firstTime) this.firstTimeProcessing(currentGraph)

        let rotateAngle: String = this.controller.gui.selectedRotation
        let layout = new LayoutContainment(this.containmentGraph, this.manager.containment, new Rotation(rotateAngle),this.controller.properties)
        let graph2D = new Graph2D(this.containmentGraph, layout,this.controller.properties)
        this.setGraph2DParameter(
            graph2D
        )

        if (this.currentView != null) {
            let vertices2Move = this.calculateVertices2Move(layout.drawing)
            let movement = new Movement(layout.drawing, this.calculateSourcePoints(vertices2Move), vertices2Move, this.calculateTargetPoints(vertices2Move, layout.drawing), this.frames)
            let promiseArr = []
            for (let count = 0; count < this.frames; count++) {
                setTimeout(() => {
                    graph2D.vertexPosition = movement.animation[count]
                    promiseArr.push(this.animationTick(count,movement,graph2D,currentGraph,layout))
                }, this.frameTime)
            }
          return Promise.all(promiseArr).then( ()=>{
            this.firstTime = false
            this.previousDrawing = layout.drawing
          }).then()
        } else {
            let specification = graph2D.exportSpecification(false)
            // @ts-ignore
            let view = new vega.View(vega.parse(specification))
                .renderer('svg')
                .initialize(document.querySelector('#drawing'))
                .addEventListener('click', (event, item) => this.calculateContainer(event, item, layout))
                .addEventListener('mouseover', (event, item) => this.toolTip.compute(event, item, currentGraph))
            this.currentView = view
            this.setBackground(this.currentView)

            return this.currentView.runAsync().then( ()=>{
            this.firstTime = false
            this.previousDrawing = layout.drawing  }).then()

        }




    }

    calculateSourcePoints(vertices) {
        let result = []
        vertices.forEach(id => result.push(this.previousDrawing[id]))
        return result
    }

      calculateTargetPoints(vertices, currentDrawing) {
        let result = []
        vertices.forEach(id => result.push(currentDrawing[id]))
        return result
    }

        calculateVertices2Move(currentDrawing) {
        let vertices2Move = []
        this.containmentGraph.verticesCT.forEach(id => {
            if (id in this.previousDrawing && id in currentDrawing) {
                if (this.previousDrawing[id].x != currentDrawing[id].x || this.previousDrawing[id].y != currentDrawing[id].y) {
                    vertices2Move.push(id)
                }
            }
        })
        this.containmentGraph.verticesBM.forEach(id => {
            if (id in this.previousDrawing && id in currentDrawing) {
                if (this.previousDrawing[id].x != currentDrawing[id].x || this.previousDrawing[id].y != currentDrawing[id].y) {
                    vertices2Move.push(id)
                }
            }
        })
        return vertices2Move
    }

    calculateContainer(event, item, layout) {
        if (item != undefined && event !=undefined) {
            if (item.mark.marktype == "rect") {
                let index = this.calculateRectIndex(event, layout.rects)
                if( index != null) {
                    this.manager.evaluate(index)
                    this.containmentGraph = this.manager.containmentGraph
                    this.render(null)
                }
            }
        }

    }
    calculateRectIndex(event, rects) {

      console.log('CHROMEBS',event)
        let rectData = event.target.__data__.datum

      //rectData: Object { x: 993.5170125915718, y: 211.82925426251683, w: 218.23264148352297, h: 529.9159014398881, Symbol("vega_id"): 2494 }
        let currentRect = new Rectangle(rectData.x, rectData.y, rectData.w, rectData.h)
        let index = null

        for (let i = 0; i < rects.length; i++) {
            if (rects[i].positionX == currentRect.positionX && rects[i].positionY == currentRect.positionY) {
                index = i
                break
            }
        }
        return index
    }

    firstTimeProcessing(currentGraph){
        /*
        Step 1: Get selected Container from dat gui
         */
        let index :number = this.fetchContainmentIndex()

        /*
        Step 2: Change root of containment representation with respect our menu choice
        */
        let containment = this.controller.graphs[this.controller.currentOrgan].containment
        if( index == -1){
            containment.root = containment.initialRoot
        }
        else{
            containment.root = (containment.outDegree[containment.initialRoot])[index-1]
        }
        containment.update()

        /*
        Step 3: Initialize Containment Manager that takes care of expansion and collapse
         */

      if( this.hideBM) {
        this.manager = new ContainmentManagerPartial(containment,currentGraph,this.controller.properties)
        let containmentReordering = new ContainmentReordering2(this.manager.containment, this.manager.containmentGraph)
      }
      else {
        this.manager = new ContainmentManager(containment,currentGraph,this.controller.properties)
        let containmentReordering = new ContainmentReordering2(this.manager.containment, this.manager.containmentGraph)
      }
        this.containmentGraph = this.manager.containmentGraph

    }

    fetchContainmentIndex(){
        let containerString = this.controller.gui.selectedContainer
        if( containerString == "All Container"){
            return -1
        }
        else{
            let words = containerString.split('Container ')
            return parseInt(words[1])
        }
    }

    reset(): void {
    //  console.log('CONTAINMENT',this.manager.containment.outDegree)
        this.firstTime = true
        if( this.manager != null){
            this.manager.reset()
        }
        this.currentView = null

    }



}

