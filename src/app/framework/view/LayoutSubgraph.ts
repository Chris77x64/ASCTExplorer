import {Point2D} from "../model/Point2D";
import {Graph} from "../model/Graph";
import { OneSidedCrossingMinimization} from "../algorithm/OneSidedCrossingMinimization"
import {InducedSubgraph} from "../model/InducedSubgraph";
import {BiomarkerAugementation, EdgeReplacement} from "../algorithm/Vertex Replicating/BiomarkerAugementation";
import {CellTypeClipping} from "../algorithm/Drawing/CellTypeClipping";
import {ASAugmentation} from "../algorithm/Anatomical Structures/ASAugmentation";
import {ASLeaves} from "../algorithm/Anatomical Structures/ASLeaves";
import {ASTreeLayoutClipping} from "../algorithm/Drawing/ASTreeLayoutClipping";
import {Layout, LayoutClass} from "./Layout";
import {ASInvariant} from "../algorithm/Anatomical Structures/ASInvariant";
import {ParamEstimatorBM} from "../algorithm/Vertex Replicating/ParamEstimatorBM";
import {CommonSubtreeReplicating} from "../algorithm/Vertex Replicating/CommonSubtreeReplicating";
import {ASBalancingV3} from "../algorithm/Anatomical Structures/ASBalancingV3";
import {BMSubtreeProperty} from "../algorithm/Vertex Replicating/BMSubtreeProperty";
import {Rotation} from "../model/Rotation";
import {Properties} from "../util/Properties";
import {BipartiteCrossings} from "../algorithm/BipartiteCrossings";


export class LayoutSubgraph extends Layout{

    constructor(graph: Graph | InducedSubgraph, rotation: Rotation,properties: Properties) {

        super(graph,rotation,properties)
        this.class = LayoutClass.Subgraph

        /*
        Preprocessing of Anatomical Tree:
        1. Ensure that each Vertex of AS Tree has either only edges to AS-Vertices or only edges to CT-Vertices
        2. Augment AS-Tree using Bends such that all Leaves have same same BFS-Layer ( width )
        3. Calculate parameter using index of last BFS-Layer (xPositions of AS-Leaves,Ct-Vertices,BM-Vertices)
         */
        let anatomicalInvariant = new ASInvariant(graph)
        let treeAugmentation = new ASAugmentation(graph)

        this.calculateParameter( )

        /*
        Cell Type Replicating:
        Replicate CT-Vertex for each adjacent AS-Subtree
         */
        let commonSubtreeAugmentation = new CommonSubtreeReplicating(graph)

        /*
        1. Reorder adjacency lists of AS-Tree:
        Leaves: Compute OCM Heuristic Median and reorder CT-Vertices according to it
        Non-Leaves: Order based on sum of precomputed heuristic
        2. Compute linear order of leaf vertices
         */
        let anatomicalBalancing = new ASBalancingV3(graph)
        let asLeaves = new ASLeaves(graph)

        /*
        Perform OCM ( fixed: AS-leaves | free: CT-Vertices )
        in order to obtain linear order of CT-Vertices (slotsCT)
         */
        let minimizationASCT = new OneSidedCrossingMinimization(graph, asLeaves.leaves, graph.verticesCT)
        let slotsCT = minimizationASCT.slots


        /*
        Biomarker Replicating:
        1. Estimate Parameter for Edge Rank Algorithm using binary search
        2. Apply Edge Rank Algorithm to replicate biomarker using previously computed parameter
         */
        let subtreeBM = new BMSubtreeProperty(graph)
        let estimator = new ParamEstimatorBM(graph,slotsCT,this.xPositionBM,this.xPositionCT,this.offsetIncrementCT,this.offsetIncrementBM)
        let augmentationBM = new BiomarkerAugementation(slotsCT, graph, estimator.parameterReplication)


        /*
        Perform OCM ( fixed: CT-Vertices | free: BM-Vertices )
        in order to obtain linear order of BM-Vertices (slotsBM)
        */
        let minimizationCTBM = new OneSidedCrossingMinimization(graph, slotsCT, this.graph.verticesBM)
        let slotsBM = minimizationCTBM.slots


        /*
        Compute drawing as Map f: V(G) -> R^2 in the order specified below
         */
        this.drawBiomarkers(slotsBM)
        this.drawCellTypes(slotsCT)
        let asTreeLayout = new ASTreeLayoutClipping(graph,this.drawing,this.depth,this.depthMultiplier,this.offsetIncrementAS)

        /*
        Estimate Size of Drawing and apply linear map to drawing
         */
        this.calculateWidthHeight()
        this.applyLinearMap(rotation,asLeaves)


    }

    drawBiomarkers(slotsBM: number[]) {
        let offsetBM = this.properties.heightTopPadding
        slotsBM.forEach(vertexID => {
            let currentPoint = new Point2D(this.xPositionBM, offsetBM)
            offsetBM = offsetBM + this.offsetIncrementBM
            this.drawing[vertexID] = currentPoint
        })

    }

    drawCellTypes(slotsCT: number[]) {
        let offsetCT = this.properties.heightTopPadding

        if(  this.feasibleClippingCT()){
            let clipping = new CellTypeClipping(this,slotsCT,offsetCT)
        }
        else{
            slotsCT.forEach(vertexID => {
                let currentPoint = new Point2D(this.xPositionCT, offsetCT)
                offsetCT = offsetCT + this.offsetIncrementCT
                this.drawing[vertexID] = currentPoint
            })
        }

    }







}


