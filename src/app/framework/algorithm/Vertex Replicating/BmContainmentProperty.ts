import {Graph} from "../../model/Graph";
import {InducedSubgraph} from "../../model/InducedSubgraph";
import {Type} from "../../util/Properties";
import {Containment} from "../../containment/Containment";

export class BMContainmentProperty {


    graph: InducedSubgraph
    containment: Containment
    artificialBMID : number

    CTRectMap: Map<number,number>


    constructor(graph,containment: Containment) {
        this.graph = graph
        this.containment = containment

        this.CTRectMap = new Map<number, number>()
        containment.containment.forEach(id=>{
           this.CTRectMap[id] = this.search(containment,id)
        })



        this.artificialBMID = -850000

        this.replicateBM()



    }

    search(containment: Containment,ctVertex){

        let res = null

        let outDeg = containment.outDegree

        for (const [key,value] of Object.entries(outDeg)) {
            if( value.includes(ctVertex)){
                res = key
            }
        }
        return res
    }


    createIndeg(){
      let ct = this.containment.containment
      let res = new Map<number,number[]>()
      ct.forEach(id=>{
        if( id in this.graph.outDegree){
          this.graph.outDegree[id].forEach(bm=>{
            // ct -> bm
            if( bm in res){
              res[bm] = res[bm].concat([id])
            }
            else{
              res[bm] = [id]
            }
          })
        }
      })
      return res
    }

    replicateBM(){
      let indeg = this.createIndeg()
        this.graph.verticesBM.forEach(id=>{
            if( id in this.graph.inDegree){
                let bins = new Map<number,number[]>()
              this.graph.inDegree[id].forEach(ct=>{
                    let index = this.CTRectMap[ct]
                    if( index in bins){
                        bins[index].push(ct)
                    }
                    else{
                        bins[index] = [ct]
                    }
                })
           //   console.log('BINS FOR BM: ',this.graph.vertexLabel[id],' WITH AID: ',bins)
                let first = true
                for (const [key,value] of Object.entries(bins)) {
                    if( first) first = false
                    else this.augment(id, value)
                }
                //console.log('ID',id,bins)
            }
        })
    }

    augment( originalBM, ctArr){

        /*
        Create Artificial Biomarker
         */
        this.graph.vertices.push(this.artificialBMID)
        this.graph.verticesBM.push(this.artificialBMID)
        this.graph.numVertices +=1
        this.graph.numVerticesBM +=1
        this.graph.vertexType[this.artificialBMID] = Type.BM
        this.graph.vertexLabel[this.artificialBMID] = this.graph.vertexLabel[originalBM]
        this.graph.IDtoOntologyType[this.artificialBMID] = this.graph.IDtoOntologyType[originalBM]
        this.graph.IDtoOntologyID[this.artificialBMID] = this.graph.IDtoOntologyID[originalBM]
        this.graph.vertexSize[this.artificialBMID] = this.graph.vertexSize[originalBM]
        this.graph.vertexVisible[this.artificialBMID] = 1
        this.graph.vertexColor[this.artificialBMID] = this.graph.vertexColor[originalBM]

        /*
        Connect edges
         */
        ctArr.forEach(id=>{
            this.graph.outDegree[id].push(this.artificialBMID)
            if( this.artificialBMID in this.graph.inDegree){
                this.graph.inDegree[this.artificialBMID].push(id)
            }
            else {
                this.graph.inDegree[this.artificialBMID] = [id]
            }
        })

        /*
        Remove Edges
         */
        ctArr.forEach(id=>{
            this.removeByValue(id,this.graph.inDegree[originalBM])
            this.removeByValue(originalBM,this.graph.outDegree[id])
        })

        /*
        Increment Counter
         */
        this.artificialBMID -= 1

    }

    removeByValue(value,arr){
        let index = arr.indexOf(value)
        if( index != -1) arr.splice(index,1)
    }




}
