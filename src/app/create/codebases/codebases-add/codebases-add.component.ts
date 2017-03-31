import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';

import { Codebase } from '../services/codebase';
import { CodebasesService } from '../services/codebases.service';
import { Context, Contexts } from 'ngx-fabric8-wit';
import { GitHubService } from '../services/github.service';
import { Notification, NotificationType, Notifications } from 'ngx-base';
import {GitHubRepoDetails} from "../services/github";

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'codebases-add',
  templateUrl: './codebases-add.component.html',
  styleUrls: ['./codebases-add.component.scss'],
  providers: [CodebasesService, GitHubService]
})
export class CodebasesAddComponent implements OnInit {
  @Input() codebases: Codebase[];
  @Output('onAdd') onAdd = new EventEmitter();

  context: Context;
  gitHubRepoDetails: GitHubRepoDetails;
  gitHubRepoFullName: string;
  gitHubRepoFullNameInvalid: boolean = false;
  gitHubRepoFullNameDuplicated: boolean = false;
  panelState: string = "out";

  constructor(
      private codebasesService: CodebasesService,
      private contexts: Contexts,
      private gitHubService: GitHubService,
      private notifications: Notifications) {
    this.contexts.current.subscribe(val => this.context = val);
  }

  ngOnInit() {
  }

  // Actions

  /**
   * Associate codebase with current space
   *
   * @param $event MouseEvent for onclick
   */
  addCodebase($event: MouseEvent): void {
    let codebase = this.createTransientCodebase();

    // Avoid duplicate codebases
    if (this.codebases !== undefined) {
      for (let i = 0; i < this.codebases.length; i++) {
        if (this.codebases[i].attributes.url === codebase.attributes.url) {
          this.gitHubRepoFullNameDuplicated = true;
          return;
        }
      }
    }

    // Add codebase to space
    this.codebasesService.addCodebase(this.context.space.id, codebase).subscribe(codebase => {
      if (codebase != null) {
        this.onAdd.emit(codebase);

        this.notifications.message({
          message: `Codebase "${this.gitHubRepoFullName}" added!`,
          type: NotificationType.SUCCESS
        } as Notification);
      }
      this.togglePanelState("out");
    }, error => {
      this.gitHubRepoFullNameInvalid = true;
      this.handleError("Failed to associate codebase with space", NotificationType.DANGER);
    });
  }

  /**
   * Fetch GitHub details based on repo full name
   *
   * @param $event MouseEvent for onclick
   */
  fetchCodebase($event: MouseEvent): void {
    this.gitHubRepoFullNameInvalid = this.isGitHubRepoFullNameInvalid();
    if (this.gitHubRepoFullNameInvalid) {
      return;
    }
    this.gitHubService.getRepoDetailsByFullName(this.gitHubRepoFullName).subscribe(gitHubRepoDetails => {
      this.gitHubRepoDetails = gitHubRepoDetails;
    }, error => {
      this.gitHubRepoFullNameInvalid = true;
    });
  }

  /**
   * Toggle slider panel open and close
   *
   * @param $event MouseEvent for onclick
   */
  togglePanel($event: MouseEvent): void {
    if (this.panelState === "in") {
      this.panelState = "out";
    } else {
      this.panelState = "in";
    }
  }

  /**
   * Toggle slider panel state based on component state change
   *
   * @param $event Panel state: "in" or "out"
   */
  togglePanelState($event: string): void {
    this.panelState = $event;
    this.resetAll();
  }

  // Private

  /**
   * Create transient codebase with GitHub repo URL
   *
   * @returns {Codebase}
   */
  private createTransientCodebase(): Codebase {
    return {
      attributes: {
        type: 'git',
        url: "https://github.com/" + this.gitHubRepoFullName + ".git"
      },
      type: 'codebases'
    } as Codebase;
  }

  /**
   * Validate GitHub repo full name (e.g., almighty/almighty-core)
   *
   * @returns {boolean}
   */
  private isGitHubRepoFullNameInvalid(): boolean {
    return (this.gitHubRepoFullName === undefined
        || this.gitHubRepoFullName.trim().length === 0
        || this.gitHubRepoFullName.split("/").length !== 2
        || this.gitHubRepoFullName.indexOf(":") !== -1
        || this.gitHubRepoFullName.indexOf("git@github.com") !== -1
        || this.gitHubRepoFullName.indexOf("https://github.com") !== -1
        || this.gitHubRepoFullName.indexOf(".git") !== -1);
  }

  /**
   * Helper to reset slider panel
   */
  resetAll():void {
    this.gitHubRepoFullName = undefined;
    this.resetFetch();
  }

  /**
   * Helper to reset invalid properties
   */
  resetFetch():void {
    this.gitHubRepoDetails = undefined;
    this.gitHubRepoFullNameInvalid = false;
    this.gitHubRepoFullNameDuplicated = false;
  }

  private handleError(error: string, type: NotificationType) {
    this.notifications.message({
      message: error,
      type: type
    } as Notification);
  }
}
