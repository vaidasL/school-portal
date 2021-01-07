import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VhmScheduleService {
  //https://github.com/Freeboard/thingproxy
  proxyUrl = 'https://desolate-gorge-70894.herokuapp.com/';
  targetUrl = 'https://vhm.lt/mokinio-diena/';

  constructor(private http: HttpClient) { }

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
