import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import { faGlobe, faPhone,faExpand,faRedo,faDownload,faServer,faCog,faSearch } from '@fortawesome/free-solid-svg-icons';
import {VisualizationComponent} from "../visualization/visualization.component";
import {Organ, Properties} from "../../framework/util/Properties";
import * as prop from '../../framework/util/Properties'
import {Point2D} from "../../framework/model/Point2D";
import * as vega from "vega";
import {Rectangle} from "../../framework/model/Rectangle";
import {GraphController} from "../../framework/controller/GraphController";

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']
})
export class TopNavComponent implements OnInit {

  checked: boolean
  lastID: string

  faGlobe = faGlobe;
  faExpand = faExpand
  faRedo = faRedo
  faDownload = faDownload
  faServer = faServer
  faCog = faCog
  faSearch = faSearch
  oldRects: any


  constructor(private visC: VisualizationComponent) {
    this.checked = false
    this.lastID = "-1"
    this.oldRects = []
  }

  ngOnInit(): void {
  }


  ngAfterViewInit() {
    let elem = document.getElementById("3l")
    if (elem != null) {
      elem.style.borderColor = "#262626"
      elem.style.backgroundColor = "white"
      elem.style.color = "#262626"
      this.lastID = "3l"
    }
  }



  organClicked(event: unknown){
    if( event != undefined){
      // @ts-ignore
      let id = event.target.id+"l"

      let elem = document.getElementById(id)
      if( elem !=null){
        elem.style.borderColor =  "#262626"
        elem.style.backgroundColor = "white"
        elem.style.color = "#262626"

        let prevElem = document.getElementById(this.lastID)
        if( prevElem !=null && this.lastID != id){
          prevElem.style.backgroundColor =  "#262626";
          prevElem.style.color = "white"
        }
      }
      this.lastID = id

      // @ts-ignore
      let organString = event.target.nextSibling.innerText

      this.visC.controller.updateOrgan(organString)
      this.visC.updateContainer()
      this.visC.controller.currentMode.reset()
      this.visC.controller.render()
    }
  }

  searchLogo = faSearch
  logo = "logo.svg"




  buttonHandlers = [
    ()=> {
      this.visC.controller.currentMode.renderRestoreGraphContext().then(()=>{
        this.visC.controller.currentMode.firstTime = true
        this.visC.controller.currentMode.fitContent(this.visC.controller.currentMode.currentView)
        document.getElementById('drawing').scrollLeft = 0
        document.getElementById('drawing').scrollTop = 0
      })
    },
    ()=>{
      this.visC.controller.currentMode.reset()
      this.visC.controller.render()
    },
    ()=>{
        this.visC.controller.currentMode.exportImage()
    },
    ()=> {
      window.open(
        "https://docs.google.com/spreadsheets/d/1tK916JyG5ZSXW_cXfsyZnzXfjyoN-8B2GXLbYD6_vF0/edit#gid=559906129", "_blank");
    },
    () => {
      this.hideSideNav()
    }
  ]

  createRectangles( idArr : number[],view): Rectangle[]{
    let result = []
    idArr.forEach(id=>{
      let object = this.findObjectByID(id,view)
      let xscale = view.scale('xscale')
      let yscale = view.scale('yscale')
      let vertexSizeScale = view.scale('vertexSizeScale')
      let point = new Point2D(xscale(object.x),yscale(object.y))
      let vertexSize = vertexSizeScale(object.vertexSize)
      let r= Math.sqrt(vertexSize)
      let factor = 2.5
      let rectangle = new Rectangle(point.x-(factor/2)*r,point.y-(factor/1.5)*r,factor*r,factor*r)
      result.push({
        "x": rectangle.positionX,
        "y": rectangle.positionY,
        "w": rectangle.width,
        "h": rectangle.height})
    })
    return result
  }


  clearRectangles(view: vega.View): Promise<vega.View>{
    let changeSet = vega.changeset()
    let data = view.data('rects').slice(0)
    if( data != null){
      data.forEach( entry =>{
        changeSet = changeSet.remove([entry])
      })
      view.change('rects', changeSet)
      return view.runAsync().then()
    }
      return Promise.resolve(view)
  }

  addRectangles( rects ,view: vega.View): Promise<vega.View>{
    let changeSet = vega.changeset()
    rects.forEach(obj=> {
      changeSet = changeSet.insert(obj)
    })
    view.change('rects', changeSet)
    return view.runAsync()
  }

  scrollToPosition(id,view){

    let object = this.findObjectByID(id,view)
    let xscale = view.scale('xscale')
    let yscale = view.scale('yscale')
    let position = new Point2D(xscale(object.x),yscale(object.y))
    let h = document.getElementById('drawing').scrollHeight
    let properties: Properties = this.visC.controller.properties
    let heightDrawingDiv = properties.heightDrawingDIV

    //if( this.visC.selectedRotation == "0 Degree" || this.visC.selectedRotation == "0 Degree"){
      let newY: number
      if( position.y - heightDrawingDiv/2 > 0) newY = position.y - heightDrawingDiv/2
      else newY = position.y
      document.getElementById('drawing').scrollTop = newY
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

  hideSideNav(){
    this.visC.sideNAVHidden = !this.visC.sideNAVHidden
    setTimeout(() => {
      this.visC.promiseFrameworkLoaded.then(()=>{
        this.visC.controller.properties.initialize()
          //prop.refresh(document.getElementById('drawing').offsetWidth,document.getElementById('drawing').offsetHeight )
        let drawing = document.getElementById('drawing')
        let rotation = this.visC.controller.selectedRotation
        this.visC.controller.renderRestore()
        // if( (rotation == '0 Degree' || rotation =='180 Degree'))  {
        //   drawing.style.overflowY = 'scroll'
        //   drawing.style.overflowX = 'hidden'
        // }
        // else{
        //   drawing.style.overflowY = 'hidden'
        //   drawing.style.overflowX = 'scroll'
        // }


      })
    })
  }

  buttonTooltips= [
      "Fit the content of the entire drawing on the screen",
      "Reset view and graph content",
      "Export drawing as scalable vector graphic",
      "Visit the tables which provide the graph data",
      "Toggle the settings navbar"
  ]


  buttonStrings = [
    "Fit Content",
    "Reset",
    "Export",
    "Data Tables",
    "Settings"
  ]

  buttonIcons= [
    faExpand,
    faRedo,
    faDownload,
    faServer,
    faCog
  ]

  organStrings = [
    "Bone Marrow",
    "Brain",
    "Heart",
    "Kidney",
    "Large Intestine",
    "Lung",
    "Lymph Nodes",
    "Skin",
    "Spleen",
    "Thymus",
    "Vasculature"

  ]
}
