import {Graph} from "../../model/Graph";
import {InducedSubgraph} from "../../model/InducedSubgraph";
import {Type} from "../../util/Properties";

export class CommonSubtreeReplicating {

    graph: Graph

    treeAS: InducedSubgraph
    counter: number

    subtreeMap: Map<number,number>

    artificialCTID: number
    artificialBMID: number

    constructor(graph) {
        this.graph = graph

        this.treeAS = new InducedSubgraph(graph,graph.verticesAS)
        this.counter = 1
        this.subtreeMap = new Map<number, number>()

        let root = this.calculateRoot()

        this.calculateSubtreeMap(root)

        this.artificialCTID = -200000
        this.artificialBMID = -750000

        this.replicateCTBM()

    }

    replicateCTBM(){
        this.graph.verticesCT.forEach(id=>{
            if( id in this.graph.inDegree){
                let bins = new Map<number,number[]>()
                this.graph.inDegree[id].forEach(leaf=>{
                    let index = this.subtreeMap[leaf]
                    if( index in bins){
                        bins[index].push(leaf)
                    }
                    else{
                        bins[index] = [leaf]
                    }
                })
                let first = true
                for (const [key,value] of Object.entries(bins)) {
                    if( first) first = false
                    else this.augment(id, value)
                }
                //console.log('ID',id,bins)
            }
        })

    }


    augment(ctVertex: number, leaves: number[]){

        this.graph.vertices.push(this.artificialCTID)
        this.graph.verticesCT.push(this.artificialCTID)
        this.graph.numVertices +=1
        this.graph.numVerticesCT +=1
        this.graph.vertexType[this.artificialCTID] = Type.CT
        this.graph.vertexVisible[this.artificialCTID] = 1
        this.graph.vertexSize[this.artificialCTID] = this.graph.vertexSize[ctVertex]

        this.graph.vertexLabel[this.artificialCTID] = this.graph.vertexLabel[ctVertex]
        this.graph.vertexColor[this.artificialCTID] = this.graph.vertexColor[ctVertex]

        this.graph.IDtoOntologyType[this.artificialCTID] = this.graph.IDtoOntologyType[ctVertex]
        this.graph.IDtoOntologyID[this.artificialCTID] = this.graph.IDtoOntologyID[ctVertex]

        leaves.forEach(leaf =>{
            this.graph.inDegree[this.artificialCTID] = [leaf]
            this.graph.outDegree[leaf].push(this.artificialCTID)
            this.removeByValue(leaf,this.graph.inDegree[ctVertex])
            this.removeByValue(ctVertex,this.graph.outDegree[leaf])
        })
        if( ctVertex in this.graph.outDegree){
            this.augmentBM(this.graph.outDegree[ctVertex])
        }
        this.artificialCTID -= 1

    }

    augmentBM(oldBM){

        let newBMID = []

        for(let i=0; i < oldBM.length; i++){
            let oldBMID = oldBM[i]

            newBMID.push(this.artificialBMID)
            this.graph.vertices.push(this.artificialBMID)
            this.graph.verticesBM.push(this.artificialBMID)
            this.graph.vertexVisible[this.artificialBMID] = 1

            this.graph.vertexColor[this.artificialBMID] = this.graph.vertexColor[oldBMID]

            this.graph.IDtoOntologyType[this.artificialBMID] = this.graph.IDtoOntologyType[oldBMID]
            this.graph.IDtoOntologyID[this.artificialBMID] = this.graph.IDtoOntologyID[oldBMID]

            this.graph.vertexSize[this.artificialBMID] = this.graph.vertexSize[oldBMID]

            this.graph.numVertices +=1
            this.graph.numVerticesBM +=1


            this.graph.vertexType[this.artificialBMID] = Type.BM
            this.graph.vertexLabel[this.artificialBMID] = this.graph.vertexLabel[oldBMID]

            this.artificialBMID -= 1
        }

        newBMID.forEach(id=>{
            if( id in this.graph.inDegree){
                this.graph.inDegree[id].push(this.artificialCTID)
            }
            else{
                this.graph.inDegree[id] = [this.artificialCTID]
            }

            if( this.artificialCTID in this.graph.outDegree){
                this.graph.outDegree[this.artificialCTID].push(id)
            }
            else{
                this.graph.outDegree[this.artificialCTID] = [id]
            }
        })
    }


    removeByValue(value,arr){
        let index = arr.indexOf(value)
        if( index != -1) arr.splice(index,1)
    }

    calculateRoot(){
        let root = -1
        this.treeAS.vertices.forEach(id=>{

            if( !(id in this.treeAS.inDegree)){
                root = id
            }
        })
        return root
    }


    calculateSubtreeMap(current){
        if( current in this.treeAS.outDegree){
            this.treeAS.outDegree[current].forEach(n=>{
                if( !this.calculateSubtreeMap(n)) this.counter += 1
            })
            return false
        }
        else{
            this.subtreeMap[current] = this.counter
            return true
        }
    }




}
