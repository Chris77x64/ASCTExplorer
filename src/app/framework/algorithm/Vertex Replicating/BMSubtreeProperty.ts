import {Graph} from "../../model/Graph";
import {InducedSubgraph} from "../../model/InducedSubgraph";
import {Type} from "../../util/Properties";

export class BMSubtreeProperty {

    subtreeMap: Map<number,number>

    counter: number

    graph: InducedSubgraph
    treeAS: InducedSubgraph

    artificialBMID : number

    constructor(graph) {
        this.graph = graph

        this.subtreeMap = new Map<number, number>()
        this.treeAS = new InducedSubgraph(graph,graph.verticesAS)
        this.counter = 1
        let root = this.calculateRoot()
        this.calculateSubtreeMap(root)


        this.artificialBMID = -850000

        this.replicateBM()
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
            if( current in this.graph.outDegree){
                this.graph.outDegree[current].forEach(id=>this.subtreeMap[id]= this.counter)
            }
            return true
        }
    }

    replicateBM(){
        this.graph.verticesBM.forEach(id=>{
            if( id in this.graph.inDegree){
                let bins = new Map<number,number[]>()
                this.graph.inDegree[id].forEach(ct=>{
                    let index = this.subtreeMap[ct]
                    if( index in bins){
                        bins[index].push(ct)
                    }
                    else{
                        bins[index] = [ct]
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
