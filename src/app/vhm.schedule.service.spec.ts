import { TestBed } from '@angular/core/testing';

import { Vhm.ScheduleService } from './vhm.schedule.service';

describe('Vhm.ScheduleService', () => {
  let service: Vhm.ScheduleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Vhm.ScheduleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
