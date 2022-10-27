import {Mode} from "./Mode";
import {GraphController} from "../GraphController";
import {Type} from "../../util/Properties";
import {Graph} from "../../model/Graph";
import {InducedSubgraph} from "../../model/InducedSubgraph";
import {BFS} from "../../algorithm/Search/BFS";
import {Graph2D} from "../../model/Graph2D";
import * as vega from "vega";
import {LayoutSubgraph} from "../../view/LayoutSubgraph";
import {Point2D} from "../../model/Point2D";
import {Movement} from "../../view/Movement";
import {Rotation} from "../../model/Rotation";
import {LayoutClass} from "../../view/Layout";
import {ASAugmentationExplore} from "../../algorithm/Anatomical Structures/ASAugmentationExplore";
import {ASInvariantExplore} from "../../algorithm/Anatomical Structures/ASInvariantExplore";

export class ModeExplore extends Mode{

    originalGraph : Graph
    bfsThreshold: number

    root: number

    previousGraph: InducedSubgraph
    previousDrawing: Map<number,Point2D>

    // number of animation steps
    frames: number
    // time till next step (ms)
    frameTime: number

    lastClick: null

    constructor(controller: GraphController) {
        super(controller,'Explore');

        this.bfsThreshold = 4
        this.firstTime = true
        this.frames = 25
        this.frameTime = 700
    }

    calculateLayoutGraph(clickedVertex){
                if( clickedVertex == null || clickedVertex == 0){
                  this.root = 1
                }
                let bfs = new BFS(this.originalGraph, this.root, this.originalGraph.outDegree)
                let levels = bfs.createLevels()
                let vertices2Induce = []

                let t: number
                 if( this.root == 1){
                    t = this.bfsThreshold-1
                  }
                else t = this.bfsThreshold

                for (let i = 0; i < Math.min(t, levels.length); i++) {
                    levels[i].forEach(id => {
                        vertices2Induce.push(id)
                    })
                }
                if( this.previousGraph !=null){
                  if (this.root in this.previousGraph.inDegree) {
                      let indeg = this.previousGraph.inDegree[this.root]
                      vertices2Induce.push(indeg[0])
                  }
                  else{
                    if (this.root in this.originalGraph.inDegree) {
                      this.originalGraph.inDegree[this.root].forEach(n => {
                        vertices2Induce.push(n)
                      })
                    }
                  }
                }
                else{
                  if (this.root in this.originalGraph.inDegree) {
                    this.originalGraph.inDegree[this.root].forEach(n => {
                      vertices2Induce.push(n)
                    })
                  }
                }

                let augmentingGraph = new InducedSubgraph(this.originalGraph, vertices2Induce)
                let a1 = new ASInvariantExplore(augmentingGraph);
                let a2 = new ASAugmentationExplore(augmentingGraph,t)//new ASAugmentation(augmentingGraph)

                bfs = new BFS(augmentingGraph, this.root, augmentingGraph.outDegree)
                levels = bfs.createLevels()
                vertices2Induce = []
                for (let i = 0; i < Math.min(t, levels.length); i++) {
                    levels[i].forEach(id => {
                        vertices2Induce.push(id)
                    })
                }
                if (this.root in augmentingGraph.inDegree) {
                    augmentingGraph.inDegree[this.root].forEach(n => {
                        vertices2Induce.push(n)
                    })
                }

                let newGraph = new InducedSubgraph(augmentingGraph, vertices2Induce)

                newGraph.vertices.forEach(id=> {
                    newGraph.vertexSize[id] = this.controller.properties.vertexSize
                })
                newGraph.inDegree[this.root].forEach(id => {
                    newGraph.vertexColor[id] = "black"
                    newGraph.vertexSize[id] = this.controller.properties.rootExplorationVertexSize
                  })

      this.previousGraph = newGraph
      return newGraph
    }

  renderRestoreGraphContext(): Promise<vega.View> {
    this.currentView = null
    if( this.lastClick !=null){
      return this.render(this.lastClick).then()
    }
    else return this.render(null).then()
  }

  renderRestoreViewContext(){
      if( this.root != null){
        this.render(this.root)
      }
      else this.render(null)
  }

    render(clickedVertex): Promise<vega.View> {
      if( this.firstTime){
        this.originalGraph = this.controller.graphs[this.controller.currentOrgan]
      }
      this.firstTime = false
      return this.controller.graphs[this.controller.currentOrgan].readyPromise.then(e => {
        let layoutGraph = this.calculateLayoutGraph(clickedVertex);
        if (layoutGraph != null) {
          return this.renderExplore(layoutGraph);
        } else
          return null;
      });
    }

    renderExplore(currentGraph): Promise<vega.View>{

        let rotateAngle: String = this.controller.gui.selectedRotation
        let layout = new LayoutSubgraph(currentGraph, new Rotation(rotateAngle),this.controller.properties)
        layout.class = LayoutClass.Exploration
        let graph2D = new Graph2D(currentGraph, layout,this.controller.properties)

        this.setGraph2DParameter(
            graph2D
        )
        let specification = graph2D.exportSpecification(false)

        if( this.currentView ==null) {
            // @ts-ignore
            let view = new vega.View(vega.parse(specification))
                .renderer('svg')
                .initialize(document.querySelector('#drawing'))
                .addEventListener('click', (event, item) => this.explore(event, item))
                .addEventListener('mouseover', (event, item) => this.toolTip.compute(event,item,currentGraph))

            this.currentView = view
            this.setBackground(this.currentView)
            return this.currentView.runAsync().then(()=>  {
              this.previousDrawing = layout.drawing
            }).then()

        }
        else{
            return this.animation(layout,currentGraph,graph2D).then(()=>this.previousDrawing = layout.drawing).then()
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
          .addEventListener('click', (event, item) => this.explore(event, item))
          .addEventListener('mouseover', (event, item) => this.toolTip.compute(event,item,currentGraph))

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

    animation(layout, currentGraph, graph2D): Promise<vega.View> {
      let vertices2Move = this.calculateVertices2Move(layout.drawing, currentGraph)
      let movement = new Movement(layout.drawing, this.calculateSourcePoints(vertices2Move), vertices2Move, this.calculateTargetPoints(vertices2Move, layout.drawing), this.frames)

      let promiseArr = []
        for (let count = 0; count < this.frames; count++) {
          setTimeout(() =>  {
            graph2D.vertexPosition = movement.animation[count]
            promiseArr.push(this.animationTick(count,movement,graph2D,currentGraph))
          }, this.frameTime)
        }
        return Promise.all(promiseArr).then()
      }


    explore(event,item){

    if( event != undefined && item != undefined) {
        let vertexID = item.datum.id
        if( this.originalGraph.vertexType[vertexID] != Type.BM && this.originalGraph.vertexType[vertexID] != Type.CT){
          this.root = vertexID
          this.render(vertexID)
        }
        this.lastClick = vertexID
    }
    }

    reset(): void {
        this.firstTime = true
        this.root = 1
        this.previousGraph = null
        this.currentView =null
        this.lastClick = null
    }

    calculateSourcePoints( vertices){
        let result = []
        vertices.forEach(id=>result.push(this.previousDrawing[id]))
        return result
    }

    calculateTargetPoints(vertices,currentDrawing){
        let result = []
        vertices.forEach(id=>result.push(currentDrawing[id]))
        return result
    }

    calculateVertices2Move(currentDrawing,currentGraph){
        let vertices2Move = []
        currentGraph.vertices.forEach(id=>{
            if( id in this.previousDrawing && id in currentDrawing){
                if( this.previousDrawing[id].x != currentDrawing[id].x || this.previousDrawing[id].y != currentDrawing[id].y){
                    vertices2Move.push(id)
                }
            }
        })
        return vertices2Move
    }

}
