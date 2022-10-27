import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {VisualizationComponent} from "../visualization/visualization.component";
import {Properties} from "../../framework/util/Properties";
import { faSearch,faAngleDown,faAngleUp,faTimes } from '@fortawesome/free-solid-svg-icons';
import * as vega from "vega";
import {MatSelectionList} from "@angular/material/list";
import {Point2D} from "../../framework/model/Point2D";
import {Rectangle} from "../../framework/model/Rectangle";
import {GraphController} from "../../framework/controller/GraphController";

interface SearchObject {
  id: String,
  name: String,
  groupName: String,
  color: String,
  induce: boolean,
  selected: boolean
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  searchOpen: boolean

  asSelected: boolean
  ctSelected: boolean
  bmSelected: boolean

  faSearch = faSearch
  faAngleDown = faAngleDown
  faAngleUp = faAngleUp
  faTimes = faTimes

  searchSet: SearchObject[]
  asSet : SearchObject[]
  ctSet : SearchObject[]
  bmSet : SearchObject[]

  searchValue: String

  @ViewChild('searchModal') searchModal: ElementRef
  @ViewChild('selectionList') selectionList: MatSelectionList
  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event): void {
    if( this.searchModal !=null) {
      if (!this.searchModal.nativeElement.contains(event.target)) {
        this.leaveSearchComponent()
      }
    }
  }

  constructor(public visC: VisualizationComponent) {
    this.searchOpen = false
    this.searchSet = []
    this.asSelected = false
    this.ctSelected = false
    this.bmSelected = false
    this.searchValue = ''
  }


  leaveSearchComponent(){
    this.searchOpen = false
    this.searchSet = []
    this.asSelected = false
    this.ctSelected = false
    this.bmSelected = false
    this.searchValue = ''
  }

  createRectangles( idArr : number[],view): Rectangle[]{
    let result = []
    idArr.forEach(id=>{
      let object = this.findObjectByID(id,view)
      if( object == null) return null
      let xscale = view.scale('xscale')
      let yscale = view.scale('yscale')
      let vertexSizeScale = view.scale('vertexSizeScale')
      let point = new Point2D(xscale(object.x),yscale(object.y))
      let vertexSize = vertexSizeScale(object.vertexSize)
      let r= Math.sqrt(vertexSize)
      let factor = 2.5
      let rectangle: Rectangle
        if( this.visC.selectedRotation == '0 Degree' || this.visC.selectedRotation == '180 Degree'){
          rectangle = new Rectangle(point.x-1.5*r,point.y-1.6*r,3*r,2.1*r)
        }
        else{
          rectangle = new Rectangle(point.x-1.6*r,point.y-1.5*r,2.1*r,3*r)
        }
      result.push({
        "x": rectangle.positionX,
        "y": rectangle.positionY,
        "w": rectangle.width,
        "h": rectangle.height})
    })
    return result
  }


  induce(){
    let selectedID = []
    this.selectionList.selectedOptions.selected.forEach(id=>{
      selectedID.push(id.value)
    })
    if(selectedID.length > 0) {
      let lastSelection = selectedID[selectedID.length - 1]
      this.visC.controller.updateMode('Exploration')
      this.visC.controller.currentMode.root = lastSelection
      this.visC.controller.currentMode.lastClick = lastSelection
      this.visC.controller.currentMode.originalGraph = this.visC.controller.graphs[this.visC.controller.currentOrgan]
      this.visC.controller.currentMode.firstTime = false
      this.visC.modes.forEach(m=>{
        if( m.sel) m.sel = false
      })
      this.visC.modes[2].sel = true
      this.selectionList.deselectAll()
      this.visC.controller.currentMode.renderRestoreGraphContext()
    }
  }

  scrollToPosition(id,view){

    let object = this.findObjectByID(id,view)
    if( object != null){
      let xscale = view.scale('xscale')
      let yscale = view.scale('yscale')
      let position = new Point2D(xscale(object.x),yscale(object.y))
      let properties: Properties = this.visC.controller.properties
      let heightDrawingDiv = properties.heightDrawingDIV

      let newY: number
      if( position.y - heightDrawingDiv/2 > 0) newY = position.y - heightDrawingDiv/2
      else newY = position.y
      let newX: number
      if( position.x - properties.totalWidth/2 > 0) newX = position.x - properties.totalWidth/2
      else newX = position.x
      document.getElementById('drawing').scrollTop = newY
      document.getElementById('drawing').scrollLeft = newX
    }
  }

  findObjectByID(currentID, view: vega.View){
    let data = view.data('vertices').slice(0)
    let result = null
    if( data != null){
      data.forEach( entry =>{
        if( entry.id == currentID){
          result = entry
        }
      })}
    return result
  }

  addRectangles( rects ,view: vega.View): Promise<vega.View>{
    if( rects !=null) {
      let changeSet = vega.changeset()
      rects.forEach(obj => {
        changeSet = changeSet.insert(obj)
      })
      view.change('rects', changeSet)
      return view.runAsync()
    }
    else return Promise.reject()
  }

  selectSearchItem(event){
      let controller: GraphController = this.visC.controller
      controller.currentMode.renderRestoreGraphContext().then(()=>{
        let selectedID = []
        this.selectionList.selectedOptions.selected.forEach(id=>{
          selectedID.push(id.value)
        })
        if(selectedID.length > 0) {
          let view = controller.currentMode.currentView
          let lastSelection = selectedID[selectedID.length - 1]
          this.scrollToPosition(lastSelection, view)
          let rects = this.createRectangles(selectedID, view)
          this.addRectangles(rects, view)
        }
      })

  }

  clearSelection(){
    let controller: GraphController = this.visC.controller
    controller.currentMode.renderRestoreGraphContext().then(()=>this.selectionList.deselectAll())
  }

  filterSearchSet(){
    if( this.searchValue != '') {
      this.searchSet = this.asSet.concat(this.ctSet.concat(this.bmSet))
      let uppercase = this.processLabel(this.searchValue)
      this.searchSet = this.searchSet.filter((x) => x.name.includes(uppercase) && this.toggleFilter(x))
    }
    else{
      this.processToggle()
    }
  }

  clearSearchText(){
    this.searchValue = ''
    this.processToggle()
  }

  toggleFilter(object: SearchObject): boolean{
    if (!this.asSelected && !this.ctSelected && this.bmSelected) {
      return object.groupName == 'Biomarker'
    } else if (!this.asSelected && this.ctSelected && !this.bmSelected) {
      return object.groupName == 'Cell Type'
    } else if (!this.asSelected && this.ctSelected && this.bmSelected) {
      return object.groupName == 'Cell Type' || object.groupName== 'Biomarker'
    } else if (this.asSelected && !this.ctSelected && !this.bmSelected) {
      return object.groupName == 'Anatomical Structure'
    } else if (this.asSelected && !this.ctSelected && this.bmSelected) {
      return object.groupName == 'Anatomical Structure' || object.groupName== 'Biomarker'
    } else if (this.asSelected && this.ctSelected && !this.bmSelected) {
      return object.groupName == 'Anatomical Structure' || object.groupName== 'Cell Type'
    }
    else return true
  }

  processToggle(){
    if ((this.asSelected && this.bmSelected && this.ctSelected) || (!this.asSelected && !this.bmSelected && !this.ctSelected)) {
      this.searchSet = this.asSet.concat(this.ctSet.concat(this.bmSet))
    } else if (!this.asSelected && !this.ctSelected && this.bmSelected) {
      this.searchSet = this.bmSet
    } else if (!this.asSelected && this.ctSelected && !this.bmSelected) {
      this.searchSet = this.ctSet
    } else if (!this.asSelected && this.ctSelected && this.bmSelected) {
      this.searchSet = this.ctSet.concat(this.bmSet)
    } else if (this.asSelected && !this.ctSelected && !this.bmSelected) {
      this.searchSet = this.asSet
    } else if (this.asSelected && !this.ctSelected && this.bmSelected) {
      this.searchSet = this.asSet.concat(this.bmSet)
    } else if (this.asSelected && this.ctSelected && !this.bmSelected) {
      this.searchSet = this.asSet.concat(this.ctSet)
    }
  }

  toggleSearchSetUpdate(){
    if( this.searchValue == "") {
      this.processToggle()
    }
    else{
      this.filterSearchSet()
      if ((this.asSelected && this.bmSelected && this.ctSelected) || (!this.asSelected && !this.bmSelected && !this.ctSelected)) {

      } else if (!this.asSelected && !this.ctSelected && this.bmSelected) {
        this.searchSet = this.searchSet.filter((x)=>x.groupName == 'Biomarker')
      } else if (!this.asSelected && this.ctSelected && !this.bmSelected) {
        this.searchSet = this.searchSet.filter((x)=>x.groupName == 'Cell Type')
      } else if (!this.asSelected && this.ctSelected && this.bmSelected) {
        this.searchSet = this.searchSet.filter((x)=>x.groupName == 'Biomarker' || x.groupName == 'Cell Type')
      } else if (this.asSelected && !this.ctSelected && !this.bmSelected) {
        this.searchSet = this.searchSet.filter((x)=>x.groupName == 'Anatomical Structure')
      } else if (this.asSelected && !this.ctSelected && this.bmSelected) {
        this.searchSet = this.searchSet.filter((x)=>x.groupName == 'Biomarker' || x.groupName == 'Anatomical Structure')
      } else if (this.asSelected && this.ctSelected && !this.bmSelected) {
        this.searchSet = this.searchSet.filter((x)=>x.groupName == 'Cell Type' || x.groupName == 'Anatomical Structure')
      }
    }
  }

  processLabel(label: String){
    let labelArr = label.split(' ')
    let newArr = []
    for(let i=0; i < labelArr.length; i++){
      if( labelArr[i] == "") continue
      newArr.push( labelArr[i][0].toUpperCase() + labelArr[i].substring(1));
    }
    return newArr.join(' ')
  }

  initializeSearchSet(){
    this.searchSet = []
    let view: vega.View = this.visC.controller.currentMode.currentView

    this.asSet = []
    this.ctSet = []
    this.bmSet = []
    view.data('vertices').forEach(object=>{

      let label : String
      if(typeof object.label === 'string') label = this.processLabel(object.label)
      else label = this.processLabel(object.label.join(''))
      if( label.length > 2){
      switch (object.vertexType){
        case "Anatomical Structure": {
                this.asSet.push({
                  id: object.id,
                  name: label,
                  groupName: 'Anatomical Structure',
                  color: '#E41A1C',
                  induce: true,
                  selected: false,
                })
                break
              }
              case "Cell Type": {
                this.ctSet.push({
                  id: object.id,
                  name: label,
                  groupName: 'Cell Type',
                  color: '#377EB8',
                  induce: true,
                  selected: false
                })
                break
              }
              default: {
               this.bmSet.push({
                  id: object.id,
                  name: label,
                  groupName: 'Biomarker',
                  color:  '#4DAF4A',
                  induce: false,
                  selected: false
                })
                break
              }
            }
      }})
    this.searchSet = this.asSet.concat(this.ctSet.concat(this.bmSet))
  }

  openSearchList(){
    this.initializeSearchSet()
    this.searchOpen = true
  }

  ngOnInit(): void {
  }

}
