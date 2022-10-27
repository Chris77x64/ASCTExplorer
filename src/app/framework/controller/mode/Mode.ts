import {GraphController} from "../GraphController";
import {Graph2D} from "../../model/Graph2D";
import {ToolTip} from "../../view/ToolTip";
import * as vega from "vega";
import * as saveAS from 'file-saver'
import {Rotation} from "../../model/Rotation";


export abstract class Mode {

    controller: GraphController
    currentView: vega.View
    toolTip: ToolTip

    darkMode: boolean
    containerSelection: any

    firstTime: boolean

    abstract render(clickedVertex: number): Promise<vega.View>
    abstract renderRestoreViewContext(): void
    abstract renderRestoreGraphContext(): Promise<vega.View>
    abstract reset(): void

    type: String

    constructor(controller: GraphController,type) {
      this.type = type
        this.controller = controller
        this.toolTip = new ToolTip(controller)
        this.firstTime = true
    }

    async exportImage(){
      let img = await this.currentView.toSVG()
      let blob = new Blob([img], {type: 'image/svg+xml'});
      saveAS(blob,'graph.jpg')
    }

  contentRectInDrawingArea(): boolean{
      let result = false
      let nodes = document.querySelectorAll('.mark-symbol.role-mark');
      if( nodes.length > 0){
        let rect = (nodes[0] as HTMLElement).getBoundingClientRect()
        if( rect.height < this.controller.properties.heightDrawingDIV &&
             rect.width < this.controller.properties.withDrawingDIV){
          result = true
        }
      }
      return result
    }


    fitContent(view: vega.View) {
      let nodes = document.querySelectorAll('.mark-symbol.role-mark');
      if (nodes.length > 0) {

        if( this.type != 'Explore') this.controller.currentMode.reset()
        let rect = (nodes[0] as HTMLElement).getBoundingClientRect()
        let rotation = new Rotation(this.controller.gui.selectedRotation)

        view.signal('xdom', [0, view.signal('width')])
        view.signal('ydom', [0, view.signal('height')])
        view.signal('sizeVertexDom', [50, 300])
        view.signal('xdomContainment', [0, view.signal('width')])
        view.signal('ydomContainment', [0, view.signal('height')])
        view.signal('sizeLabelDom', [6, 8])

        if( this.type == 'Explore' || rotation.rotateAngle == 180 || rotation.rotateAngle == 270 ) view.signal('anchor', [0, 0])
        else view.signal('anchor', [this.controller.properties.totalWidth/2, 0])

        if (rect.width > rect.height) view.signal('zoom', rect.width / (0.98 * this.controller.properties.totalWidth))
        else view.signal('zoom', rect.height / (0.9 * this.controller.properties.heightDrawingDIV))

        view.runAsync().then(()=>{
          this.currentView = view
        })


      }
    }

    setBackground(view: vega.View){
      if( this.darkMode) {
        view.signal('background','black')
      }
      else{
        view.signal('background','white')
      }
    }

    setGraph2DParameter(graph2D: Graph2D){

        let darkMode : boolean = this.controller.gui.appearance[2].sel
        let drawLabels : boolean = this.controller.gui.appearance[0].sel

        this.darkMode = darkMode
        graph2D.graphStyle.labelEnabled = drawLabels

        if(darkMode){
            graph2D.graphStyle.darkMode = true
            graph2D.graphStyle.labelFill = "#fff"
        }
        else{
            graph2D.graphStyle.darkMode = false
            graph2D.graphStyle.labelFill = "#000"
        }
    }


    updateView(newView,oldView){
        let newState = oldView.getState()
        newState.data = newView.getState().data
        newState.signals.width = newView.getState().signals.width
        newState.signals.height = newView.getState().signals.height
        newView.setState(newState)
        oldView.finalize()
    }

    calculateContainerStrings(){
      let containment = this.controller.graphs[this.controller.currentOrgan].containment
      let containmentStrings = []
      let count = 1
      containment.outDegree[containment.initialRoot].forEach(id=>{
        containmentStrings.push('Container '+count)
        count += 1
      })
      return containmentStrings
    }


}
