import {Graph} from "../model/Graph";
import {InducedSubgraph} from "../model/InducedSubgraph";

export class Properties {


  withDrawingDIV: number
  heightDrawingDIV: number
  totalWidth: number

  vertexSize : number
  rootExplorationVertexSize : number
  maxContainmentCollapsedVertexSize : number

  vertexLabelSize : number

  offsetIncrementTwoLines : number
  offsetIncrementOneLine : number

  oneLineLabelOffset : number
  twoLineLabelOffset : number
  collapsedCTLabelOffset : number
  rootExplorationTwoLineLabelOffset : number
  rootExplorationOneLineLabelOffset : number

  heightTopPadding : number
  widthRightPadding : number

  constructor( ) {
      this.initialize()
  }


  initialize(){
    this.withDrawingDIV = document.getElementById('drawing').offsetWidth
    this.heightDrawingDIV = document.getElementById('drawing').offsetHeight
    this.totalWidth = this.withDrawingDIV - this.withDrawingDIV*0.05

    /*
    Vertex Size
     */
    this.vertexSize = Math.sqrt((window.screen.height*window.screen.height)+(window.screen.width*window.screen.width))/2
    this.rootExplorationVertexSize = 1.5* this.vertexSize
    this.maxContainmentCollapsedVertexSize = 2*this.vertexSize

    /*
    Vertex Label Size
     */
    this.vertexLabelSize = 14

    /*
    Offset Increments
     */
    this.offsetIncrementTwoLines = 2*Math.sqrt(this.vertexSize)//2.25 * Math.sqrt(this.vertexSize)
    this.offsetIncrementOneLine = 2* Math.sqrt(this.vertexSize) //1.75 * Math.sqrt(this.vertexSize)

    /*
    Label Offset
     */
    this.oneLineLabelOffset = -Math.sqrt(this.vertexSize)
    this.twoLineLabelOffset = - Math.sqrt(this.vertexSize) - this.vertexLabelSize
    this.collapsedCTLabelOffset = -this.vertexLabelSize/2 //Math.sqrt(this.vertexSize) / 5.5
    this.rootExplorationTwoLineLabelOffset =  -Math.sqrt(this.rootExplorationVertexSize) - this.vertexLabelSize
    this.rootExplorationOneLineLabelOffset = -Math.sqrt(this.rootExplorationVertexSize)

    // this.oneLineLabelOffset = 2* - 0.3 * Math.sqrt(this.vertexSize)
    // this.twoLineLabelOffset = 4* - 0.3 * Math.sqrt(this.vertexSize)
    // this.collapsedCTLabelOffset = Math.sqrt(this.vertexSize) / 5.5
    // this.rootExplorationTwoLineLabelOffset =  1.25* this.twoLineLabelOffset
    // this.rootExplorationOneLineLabelOffset = 1.25 * this.oneLineLabelOffset

    /*
    Padding
     */
    this.heightTopPadding = this.offsetIncrementTwoLines
    this.widthRightPadding = this.withDrawingDIV*0.05
  }
}

export function isOnline() {
      return false
}


export enum Organ {
    BoneMarrow,
    Brain,
    Heart,
    Kidney,
    LargeIntestine,
    Lung,
    LymphNodes,
    Skin,
    Spleen,
    Thymus,
    Vasculature,
    All,
    HeartWithCTTypology
}


export const rotateStrings = [
    "0 Degree",
    "90 Degree",
    "180 Degree",
    "270 Degree"
]



export function stringToOrgan(organ:String){
    switch (organ) {
        case "Bone Marrow":
            return Organ.BoneMarrow
        case "Brain":
            return Organ.Brain
        case "Heart":
            return Organ.Heart
        case "HeartWithCTTypology":
            return Organ.HeartWithCTTypology
        case "Kidney":
            return Organ.Kidney
        case "Large Intestine":
            return Organ.LargeIntestine
        case "Lung":
            return Organ.Lung
        case "Lymph Nodes":
            return Organ.LymphNodes
        case "Skin":
            return Organ.Skin
        case "Spleen":
            return Organ.Spleen
        case "Thymus":
            return Organ.Thymus
        case "Vasculature":
            return Organ.Vasculature
        case "All":
            return Organ.All
      default:{
          return null
      }
    }
}

export async function getAdditionalVertexData(id: number,graph: Graph | InducedSubgraph) {
    if (id in graph.IDtoOntologyID  ) {
        let url = 'https://asctb-api.herokuapp.com/lookup/'
        switch (graph.IDtoOntologyType[id]) {
            case OntologyType.UBERON: {
                url += 'UBERON/' + graph.IDtoOntologyID[id]
                break
            }
            case OntologyType.FMAID: {
                url += 'FMA/' + graph.IDtoOntologyID[id]
                break
            }
            case OntologyType.HGNC: {
                url += 'HGNC/' + graph.IDtoOntologyID[id]
                break
            }
            case OntologyType.CL: {
                url += 'CL/' + graph.IDtoOntologyID[id]
                break
            }
        }
        const response = await fetch(url)
        return await response.json()
    }
    else{
        return Promise.reject()
    }

}





export enum Type {
    AS,
    CT,
    BM
}

export enum OntologyType{
    UBERON,
    FMAID,
    HGNC,
    CL
}


export function containmentURL(organ: Organ){
    const baseUrl = 'https://asctb-api.herokuapp.com/v2/csv?output=graph&csvUrl=';
    const uberonCT = baseUrl + 'https://hubmap-link-api.herokuapp.com/asctb/';
    switch (organ) {
        case Organ.BoneMarrow:
            return uberonCT + 'UBERON:0002371';
        case Organ.Brain:
            return uberonCT + 'UBERON:0000955';
        case Organ.Heart:
            return uberonCT + 'UBERON:0000948';
        case Organ.Kidney:
            return uberonCT + 'UBERON:0002113';
        case Organ.HeartWithCTTypology:
            return uberonCT + 'UBERON:0000948'; // this is the uberon term for Heart
        case Organ.LargeIntestine:
            return uberonCT + 'UBERON:0000059';
        case Organ.Lung:
            return uberonCT + 'UBERON:0001004';
        case Organ.LymphNodes:
            return uberonCT + 'UBERON:0000029';
        case Organ.Skin:
            return uberonCT + 'UBERON:0002097';
        case Organ.Spleen:
            return uberonCT + 'UBERON:0002106';
        case Organ.Thymus:
            return uberonCT + 'UBERON:0002370';
        case Organ.Vasculature:
            return uberonCT + 'UBERON:0000948';
        case Organ.All:
            return undefined;
        default:
            return undefined;
    }
}


export function offlineURL(organ: Organ){
  switch (organ) {
    case Organ.BoneMarrow:
      return "assets/csv/graphBoneMarrow.json"
    case Organ.Brain:
      return "assets/csv/graphBrain.json"
    case Organ.Heart:
      return "assets/csv/graphHeart.json"
    case Organ.HeartWithCTTypology:
      return "assets/csv/graphHeartjson"
    case Organ.Kidney:
      return "assets/csv/graphKidney.json"
    case Organ.LargeIntestine:
      return "assets/csv/graphLargeIntestine.json"
    case Organ.Lung:
      return "assets/csv/graphLung.json"
    case Organ.LymphNodes:
      return "assets/csv/graphLymphNodes.json"
    case Organ.Skin:
      return "assets/csv/graphSkin.json"
    case Organ.Spleen:
      return "assets/csv/graphSpleen.json"
    case Organ.Thymus:
      return "assets/csv/graphThymus.json"
    case Organ.Vasculature:
      return "assets/csv/graphVasculature.json"
    case Organ.All:
      return undefined;
    default:
      return undefined;
  }
}

export function graphURL(organ: Organ): string | undefined {
  const baseUrl = 'https://asctb-api.herokuapp.com/v2/csv?output=graph&csvUrl=';
  const uberonCT = baseUrl + 'https://hubmap-link-api.herokuapp.com/asctb/';
  const asctRelease = baseUrl + 'https://hubmapconsortium.github.io/ccf-releases/v1.0/asct-b/ASCT-B_';
  const asctDraft = 'https://asctb-api.herokuapp.com/v2/1tK916JyG5ZSXW_cXfsyZnzXfjyoN-8B2GXLbYD6_vF0/'
  switch (organ) {
    case Organ.BoneMarrow:
      // return asctRelease + 'VH_BM_Blood_Pelvis.csv';
      return asctDraft + '1845311048/graph';
    case Organ.Brain:
      // return asctRelease + 'Allen_Brain.csv'
      return asctDraft + '1379088218/graph';
    case Organ.Heart:
      return asctRelease + 'VH_Heart.csv';
    // return asctDraft + '2133445058/graph';
    case Organ.HeartWithCTTypology:
      return uberonCT + 'UBERON:0000948'; // this is the uberon term for Heart
    case Organ.Kidney:
      // return asctRelease + 'VH_Kidney.csv';
      return asctDraft + '2137043090/graph';
    case Organ.LargeIntestine:
      // return asctRelease + 'VH_Intestine_Large.csv';
      return asctDraft + '512613979/graph';
    case Organ.Lung:
      // return asctRelease + 'VH_Lung.csv';
      return asctDraft + '1824552484/graph';
    case Organ.LymphNodes:
      // return asctRelease + 'NIH_Lymph_Node.csv';
      return asctDraft + '1440276882/graph';
    case Organ.Skin:
      // return asctRelease + 'VH_Skin.csv';
      return asctDraft + '1158675184/graph';
    case Organ.Spleen:
      // return asctRelease + 'VH_Spleen.csv';
      return asctDraft + '984946629/graph';
    case Organ.Thymus:
      // return asctRelease + 'VH_Thymus.csv';
      return asctDraft + '1823527529/graph';
    case Organ.Vasculature:
      // return asctRelease + 'VH_Vasculature.csv';
      return asctDraft + '361657182/graph';
    case Organ.All:
      // TODO: An exercise for the reader ;-)
      return undefined;
    default:
      return undefined;
  }
}
