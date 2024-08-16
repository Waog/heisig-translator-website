import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpPromiseService {
  private cache: Map<string, Promise<any>> = new Map();

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

  getOnce<T>(url: string, forceReload = false): Promise<T> {
    if (forceReload || !this.cache.has(url)) {
      const requestPromise = this.get<T>(url).catch((error) => {
        this.cache.delete(url); // Remove from cache if the request fails
        throw error;
      });
      this.cache.set(url, requestPromise);
    }

    return this.cache.get(url) as Promise<T>;
  }
}
