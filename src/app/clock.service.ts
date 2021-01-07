import { Injectable } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ClockService {

  private clock: Observable<Date>;

  constructor() {
    this.clock = interval(60000).pipe(map(() => new Date()));
  }

  getCurrentTime() {
    return this.clock;
  }
}
