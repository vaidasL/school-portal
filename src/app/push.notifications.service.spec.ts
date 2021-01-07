import { TestBed } from '@angular/core/testing';

import { Push.NotificationsService } from './push.notifications.service';

describe('Push.NotificationsService', () => {
  let service: Push.NotificationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Push.NotificationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
