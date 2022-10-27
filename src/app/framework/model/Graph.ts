import {graphURL, isOnline, offlineURL, OntologyType, Organ, Properties, Type} from "../util/Properties";
import {Containment} from "../containment/Containment";
import {RandomContainment} from "../containment/RandomContainment";

export class Graph {

    organ: Organ

    vertices: number[]

    verticesAS: number[]
    verticesCT: number[]
    verticesBM: number[]

    numVertices: number
    numVerticesAS: number
    numVerticesCT: number
    numVerticesBM: number

    inDegree: Map<number,number[]>
    outDegree: Map<number,number[]>
    vertexType: Map<number,Type>
    vertexLabel: Map<number,String>
    vertexVisible: Map<number,number>
    vertexColor: Map<number,String>
    vertexSize: Map<number,number>

    ready: boolean
    readyPromise: Promise<any>

    IDtoOntologyType: Map<string,OntologyType>
    IDtoOntologyID: Map<number,string>

    containment: Containment

    constructor(args: any[]) {

        this.vertexSize = new Map<number, number>()
        if( args.length == 1){
            this.organ = args[0]
            this.vertices = []

            this.inDegree = new Map<number, number[]>()
            this.outDegree = new Map<number, number[]>()
            this.vertexType = new Map<number, Type>()
            this.vertexLabel = new Map<number,String>()
            this.vertexVisible = new Map<number, number>()
            this.vertexColor = new Map<number, String>()

            this.IDtoOntologyType = new Map<string, number>()
            this.IDtoOntologyID = new Map<number, string>()

            this.ready = false

            const theGraphUrl = graphURL(this.organ)
            this.readyPromise = this.initializeGraph(theGraphUrl).then(r => {
                let vertexSizeP = Math.sqrt((window.screen.height*window.screen.height)+(window.screen.width*window.screen.width))/2
                this.vertices.forEach(id=>this.vertexSize[id] = vertexSizeP)
                this.ready = true
                this.containment = new RandomContainment(this.verticesCT)
            })
        }
        else{
            this.organ = args[0]
            this.vertices = args[1]
            this.inDegree = args[2]
            this.outDegree = args[3]
            this.vertexType = args[4]
            this.vertexLabel = args[5]
            this.vertexVisible = args[6]
            this.vertexColor = args[7]
            this.IDtoOntologyType = args[8]
            this.IDtoOntologyID = args[9]


            this.verticesAS =  []
            this.verticesCT = []
            this.verticesBM = []
            this.numVertices = this.vertices.length
            this.numVerticesAS = 0
            this.numVerticesCT = 0
            this.numVerticesBM = 0

            this.vertices.forEach(id=>{
                switch (this.vertexType[id]) {
                    case Type.AS:{
                        this.verticesAS.push(id)
                        this.numVerticesAS += 1
                        break
                    }
                    case Type.CT:{
                        this.verticesCT.push(id)
                        this.numVerticesCT += 1
                        break
                    }
                    case Type.BM:{
                        this.verticesBM.push(id)
                        this.numVerticesBM += 1
                        break
                    }
                }
                this.vertexSize[id] = 300
            })

            this.ready = true
        }

    }

    processOntologyID(metadata,id){
        if( metadata.ontologyId != '') {
            let metaID = metadata.ontologyId
            // escape metadata subject to UBERON:0004538 ->  UBERON/0004538
            let valid = metaID.indexOf(":")
            if( valid != -1){

                metaID = metaID.split(' ')[0]
                const [ontologyType,ontologyID] =  metaID.split(':')

                switch (ontologyType) {
                    case "HGNC":{
                        this.IDtoOntologyType[id] = OntologyType.HGNC
                        break
                    }
                    case "UBERON":{
                        this.IDtoOntologyType[id] = OntologyType.UBERON
                        break
                    }
                    case "FMAID":{
                        this.IDtoOntologyType[id] = OntologyType.FMAID
                        break
                    }
                    case "CL":{
                        this.IDtoOntologyType[id] = OntologyType.CL
                        break
                    }
                }
                this.IDtoOntologyID[id] = ontologyID
            }
        }
    }

    async initializeGraph(theGraphUrl: string) {


      let data: any
      if( isOnline()){
        data = await fetch(theGraphUrl).then(r => r.json()).then(r => r.data);
      }
      else{
        data = await fetch(offlineURL(this.organ)).then(r => r.json()).then(r => r.data);
      }

        this.verticesAS = []
        this.verticesCT = []
        this.verticesBM = []

        for (const node of data.nodes) {
            const { id, type, name, metadata } = node as {id: number, type: string, name: string, metadata: any};

            this.processOntologyID(metadata,id)

            switch (type) {
                case "AS":
                    this.vertexType[id] = Type.AS
                    this.vertexColor[id] = "red"
                    this.verticesAS.push(id)
                    break;
                case "CT":
                    this.vertexType[id] = Type.CT
                    this.vertexColor[id] = "blue"
                    this.verticesCT.push(id)
                    break;
                case "BM":
                    this.vertexType[id] = Type.BM
                    this.verticesBM.push(id)
                    if( metadata.bmType == "gene"){
                      this.vertexColor[id] = "green"
                    }
                    else this.vertexColor[id] = "Chartreuse"
                    break;
            }

            this.vertexVisible[id] = 1

            this.vertices.push(id)
            this.vertexLabel[id] = name
        }


        for (const edge of data.edges) {
            const { source, target} = edge as { source: number, target: number};

            if( this.vertexType[source] == Type.CT && this.vertexType[target] == Type.CT ){
                if( this.organ == Organ.Heart) {
                    console.log("SOURCE: ", source, "TARGET", target, this.organ)
                }}


            if( ! (this.vertexType[source] == Type.CT && this.vertexType[target] == Type.CT) && !(this.vertexType[source] == Type.AS && this.vertexType[target] == Type.BM) ) {

                if (target in this.inDegree) {
                    if (!this.inDegree[target].includes(source)) {
                        this.inDegree[target].push(source)
                    }
                } else {
                    this.inDegree[target] = [source]
                }

                if (source in this.outDegree) {
                    if (!this.outDegree[source].includes(target)) {
                        this.outDegree[source].push(target)
                    }
                } else {
                    this.outDegree[source] = [target]
                }

            }
        }

        this.numVerticesAS = this.verticesAS.length
        this.numVerticesCT = this.verticesCT.length
        this.numVerticesBM = this.verticesBM.length
        this.numVertices = this.numVerticesAS + this.numVerticesCT + this.numVerticesBM
    }
}
