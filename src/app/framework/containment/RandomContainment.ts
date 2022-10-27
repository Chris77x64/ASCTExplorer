import {Containment} from "./Containment";

export class RandomContainment extends Containment {

  constructor(verticesCT) {
    super(verticesCT)
  }

  initializeContainment() {
    let random = this.verticesCT
      .map((value) => ({value, sort: Math.random()}))
      .sort((a, b) => a.sort - b.sort)
      .map(({value}) => value)

    let index = -400000

    if (this.verticesCT.length == 2) {
      this.outDegree = new Map<number, number[]>()
      this.outDegree[index] = [index+1,index+2]
      this.outDegree[index+1] = [random[0]]
      this.outDegree[index+2]=[random[1]]

      this.root = index
      this.initialRoot = this.root

    }
    else{
      let current = random.splice(0)
      while (current.length > 1) {
        let next = []

        for (let i = 1; i < current.length; i = i + 2) {

          next.push(index)
          if (current.length % 2 == 1 && i + 1 == current.length - 1) {
            this.outDegree[index] = [current[i - 1], current[i], current[i + 1]]
          } else {
            this.outDegree[index] = [current[i - 1], current[i]]
          }
          index = index - 1
        }
        current = next

      }
      this.root = current[0]
      this.initialRoot = this.root

    }


  }

}
