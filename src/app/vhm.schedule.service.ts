import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VhmScheduleService {
  //https://github.com/Freeboard/thingproxy
  proxyUrl = 'https://desolate-gorge-70894.herokuapp.com/';
  //proxyUrl = 'https://thingproxy.freeboard.io/fetch/';
  targetUrl = 'https://vhm.lt/mokinio-diena/';

  lessonTimes = ['', '8:30', '9:30', '10:15', '11:10', '11:55', '12:30', '13:10', '14:30', '15:20'];

  constructor(private http: HttpClient) { }

  getSourceRegular(className: 'A' | 'B', subGroup: string) {
    return this.http.get(this.proxyUrl + this.targetUrl, {responseType: 'text'}).pipe(map(e => {
      //console.log('e', e);
      let days: any[] = [];
      let res = e.match(/<table border="0">(.+?)<\/table>/gms);
      //console.log('a', res);
      if (res) {
        let re = /<tr>(.+?)<\/tr>/gs;
        //console.log(re);
        const m = res[0].replace(/<\/?strong>/g, '').match(re);
        m?.shift(); // first element is class names
        //console.log('m', m);
        
        for (let i=1; i<=5; i++) {
          m?.shift(); //  element is weekday
          days[i] = m?.shift() + '';//; // actual schedule
          //extract A or B class
          days[i] = days[i].match(/<td([^>]*)>(.+?)<\/td>/gs)?.slice(className === 'A' ? 0 : 1, className === 'A' ? 1 : 2).shift() + '';


          const div = document.createElement("div");
          div.innerHTML = days[i];
          days[i] = div.textContent || div.innerText || "";
          days[i] = days[i].trim().match(/\n?[^\n]+/g).map((el: string) => {
            const d = el.match(/(\d)\.\s+(.+)/);
            if (d) {
              return { time: this.lessonTimes[+d[1]], subject: d[2]};
            } else {
              return {};
            }
          });
        }
      }
      return days;
    }));

  }

  getSource(className: 'A' | 'B', subGroup: '1' | '2') {
    return this.http.get(this.proxyUrl + this.targetUrl, {responseType: 'text'}).pipe(map(e => {
      //console.log('e', e);
      let days: any[] = [];
      let res = e.match(/<table border="0">(.+?)<\/table>/gms);
      //console.log('a', res);
      if (res) {
        let re = /<tr>(.+?)<\/tr>/gs;
        const m = res[0].replace(/<\/?strong>/g, '').match(re);
        m?.shift(); // first element is class names
        //console.log('m', m);
        
        for (let i=1; i<=5; i++) {
          m?.shift(); //  element is weekday
          days[i] = m?.shift() + '';//; // actual schedule
          //extract A or B class
          days[i] = days[i].match(/<td([^>]*)>(.+?)<\/td>/gs)?.slice(className === 'A' ? 0 : 1, className === 'A' ? 1 : 2).shift() + '';
          // extract subgroup
          days[i] = days[i].split('----------------------------------------------')[+subGroup-1] + '';
          //extract lessons
          days[i] = days[i].match(/<p([^>]*)>(\d{1,2}\.\d\d)\s+(.+?)<\/p>/gs);
          
          days[i] = days[i]?.map((el: string) => {
              // cleanup
               const r = el.replace(/<\/?p>/g, '').replace(/<br\s*?\/>/g, '');
               // extract time and subject
               const d = r.match(/(\d{1,2}\.\d\d)\s+(.+)/);
               if (d) {
                return { time: d[1].replace('.', ':'), subject: d[2]};
               } 
               return {};
          });
        }
      }
      return days;
    }));
  }
}
