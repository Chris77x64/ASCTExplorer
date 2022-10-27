import {Mode} from "./Mode";
import {GraphController} from "../GraphController";
import {Graph2D} from "../../model/Graph2D";
import {LayoutSubgraph} from "../../view/LayoutSubgraph";
import * as vega from "vega";
import {InducedSubgraph} from "../../model/InducedSubgraph";
import {Rotation} from "../../model/Rotation";
import {Point2D} from "../../model/Point2D";

export class ModeSubgraph extends Mode{

  currentString: string
  lastID: number

  lastWidth: number
  lastHeight: number

    constructor(controller: GraphController) {
        super(controller,'Subgraph');
        this.currentString = ""
        this.lastID = null
    }


    renderRestoreViewContext(){
        this.firstTime = false
        this.render(null)
    }

  renderRestoreGraphContext(): Promise<vega.View> {
    this.firstTime = true
    return this.render(null)
  }

    render(clickedVertex): Promise<vega.View> {
        let currentGraph = this.controller.graphs[this.controller.currentOrgan]
        if( currentGraph.ready) {
            let layoutGraph = new InducedSubgraph(currentGraph, currentGraph.vertices)
            return this.renderSubgraph(layoutGraph)
        }
        else return Promise.reject()
    }

    renderSubgraph(currentGraph): Promise<vega.View>{

        let rotateAngle: String = this.controller.gui.selectedRotation

        let layout = new LayoutSubgraph(currentGraph,new Rotation(rotateAngle),this.controller.properties)

        let graph2D = new Graph2D(currentGraph,layout,this.controller.properties)

        this.setGraph2DParameter( graph2D)

        let specification = graph2D.exportSpecification(false)
        let newView =  new vega.View(vega.parse(specification))
          .renderer('svg')
          .initialize(document.querySelector('#drawing'))
          .addEventListener('mouseover', (event, item) => this.toolTip.compute(event, item, currentGraph))

        if( !this.firstTime) this.updateView(newView,this.currentView)
        this.currentView = newView
        this.setBackground(this.currentView)
        return this.currentView.runAsync().then( ()=>{
           this.firstTime = false
        }).then()
    }

    processZoom(currentGraph,drawing){

      let minX: Number = Number.POSITIVE_INFINITY
      let maxX: Number = Number.NEGATIVE_INFINITY
      let minY: Number = Number.POSITIVE_INFINITY
      let maxY: Number = Number.NEGATIVE_INFINITY

      let xScale = this.currentView.scale('xscale')
      let yScale = this.currentView.scale('yscale')


      currentGraph.vertices.forEach(id=>{
        let drawingPoint: Point2D = drawing[id]
        if( xScale(drawingPoint.x) < minX)  minX = xScale(drawingPoint.x)
        if( xScale(drawingPoint.x) > maxX)  maxX = xScale(drawingPoint.x)
        if( yScale(drawingPoint.y) < minY)  minY = yScale(drawingPoint.y)
        if( yScale(drawingPoint.y) > maxY)  maxY = yScale(drawingPoint.y)
      })

      // @ts-ignore
      let newWidth = Math.max(Math.abs(maxX-minX),withDrawingDIV)
      // @ts-ignore
      let newHeight = Math.max(Math.abs(maxY-minY),heightDrawingDIV)
      //

      let anchor = this.currentView.signal('anchor')

      this.currentView.container().querySelector('svg').style.width = newWidth + 'px'
      this.currentView.container().querySelector('svg').style.height = newHeight + 'px'

      if( this.lastWidth !=null){
        let aX = anchor[0] / this.lastWidth
        let aY = anchor[1] / this.lastHeight
        this.currentView.container().querySelector('svg').scrollTop = -aY

      }

      this.lastWidth = newWidth
      this.lastHeight = newHeight

    }

    reset(): void {
        this.firstTime = true
        this.currentView = null
    }

}
