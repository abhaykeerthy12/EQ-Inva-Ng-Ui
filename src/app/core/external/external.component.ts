import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-external',
  templateUrl: './external.component.html',
  styleUrls: ['./external.component.scss']
})
export class ExternalComponent implements OnInit {

  year = new Date().getFullYear();
  
  constructor() { }

  ngOnInit() {
  }

}
