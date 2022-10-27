import {Graph} from "./Graph";
import {OntologyType, Organ, Type} from "../util/Properties";

export class InducedSubgraph{

    vertices: number[]

    outDegree: Map<number,number[]>
    inDegree: Map<number,number[]>

    numVertices: number

    verticesAS: number[]
    verticesCT: number[]
    verticesBM: number[]

    numVerticesAS: number
    numVerticesCT: number
    numVerticesBM: number

    vertexType: Map<number,Type>
    vertexLabel: Map<number,String>
    vertexVisible: Map<number,number>
    vertexColor: Map<number,String>
    vertexSize: Map<number,number>

    organ: Organ

    vertexInduced: Map<number,boolean>

    IDtoOntologyType: Map<string,OntologyType>
    IDtoOntologyID: Map<number,string>

    constructor( graph: Graph| InducedSubgraph, inducedVertices: number[]) {


        this.vertices = inducedVertices.slice(0)
        this.createVertexInducedMap(graph,inducedVertices)
        this.numVertices = inducedVertices.length

        this.outDegree = new Map<number, number[]>()
        this.inDegree = new Map<number, number[]>()
        this.vertexVisible = new Map<number, number>()

        this.induceEdges(inducedVertices,graph.outDegree,this.outDegree)
        this.induceEdges(inducedVertices,graph.inDegree,this.inDegree)

        this.induceVertexArrays(inducedVertices,graph)

        this.vertexType = new Map<number, Type>()
        this.vertexLabel = new Map<number, String>()
        this.vertexColor = new Map<number, String>()

        this.induceDataContainer(inducedVertices,graph.vertexType,this.vertexType)
        this.induceDataContainer(inducedVertices,graph.vertexLabel,this.vertexLabel)
        this.induceDataContainer(inducedVertices,graph.vertexVisible,this.vertexVisible)
        this.induceDataContainer(inducedVertices,graph.vertexColor,this.vertexColor)

        this.organ = graph.organ

        this.IDtoOntologyType = new Map<string, OntologyType>()
        this.IDtoOntologyID = new Map<number, string>()

        this.induceDataContainer(inducedVertices,graph.IDtoOntologyType,this.IDtoOntologyType)
        this.induceDataContainer(inducedVertices,graph.IDtoOntologyID,this.IDtoOntologyID)

        this.vertexSize = new Map<number, number>()
        this.induceDataContainer(inducedVertices,graph.vertexSize,this.vertexSize)

    }

    addVertex(vertexType: Type, vertexID,vertexColor,vertexVisible,vertexSize,vertexLabel){
        switch (vertexType) {
            case Type.AS:
                this.verticesAS.push(vertexID)
                this.numVerticesAS += 1
                break;
            case Type.CT:
                this.verticesCT.push(vertexID)
                this.numVerticesCT +=1
                break;
            case Type.BM:
                this.verticesBM.push(vertexID)
                this.numVerticesBM +=1
                break;
        }

        this.vertices.push(vertexID)
        this.vertexType[vertexID] = vertexType
        this.vertexColor[vertexID] = vertexColor
        this.vertexVisible[vertexID] = 1
        this.vertexSize[vertexID] = vertexSize
        this.vertexLabel[vertexID] = vertexLabel
        this.numVertices +=1

    }

    createVertexInducedMap(graph: Graph | InducedSubgraph, inducedVertices: number[]){
        this.vertexInduced = new Map<number, boolean>()
        graph.vertices.forEach(vertexID=>{
            if( inducedVertices.includes(vertexID)){
                this.vertexInduced[vertexID] = true
            }
            else{
                this.vertexInduced[vertexID] = false
            }
        })
    }


    induceVertexArrays(inducedVertices: number[],graph: Graph| InducedSubgraph){

        this.verticesAS = []
        this.verticesCT = []
        this.verticesBM = [ ]

        inducedVertices.forEach(inducedID=>{

            let type = graph.vertexType[inducedID]

            switch (type) {
                case Type.AS:
                    this.verticesAS.push(inducedID)
                    break
                case Type.CT:
                    this.verticesCT.push(inducedID)
                    break
                case Type.BM:
                    this.verticesBM.push(inducedID)
                    break
            }

        })

        this.numVerticesAS = this.verticesAS.length
        this.numVerticesCT = this.verticesCT.length
        this.numVerticesBM = this.verticesBM.length



    }

    induceEdges(inducedVertices: number[],source,target){
        inducedVertices.forEach(inducedID=>{
            if( inducedID in source){
                let result = []
                source[inducedID].forEach( relativeID=>{
                    if( this.vertexInduced[relativeID]){
                        result.push(relativeID)
                    }
                })
                if( result.length > 0) {
                    target[inducedID] = result
                }
            }
        })
    }



    induceDataContainer(inducedVertices: number[],source,target){
        inducedVertices.forEach(inducedID=>{
            target[inducedID] = source[inducedID]
        })
    }

    merge(graph: InducedSubgraph){

        let inducedVertices = graph.vertices

        inducedVertices.forEach(id=>{
            if( id in graph.outDegree){
                this.outDegree[id] = graph.outDegree[id]
            }
            if( id in graph.inDegree){
                this.inDegree[id] = graph.inDegree[id]
            }
        })

        this.induceDataContainer(inducedVertices,graph.vertexType,this.vertexType)
        this.induceDataContainer(inducedVertices,graph.vertexLabel,this.vertexLabel)
        this.induceDataContainer(inducedVertices,graph.vertexVisible,this.vertexVisible)
        this.induceDataContainer(inducedVertices,graph.vertexColor,this.vertexColor)
        this.induceDataContainer(inducedVertices,graph.IDtoOntologyType,this.IDtoOntologyType)
        this.induceDataContainer(inducedVertices,graph.IDtoOntologyID,this.IDtoOntologyID)
        this.induceDataContainer(inducedVertices,graph.vertexSize,this.vertexSize)

        inducedVertices.forEach(inducedID=>{

            let type = graph.vertexType[inducedID]

            switch (type) {
                case Type.AS:
                    this.verticesAS.push(inducedID)
                    this.numVerticesAS +=1
                    break
                case Type.CT:
                    this.verticesCT.push(inducedID)
                    this.numVerticesCT +=1
                    break
                case Type.BM:
                    this.verticesBM.push(inducedID)
                    this.numVerticesBM += 1
                    break
            }
            this.vertices.push(inducedID)

        })
        this.numVerticesAS = this.verticesAS.length
        this.numVerticesCT = this.verticesCT.length
        this.numVerticesBM = this.verticesBM.length
    }


}
