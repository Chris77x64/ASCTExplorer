import {Mode} from "./Mode";
import {GraphController} from "../GraphController";
import {InducedSubgraph} from "../../model/InducedSubgraph";
import {LayoutSubgraph} from "../../view/LayoutSubgraph";
import {Graph2D} from "../../model/Graph2D";
import * as vega from "vega";
import {LayoutOriginal} from "../../view/LayoutOriginal";
import {Rotation} from "../../model/Rotation";

export class ModeOriginal extends Mode{


    constructor(controller: GraphController) {

        super(controller,'Original');

    }

  renderRestoreGraphContext(): Promise<vega.View> {
      this.firstTime = true
    return this.render(null)
  }

  renderRestoreViewContext(){
      this.firstTime = false
    this.render(null)
  }

    render(clickedVertex: number): Promise<vega.View> {
        let currentGraph = this.controller.graphs[this.controller.currentOrgan]
        if( currentGraph.ready) {

            let rotateAngle: String = this.controller.gui.selectedRotation

            let layoutGraph = new InducedSubgraph(currentGraph, currentGraph.vertices)

            let layout = new LayoutOriginal(currentGraph,new Rotation(rotateAngle),this.controller.properties)

            let graph2D = new Graph2D(currentGraph,layout,this.controller.properties)

            this.setGraph2DParameter(
                graph2D
            )


            let specification = graph2D.exportSpecification(false)
            let newView = new vega.View(vega.parse(specification))
                .renderer('svg')
                .initialize(document.querySelector('#drawing'))
                .addEventListener('mouseover', (event, item) => this.toolTip.compute(event,item,currentGraph))

            if( !this.firstTime) this.updateView(newView,this.currentView)
            this.currentView = newView
            this.setBackground(this.currentView)
            return this.currentView.runAsync().then( ()=>this.firstTime = false).then()
        }
        else return null
    }

    reset(): void {
        this.firstTime = true
        this.currentView = null
    }


}
