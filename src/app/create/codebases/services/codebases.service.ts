import { Injectable, Inject } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { AuthenticationService, UserService } from 'ngx-login-client';
import { Logger } from 'ngx-base';
import { Observable } from 'rxjs';

import { WIT_API_URL } from 'ngx-fabric8-wit';
import { Codebase } from './codebase';

@Injectable()
export class CodebasesService {
  private headers = new Headers({ 'Content-Type': 'application/json' });
  private spacesUrl: string;
  private nextLink: string = null;

  constructor(
    private http: Http,
    private logger: Logger,
    private auth: AuthenticationService,
    private userService: UserService,
    @Inject(WIT_API_URL) apiUrl: string) {
    if (this.auth.getToken() != null) {
      this.headers.set('Authorization', 'Bearer ' + this.auth.getToken());
    }
    this.spacesUrl = apiUrl + 'spaces';
  }

  /**
   * Add a codbase to the given space
   *
   * @param spaceId The ID associated with the given space
   * @param codebase The codebase to add
   * @returns {Observable<Codebase>}
   */
  addCodebase(spaceId: string, codebase: Codebase): Observable<Codebase> {
    let url = `${this.spacesUrl}/${spaceId}/codebases`;
    let payload = JSON.stringify({ data: codebase });
    return this.http
      .post(url, payload, { headers: this.headers })
      .map(response => {
        return response.json().data as Codebase;
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  /**
   * Get the codebases associated with give space
   *
   * @param spaceId The ID associated with the given space
   * @returns {Observable<Codebase>}
   */
  getCodebases(spaceId: string): Observable<Codebase[]> {
    let url = `${this.spacesUrl}/${spaceId}/codebases`;
    return this.http.get(url, { headers: this.headers })
      .map((response) => {
        // Extract data from JSON API response, and assert to an array of repos.
        let Codebases: Codebase[] = response.json().data as Codebase[];
        return Codebases;
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  /**
   * Get paged codebases associated with give space
   *
   * @param spaceId The ID associated with the given space
   * @param pageSize The page limit to retrieve (default is 20)
   * @returns {Observable<Codebase[]>}
   */
  getPagedCodebases(spaceId: string, pageSize: number = 20): Observable<Codebase[]> {
    let url = `${this.spacesUrl}/${spaceId}/codebases` + '?page[limit]=' + pageSize;
    return this.getPagedCodebasesDelegate(url);
  }

  /**
   * Get next paged codebases associated with give space
   *
   * @returns {Observable<Codebase[]>}
   */
  getNextPagedCodebases(): Observable<Codebase[]> {
    if (this.nextLink) {
      return this.getPagedCodebasesDelegate(this.nextLink);
    } else {
      return Observable.throw('No more codebases found');
    }
  }

  // Private

  /**
   * Get the codebases associated with the given space
   *
   * @param url The URL used to retrieve paged codebases
   * @returns {Observable<Codebase[]>}
   */
  private getPagedCodebasesDelegate(url: string): Observable<Codebase[]> {
    return this.http
      .get(url, { headers: this.headers })
      .map(response => {
        // Extract links from JSON API response.
        // and set the nextLink, if server indicates more resources
        // in paginated collection through a 'next' link.
        let links = response.json().links;
        if (links.hasOwnProperty('next')) {
          this.nextLink = links.next;
        } else {
          this.nextLink = null;
        }
        // Extract data from JSON API response, and assert to an array of codebases.
        let newCodebases: Codebase[] = response.json().data as Codebase[];
        return newCodebases;
      })
      .catch((error) => {
        return this.handleError(error);
      });
  }

  private handleError(error: any) {
    this.logger.error(error);
    return Observable.throw(error.message || error);
  }
}
