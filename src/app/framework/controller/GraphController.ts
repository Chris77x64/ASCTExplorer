import {Graph} from "../model/Graph";
import {containmentURL, graphURL, OntologyType, Organ, Properties, stringToOrgan, Type} from "../util/Properties";
import {Mode} from "./mode/Mode";
import {ModePartial} from "./mode/ModePartial";
import {ModeSubgraph} from "./mode/ModeSubgraph";
import {ModeExplore} from "./mode/ModeExplore";
import {ModeContainment} from "./mode/ModeContainment";
import {ModeOriginal} from "./mode/ModeOriginal";
import {VisualizationComponent} from "../../component/visualization/visualization.component";
import * as vega from "vega";
import {Rotation} from "../model/Rotation";

export class GraphController{

    gui: VisualizationComponent
    graphs: Graph[]

    currentOrgan: Organ
    currentMode: Mode

    properties: Properties

    constructor(gui: VisualizationComponent) {
        this.initializeGraphs()
        this.gui = gui
        this.currentOrgan = Organ.Kidney
        this.properties = new Properties()
        this.currentMode = new ModeSubgraph(this)
    }

    initializeGraphs(){
        this.graphs = [
            new Graph([Organ.BoneMarrow]),
            new Graph([Organ.Brain]),
            new Graph([Organ.Heart]),
            new Graph([Organ.Kidney]),
            new Graph([Organ.LargeIntestine]),
            new Graph([Organ.Lung]),
            new Graph([Organ.LymphNodes]),
            new Graph([Organ.Skin]),
            new Graph([Organ.Spleen]),
            new Graph([Organ.Thymus]),
            new Graph([Organ.Vasculature])
        ]
    }

    updateMode(str){

      if( this.currentMode != null){
        this.currentMode.reset()
       }
        if( str == "Partial Graph"){
           this.currentMode = new ModePartial(this)
        }
        else if( str== "Complete Graph"){
          this.currentMode = new ModeSubgraph(this)
        }
        else if( str == "Exploration"){
            this.currentMode = new ModeExplore(this)
        }
        else if( str == "Containment"){
          if(this.gui.modes[0].sel) this.currentMode = new ModeContainment(this,false)
          else this.currentMode = new ModeContainment(this,true)
        }
        else if( str == "Unmodified Graph"){
            this.currentMode = new ModeOriginal(this)
        }

    }

    updateOrgan(newOrgan: String){
        this.currentOrgan = stringToOrgan(newOrgan)
        this.currentMode.reset()
    }


    renderRestore(){
      this.currentMode.renderRestoreViewContext()
      this.f()
    }

    render(): Promise<vega.View> {
        return this.currentMode.render( null).then(()=>this.f()).then()
    }
  restore90270(){
    let drawing = document.getElementById('drawing')
    drawing.style.overflowY = 'hidden'
    drawing.style.overflowX = 'scroll'
  }

  restore0180(){
    let drawing = document.getElementById('drawing')
    drawing.style.overflowY = 'scroll'
    drawing.style.overflowX = 'hidden'
  }

    f(){
      let rotation = new Rotation(this.gui.selectedRotation)
      if(  rotation.rotateAngle == 180 || rotation.rotateAngle == 270 ){
        this.restore90270()
      }
      else this.restore0180()
    }


}

