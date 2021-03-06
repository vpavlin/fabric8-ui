import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { Codebase } from './services/codebase';
import { CodebasesService } from './services/codebases.service';
import { ListViewConfig } from 'ngx-widgets';
import { Logger } from 'ngx-base';
import { Context, Contexts } from 'ngx-fabric8-wit';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'codebases',
  templateUrl: './codebases.component.html',
  styleUrls: ['./codebases.component.scss']})
export class CodebasesComponent implements OnInit {
  codebases: Codebase[];
  context: Context;
  listViewConfig: ListViewConfig;

  constructor(
      private codebasesService: CodebasesService,
      private contexts: Contexts,
      private logger: Logger,
      private router: Router) {
    this.contexts.current.subscribe(val => this.context = val);
  }

  ngOnInit() {
    // TODO Refresh codebase list on add
    if (this.context && this.context.space) {
      this.codebasesService.getCodebases(this.context.space.id).subscribe(codebases => {
        this.codebases = codebases;

        // Todo: Temporary associate codebase until empty state config is ready
        if (this.codebases === undefined || this.codebases.length == 0) {
          let codebase = this.createTransientCodebase();
          this.codebasesService.create(this.context.space.id, codebase).subscribe(codebase => {
            this.codebases = [codebase];
          });
        }
      });
    } else {
      this.logger.error("Failed to retrieve codebases");
    }

    this.listViewConfig = {
      dblClick: false,
      dragEnabled: false,
      //emptyStateConfig: this.emptyStateConfig,
      multiSelect: false,
      selectItems: false,
      //selectionMatchProp: 'name',
      showSelectBox: false,
      useExpandingRows: true
    } as ListViewConfig;
  }

  // Todo: Temporary associate codebase until empty state config is ready
  createTransientCodebase(): Codebase {
    return {
      attributes: {
        type: 'git',
        url: 'git@github.com:almighty/almighty-core.git'
      },
      type: 'codebases'
    } as Codebase;
  }

}
