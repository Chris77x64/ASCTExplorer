import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import {AppComponent} from './app.component';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { StartComponent } from './component/start/start.component';
import { TopNavComponent } from './component/top-nav/top-nav.component';
import { VisualizationComponent } from './component/visualization/visualization.component';
import { SideNavComponent } from './component/side-nav/side-nav.component';
import {MatExpansionModule} from '@angular/material/expansion'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatListModule} from '@angular/material/list'
import {MatSelectModule} from "@angular/material/select";
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { SearchComponent } from './component/search/search.component';
import {MatListOption} from "@angular/material/list";
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import {MatInputModule} from "@angular/material/input";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {FormsModule} from '@angular/forms'


@NgModule({
  declarations: [
    AppComponent,
    StartComponent,
    TopNavComponent,
    VisualizationComponent,
    SideNavComponent,
    SearchComponent
  ],

  imports: [
    BrowserModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatListModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    FontAwesomeModule,
    YouTubePlayerModule,
    BrowserAnimationsModule,
    MatIconModule,
    ReactiveFormsModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    MatButtonModule,
    FormsModule
],

  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
