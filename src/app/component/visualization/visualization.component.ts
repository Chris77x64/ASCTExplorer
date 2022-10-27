import {
  AfterContentInit,
  Component,
  Directive, ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {Type} from "../../framework/util/Properties";


@Component({
  selector: 'app-visualization',
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.css']
})
export class VisualizationComponent implements OnInit {

  sideNAVHidden: boolean

  modes: any[]
  appearance: any[]

  selectedContainer: string
  startContainer: string
  containerStrings: string[]

  selectedRotation: string

  containmentSelect: boolean

  sideNavContainer1Expanded: boolean
  sideNavContainer2Expanded: boolean
  sideNavContainer3Expanded: boolean
  sideNavContainer4Expanded: boolean

  controller: any
  promiseFrameworkLoaded: Promise<boolean>
  promiseComponentLoaded: Promise<void>

  initialLoad: boolean

  constructor(private ngProgress: MatProgressSpinnerModule) {

    this.sideNAVHidden = false
    this.containmentSelect = false

    this.sideNavContainer1Expanded = true
    this.sideNavContainer2Expanded = true
    this.sideNavContainer3Expanded = true
    this.sideNavContainer4Expanded = true

    this.initialLoad = true

    this.modes = []
    this.appearance = []
    this.containerStrings = []


    this.selectedContainer = 'All Container'
    this.selectedRotation = "0 Degree"
    this.initializeModes()
    this.initializeAppearance()

  }



  updateContainer(){
    this.containerStrings =  this.controller.currentMode.calculateContainerStrings()
  }


  ngOnInit(): void {

  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if( this.controller != null) {
      this.controller.properties.initialize()
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    //event.stopPropagation()
    switch (event.key) {
      case "ArrowUp": {
        let val = document.getElementById('drawing').scrollHeight/12
        document.getElementById('drawing').scrollTop -= val
        break
      }
      case "ArrowDown": {
        let val = document.getElementById('drawing').scrollHeight/12
        document.getElementById('drawing').scrollTop += val
        break
      }
      case "ArrowLeft": {
        let val = document.getElementById('drawing').scrollWidth/12
        document.getElementById('drawing').scrollLeft -= val
        break
      }
      case "ArrowRight": {
        let val = document.getElementById('drawing').scrollWidth/12
        document.getElementById('drawing').scrollLeft += val
        break
      }
      default: {

      }
    }

  }

  ngAfterViewInit(): void {

      this.promiseFrameworkLoaded = import('../../framework/controller/GraphController').then((c) => {
        this.controller = new c.GraphController(this);
        this.controller.graphs[this.controller.currentOrgan].readyPromise.then(() => {
          this.updateContainer()
          this.initialLoad = false
          this.controller.render(true, [], [])
          }
        );
      }).then()
  }


  initializeAppearance(){
    this.appearance.push( {
      "id": "A1",
      "label": "Draw Labels",
      "sel": true
    })
    this.appearance.push( {
      "id": "A2",
      "label": "Show Tooltips",
      "sel": false
    })
    this.appearance.push( {
      "id": "A3",
      "label": "Dark Theme",
      "sel": false
    })
  }

  initializeModes(){
    this.modes.push( {
      "id": "M1",
      "label": "Complete Graph",
      "sel": true
    })
    this.modes.push( {
      "id": "M2",
      "label": "Partial Graph",
      "sel": false
    })
    this.modes.push( {
      "id": "M3",
      "label": "Exploration",
      "sel": false
    })
    this.modes.push( {
      "id": "M4",
      "label": "Unmodified Graph",
      "sel": false
    })
  }

}

