/* Polka-Zeit public Google Sheets content loader. No external libraries. */
(function(){
  'use strict';
  const id=(window.POLKAZEIT_SHEET_ID||'').trim();
  const $=s=>document.querySelector(s);
  function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
  function setText(sel,value){const e=$(sel);if(e&&value)e.textContent=value;}
  function validUrl(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null}catch{return null}}
  function load(tab){return new Promise((resolve,reject)=>{
    const cb='pzSheetCallback_'+Math.random().toString(36).slice(2);
    const script=document.createElement('script');
    const timeout=setTimeout(()=>finish(new Error('Timed out loading '+tab)),12000);
    function finish(err,result){clearTimeout(timeout);delete window[cb];script.remove();err?reject(err):resolve(result)}
    window[cb]=function(response){
      if(!response||response.status==='error'||!response.table){finish(new Error('Sheet not accessible: '+tab));return}
      const t=response.table;
      const headers=(t.cols||[]).map(c=>(c.label||'').trim());
      const rows=(t.rows||[]).map(row=>{
        const out={};(row.c||[]).forEach((cell,i)=>{
          let v=cell?(cell.f!==undefined?cell.f:cell.v):'';
          // gviz may represent dates as Date(2026,9,26)
          if(typeof v==='string'&&/^Date\(\d{4},\d{1,2},\d{1,2}/.test(v)){
            const m=v.match(/^Date\((\d+),(\d+),(\d+)/);v=m?`${m[1]}-${String(Number(m[2])+1).padStart(2,'0')}-${m[3].padStart(2,'0')}`:v;
          }
          out[headers[i]]=v==null?'':String(v).trim();
        });return out;
      });
      finish(null,rows);
    };
    script.onerror=()=>finish(new Error('Could not load '+tab));
    const query=new URLSearchParams({sheet:tab,headers:'1',tqx:'out:json;responseHandler:'+cb});
    script.src='https://docs.google.com/spreadsheets/d/'+encodeURIComponent(id)+'/gviz/tq?'+query;
    document.head.appendChild(script);
  })}
  function visible(row){return !['NO','FALSE','0','HIDE','HIDDEN'].includes((row.Visible||'').toUpperCase())}
  function parseDate(s){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return null;
    const [y,m,d]=s.split('-').map(Number);const date=new Date(y,m-1,d);
    return date.getFullYear()===y&&date.getMonth()===m-1&&date.getDate()===d?date:null;
  }
  function prettyDate(date){return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(date)}
  function showCard(row,date){
    const a=el('article','show-entry');const dt=el('div','show-date',prettyDate(date));a.appendChild(dt);
    const main=el('div','show-details');main.appendChild(el('h3','',row.Venue||'Performance'));
    const meta=[row.City,row.Time].filter(Boolean).join(' · ');if(meta)main.appendChild(el('p','show-location',meta));
    if(row.Details)main.appendChild(el('p','',row.Details));a.appendChild(main);
    const url=validUrl(row['Ticket URL']);if(url){const link=el('a','btn btn-red','Tickets ↗');link.href=url;link.target='_blank';link.rel='noopener noreferrer';a.appendChild(link)}
    return a;
  }
  function renderShows(rows){
    const up=$('#upcoming-list'),past=$('#past-list');if(!up||!past)return;
    const today=new Date();today.setHours(0,0,0,0);
    const events=rows.filter(visible).map(row=>({row,date:parseDate(row.Date)})).filter(e=>e.date);
    const upcoming=events.filter(e=>e.date>=today).sort((a,b)=>a.date-b.date);
    const previous=events.filter(e=>e.date<today).sort((a,b)=>b.date-a.date);
    up.replaceChildren();past.replaceChildren();
    upcoming.forEach(e=>up.appendChild(showCard(e.row,e.date)));
    previous.forEach(e=>past.appendChild(showCard(e.row,e.date)));
    if(!upcoming.length)up.appendChild(el('p','empty-list','New dates coming soon.'));
    if(!previous.length)past.appendChild(el('p','empty-list','Past performances will appear here.'));
  }
  function renderBios(rows){const target=$('#member-bios');if(!target)return;
    const members=rows.filter(visible).filter(r=>r.Name).sort((a,b)=>(Number(a.Order)||999)-(Number(b.Order)||999));
    target.replaceChildren();if(!members.length){target.hidden=true;return}
    target.hidden=false;
    members.forEach(r=>{const card=el('article','bio-card');
      // Only allow filename, never remote/script URLs
      const filename=(r['Photo filename']||'').trim();
      if(/^[\w-]+\.(jpg|jpeg|png|webp)$/i.test(filename)){const img=el('img');img.src='assets/'+filename;img.alt=r.Name;img.loading='lazy';card.appendChild(img)}
      const content=el('div');content.appendChild(el('h3','',r.Name));if(r.Instrument)content.appendChild(el('p','kicker red',r.Instrument));if(r.Biography)content.appendChild(el('p','',r.Biography));card.appendChild(content);target.appendChild(card)});
  }
  function fields(rows){return Object.fromEntries(rows.filter(r=>r.Field).map(r=>[r.Field.toLowerCase().trim(),r.Value||'']))}
  function renderBooking(rows){const f=fields(rows);setText('#booking-headline',f.headline);setText('#booking-description',f.description);
    const area=$('#booking-contact');if(!area)return;area.replaceChildren();
    if(f['contact name'])area.appendChild(el('p','',f['contact name']));
    const email=(f.email||'').trim();if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      const a=el('a','btn btn-red',f['button text']||'Email for booking');a.href='mailto:'+email;area.appendChild(a);
    }
    if(f.phone&&/^[+\d\s().-]{7,25}$/.test(f.phone)){const a=el('a','contact-phone',f.phone);a.href='tel:'+f.phone.replace(/[^\d+]/g,'');area.appendChild(a)}
    if(!area.children.length)area.appendChild(el('p','small-note','Booking contact information coming soon.'));
  }
  function youtubeId(url){try{const u=new URL(url);const host=u.hostname.replace(/^www\./,'');let id='';
    if(host==='youtu.be')id=u.pathname.split('/')[1];
    else if(['youtube.com','m.youtube.com','youtube-nocookie.com'].includes(host))id=u.searchParams.get('v')||u.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1];
    return /^[\w-]{11}$/.test(id||'')?id:null;
  }catch{return null}}
  function renderVideos(rows){const target=$('#video-list');if(!target)return;target.replaceChildren();let count=0;
    rows.filter(visible).forEach(r=>{const id=youtubeId(r['YouTube URL']);if(!id)return;count++;
      const card=el('article','video-card');const frame=el('iframe');frame.src='https://www.youtube-nocookie.com/embed/'+id;frame.title=r.Title||'Polka-Zeit video';frame.loading='lazy';frame.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';frame.allowFullscreen=true;
      card.appendChild(frame);card.appendChild(el('h3','',r.Title||'Live performance'));if(r.Description)card.appendChild(el('p','',r.Description));target.appendChild(card);
    });
    if(!count)target.appendChild(el('p','empty-list','New videos coming soon.'));
  }
  function renderSite(rows){const f=fields(rows);setText('#hero-tagline',f['hero tagline']);setText('#hero-subtitle',f['hero subtitle']);setText('#home-introduction',f['home introduction']);setText('#about-introduction',f['about introduction']);document.querySelectorAll('.footer-tagline').forEach(e=>{if(f['footer tagline'])e.textContent=f['footer tagline']})}
  if(!id){document.querySelectorAll('[data-sheet-status]').forEach(e=>e.textContent='Connect your Google Sheet in sheet-config.js to manage this page.');return}
  const loaders=[['Shows',renderShows],['Bios',renderBios],['Booking',renderBooking],['Videos',renderVideos],['Site Info',renderSite]];
  loaders.forEach(([name,render])=>{
    if(name==='Shows'&&!$('#upcoming-list'))return;
    if(name==='Bios'&&!$('#member-bios'))return;
    if(name==='Booking'&&!$('#booking-contact'))return;
    if(name==='Videos'&&!$('#video-list'))return;
    if(name==='Site Info'&&!($('#hero-tagline')||$('#about-introduction')||$('.footer-tagline')))return;
    load(name).then(rows=>{render(rows);if(name==='Shows')setText('[data-sheet-status]','')}).catch(err=>{
      console.warn('Polka-Zeit content:',err.message);
      if(name==='Shows')setText('[data-sheet-status]','Shows are temporarily unavailable. Please check back soon.');
    });
  });
})();
