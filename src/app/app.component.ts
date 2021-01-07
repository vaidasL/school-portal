import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ClockService } from './clock.service';
import { PushNotificationsService } from './push.notifications.service';
import { VhmScheduleService } from './vhm.schedule.service';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  teachers: Teacher[] = [];
  schedule: Schedule[] =  [];

  currentTime: Date = new Date();
  //currentTime: Date = new Date('Thu Jan 06 2021 11:55');

  timeOverlapMins = 15;

  className: 'A' | 'B' = 'B';
  subGroup: '1' | '2' = '2';

  loading = true;

  constructor(private clockService: ClockService, private pushNotifications: PushNotificationsService, private vhm: VhmScheduleService) {
    this.pushNotifications.requestPermission();
    fetch('assets/teachers.json').then((response: Response) => {
      response.json().then(data => this.teachers = data);
    });
  }
  
  ngOnInit(): void {
    const cn = localStorage.getItem('className');
    if (!cn) {
      localStorage.setItem('className', this.className);
    } else {
      this.className = cn == 'A' ? 'A' : 'B';
    }

    const sg = localStorage.getItem('subGroup');
    if (!sg) {
      localStorage.setItem('subGroup', this.subGroup);
    } else {
      this.subGroup = sg == '1' ? '1' : '2';
    }

    this.retrieve(this.className, this.subGroup);
    
    this.clockService.getCurrentTime().subscribe(time => {
      if (time.getDay() != this.currentTime.getDay()) {
        this.retrieve(this.className, this.subGroup);
      } else {
        this.setup(time);
      }
    });
  }

  private setup(newDate: Date) {
    this.currentTime = newDate;
    this.schedule
      // work only on current day
      .filter(s => this.currentTime.getDay() === s.day)
      // recalculate time related attributes
      .forEach(s => {
        if (typeof s.time === 'string') {
          s.time = new Date(this.currentTime.toDateString() + ' ' + s.time);
        }
        s.status = this.getStatus(s.time);
        s.minutesLeft = this.getMinutesLeft(s.time);
        if (s.minutesLeft == 5 || s.minutesLeft == 0) {
          const title = s.minutesLeft == 0 ? 'Pamoka prasideda!' : 'Pamoka už ' + s.minutesLeft + 'min.';
          this.showNotification(title, s.subject, s.teacher.photo);
        }
      });
  }

  private retrieve(className: any, subGroup: any) {
    this.loading = true;
    this.vhm.getSource(className, subGroup).subscribe(s => {
      const newSchedule: Schedule[] = [];
      for (let i=1; i<=5; i++) {
        s[i].forEach((l:any) => {
          newSchedule.push({day: i, time: l.time, subject: l.subject, teacher: this.getTeacher(l.subject, className), minutesLeft: -1, status: 'future'})
        });
      }
      this.schedule = newSchedule;
      this.setup(this.currentTime);
      this.loading = false;
    }, err => {
      console.log('loading failed', err);
      alert('Nepavyko gauti tvarkaraščio iš vhm.lt');
      this.loading = false;
    });
  }

  private getMinutesLeft(time: Date) {
    if (this.currentTime > time) return -1;
    return Math.round((time.getTime() - this.currentTime.getTime())/1000/60);
  }

  private getStatus(time: Date): 'active' | 'past' | 'future' | 'starting' {
    if (time.getHours() === this.currentTime.getHours()+1 && Math.abs(time.getTime()-this.currentTime.getTime()) < 60000 * this.timeOverlapMins) {
      return 'starting';
    }

    if (time.getHours() === this.currentTime.getHours()) {
      return this.currentTime.getMinutes() < 60 - this.timeOverlapMins ? 'active' : 'past';
    }

    if (time.getHours() > this.currentTime.getHours()) {
      return 'future';
    }

    return 'past';
  }

  private getTeacher(subject: string, className: string) {
    let n = '';
    if (subject.search(/lietuv/i) >=0 || subject.search(/matem/i) >=0 || subject.search(/pasaul/i) >=0) {
      n = className == 'A' ? 'Agneška' : 'Alma';
    } else if (subject.search(/angl/i) >= 0) {
      n = 'Jurga';
    } else if (subject.search(/Narsa/i) >= 0) {
      n = 'Andrius';
    } else if (subject.search(/youtube/i) >= 0) {
      n = 'Youtube';
    } else {
      n = 'Genadijus';
    }
    return this.teachers.find(t => t.name === n);
  }

  private showNotification(title: string, bodyText: string, iconUrl: string) {
    let options = { //set options
      //requireInteraction: true,
      body: bodyText,
      icon: iconUrl //adding an icon
    }
     const a: Observable<any> = this.pushNotifications.create(title, options)
     a.subscribe( //creates a notification
        res => {
          console.log(res);
          if (res.event.type === 'close' || res.event.type === 'click') {
            parent.focus();
            window.focus(); //just in case, older browsers
          }
        },
        err => console.log(err)
    );
  }

  public onChange() {
    localStorage.setItem('className', this.className);
    localStorage.setItem('subGroup', this.subGroup);
    if (this.className && this.subGroup) {
      this.retrieve(this.className, this.subGroup);
    }
  }

  public getTodaysSchedule() {
    return this.schedule.filter(s => s.day == this.currentTime.getDay());
  }

  public test() {
    setTimeout(() => {
      this.showNotification('title', 'body', '');
    }, 2000);
  }

  @HostListener('window:focus', ['$event'])
  onFocus(event: FocusEvent): void {
    this.setup(new Date());
  }
}

interface Schedule {
  day: number, 
  time: any, 
  subject: string, 
  teacher: any,
  minutesLeft: number,
  status: 'active' | 'past' | 'future' | 'starting'
}

interface Teacher {
  name: string, 
  photo: string, 
  details: any[]
}