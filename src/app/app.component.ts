import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent implements OnInit{

  visEnabled: boolean

  constructor( ) {
    this.visEnabled = false
  }

  ngOnInit(): void {
  }

}


