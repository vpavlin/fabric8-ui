import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { Fabric8UIConfig } from './fabric8-ui-config';
import { ConfigStore } from './../../base/config.store';

@Injectable()
export class Fabric8UIConfigService {

  static readonly NAME = 'fabric8';

  private _config: Observable<Fabric8UIConfig>;

  constructor(
    configStore: ConfigStore
  ) {}



}
