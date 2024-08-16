import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpPromiseService {
  constructor(private httpClient: HttpClient) {}

  get<T>(...args: Parameters<HttpClient['get']>): Promise<T> {
    return firstValueFrom(this.httpClient.get<T>(...args));
  }

  post<T>(...args: Parameters<HttpClient['post']>): Promise<T> {
    return firstValueFrom(this.httpClient.post<T>(...args));
  }

  put<T>(...args: Parameters<HttpClient['put']>): Promise<T> {
    return firstValueFrom(this.httpClient.put<T>(...args));
  }

  delete<T>(...args: Parameters<HttpClient['delete']>): Promise<T> {
    return firstValueFrom(this.httpClient.delete<T>(...args));
  }
}
