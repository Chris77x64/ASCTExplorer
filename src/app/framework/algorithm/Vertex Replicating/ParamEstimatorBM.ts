import {InducedSubgraph} from "../../model/InducedSubgraph";
import {Edge} from "../../model/Edge";
import {Point2D} from "../../model/Point2D";
import {AbstractDrawingBM} from "./AbstractDrawingBM";

export class ParamEstimatorBM {

    graph : InducedSubgraph

    parameterReplication: number

    constructor(graph,slotsCT,biomarkerX,cellTypeX,offsetIncrementCT,offsetIncrementBM) {
        this.graph = graph
        this.binarySearch(slotsCT,biomarkerX,cellTypeX,offsetIncrementCT,offsetIncrementBM)
    }


    binarySearch(slotsCT,biomarkerX,cellTypeX,offsetIncrementCT,offsetIncrementBM){
        let start = 0
        let stop = 100

        while ( start <= stop){
            let middleIndex = Math.floor( start+ ((stop-start)/2) )

            if( stop == middleIndex){
                break
            }
            let abstractDrawingBM = new AbstractDrawingBM(this.graph,middleIndex,slotsCT, biomarkerX,cellTypeX,offsetIncrementCT,offsetIncrementBM)
            if( abstractDrawingBM.feasible){
                stop = middleIndex
            }
            else{/*
            for false the minimum percentage needs to be at least middle+1
                */

                start = middleIndex + 1
            }

        }
        this.parameterReplication = stop
    }

}
