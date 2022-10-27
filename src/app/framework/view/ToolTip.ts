import * as tip from "vega-tooltip";
import {getAdditionalVertexData, OntologyType, Type} from "../util/Properties";
import {Item} from 'vega-typings/types';
import {GraphController} from "../controller/GraphController";

export class ToolTip {

    currentString: string
    lastID: number
    controller: GraphController

    constructor(controller) {
        this.currentString = ""
        this.lastID = null
        this.controller = controller
    }

    compute(event,item, currentGraph){
        let drawTooltips: boolean = this.controller.gui.appearance[1].sel
       if(drawTooltips){
            let handler = this.createTooltip()
            this.processEvent(event,item,handler,currentGraph)
       }
       else{
           this.removeCurrentTooltip()
       }
    }

    processOntologyStrings(vertexID,currentGraph){
        let ontologyID = 'Not Available '
        let ontologyType = 'Not Available'
        if( vertexID in currentGraph.IDtoOntologyID){
            ontologyID = currentGraph.IDtoOntologyID[vertexID]
            switch (currentGraph.IDtoOntologyType[vertexID]) {
                case OntologyType.UBERON:{
                    ontologyType = 'UBERON'
                    break
                }
                case OntologyType.CL:{
                    ontologyType = 'CL'
                    break
                }
                case OntologyType.HGNC:{
                    ontologyType = 'HGNC'
                    break
                }
                case OntologyType.FMAID:{
                    ontologyType = 'FMAID'
                    break
                }
            }
        }
        return [ontologyType,ontologyID]
    }

    processDescription(r){
        let processedString = r.description
        let resultDescription = " "
        let arr = processedString.split(' ')
        let cnt = 0
        let len = (r.link).length -4
        arr.forEach(s=>{
            if( cnt  > len){
                resultDescription += "<br>"
                cnt = 0
            }
            resultDescription += s+" "
            cnt = cnt+s.length
        })
        if( processedString.length != 0 ) return resultDescription
        else return 'Not Available '
    }

    processColor(currentGraph,vertexID){
        let color = ""
        switch (currentGraph.vertexType[vertexID]){
            case Type.AS:{
                color = "red"
                break
            }
            case Type.CT:{
                color = "deepskyblue"
                break
            }
            case Type.BM:{
                color = "greenyellow"
                break
            }
        }
        return "color:"+color
    }

    processEvent(event,item,handler,currentGraph){
        if( item != undefined) {
            let vertexID = item.datum.id
            if( vertexID != this.lastID) {
                getAdditionalVertexData(vertexID, currentGraph)
                    .then(r => {
                        if (r != undefined) {

                            let [ ontologyType,ontologyID] = this.processOntologyStrings(vertexID,currentGraph)
                            let resultDescription = this.processDescription(r)
                            let color = this.processColor(currentGraph,vertexID)

                            this.currentString =
                              "<div style='font-size: 2vh'> <u>Name:</u>  "+ currentGraph.vertexLabel[vertexID]+ "<br>"
                              +"Database:  " + ontologyType+ "<br>"
                              +"Ontology ID:  " + ontologyID+ "<br>"
                              + '<div style='+color+  '>' + r.link + "</div>"
                              + "<u>  Description: </u> <br>"
                              + resultDescription + "</div>"

                            handler.call(handler, event, {} as Item<any>, 'foo')
                        }
                    })
                    .catch(x => {
                        this.removeCurrentTooltip()
                    })
            }
            this.lastID = vertexID
        }
        else{
            this.removeCurrentTooltip()
        }
    }


    removeCurrentTooltip(){
        let el = document.getElementById('vg-tooltip-element');
        if( el != null) el.remove();
    }


    createTooltip(){
        let DEFAULT_OPTIONS =
            {
                offsetX: 30,
                offsetY: 10,
                id: 'vg-tooltip-element',
                styleId: 'vega-tooltip-style',
                theme: 'dark',
                disableDefaultStyle: false,
                sanitize: (value) => {
                    return this.currentString
                },
                formatTooltip: tip.formatValue
            };

        return new tip.Handler(DEFAULT_OPTIONS);
    }
}
