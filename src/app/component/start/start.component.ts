import {Component, OnInit, ViewChild} from '@angular/core';
import {AppComponent} from "../../app.component";
import {YouTubePlayer} from "@angular/youtube-player";
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css']
})
export class StartComponent implements OnInit {

  usercircle = "assets/user-circle.svg"


  player: YT.Player | undefined
  icon = faUserCircle
  currentText: number


  constructor(private appComponent: AppComponent) {
    this.appComponent = appComponent
    this.currentText = 0

  }

  ngOnInit(): void {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);

  }

  onReady(event: YT.PlayerEvent): void {
    let iframe = document.querySelector('iframe')
    if(iframe !=null){
      iframe.style.width = "100%"
      iframe.style.height = "100%"
      this.player = event.target
    }
  }

  ngAfterViewInit() {
    this.displayText(0)
    let x = document.getElementById("btn0")
    x.focus()
    scroll(0,0)
  }

  goToVis(){
    this.appComponent.visEnabled = true
  }


  navText = [
    "GitHub",
    "Master Tables",
    "HubMap Consortium"
  ]

  navURL = [
    "https://github.com/Chris77x64/ASCTVIS",
    "https://docs.google.com/spreadsheets/d/1tK916JyG5ZSXW_cXfsyZnzXfjyoN-8B2GXLbYD6_vF0/edit#gid=559906129",
    "https://hubmapconsortium.github.io/ccf/index.html"
  ]

  headerText = "The ASCT+B Explorer is a visualization tool for displaying anatomical structures, cell <br> types, and biomarker (ASCT+B) authored by domain\n" +
    "experts for different human organs. <br> The tables are used to develop a common coordinate framework (CCF) of the <br> healthy human body, represented as knowledge graph. See also\n" +
    "Hubmap Consortium website."

  aboutText = "The ASCT+B Explorer is a state-of-the-art visualization tool. This introduction gives an overview of the functionalities listed below.\n" +
    "Please use the selectors below to skip to any section you’d want to specifically know about."

  previewData=[
    "assets/subgraph1.svg",
    "assets/subgraph2.svg",
    "assets/partial.svg",
    "assets/containment.svg",
    "assets/explore.svg"
  ]

  videoTitle = [
    "Introduction",
    "Large Scale Graph Visualization",
    "Modes of Operation",
    "Partial View",
    "Containment",
    "Graph Exploration"]

  videoDescription = [
    "Know about the Explorer, what it is and why was it built",
    "Learn how to analyze large quantities of biological data",
    "Different modes of operation with user interactivity",
    "Hiding bio-markers allows a more compact representation",
    "Visualization based on a hierarchical ordering of cell types",
    "Explore all graph structures using a layered approach"
  ]

  videoImages= [
    "assets/introFirst.svg",
    "assets/introCompleteGraph.svg",
    "assets/introModes.svg",
    "assets/introPartial.svg",
    "assets/introContainment.svg",
    "assets/introExplore.svg"
  ]

  videoText=[
    "The human reference atlas is an ongoing effort to analyze the estimated 37 trillion cells of the human body. It is a significant challenge to combine and link the vast amounts of data from more than 2000 scientists. In March 2020, the National Institute of Health (NIH) invited leading domain experts to encode the relevant knowledge in a unified and coherent way. The format agreed upon is called the ASCT+B format and can encode all entities and relationships of an organ. The ASCT+B Explorer can derive and visualize a graph representation for 11 different organs using their associated ASCT+B tables.",

    "A coloring scheme is used in all drawings to distinguish between the three different entities. Anatomical structures will be visualized using red color, cell types will be visualized using blue color, and the color green is used for biomarkers. Crossing minimization, vertex splitting, and tree augmentation techniques are used to derive a visualization where it is possible to emphasize relationships between entities. The zoom feature allows viewing every graph structure in brief detail and can be used with the mouse wheel. It is also possible to rotate the drawing in order to have a different point of view.",

    "However, we do not only want to construct static drawings but to give the user the possibility to analyze and explore the graph interactively. For this reason, we will introduce four different modes of operation. The entire graph will be drawn in the complete graph mode. Partial views, where parts of the graph are hidden, allow for a more compact representation. The user can click on any vertex and display all reachable vertices. The containment mode allows expanding and collapsing operations on the container where cell type vertices are arranged. The exploration mode allows doing an interactive graph search. There exists a search feature to search a specific vertex. Furthermore, the search menu can highlight the selected vertex with an oval circle around it, and it is possible to switch to the exploration mode with the selected vertex as the root.",

    "The partial-view mode hides all biomarker vertices. This decreases complexity and allows the user to explore the relationships between anatomical structures and cell types. Whenever a mouse click selects a vertex, all reachable biomarker vertices will be displayed, and the associated subgraph is highlighted. ",


    "Data classification into a finite set of categories is a classical task in data science. In the case of biological data and cell types, similarity in function or local proximity of cell types is a reason for categorizing one more cell type vertices in a container. Furthermore, a container may include another container to support a hierarchy that can be expressed as a tree. Every container is visualized by black rectangles and can collapse with a mouse click. A black vertex represents a collapsed container, and a mouse click will expand the container. Hiding non-important information is a vital ingredient when working on large-scale data sets. Since this is a cell type specific point of view, we only want to display vertices that are related to expanded cell type vertices. The ASCT+B Explorer supports two views of containment: The first (Complete Graph + Containment) displays the entire graph. The black vertices representing collapsed containers will have a label that indicates the number of the hidden biomarker. The second containment view (Partial Graph + Containment) hides all biomarkers and tries to emphasize the connections between the anatomical tree. The black vertices will have a label that indicates how many disjoint anatomical structure vertices are involved in the respective container, which measures how vital the container might be.   ",

    "A layered graph exploration is beneficial when dealing with large datasets. This allows for reducing the amount of data that will be displayed. The user can explore the graph representation of an organ starting from the red anatomical tree. A simple mouse click on any vertex allows displaying all reachable vertices in the following two layers. In order to go backward, one can always click at the root of the tree, which is drawn in black. "
    ]

  displayText(i: number){
    document.getElementById('Imag'+this.currentText).style.visibility = 'hidden'
    document.getElementById('Imag'+i).style.visibility = 'visible'
    document.getElementById('Imag'+this.currentText).style.display = 'none'
    document.getElementById('Imag'+i).style.display = 'flex'
    this.currentText = i
  }

  playVideoTo(value: number){
    if( this.player != undefined){
      this.player.seekTo(value,true)
    }
  }
  videoTimeStamps = [
    50,
    100,
    150,
    200,
    250,
    300
  ]

  creditsName=[
    "Christoph Hekeler",
    "Prof. Dr. Michael Kaufmann",
    "Prof. Dr. Katy Boener",
    "Prof. Dr. Alexander Wolff",
    "Bruce W Herr II"
  ]

  creditsEmail=[
    "chris.hekeler @ gmx.de",
    "mk @ informatik.uni-tuebingen.de",
    "katy @ indiana.edu",
    "alexander.wolff @ uni-wuerzburg.de",
    "bherr @ indiana.edu",
  ]

  openImprint() {
    document.getElementById("backdrop2").style.display = "block"
    document.getElementById("exampleModal2").style.display = "block"
    document.getElementById("exampleModal2").classList.add("show")

  }
  closeImprint() {
    document.getElementById("backdrop2").style.display = "none"
    document.getElementById("exampleModal2").style.display = "none"
    document.getElementById("exampleModal2").classList.remove("show")
  }

}
