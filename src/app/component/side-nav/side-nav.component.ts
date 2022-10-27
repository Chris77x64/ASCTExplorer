import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {MatListOption} from "@angular/material/list";
import {VisualizationComponent} from "../visualization/visualization.component";
import {MatSelect} from "@angular/material/select";
import {MatFormField} from "@angular/material/form-field";

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit {

  @ViewChild("containmentForm") containmentForm: MatSelect
  @ViewChild("rotationForm") rotationForm: MatSelect


  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event): void {
      //this.containmentForm.close()
      //this.rotationForm.close()
  }

  color = 'accent';
  legends: any[]

  constructor( public vc : VisualizationComponent) {
    this.legends = []
    this.initializeLegend()
  }

  appearanceTooltip = [
    "Enable/Disable the rendering of vertex label. The view context will be preserved",
    "Enable/Disable Tooltips for vertices. One can hover over a vertex and " +
    "a textual description, the corresponding website and ontologyID will be displayed.",
    "Enable/Disable the dark theme where the background is black and edges/rectangles are white"
  ]

  modeTooltip = [
    "Draw the entires graph including anatomical structures, cell types and biomarkers",
    "Draw only anatomical structures and cell types in order to have a more compact representation of the respective organ. Click on a vertex in order to display all reachable biomarkers",
    "The exploration mode is a layered approach where one can see the next 3 layers of the respective root. Click on a vertex in order to select it as root. Navigate backwards by clicking on the parent vertex(black)",
    "This mode shows the unmodified data delivered by the ASCT+B API. No algorithmic improvement in terms of structure or layout is made"
  ]

  /*
  Mode Click Toplevel
   */
  disableSelectionChange(option: MatListOption) {
      option.selected = !option.selected
  }

  restore90270(){
    let drawing = document.getElementById('drawing')
    drawing.style.overflowY = 'hidden'
    drawing.style.overflowX = 'scroll'
    this.vc.controller.renderRestore()
  }

  restore0180(){
    let drawing = document.getElementById('drawing')
    drawing.style.overflowY = 'scroll'
    drawing.style.overflowX = 'hidden'
    this.vc.controller.renderRestore()
  }
  performModeChange(event){
    this.vc.modes.forEach(m=>{
      if( m.sel) m.sel = false
    })
    this.vc.modes[event].sel = true
  }

  /*
  Mode Click Lowlevel
   */
  modeSelect(event: number){
    if( this.vc.containmentSelect) {
      if (event == 2 || event == 3) {
        this.openModal()
      } else {
        this.performModeChange(event)
        this.vc.controller.updateMode("Containment")
        this.vc.controller.render()
      }
    }
    else{
        this.performModeChange(event)
      this.vc.controller.updateMode(this.vc.modes[event].label)
      this.vc.controller.render()
    }
  }


  debug(){
    console.log(this.vc.selectedContainer)
  }
  debug2(){
    this.vc.selectedContainer="All Container"
    return "All Container"
  }
  debug3(x){
    this.vc.selectedContainer=x
    return x
  }
/*
Containment Toplevel
 */
  disableSelectionChange2(option: MatListOption) {
    option.selected = !option.selected
  }

  /*
  Containment LOWLEVEL
   */

  containmentSelection(){
    console.log('CONTAINMENT SELECTED')
    if( this.vc.modes[2].sel || this.vc.modes[3].sel){
        this.openModal()
    }else{
      if( this.vc.containmentSelect) {
        this.vc.containmentSelect = false
        let res = null
          this.vc.controller.gui.modes.forEach(m => {
            if (m.sel) res = m.label
          })
          this.vc.controller.updateMode(res)
          this.vc.controller.currentMode.reset()
          this.vc.controller.render()
      }
      else {
        this.vc.containmentSelect = true
        this.vc.controller.updateMode("Containment")
        this.vc.controller.render()
      }
    }
  }






  openModal() {
    document.getElementById("backdrop").style.display = "block"
    document.getElementById("exampleModal").style.display = "block"
    document.getElementById("exampleModal").classList.add("show")

  }
  closeModal() {
    document.getElementById("backdrop").style.display = "none"
    document.getElementById("exampleModal").style.display = "none"
    document.getElementById("exampleModal").classList.remove("show")
  }






  handleContainerSelect(){
    console.log('CONTAINMENT SELECTED',this.vc.containmentSelect,this.vc.selectedContainer)
    if( this.vc.containmentSelect){
      this.vc.controller.currentMode.reset()
      this.vc.controller.render()
    }
  }


  appearanceSelect(event:number){
    this.vc.appearance[event].sel = !this.vc.appearance[event].sel
    this.vc.controller.renderRestore()
  }

  initializeLegend(){
    this.legends.push({
      name: 'Anatomical Structures',
      color: '#E41A1C'
    })
    this.legends.push({
      name: 'Cell Types',
      color: '#377EB8'
    });
    this.legends.push({
      name: 'Gene Biomarkers',
      color: '#4DAF4A'
    });
    this.legends.push({
      name: 'Protein Biomarkers',
      color: '#7fff00'
    });
  }

  ngOnInit(): void {
  }

}
