import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { UserService } from 'ngx-login-client';

import { StaticNamespaceScope } from './static-namespace.scope';

// TODO HACK These should all be exported by the modules
import { DevNamespaceScope } from 'fabric8-runtime-console/src/app/kubernetes/service/devnamespace.scope';

/**
 * A NamespaceScope which always returns a particular namespace
 */
@Injectable()
export class ToolsNamespaceScope extends StaticNamespaceScope {

  constructor(activatedRoute: ActivatedRoute, router: Router, userService: UserService) {
    super(
      activatedRoute,
      router,
      userService
        .loggedInUser
        .map(user => `${user.attributes.username}-dsaas-jenkins`)
    );
  }
}

export let toolsNamespaceScopeProvider = {
  provide: DevNamespaceScope,
  useClass: ToolsNamespaceScope
};
