import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from '@angular/material/select';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule, Routes } from '@angular/router';
import { RoomComponent } from './room/room.component';
import { WelcomeComponent } from './welcome/welcome.component'
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

const routes: Routes = [
  { path: 'room/:roomId', component: RoomComponent },
  { path: '', component: WelcomeComponent },
];
@NgModule({
  declarations: [
    AppComponent,
    RoomComponent,
    WelcomeComponent
  ],
  imports: [
    BrowserModule, RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    MatButtonModule,
    MatInputModule, MatIconModule, FormsModule, MatOptionModule, MatSelectModule, AppRoutingModule,
    ReactiveFormsModule, MatProgressSpinnerModule


  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
