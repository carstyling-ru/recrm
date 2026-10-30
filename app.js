import {createLocalization} from './i18n.js?v=27';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const definitions=[
 ['01','Помогаем получить максимум прибыли','intro'],
 ['02','Ключевые возможности','features'],
 ['03','Почему мы?','why-us'],
 ['04','Преимущества перед универсальными CRM','crm-comparison'],
 ['05','Проблемы, которые мы решаем','challenges'],
 ['06','Преимущества RECRM','benefits'],
 ['07','Мобильные приложения','mobile-app'],
 ['08','Выгрузка на площадки','advertising'],
 ['09','Настройка и запуск','onboarding'],
 ['10','О разработчике','about'],
 ['21','Зачем вам нужна CRM?','why-crm'],
 ['22','Как это работает?','how-it-works'],
 ['23','Возможности Real Estate CRM','capabilities'],
 ['24','Бизнес-кейсы','case-studies'],
 ['31','Сколько это стоит?','pricing'],
 ['41','Видео и фотографии клиентов','customers'],
 ['42','Отзывы наших клиентов','reviews'],
 ['43','География клиентов','geography'],
 ['51','Поддержка','support'],
 ['61','Полезные статьи','blog'],
 ['form','Попробовать бесплатно','free-trial']
];
// Remove a slug from this set to restore the screen to sequential navigation.
const sequenceExcluded=new Set(['advertising','customers','geography','support']);
const articleRoutes=[
 ['62','Главное мобильное приложение риэлтора','mobile-crm-guide'],
 ['63','Для чего нужна воронка продаж в риэлторском бизнесе','sales-funnel'],
 ['64','Конкурентные преимущества при использовании RECRM Online.','competitive-advantages'],
 ['65','Выбираем CRM-систему.','choosing-crm']
];
const routes=[...definitions,...articleRoutes];
const articleIds=new Set(articleRoutes.map(([id])=>id));
const featureHighlights=[
 'Постоянный поток собственников из интернета;',
 'Выгрузка рекламы на ведущие площадки и собственный веб-сайт;',
 'Планировщик риэлтора: звонки, встречи, показы;',
 'Настраиваемые воронки продаж. Набор риэлторских воронок;',
 'Совместные сделки, автоподбор объектов и заявок;',
 'API для обмена информацией с внешними продуктами;',
 'Интеграция с телефонией.'
];
const bluePages=new Set(['01','03','05','07','22','41','43','form']);
let screens={},content={},current='01',previous='01',navigationLocked=false,menuOpen=false,problemIndex=0;
let i18n={apply(){},text(value){return value;}};
const problemDelay=5000;
let problemTimer=0,problemPaused=matchMedia('(prefers-reduced-motion:reduce)').matches,problemFocusPaused=false;
let formValues={name:'',email:'',phone:''};
const stage=$('#stage'),screen=$('#screen');
const template=s=>{const t=document.createElement('template');t.innerHTML=s;return t.content.firstElementChild;};
function resize(){
 const mobile=innerWidth<=760,s=mobile?1:Math.min(innerHeight/1158,innerWidth/1440);
 document.documentElement.style.setProperty('--scale',s);
 document.documentElement.style.setProperty('--rail',mobile?'52px':`${100*s}px`);
 document.documentElement.style.setProperty('--hero-mobile-scale',Math.min((innerWidth-98)/701,.6));
 document.documentElement.style.setProperty('--comparison-scale',Math.min((innerWidth-98)/521,1));
 document.documentElement.style.setProperty('--challenge-scale',Math.min((innerWidth-98)/380,1));
 document.documentElement.style.setProperty('--onboarding-scale',Math.min((innerWidth-98)/380,1));
 stage.style.width=mobile?'100%':`${innerWidth/s}px`;
}
const action=(n,callback,label)=>{if(!n)return;n.setAttribute('role','button');n.tabIndex=0;n.classList.add('action-target');if(label)n.setAttribute('aria-label',label);n.addEventListener('click',callback);n.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();callback();}});};
function routeHash(id){return '#'+(id==='form'?'free-trial':routes.find(d=>d[0]===id)?.[2]||'intro');}
function routeId(){
 const slug=location.hash.slice(1);
 return ['free-trial','form'].includes(slug)?'form':routes.find(([id,,route])=>route===slug||`recrm-${id}`===slug)?.[0]||'01';
}
function go(id){if(id==='form'&&current!=='form')previous=current;location.hash=routeHash(id);}
function syncRoute(animate=true){
 const id=routeId();
 if(id==='form'&&current!=='form')previous=current;
 render(id,animate);
 if(location.hash!==routeHash(current))history.replaceState(null,'',routeHash(current));
}
function move(delta){
 const i=definitions.findIndex(d=>d[0]===current);if(i<0||menuOpen||$('dialog[open]'))return;
 for(let next=i+delta;next>=0&&next<definitions.length;next+=delta){
  if(!sequenceExcluded.has(definitions[next][2])){go(definitions[next][0]);return;}
 }
}
function setMenu(open){
 menuOpen=open;document.body.classList.toggle('menu-open',open);$('#menu').inert=!open;$('#menuToggle').setAttribute('aria-expanded',open);$('#menuToggle').setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');$('#menuShade').hidden=!open;
 if(open){screen.inert=true;$('.menu-links a').focus({preventScroll:true});}else{screen.inert=false;$('#menuToggle').focus({preventScroll:true});}
 restartProblemPlayback();
 i18n.apply($('#menuToggle'));
}
function openMedia(html){$('#mediaContent').innerHTML=html;i18n.apply($('#media'));$('#media').showModal();restartProblemPlayback();}
function showVideo(url,title){openMedia(`<h2>${esc(title)}</h2><iframe src="${esc(url)}?rel=0" title="${esc(title)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`);}
function picture(src,title){openMedia(`<h2>${esc(title)}</h2><img src="${esc(src)}" alt="${esc(title)}">`);}
function setupComparisonIllustrations(root){
 const start=$('[data-name="btn / left"]',root),stop=$('[data-name="btn / right"]',root),segments=document.createElement('div');
 segments.className='comparison-segmented';start.before(segments);segments.append(start,stop);
 const title=$$('p',root).find(p=>p.textContent.trim()==='Автоподбор'),toggle=$('[data-name="toggler / yes"]',title.parentElement),matching=document.createElement('div');
 matching.className='comparison-matching-toggle';title.classList.add('comparison-matching-title');toggle.before(matching);matching.append(toggle,title);
 const label=$$('p',root).find(p=>p.textContent.trim()==='Заявка 2-ком квартира – Варианты').parentElement,counter=$('[data-name="counter / variants"]',root),matches=document.createElement('div');
 matches.className='comparison-matches';label.classList.add('comparison-matches-label');counter.classList.add('comparison-counter');label.before(matches);matches.append(label,counter);
 $$('p',root).find(p=>p.textContent.trim()==='32 000 000 ₽').classList.add('comparison-property-price');
}
function sourceScreen(id){
 const root=template(screens[id]);root.className='design-screen desktop-layout';root.style.width='100%';root.style.height='1158px';
 for(const n of [...root.children]){const name=n.dataset.name||'';if(['HEADER','FOOTER','MENU'].includes(name)||n.style.width==='100px')n.remove();}
 for(const n of $$('p',root)){
  if(/Поробовать бесплатно/.test(n.textContent))n.textContent=n.textContent.replace('Поробовать','Попробовать');
  if(/^(Попробуйте|Попробовать) бесплатно$/.test(n.textContent.trim()))action(n,()=>go('form'));
 }
 const heading=$('[data-name="H1"] p',root)||$$('p',root).find(n=>n.style.fontSize==='72px');if(heading){heading.setAttribute('role','heading');heading.setAttribute('aria-level','1');}
 if(['10','31'].includes(id)){
  const prefix=id==='10'?'Site-Mechanics — это команда':'СТОИМОСТЬ НА ТАРИФАХ',intro=$$('p',root).find(p=>p.textContent.trim().startsWith(prefix));
  intro.style.left=$('[data-name="H1"]',root).style.left;intro.classList.add('section-lead');
 }
 if(id==='01'){
  root.classList.add('hero');
  const intro=$('[data-name="01-INTRO"]',root),title=$('[data-name="H1"] p',intro).cloneNode(true),description=$('[data-name="TITLE"] > p',intro).textContent;
  $$('br',title).forEach(br=>br.replaceWith(' '));
  const copy=document.createElement('section');copy.className='hero-copy';
  copy.innerHTML=`<h1>${esc(title.textContent.replace(/\s+/g,' ').trim())}</h1><div class="hero-rule"></div><p class="hero-description">${esc(description)}</p><div class="hero-price"><span>от</span><strong>345 ₽</strong><small>/мес. за сотрудника</small></div><button class="hero-cta" data-open-form>Попробовать бесплатно <span aria-hidden="true">→</span></button>`;
  $$('[data-name="TITLE"],[data-name="PRICE"],[data-name="Try4free"]',intro).forEach(n=>n.remove());
  $('[data-name="VIS"]',intro).classList.add('hero-visual');intro.append(copy);
 }
 if(id==='31'){
  const cards=$$('div',root).filter(n=>n.style.height==='614px'&&n.style.width==='335px');
  cards.forEach(card=>card.remove());root.append(template(pricingHtml('desktop')));
 }

 if(id==='03'){
  const intro=$$('p',root).find(n=>n.textContent.startsWith('Мы оцифровываем агентства недвижимости'));if(intro)intro.style.left=$('[data-name="H1"]',root).style.left;
  const cards=$$('[data-name^="feedback"]',root);const grid=document.createElement('div');grid.className='reviews-grid';
  for(const card of cards){card.style.position='relative';card.style.left='auto';card.style.top='auto';card.style.width='100%';grid.append(card);}root.append(grid);
 }
 if(id==='04'||id==='06'){
  const block=$('[data-name="Content"]',root);if(block){block.classList.add('feature-content');
   for(const row of [...block.children].filter(n=>$$('[data-name^="Adv"]',n).length)){
    row.classList.add('feature-row');for(const card of $$('[data-name^="Adv"]',row)){
     const right=parseFloat(card.style.marginLeft)>0;card.style.marginLeft='0';card.style.gridColumn=right?'2':'1';card.style.justifySelf=right?'end':'start';
     card.classList.add('comparison-card');const description=card.firstElementChild,visual=document.createElement('div'),art=document.createElement('div');
     visual.className='comparison-visual';art.className='comparison-art';art.style.width=card.style.width;art.style.height=card.style.height;
     for(const child of [...card.children])if(child!==description)art.append(child);
     visual.append(art);card.prepend(visual);description.classList.add('comparison-description');$$('br',description).forEach(br=>br.replaceWith(' '));
     for(const p of $$('p',description)){const span=document.createElement('span');span.innerHTML=p.innerHTML+' ';p.replaceWith(span);}
    }
   }
  }
 }
 if(id==='04')setupComparisonIllustrations(root);
 if(id==='05'){
  const section=$('[data-name="05-PROBLEMS"]',root),grid=document.createElement('div');grid.className='challenges-grid';
  for(const number of [1,2,3]){
   const original=$(`[data-name="VIS${number}"]`,section),art=$(`[data-name="vis-${number}"]`,original),card=document.createElement('article'),visual=document.createElement('div'),caption=document.createElement('p');
   card.className='challenge-card'+(number===2?' challenge-card--question':'');visual.className='challenge-visual';art.classList.add('challenge-art');art.setAttribute('aria-hidden','true');
   caption.className='challenge-caption';caption.innerHTML=$$('p',original).map(p=>p.innerHTML).join('<br>');
   visual.append(art);card.append(visual,caption);grid.append(card);original.remove();
  }
  section.append(grid);
 }
 if(id==='09'){
  const grid=document.createElement('div');grid.className='support-cards-grid';
  for(const card of $$('[data-name^="support-"]',root)){
   const [description,title]=card.children,visual=document.createElement('div'),art=document.createElement('div');
   card.classList.add('onboarding-card');card.style.position='relative';card.style.left='auto';card.style.top='auto';
   description.classList.add('onboarding-description');title.classList.add('onboarding-title');title.setAttribute('role','heading');title.setAttribute('aria-level','2');
   $$('p',description).filter(p=>!p.textContent.replaceAll('\u200b','').trim()).forEach(p=>p.remove());
   if(card.dataset.name==='support-3'){
    description.classList.add('onboarding-materials');const icons=$$('[data-name^="icn / "]',card);
    $$('p',description).forEach((p,i)=>{const row=document.createElement('div');row.className='onboarding-material';row.append(icons[i],p);description.append(row);});
   }
   visual.className='onboarding-visual';art.className='onboarding-art';visual.setAttribute('aria-hidden','true');
   for(const child of [...card.children])if(child!==description&&child!==title)art.append(child);
   visual.append(art);card.replaceChildren(title,description,visual);grid.append(card);
  }
  root.append(grid);
 }
 if(id==='02'){
  const section=$('[data-name="02-FEATURES"]',root),visual=$('[data-name="VIS"]',section),play=$('[data-name="iconfinder_youtube-play_1608384 1"]',visual);
  $('[data-name="TEXT"]',section).replaceWith(template(`<div class="features-copy">${featuresListHtml()}</div>`));
  visual.classList.add('features-visual');$('[data-name="slide-5 2"]',visual).classList.add('features-preview');play.classList.add('features-play');
  action(play,()=>showVideo('https://www.youtube.com/embed/iy-JT9-9Grw','Обзор RECRM'),'Смотреть видеообзор RECRM');
 }
 if(id==='23'){
  const section=$('[data-name="23-FEATURES"]',root),grid=document.createElement('div');grid.className='capabilities-grid';
  const columns=[...section.children].filter(n=>n.style.width==='550px'&&n.style.fontSize==='16px').sort((a,b)=>Number(b.style.left.includes('-'))-Number(a.style.left.includes('-')));
  for(const column of columns){
   const list=document.createElement('ul');list.className='capabilities-list';
   for(const p of $$('p',column))if(p.textContent.replaceAll('\u200b','').trim()){
    const item=document.createElement('li');item.innerHTML=`<span class="capability-marker" aria-hidden="true">—</span><span class="capability-text">${p.innerHTML}</span>`;list.append(item);
   }
   grid.append(list);column.remove();
  }
  for(const child of [...section.children])if(child.style.fontSize==='0px')child.remove();
  const title=$(':scope > p',section);title.setAttribute('role','heading');title.setAttribute('aria-level','1');section.append(grid);
 }
 if(['03','08','10'].includes(id))setupSlider(root,id);
 if(id==='08')for(const p of $$('p',root))if(p.textContent.includes('Ознакомьтесь с подробным'))action(p,()=>openMedia(`<h2>Выгрузка объявлений на площадки</h2><p>Авито, Циан, Яндекс Недвижимость, Домклик, Юла, N1, МирКвартир и другие интернет-площадки.</p><p style="margin-top:20px"><a href="https://recrm.ru/" target="_blank" rel="noopener">Подробный список на сайте RECRM ↗</a></p>`));
 if(id==='07'){action($$('img',root).find(n=>n.src.includes('24533'))?.parentElement,()=>window.open('https://apps.apple.com/ru/app/recrm-app/id1448632364?l=ru&ls=1','_blank','noopener'));action($$('img',root).find(n=>n.src.includes('7bc21'))?.parentElement,()=>window.open('https://play.google.com/store/apps/details?id=com.recrm.online','_blank','noopener'));}
 if(id==='09')for(const p of $$('.onboarding-material p',root))p.dataset.supportLink='';
 if(id==='10')for(const p of $$('p',root))if(p.textContent.trim()==='Site-Mechanics')action(p,()=>window.open('https://www.site-mechanics.ru/','_blank','noopener'));
 return root;
}
function setupSlider(root,id){
 const old=$('[data-name="Scroll"]',root)||$('[data-name="SCROLL"]',root);if(old)old.remove();
 $$('[data-name="scroll-bg"],[data-name="scroll-button"]',root).forEach(n=>n.remove());
 const slider=document.createElement('input');slider.type='range';slider.min=0;slider.max=id==='03'?2:100;slider.step=1;slider.value=0;slider.className='carousel-control';slider.setAttribute('aria-label',id==='03'?'Отзывы клиентов':id==='08'?'Площадки выгрузки':'Фотографии разработчика');
 if(id==='08'){slider.style.top='826px';}if(id==='10')slider.style.top='951px';
 root.append(slider);
 if(id==='03'){
  const cards=$$('[data-name^="feedback"]',root);const originals=cards.map(n=>n.innerHTML);
  slider.addEventListener('input',()=>{cards.forEach((n,i)=>n.innerHTML=originals[(i+Number(slider.value))%originals.length]);i18n.apply(root);});
 }else{
  const candidates=id==='10'?$$('img',root).filter(n=>/99c59|5c8ef/.test(n.src)).map(n=>n.parentElement):[$('[data-name="LOGOS"]',root)||$('[data-name="Logos"]',root)||$$('div',root).find(n=>n.style.gap==='100px')].filter(Boolean);
  slider.addEventListener('input',()=>candidates.forEach(n=>{n.style.translate=`${-Number(slider.value)*4}px 0`;}));
 }
}
function videosHtml(){return `<h1>Почему мы?</h1><div class="title-rule"></div><div class="video-grid">${content.videos.slice(0,3).map((v,i)=>`<button class="video-card" data-video="${i}"><div class="thumbnail"><img src="${esc(v.image)}" alt="${esc(v.title)}"><span class="play" aria-hidden="true">▶</span></div><small>${esc(v.title)}</small></button>`).join('')}</div><div class="photo-grid">${content.offices.slice(0,3).map((v,i)=>`<button class="video-card" data-office="${i}"><img src="${esc(v.image)}" alt="${esc(v.title)}"><small>${esc(v.title)}</small></button>`).join('')}</div>`;}
const faqTitles=['Вопросы по настройке системы','Вопросы по сайту-витрине агентства','Вопросы по наполнению базы и удалению из неё данных','Вопросы по ведению заявок','Вопросы по поиску в CRM','Вопросы по задачам','Вопросы по выгрузке объявлений на интернет-площадки','Вопросы по отчетам','Цены, хостинг, тех. поддержка','Доработки'];

function supportHtml(){return `<h1>Поддержка</h1><div class="title-rule"></div><p>Не нашли ответ? Свяжитесь с нами</p><div class="support-grid"><div class="support-contact"><p>Вы можете <a href="https://t.me/recrmtechsupport_bot" target="_blank" rel="noopener">написать нам в Telegram</a> или позвонить по тел. <a href="tel:+74997537723">+7 (499) 753-77-23</a> с 9.00 до 17.00 по Москве в рабочие дни.</p><p>Электронные письма отправляйте в любое время на адрес: <a href="mailto:support@recrm.online">support@recrm.online</a></p></div><aside><h3>Полезно посмотреть</h3><a href="https://www.youtube.com/playlist?list=PLAs1mEzxDu2OVJimbjaamUuvv_17ABhPr" target="_blank" rel="noopener">Обучающие видеоролики по использованию ReCRM</a><a href="https://recrm.ru/support/" target="_blank" rel="noopener">Руководство пользователя CRM</a><a href="http://docs.google.com/document/d/1jMP1yBEX3UG6_LHVKTegBipkyP1CVAZh/" target="_blank" rel="noopener">Документация по API</a></aside></div><h3 style="margin-top:35px">Ответы на часто задаваемые вопросы</h3><div class="faq-list">${content.faq.map((g,i)=>`<button class="faq-link" data-faq="${i}">${esc(g.title)}</button>`).join('')}</div>`;}
function blogHtml(){
 return `<h1>Полезные статьи для риэлторов</h1><div class="title-rule"></div><div class="blog-layout">${content.articles.map(a=>`<article class="blog-card"><a href="#${esc(a.slug)}"><img src="${esc(a.image)}" alt="${esc(a.title)}"></a><div><h2><a href="#${esc(a.slug)}">${esc(a.title)}</a></h2><p>${esc(a.text)}</p></div></article>`).join('')}</div>`;
}
function articleHtml(id){
 const index=content.articles.findIndex(article=>article.id===id),a=content.articles[index],previousArticle=content.articles[index-1],nextArticle=content.articles[index+1];
 const pageLink=(entry,direction)=>entry?`<a class="article-page article-page--${direction}" rel="${direction}" href="#${esc(entry.slug)}"><small><span aria-hidden="true">${direction==='prev'?'←':'→'}</span> ${direction==='prev'?'Предыдущая статья':'Следующая статья'}</small><span>${esc(entry.title)}</span></a>`:'';
 const pagination=previousArticle||nextArticle?`<nav class="article-pagination" aria-label="Навигация по статьям">${pageLink(previousArticle,'prev')}${pageLink(nextArticle,'next')}</nav>`:'';
 const body=a.fullHtml||esc(a.fullText),trial=body.includes('data-open-form')?'':'<p class="article-actions"><a href="#free-trial" data-open-form>Попробовать бесплатно</a></p>';
 return `<a class="back-to-blog" href="#blog">← Все статьи</a><h1 class="article-title">${esc(a.title)}</h1><div class="article"><img class="article-cover" src="${esc(a.image)}" alt="${esc(a.title)}"><div class="article-text" tabindex="0"><div class="article-body">${body}</div>${trial}${pagination}</div></div>`;
}
function casesHtml(){return `<h1 style="font-size:48px">Бизнес-кейсы</h1><div class="case-list">${content.cases.map((c,i)=>`<details ${i===0?'open':''}><summary>${esc(c.title)}</summary><div class="case-content${c.image?'':' case-content--text'}">${c.image?`<img src="${esc(c.image)}" alt="${esc(c.title)}">`:""}<div class="case-copy">${c.text.split(/\n{2,}/).map(p=>`<p>${esc(p).replaceAll('\n','<br>')}</p>`).join('')}</div></div></details>`).join('')}</div>`;}
function reviewsHtml(){return `<h1>Отзывы наших клиентов</h1><div class="title-rule"></div><div class="written-reviews">${[0,1,2].map(i=>{const r=content.reviews[i];return `<article>${r?.images[0]?`<img class="review-logo" src="${esc(r.images[0])}" alt="Логотип клиента">`:''}<div class="review-text">${esc(r?.text||'').replaceAll('\n\n','<br><br>')}</div>${r?.images.length?`<button class="review-original" data-letter="${i}">Посмотреть оригинал ↗</button>`:""}</article>`;}).join('')}</div>`;}
function pricingHtml(layout){
 return `<div class="pricing-grid">${content.pricing.plans.map(plan=>{
  const panelId=`pricing-${layout}-${plan.id}`,summary=`<div class="pricing-summary"><strong>${esc(plan.price)}</strong><span>${esc(plan.unit)}</span></div>`;
  return `<article class="pricing-card pricing-card--${plan.id}"><h2><button class="pricing-toggle" data-pricing-toggle aria-expanded="false" aria-controls="${panelId}" aria-label="Тариф «${esc(plan.name)}»: цены по количеству сотрудников">${esc(plan.name)}</button></h2><p class="pricing-subscription"><strong>${esc(plan.employees)}</strong><span>${esc(plan.subscription)}</span></p><div class="pricing-body"><div class="pricing-overview" data-pricing-overview><table class="pricing-table pricing-features"><caption class="sr-only">Возможности тарифа «${esc(plan.name)}»</caption><colgroup><col><col></colgroup><tbody>${content.pricing.featureLabels.map((label,i)=>`<tr><th scope="row">${esc(label)}</th><td>${plan.features[i]===true?`<span class="pricing-check" role="img" aria-label="Включено">✓</span>${plan.note&&i===3?'<sup>*</sup>':''}`:esc(plan.features[i]===false?'—':plan.features[i])}</td></tr>`).join('')}</tbody></table>${summary}${plan.note?`<small class="pricing-note">${esc(plan.note)}</small>`:''}</div><div class="pricing-details" data-pricing-details id="${panelId}" hidden>${summary}<table class="pricing-table pricing-tiers"><caption class="sr-only">Стоимость тарифа «${esc(plan.name)}» по количеству сотрудников</caption><colgroup><col><col></colgroup><tbody>${plan.tiers.map(([employees,price])=>`<tr><th scope="row">${esc(employees)}</th><td>${esc(price)}</td></tr>`).join('')}</tbody></table>${plan.note?`<small class="pricing-note">${esc(plan.note)}</small>`:''}<button class="pricing-cta" data-open-form>Попробовать бесплатно</button></div></div></article>`;
 }).join('')}</div>`;
}
function setPricingCard(card,expanded){
 for(const item of $$('.pricing-card',card.closest('.pricing-grid'))){
  if(item!==card&&!expanded)continue;
  const active=item===card&&expanded;item.classList.toggle('is-expanded',active);
  $('[data-pricing-toggle]',item).setAttribute('aria-expanded',active);$('[data-pricing-overview]',item).hidden=active;$('[data-pricing-details]',item).hidden=!active;
 }
}
function setupPricingCards(){
 const hover=matchMedia('(hover:hover) and (pointer:fine)');
 for(const card of $$('.pricing-card',stage)){
  card.addEventListener('pointerenter',e=>{if(hover.matches&&e.pointerType!=='touch')setPricingCard(card,true);});
  card.addEventListener('pointerleave',()=>{if(hover.matches&&!card.contains(document.activeElement))setPricingCard(card,false);});
  card.addEventListener('click',e=>{if(e.target.closest('a,button,input,select')&&!e.target.closest('[data-pricing-toggle]'))return;setPricingCard(card,!card.classList.contains('is-expanded'));});
  card.addEventListener('focusout',e=>{if(!card.contains(e.relatedTarget)&&!(hover.matches&&card.matches(':hover')))setPricingCard(card,false);});
  card.addEventListener('keydown',e=>{if(e.key==='Escape'&&card.classList.contains('is-expanded')){e.preventDefault();e.stopPropagation();setPricingCard(card,false);$('[data-pricing-toggle]',card).focus({preventScroll:true});}});
 }
}
function customHtml(id){
 if(id==='21')return `<h1>Зачем вам нужна CRM?</h1><div class="title-rule"></div><p class="lead">Автоматизация работы агентства недвижимости на основе Real Estate CRM</p>${content.why.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}<div class="icon-features">${content.why.features.map(f=>`<div class="icon-feature"><img src="${esc(f.image)}" alt=""><span>${esc(f.text)}</span></div>`).join('')}</div><p>Наконец, риелтор может избавиться от рутины и посвятить свое время тому, чего за него не сделает ни одна программа — человеческому общению с клиентами.</p>`;
 if(id==='24')return casesHtml();
 if(id==='41')return videosHtml();
 if(id==='42')return reviewsHtml();
 if(id==='43')return `<h1>Более 3000 риэлторов используют<br>ReCRM ежедневно в своей работе</h1><div class="title-rule"></div><strong class="map-year">2020</strong><img src="./assets/client-map.svg" alt="География клиентов RECRM по всей России" class="client-map"><input class="map-slider" type="range" min="2012" max="2020" value="2020" aria-label="Год на карте клиентов">`;
 if(id==='51')return supportHtml();if(id==='61')return blogHtml();if(articleIds.has(id))return articleHtml(id);return '';
}
function featuresListHtml(){return `<ul class="features-list">${featureHighlights.map(text=>`<li><span>${esc(text)}</span></li>`).join('')}</ul>`;}
function mobileHtml(id,desktop){
 if(id==='01')return `<h1>Помогаем получить максимум прибыли от сделок с недвижимостью</h1><p class="hero-description">RECRM.RU — это облачный сервис для руководителей и сотрудников агентства недвижимости, позволяющий работать легко, быстро и эффективно.</p><div class="mobile-hero-visual">${$('[data-name="VIS"]',desktop)?.outerHTML||''}</div><div class="hero-price">от <strong>345 ₽</strong><small>/мес. за сотрудника</small></div><button class="mobile-cta" data-open-form>Попробовать бесплатно →</button>`;
 if(id==='02')return `<h1>Ключевые возможности нашего продукта</h1><div class="features-mobile-visual"><img src="./assets/70364.png" alt="Интерфейс RECRM"><button data-overview aria-label="Смотреть видеообзор RECRM"><img src="./assets/777e8.svg" alt=""></button></div>${featuresListHtml()}`;
 if(id==='05')return `<h1>Топ-3 проблемы, которые мы решаем</h1>${$('.challenges-grid',desktop).outerHTML}`;
 if(id==='09')return `<h1>Настройка и запуск «под ключ»</h1>${$('.support-cards-grid',desktop).outerHTML}`;
 if(id==='23')return `<h1>Возможности Real Estate CRM</h1>${$('.capabilities-grid',desktop).outerHTML}`;
 if(id==='04'||id==='06'){
  const cards=$$('.feature-row',desktop).flatMap(row=>$$('.comparison-card',row).sort((a,b)=>Number(a.style.gridColumn)-Number(b.style.gridColumn)));
  const title=$$('[data-name="H1"] p',desktop).map(p=>{const copy=p.cloneNode(true);$$('br',copy).forEach(br=>br.replaceWith(' '));return copy.textContent.trim();}).join(' ');
  return `<h1>${esc(title)}</h1><div class="comparison-grid">${cards.map(card=>card.outerHTML).join('')}</div>`;
 }
 if(['21','24','41','42','43','51','61'].includes(id)||articleIds.has(id))return customHtml(id);
 if(id==='22')return problemHtml(true);
 if(id==='31')return `<h1>Сколько это стоит?</h1><p>${esc(content.pricing.caption)}</p>${pricingHtml('mobile')}`;
 if(id==='10'){
  const title=$('[data-name="H1"] p',desktop).textContent,intro=$('.section-lead',desktop),description=$$('p',desktop).find(p=>p.textContent.startsWith('Нами разработано'));
  return `<h1>${esc(title)}</h1><p class="section-lead">${esc(intro.textContent)}</p><img class="mobile-image" src="./assets/99c59.png" alt="Команда Site-Mechanics"><p>${esc(description.textContent)}</p>`;
 }
 const mainImage={'07':'a900d.png','10':'99c59.png'}[id];
 const seen=new Set();const paragraphs=$$('p',desktop).map(n=>n.textContent.trim()).filter(t=>t&&t!=='​'&&!seen.has(t)&&seen.add(t));
 const title=paragraphs.shift()||definitions.find(d=>d[0]===id)?.[1];
 if(id==='03'){
  const cards=$$('[data-name^="feedback"]',desktop);return `<h1>Почему мы?</h1><p>Мы оцифровываем агентства недвижимости с 2012 года.</p>${cards.map(c=>`<article class="mobile-card">${$$('img',c).filter(n=>/939bd|eece3|5a121/.test(n.src)).map(n=>`<img src="${esc(n.getAttribute('src'))}" alt="Логотип клиента">`).join('')}${$$('p',c).map(n=>`<p>${esc(n.textContent)}</p>`).join('')}</article>`).join('')}`;
 }
 if(id==='08')return `<h1>Выгрузка на площадки</h1><p>Автоматизированная отправка объявлений на профильные интернет-площадки экономит рабочее время сотрудников агентства.</p><div class="mobile-logos">${['c6ebe.svg','7de75.svg','c463d.svg','e6077.svg','2966d.png'].map(s=>`<img src="./assets/${s}" alt="Рекламная площадка">`).join('')}</div>`;
 return `<h1>${esc(title)}</h1>${mainImage?`<img class="mobile-image" src="./assets/${mainImage}" alt="Интерфейс RECRM">`:''}${paragraphs.map(t=>`<p style="margin-bottom:16px">${esc(t)}</p>`).join('')}`;
}
function problemHtml(mobile=false){
 const prefix=mobile?'problem-mobile':'problem-desktop';
 return `<section class="problem-carousel" role="region" aria-roledescription="карусель" aria-label="Real Estate CRM решает вопросы"><h2>Real Estate CRM решает вопросы</h2><div class="problem-controls"><div class="problem-tabs" role="group" aria-label="Выбрать слайд">${content.problems.map((p,i)=>`<button data-problem="${i}" class="${problemIndex===i?'active':''}" aria-label="${esc(p.title)}" aria-controls="${prefix}-${i}" aria-pressed="${problemIndex===i}"></button>`).join('')}</div><button class="problem-toggle" data-problem-toggle aria-label="${problemPaused?'Включить автоматическую смену слайдов':'Приостановить смену слайдов'}" aria-pressed="${problemPaused}"><span aria-hidden="true">${problemPaused?'▶':'Ⅱ'}</span></button></div><div class="problem-slides" aria-live="off">${content.problems.map((p,i)=>`<article class="problem-slide" id="${prefix}-${i}" data-problem-slide="${i}" role="group" aria-roledescription="слайд" aria-label="${i+1} из ${content.problems.length}" ${problemIndex===i?'':'hidden inert'}><div class="problem-copy"><h1>${esc(p.title)}</h1><div class="title-rule"></div><p>${esc(p.text)}</p></div><img class="problem-visual" src="${esc(p.image)}" alt="${esc(p.title)}" draggable="false"></article>`).join('')}</div><span class="problem-status sr-only" role="status"></span></section>`;
}
function restartProblemPlayback(){
 clearTimeout(problemTimer);problemTimer=0;
 const carousels=$$('.problem-carousel',stage),playing=current==='22'&&!problemPaused&&!problemFocusPaused&&!menuOpen&&!document.hidden&&!$('dialog[open]');
 for(const carousel of carousels){
  carousel.classList.remove('is-playing');
  const toggle=$('[data-problem-toggle]',carousel);toggle.setAttribute('aria-pressed',problemPaused);toggle.setAttribute('aria-label',problemPaused?'Включить автоматическую смену слайдов':'Приостановить смену слайдов');toggle.firstElementChild.textContent=problemPaused?'▶':'Ⅱ';
  if(playing){void carousel.offsetWidth;carousel.classList.add('is-playing');}
 }
 if(playing&&carousels.length)problemTimer=setTimeout(()=>setProblem(problemIndex+1,false),problemDelay);
 if(carousels.length)i18n.apply(stage);
}
function setProblem(index,announce=true){
 const changed=problemIndex!==(index+content.problems.length)%content.problems.length;
 problemIndex=(index+content.problems.length)%content.problems.length;
 for(const carousel of $$('.problem-carousel',stage)){
  for(const panel of $$('[data-problem-slide]',carousel)){
   const active=Number(panel.dataset.problemSlide)===problemIndex;panel.hidden=!active;panel.inert=!active;panel.classList.remove('problem-enter');
   if(active&&changed){void panel.offsetWidth;panel.classList.add('problem-enter');}
  }
  for(const tab of $$('[data-problem]',carousel)){const active=Number(tab.dataset.problem)===problemIndex;tab.classList.toggle('active',active);tab.setAttribute('aria-pressed',active);}
  $('.problem-status',carousel).textContent=announce?content.problems[problemIndex].title:'';
 }
 restartProblemPlayback();
}
function setupProblemCarousel(){
 for(const carousel of $$('.problem-carousel',stage)){
  $$('[data-problem]',carousel).forEach(tab=>tab.onclick=()=>setProblem(Number(tab.dataset.problem)));
  $('[data-problem-toggle]',carousel).onclick=()=>{problemPaused=!problemPaused;problemFocusPaused=false;restartProblemPlayback();};
  carousel.addEventListener('focusin',e=>{if(!e.target.closest('[data-problem-toggle]')){problemFocusPaused=true;restartProblemPlayback();}});
  carousel.addEventListener('focusout',e=>{if(!carousel.contains(e.relatedTarget)){problemFocusPaused=false;restartProblemPlayback();}});
  carousel.addEventListener('keydown',e=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
   e.preventDefault();e.stopPropagation();setProblem(e.key==='Home'?0:e.key==='End'?content.problems.length-1:problemIndex+(e.key==='ArrowRight'?1:-1));
  });
  let start=null;
  carousel.addEventListener('pointerdown',e=>{if(e.isPrimary&&e.button===0&&!e.target.closest('button,a,input'))start={x:e.clientX,y:e.clientY};});
  carousel.addEventListener('pointercancel',()=>{start=null;});
  carousel.addEventListener('pointerup',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.3)setProblem(problemIndex+(dx<0?1:-1));});
 }
 restartProblemPlayback();
}
function formHtml(){return `<div class="form-content"><h1>Хочу попробовать<br>Real Estate CRM в деле</h1><div class="title-rule"></div><form id="trialForm" class="trial-form"><label for="name">Как к вам обращаться?<input name="name" id="name" autocomplete="name" placeholder="Ваше имя" required minlength="2" value="${esc(formValues.name)}"></label><label class="sr-only" for="email">Электронная почта</label><input type="email" id="email" name="email" placeholder="Электронная почта" autocomplete="email" required value="${esc(formValues.email)}"><label for="phone"><span class="sr-only">Телефон для связи с вами</span><input type="tel" inputmode="tel" id="phone" name="phone" placeholder="Телефон для связи с вами" autocomplete="tel" required value="${esc(formValues.phone)}"><small>Только цифры, от 10 до 15</small></label><button class="submit-button" type="submit">ОТПРАВИТЬ</button></form><p class="form-policy">Регистрируясь, вы соглашаетесь с <a href="#legal-terms" data-legal="terms">Условиями использования</a> и <a href="#legal-privacy" data-legal="privacy">Политикой конфиденциальности</a></p><p class="form-note">Демонстрационная форма прототипа. Данные не отправляются.</p></div>`;}
function wire(){
 $$('[data-support-link]',stage).forEach(n=>action(n,()=>go('51')));
 $$('[data-faq]',stage).forEach(b=>b.onclick=()=>{const g=content.faq[Number(b.dataset.faq)];openMedia('<h2>'+esc(g.title)+'</h2><div class="faq-modal">'+g.items.map(i=>'<h3>'+esc(i.question)+'</h3><p>'+esc(i.answer)+'</p>').join('')+'</div>');});

 $$('[data-legal]',stage).forEach(a=>a.onclick=e=>{e.preventDefault();openMedia('<h2>'+ (a.dataset.legal==='privacy'?'Политика конфиденциальности':'Условия использования')+'</h2><p>'+esc(content.legal)+'</p><p style="margin-top:20px">Демонстрационный прототип. Форма не передаёт и не сохраняет данные на сервере.</p><p><a href="https://recrm.ru/" target="_blank" rel="noopener">Действующие условия на сайте RECRM ↗</a></p>');});
 $$('[data-open-form]').forEach(n=>n.onclick=e=>{e.preventDefault();if(menuOpen)setMenu(false);go('form');});
 $$('[data-video]',stage).forEach(n=>n.onclick=()=>{const v=content.videos[Number(n.dataset.video)];showVideo(v.url,v.title);});
 $$('[data-office]',stage).forEach(n=>n.onclick=()=>{const v=content.offices[Number(n.dataset.office)];picture(v.image,v.title);});
 $$('[data-letter]',stage).forEach(n=>n.onclick=()=>{const r=content.reviews[Number(n.dataset.letter)];picture(r.images[r.images.length-1],'Отзыв клиента RECRM');});
 if(current==='22')setupProblemCarousel();
 if(current==='31')setupPricingCards();
 $$('[data-overview]',stage).forEach(n=>n.onclick=()=>showVideo('https://www.youtube.com/embed/iy-JT9-9Grw','Обзор RECRM'));
 $$('.case-list details',stage).forEach(n=>n.addEventListener('toggle',()=>{if(n.open)$$('.case-list details',n.parentElement).forEach(s=>{if(s!==n)s.open=false;});}));
 const map=$('.map-slider',stage);if(map)map.oninput=()=>{$('.map-year',stage).textContent=map.value;};
 const form=$('#trialForm');if(form){
  form.oninput=()=>{formValues=Object.fromEntries(new FormData(form));$$('input',form).forEach(input=>input.setCustomValidity(''));};
  form.onsubmit=e=>{e.preventDefault();const phone=$('#phone'),digits=phone.value.replace(/\D/g,'');if(digits.length<10||digits.length>15||!/^[+0-9 ()-]+$/.test(phone.value)){phone.setCustomValidity(i18n.text('Укажите номер телефона: от 10 до 15 цифр'));phone.reportValidity();return;}const el=$('.form-content');el.innerHTML=`<h1>Спасибо, <span data-i18n-ignore>${esc(formValues.name)}</span>!</h1><div class="title-rule"></div><div class="form-success" role="status"><h2>Форма заполнена</h2><p>Это демонстрация отправки заявки. Данные остались только в открытой вкладке и не передавались на сервер.</p><p>Для получения демо-доступа напишите <a href="mailto:sales@recrm.ru">sales@recrm.ru</a>.</p><button class="submit-button" id="backFromSuccess">Вернуться к сайту</button></div>`;$('#backFromSuccess').onclick=()=>go(previous);i18n.apply(el);};
 }
}
function render(id,animate=true){
 clearTimeout(problemTimer);problemTimer=0;problemFocusPaused=false;
 if(!routes.some(d=>d[0]===id)&&id!=='form')id='01';
 $$('#screen > .transition-out').forEach(n=>n.remove());
 const last=current;
 if(animate&&stage.children.length&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
  const old=stage.cloneNode(true);old.id='';old.className='transition-out '+(routes.findIndex(d=>d[0]===id)<routes.findIndex(d=>d[0]===last)?'screen-exit-up':'screen-exit-down');old.inert=true;old.setAttribute('aria-hidden','true');screen.append(old);setTimeout(()=>old.remove(),700);
 }
 current=id;if(menuOpen)setMenu(false);
 const blue=bluePages.has(id);document.body.classList.toggle('is-blue',blue);$('#backdrop').style.background=blue?'#368cfb':'white';
 document.body.dataset.screen=id;
 $('.trial').hidden=id==='form';$('#closeForm').hidden=id!=='form';$('.screen-controls').hidden=id==='form'||articleIds.has(id);
 stage.innerHTML='';
 if(id==='form'){const wrapper=document.createElement('div');wrapper.innerHTML=formHtml();stage.append(wrapper);}else{
  let desktop;if(id==='22'){desktop=template(`<div class="design-screen desktop-layout" style="background:#368cfb">${problemHtml()}</div>`);}else if(screens[id]&&id!=='24')desktop=sourceScreen(id);else desktop=template(`<div class="design-screen desktop-layout"><section class="custom-screen ${blue?'blue':''}">${customHtml(id)}</section></div>`);
  stage.append(desktop);const mobile=document.createElement('div');mobile.className='mobile-layout';mobile.innerHTML=mobileHtml(id,desktop);stage.append(mobile);
 }
 if(animate&&!matchMedia('(prefers-reduced-motion:reduce)').matches){stage.classList.remove('stage-in-down','stage-in-up');void stage.offsetWidth;stage.classList.add(routes.findIndex(d=>d[0]===id)<routes.findIndex(d=>d[0]===last)?'stage-in-up':'stage-in-down');}
 $('#next').setAttribute('aria-label','Следующий экран');
 const group=id==='form'?'form':id==='10'?'10':id.startsWith('0')?'01':id[0]==='2'?'21':id==='31'?'31':id[0]==='4'?'41':id==='51'?'51':'61';
 $$('.menu-links a').forEach(a=>{const active=a.hash===routeHash(group);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 const title=id==='form'?'Попробовать бесплатно':routes.find(d=>d[0]===id)[1];document.title=`${title} — RECRM`;$('#announcer').textContent=title;resize();wire();i18n.apply();
}
function fieldError(input){
 const validity=input.validity;
 if(validity.valueMissing)return {name:'Введите ваше имя.',email:'Введите адрес электронной почты.',phone:'Введите номер телефона.'}[input.name]||'';
 if(input.name==='name'&&input.value.trim().length<2)return 'Имя должно содержать не менее 2 символов.';
 if(input.name==='email'&&validity.typeMismatch)return 'Укажите корректный адрес электронной почты.';
 if(input.name==='phone'&&(input.value.replace(/\D/g,'').length<10||input.value.replace(/\D/g,'').length>15||!/^[+0-9 ()-]+$/.test(input.value)))return 'Укажите номер телефона: от 10 до 15 цифр';
 return '';
}
document.addEventListener('invalid',e=>{if(e.target.closest('#trialForm')){e.target.setCustomValidity('');e.target.setCustomValidity(i18n.text(fieldError(e.target)));}},true);
document.addEventListener('recrm:locale-change',()=>{$$('#trialForm input').forEach(input=>{if(input.validity.customError){input.setCustomValidity('');input.setCustomValidity(i18n.text(fieldError(input)));}});});
$$('.menu-links a,.menu-actions a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('pointerdown',e=>{if(current==='31'&&!e.target.closest('.pricing-card'))$$('.pricing-card.is-expanded',stage).forEach(card=>setPricingCard(card,false));});
$('.skip-link').onclick=e=>{e.preventDefault();screen.focus();};
$('#menuToggle').onclick=()=>setMenu(!menuOpen);$('#menuShade').onclick=()=>setMenu(false);
$('#closeForm').onclick=()=>go(previous);$('#next').onclick=()=>move(1);
$$('.dialog-close').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('#media').addEventListener('close',()=>{$('#mediaContent').replaceChildren();restartProblemPlayback();});
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close();}));
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){if(e.target.tagName==='SELECT')return;if(menuOpen)setMenu(false);else if(current==='form')go(previous);return;}
 if(menuOpen&&e.key==='Tab'){const focus=[$('#menuToggle'),...$$('a,button',$('#menu'))];const first=focus[0],last=focus.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}return;}
 if(menuOpen||articleIds.has(current)||$('dialog[open]')||/INPUT|TEXTAREA|SELECT|SUMMARY/.test(e.target.tagName)||(e.key===' '&&e.target.closest('button,a,details')))return;
 if(['ArrowDown','PageDown',' '].includes(e.key)){e.preventDefault();move(1);}if(['ArrowUp','PageUp'].includes(e.key)){e.preventDefault();move(-1);}if(e.key==='Home'){e.preventDefault();go('01');}if(e.key==='End'){e.preventDefault();go(definitions.at(-1)[0]);}
});
let wheelSum=0,wheelTime=0;
addEventListener('wheel',e=>{
 if(menuOpen||articleIds.has(current)||$('dialog[open]')||e.target.closest('input,textarea,select')||e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
 const scrollables='.mobile-layout,.form-content,.case-list,.case-content,.article-text,.faq-list,.blog-layout';
 for(let scroller=e.target.closest(scrollables);scroller;scroller=scroller.parentElement?.closest(scrollables)){
  if(scroller.scrollHeight>scroller.clientHeight+3){const down=e.deltaY>0;if((down&&scroller.scrollTop+scroller.clientHeight<scroller.scrollHeight-3)||(!down&&scroller.scrollTop>3))return;}
 }
 e.preventDefault();const now=Date.now();if(navigationLocked)return;if(now-wheelTime>180)wheelSum=0;wheelTime=now;wheelSum+=e.deltaY;if(Math.abs(wheelSum)>55){navigationLocked=true;move(wheelSum>0?1:-1);wheelSum=0;setTimeout(()=>navigationLocked=false,850);}
},{passive:false});
let touchStart=null;
screen.addEventListener('touchstart',e=>{touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY,target:e.target};},{passive:true});
screen.addEventListener('touchend',e=>{if(!touchStart||menuOpen||articleIds.has(current)||touchStart.target.closest('input,textarea,select'))return;const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;const scroller=touchStart.target.closest('.mobile-layout,.form-content');if(scroller&&scroller.scrollHeight>scroller.clientHeight+3&&((dy<0&&scroller.scrollTop+scroller.clientHeight<scroller.scrollHeight-3)||(dy>0&&scroller.scrollTop>3)))return;if(Math.abs(dy)>65&&Math.abs(dy)>Math.abs(dx)*1.3)move(dy<0?1:-1);touchStart=null;},{passive:true});
addEventListener('resize',resize);addEventListener('hashchange',()=>syncRoute());
document.addEventListener('visibilitychange',restartProblemPlayback);
const localizationReady=createLocalization().then(instance=>{i18n=instance;window.recrmI18n=instance;});
try{[screens,content]=await Promise.all([...['./screens.json','./content.json?v=27'].map(async url=>{const r=await fetch(url);if(!r.ok)throw Error(url);return r.json();}),localizationReady]);syncRoute(false);}catch(error){console.error(error);await localizationReady.catch(()=>{});$('#loadError').hidden=false;i18n.apply($('#loadError'));}
