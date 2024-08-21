import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchFilterUrlParamService {
  constructor(private route: ActivatedRoute) {}

  async getSearchFilterText(): Promise<string> {
    const params = await firstValueFrom(this.route.queryParams);
    return params['searchFilter'] || '';
  }

  getSearchFilterText$(): Observable<string> {
    return this.route.queryParams.pipe(
      map((params) => params['searchFilter'] || '')
    );
  }
}
