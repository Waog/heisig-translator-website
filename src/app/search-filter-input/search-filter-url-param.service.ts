import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchFilterUrlParamService {
  constructor(private route: ActivatedRoute) {}

  async getSearchFilterText(): Promise<string> {
    const params = await firstValueFrom(this.route.queryParams);
    return params['searchFilter'] || '';
  }
}
