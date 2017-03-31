import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http } from '@angular/http';
import { SlideOutPanelModule } from 'ngx-widgets';

import { CodebasesAddComponent } from './codebases-add.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpModule,
    SlideOutPanelModule
  ],
  declarations: [ CodebasesAddComponent ],
  exports: [ CodebasesAddComponent ]
})
export class CodebasesAddModule {
  constructor(http: Http) {}
}
