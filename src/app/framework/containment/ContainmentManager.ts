import {Containment} from "./Containment";
import {RandomContainment} from "./RandomContainment";
import {InducedSubgraph} from "../model/InducedSubgraph";
import {ASInvariant} from "../algorithm/Anatomical Structures/ASInvariant";
import {ASAugmentation} from "../algorithm/Anatomical Structures/ASAugmentation";
import {OneSidedCrossingMinimization} from "../algorithm/OneSidedCrossingMinimization";
import {BiomarkerAugementation} from "../algorithm/Vertex Replicating/BiomarkerAugementation";
import {graphURL, Properties, Type} from "../util/Properties";
import {ParamEstimatorBM} from "../algorithm/Vertex Replicating/ParamEstimatorBM";
import {ASLeaves} from "../algorithm/Anatomical Structures/ASLeaves";
import {BMContainmentProperty} from "../algorithm/Vertex Replicating/BmContainmentProperty";

export class ContainmentManager {

    containment: Containment


    modelGraph: InducedSubgraph
    containmentGraph: InducedSubgraph

    depth: number

    properties: Properties

    constructor( containment: Containment, currentGraph,properties) {
        this.properties = properties
        this.containment = containment
        this.modelGraph = this.calculateModelGraph(currentGraph)
        this.containmentGraph = this.calculateContainmentGraph(this.modelGraph)
    }

    evaluate(rectIndex){
      let artificialID = this.containment.rectIDArtificialIDMap[rectIndex]

        if( this.containment.containerState[artificialID] == true){
            this.collapse(rectIndex)
        }
        else{
            this.expand(rectIndex)
        }
    }

    expand(rectIndex){
       let artificialID = this.containment.rectIDArtificialIDMap[rectIndex]
      this.containment.expand(artificialID)
      this.containment.update()
      this.containmentGraph = this.calculateContainmentGraph(this.modelGraph)
    }


    customDelete(data: number[],set2Delete: number[]){
        let res = []
        for(let i=0; i < data.length; i++){
            let elem = data[i]
            if(  set2Delete.indexOf(elem) == -1){
                res.push(elem)
            }
        }
        return res
    }



    collapse(rectIndex){
        let artificialID = this.containment.rectIDArtificialIDMap[rectIndex]
        this.containment.collapse(artificialID)
        this.containment.update()
        this.containmentGraph = this.calculateContainmentGraph(this.modelGraph)
    }

    reset(){
        this.containment.reset()
    }




    calculateContainmentGraph(currentGraph){
      let involvedCT = []
      let artificialCT = []

      this.containment.containment.forEach(id=>{
        if( (id in this.containment.artificialIDToInnerVertex) ) {
          artificialCT.push(id)
        }
        else {
          involvedCT.push(id)
        }
      })

      /*
      Step 1: Obtain all reachable biomarker from resulting ct vertices of containment
       */

      let newBM = new Set<number>()

      involvedCT.forEach(id=>{
        if( id in currentGraph.outDegree){
          currentGraph.outDegree[id].forEach(bm=>{
            newBM.add(bm)
          })}})
      let involvedBM = Array.from(newBM)


      /*
      Step 2: Obtain all reachable anatomical leaves from resulting ct vertices of containment
      */

      let asLeaves = new ASLeaves(currentGraph)
      let newAS = new Set<number>()

      asLeaves.leaves.forEach(asID=>{
        if( asID in currentGraph.outDegree){

          currentGraph.outDegree[asID].forEach(n=>{
            if( involvedCT.includes(n)){
              newAS.add(asID)
            }
          })
        }
      })
      let involvedAS = Array.from(newAS)


      /*
      Step 3: visitedMap For anatomical tree
       */
      let f = new Map<number,boolean>()
      currentGraph.verticesAS.forEach(asId=> f[asId]= false)
      involvedAS.forEach(asID=>{
        this.tcontWorker(currentGraph,asID,f)
      })


      let A = []
      currentGraph.verticesAS.forEach(asID=>{
        if( f[asID] == true) A.push(asID)
      })

      let verticesToInduce = involvedCT.concat(involvedBM).concat(A)

      let res = new InducedSubgraph(currentGraph,verticesToInduce)
      artificialCT.forEach(artifID=>{
        this.addBlackVertex(artifID,res)
      })

      return res
    }

    tcontWorker(currentGraph,id,f){
      f[id] = true
      if( id in currentGraph.inDegree){
        let n = currentGraph.inDegree[id]
        let parent = n[0]
        if( f[parent] == false) {
          this.tcontWorker(currentGraph, parent,f)
        }
      }
    }

    calculateModelGraph(currentGraph){

        let res = new InducedSubgraph(currentGraph,currentGraph.vertices)

        let anatomicalInvariant = new ASInvariant(res)
        let treeAugmentation = new ASAugmentation(res)
        this.depth = treeAugmentation.depth
        let augmentationBM = new BMContainmentProperty(res,this.containment)
        return res
    }


    affectedCT(id) {

      if (id in this.containment.outDegree) {

        let S = []
        this.containment.outDegree[id].forEach(child => {
          S = S.concat(this.affectedCT(child))
        })
        return S
      } else {
        return [id]
      }
    }

    addBlackVertex(artifID,g){

      let correspondingVertex = this.containment.artificialIDToInnerVertex[artifID]
      let affectedCT = this.affectedCT(correspondingVertex)
      let accumulatedLength = 0

      affectedCT.forEach(id=>{
        if( id in this.modelGraph.outDegree){
          accumulatedLength += this.modelGraph.outDegree[id].length
        }
      })


        let maxSize = this.properties.maxContainmentCollapsedVertexSize
        let newSize = this.properties.vertexSize

        let threshold = 12
        if( accumulatedLength > threshold){
            newSize += maxSize
        }
        else{
            newSize += accumulatedLength * (maxSize/threshold)
        }

        g.addVertex(Type.CT,artifID,"black",1,newSize,""+accumulatedLength)

    }

}
