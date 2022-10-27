import {Graph} from "../../model/Graph";
import {InducedSubgraph} from "../../model/InducedSubgraph";
import {BFS} from "../Search/BFS";
import {Type} from "../../util/Properties";
import {Bend} from "../../model/Bend";

export class ASAugmentation {

    bends: Bend[]
    bendCount: number

    depth : number

    constructor( graph) {

        this.bends = []
        this.bendCount = -1;
        this.depth = Number.NEGATIVE_INFINITY

        let tree = new InducedSubgraph(graph,graph.verticesAS)

        let roots = this.calculatePossibleRoots(graph)
        roots.forEach(rootID=> {
            this.treeAugmentation(rootID, graph,tree)
        })
        this.processBends(graph,tree)

    }

    treeAugmentation(rootID,graph,tree){
        let bfs = new BFS(tree,rootID,tree.outDegree)
        let layers = bfs.createLevels()

        if( this.depth < layers.length) {
            this.depth = layers.length
        }

        for( let i=0; i < layers.length -1; i++){
            let currentLayer = layers[i]
            currentLayer.forEach(vertexID =>{

                //if vertexID is leaf
                if( ! (vertexID in tree.outDegree)) {

                    let previous = vertexID
                    if (vertexID in graph.inDegree) {
                        let parent = graph.inDegree[vertexID][0]

                        let newOutDegreeParent = []
                        if (parent in tree.outDegree) {
                            tree.outDegree[parent].forEach(childID => {
                                if (childID != vertexID) {
                                    newOutDegreeParent.push(childID)
                                }
                            })
                           tree.outDegree[parent] = newOutDegreeParent


                        }


                        let artificialVertices = []

                        for (let j = i + 1; j < layers.length; j++) {
                            tree.outDegree[this.bendCount] = [previous]

                            artificialVertices.push(this.bendCount)
                            previous = this.bendCount
                            this.bendCount = this.bendCount - 1
                        }

                        this.bends.push(new Bend(parent, artificialVertices, vertexID, vertexID))

                        if (parent in tree.outDegree) {
                            tree.outDegree[parent].push(previous)
                        }

                    }
                }


            })
        }


    }

    processBends(graph,tree){
        this.bends.forEach(currentBend =>{
            let middle = currentBend.middleID

            middle.forEach(artificialVertex=> {

                graph.vertices.push(artificialVertex)
                graph.verticesAS.push(artificialVertex)
                graph.numVertices += 1
                graph.numVerticesAS += 1
                graph.vertexType[artificialVertex] = Type.AS
                graph.vertexColor[artificialVertex] = "red"
                graph.vertexLabel[artificialVertex] = " "
                graph.vertexVisible[artificialVertex] = 0
                graph.vertexSize[artificialVertex] = 300
            })

            let prevID = currentBend.targetID

            middle.forEach(artificialVertex=>{
                if( artificialVertex in graph.outDegree ){
                    graph.outDegree[artificialVertex].push(prevID)
                }
                else{
                    graph.outDegree[artificialVertex] = [prevID]
                }
                if( prevID in graph.inDegree){
                    graph.inDegree[prevID].push(artificialVertex)
                }
                else{
                    graph.inDegree[prevID] = [artificialVertex]
                }

                prevID = artificialVertex
            })

            graph.inDegree[middle[middle.length-1]] = [ currentBend.sourceID]
            graph.outDegree[currentBend.sourceID].push(middle[middle.length-1])

            this.removeByValue(currentBend.targetID,graph.outDegree[currentBend.sourceID])
            this.removeByValue(currentBend.sourceID,graph.inDegree[currentBend.targetID])

        })
    }

    removeByValue(value,arr){
        let index = arr.indexOf(value)
        arr.splice(index,1)
    }

    calculatePossibleRoots(graph: Graph| InducedSubgraph){
        let result = []
        graph.verticesAS.forEach(vertexID=>{
            if( !(vertexID in graph.inDegree)){
                result.push(vertexID)
            }
        })
        return result
    }


}
