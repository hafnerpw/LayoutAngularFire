import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroupDirective, NgForm, Validators} from "@angular/forms";
import {ErrorStateMatcher} from "@angular/material/core";
import {Router} from "@angular/router";



export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  channelName: string;
  validControl= new FormControl('', [Validators.required, Validators.minLength(3)])
  matcher = new MyErrorStateMatcher();
  username: string;
  roomControl = new FormControl('', Validators.required);
  hide: boolean;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }


  go_next(){
    this.hide = true;
    setTimeout(() => {
        this.router.navigate(['room/'+this.channelName])
      }
      , Math.floor(Math.random() * (1500 - 200 + 1)) + 200);
  }
}
