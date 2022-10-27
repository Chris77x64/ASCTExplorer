export abstract class Containment {

    verticesCT: number[]

    /*
    Adjacency List of containment tree ( planar dual )
     */
    outDegree: Map<number,number[]>

    initialRoot: number
    root: number


    containment : number[]
    containerState: Map<number,boolean> // 1: expanded 0: collapsed
    containmentLeaves: Map<number,number[]>  // key: artificial id of container and value: all its leaf vertices
    artificialID: number
    artificialIDToInnerVertex: Map<number,number>

    /*
    create adjacency list for containment tree and set root of tree
     */
    abstract  initializeContainment(): void

    numRectangles: number
    /*
    key: position of rectangle in rectangle array,
    value: involved vertices
     */
    rectangleMap: Map<number,number[]>

    /*
    key: position of rectangle in rectangle array
    value: corresponding artificial ID of containment
     */
    rectIDArtificialIDMap: Map <number,number>

    /*
   key:  corresponding artificial ID of containment
    value: position of rectangle in rectangle array
     */
    artificialIdRectIDMap: Map <number,number>

    aid: number

    constructor( verticesCT: number[]) {

        this.verticesCT = verticesCT
        this.outDegree = new Map<number,number[]>()


        this.containerState = new Map<number, boolean>()
        this.containmentLeaves = new Map<number, number[]>()
        this.artificialID = -800000
        this.artificialIDToInnerVertex = new Map<number, number>()

        //RandomContainment extends Containment creates outDegree
        this.initializeContainment()
        //calculate linear order on V_CT
        this.parseInitialContainment()

        this.parseAbstractRectangles()

    }

    /*
    Parse Containment Tree (DFS) to obtain valid ordering of CT vertices
    */
    parseContainment(){
        this.containmentLeaves = new Map<number, number[]>()
        this.artificialIDToInnerVertex = new Map<number, number>()
        this.artificialID = -800000
        this.containment = this.worker(this.root)

    }

    reset(){
      this.containmentLeaves = new Map<number, number[]>()
      this.artificialID = -800000
      this.parseInitialContainment() //resettet container state and containment leaves
    }

    /*
    id can be artifical id
     */
    expand(id){
      //if artificial id
      if( id in this.artificialIDToInnerVertex){
        this.containerState[this.artificialIDToInnerVertex[id]] = true
        this.expandWorker(this.artificialIDToInnerVertex[id])
      }
      //if original id
      else{
        this.containerState[id] = true
        this.expandWorker(id)
      }
    }

    expandWorker(id){
      this.containerState[id] = true
      if( id in this.outDegree){
          this.outDegree[id].forEach(n=>{
            this.containerState[n] = true
            this.expandWorker(n)
          })
      }
    }

    collapse(id){
      this.containerState[id] = false
    }

    worker( id){

      if( id in this.outDegree){

        if( this.containerState[id] == true) {
          let S = []
          this.outDegree[id].forEach(child => {
            S = S.concat(this.worker(child))
          })

          this.containmentLeaves[id] = S
          return S
        }
        else{
          this.artificialID = this.artificialID - 1
          this.containmentLeaves[id] = this.artificialID
          this.artificialIDToInnerVertex[this.artificialID] = [id]
          return [this.artificialID]
        }
      }
      else {
        this.containmentLeaves[id] = [id]
        return [id]
      }
    }

    parseInitialContainment(){
      this.containment = this.workerInitial(this.root)
    }

  workerInitial( id){
      this.containerState[id] = true

      if( id in this.outDegree){

        let S = []
        this.outDegree[id].forEach(child=> {
            S = S.concat(this.workerInitial(child))
        })

        this.containmentLeaves[id] = S
        return S
      }
      else {
        this.containmentLeaves[id] = [id]
        return [id]
      }


  }

  calculateFakeOutDeg(){
    this.aid = -800000
    let f = new Map<number,number[]>()
    this.worker2(this.root,f)
    f[this.root] = this.outDegree[this.root]
    return f
  }

  worker2( id,f){

    if( id in this.outDegree){
      if( this.containerState[id] == true) {
        this.outDegree[id].forEach(n=>{
          this.worker2(n,f)
        })
        f[id] = this.outDegree[id]
      }
      else{
        this.aid = this.aid - 1
        f[id] = [this.aid]
      }
    }

  }

    parseAbstractRectangles(){

        let root = this.root
        this.numRectangles = 0
        this.rectangleMap = new Map<number, number[]>()
        this.rectIDArtificialIDMap = new Map<number, number>()
        this.artificialIdRectIDMap = new Map<number, number>()


        if( root in this.outDegree){
            this.outDegree[root].forEach(n=>{
                this.abstractRectangleWorker(n)
            })
        }
    }

    abstractRectangleWorker(id){

      if( id in this.outDegree){

        if( this.containerState[id] == true) {
          this.rectangleMap[this.numRectangles] = this.containmentLeaves[id]
          this.rectIDArtificialIDMap[this.numRectangles] = id
          this.artificialIdRectIDMap[id] = this.numRectangles
          this.numRectangles += 1

          this.outDegree[id].forEach(child => {
            this.abstractRectangleWorker(child)
          })
        }
        else{
          this.rectangleMap[this.numRectangles] = this.containmentLeaves[id]
          this.rectIDArtificialIDMap[this.numRectangles] = id
          this.artificialIdRectIDMap[id] = this.numRectangles
          this.numRectangles += 1
        }
      }
    }

    update(){
        this.parseContainment()
        this.parseAbstractRectangles()
    }

}
