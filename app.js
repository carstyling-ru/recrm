import {createLocalization} from './i18n.js?v=53';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const comparisonCountTimers=new WeakMap();
const comparisonStatTimers=new WeakMap();
const comparisonModeTimers=new WeakMap();
function setComparisonRunMode(card,active){
 const start=$('.comparison-start-button',card),stop=$('.comparison-stop-button',card);
 if(!start||!stop)return;
 const apply=(button,on)=>{button.style.backgroundColor=on?'#568fe1':'#fff';button.style.borderColor='#568fe1';const label=$('p',button);if(label)label.style.color=on?'#fff':'#568fe1';};
 apply(start,active);apply(stop,!active);
}
function localizeComparisonCountUnits(root=document){
 const units={ru:['Просмотров','Кликов'],en:['Views','Clicks'],ka:['ნახვა','დაწკაპუნება']}[i18n.locale]||['Просмотров','Кликов'];
 $$('.comparison-view-unit',root).forEach(node=>node.textContent=units[0]);
 $$('.comparison-click-unit',root).forEach(node=>node.textContent=units[1]);
}
function applyMobileAppProductImages(root=document){
 const useEnglish=['en','ka'].includes(i18n.locale),desktopImage=useEnglish?'./assets/mobile-app-desktop-en.webp':'./assets/mobile-app-desktop-ru.webp',phoneImage=useEnglish?'./assets/mobile-app-phone-en.webp':'./assets/30bfe.png';
 $$('[data-name="slide-4_1"] img,.mobile-app-desktop',root).forEach(image=>{if(image.getAttribute('src')!==desktopImage)image.setAttribute('src',desktopImage);});
 $$('[data-name="slide-4_2"] img,.mobile-app-phone img',root).forEach(image=>{if(image.getAttribute('src')!==phoneImage)image.setAttribute('src',phoneImage);});
}
const definitions=[
 ['01','Помогаем получить максимум прибыли','intro'],
 ['02','Ключевые возможности','features'],
 ['07','Мобильные приложения','mobile-app'],
 ['04','Преимущества перед универсальными CRM','crm-comparison'],
 ['05','Проблемы, которые мы решаем','challenges'],
 ['06','Преимущества RECRM','benefits'],
 ['03','Почему мы?','why-us'],
 ['08','Выгрузка на площадки','advertising'],
 ['21','Зачем вам нужна CRM?','why-crm'],
 ['22','Как это работает?','how-it-works'],
 ['23','Возможности RECRM','capabilities'],
 ['24','Бизнес-кейсы','case-studies'],
 ['09','Настройка и запуск','onboarding'],
 ['31','Сколько это стоит?','pricing'],
 ['10','О разработчике','about'],
 ['41','Видео и фотографии клиентов','customers'],
 ['42','Отзывы наших клиентов','reviews'],
 ['43','География клиентов','geography'],
 ['51','Поддержка','support'],
 ['61','Полезные статьи','blog'],
 ['form','Попробовать бесплатно','free-trial']
];
// Remove a slug from this set to restore the screen to sequential navigation.
const sequenceExcluded=new Set(['advertising','customers','reviews','geography','support']);
const articleRoutes=[
 ['62','Главное мобильное приложение риэлтора','mobile-crm-guide'],
 ['63','Для чего нужна воронка продаж в риэлторском бизнесе','sales-funnel'],
 ['64','Конкурентные преимущества при использовании RECRM','competitive-advantages'],
 ['65','Выбираем CRM-систему','choosing-crm']
];
const routes=[...definitions,...articleRoutes];
const articleIds=new Set(articleRoutes.map(([id])=>id));
const featureHighlights=[
 'Настраиваемые воронки продаж. Набор риэлторских воронок;',
 'Выгрузка рекламы на ведущие площадки и собственный веб-сайт;',
 'Планировщик риэлтора: звонки, встречи, показы;',
 'Совместные сделки, автоподбор объектов и заявок;',
 'Постоянный поток собственников из интернета;',
 'API для обмена информацией с внешними продуктами;',
 'Интеграция с телефонией.'
];
const bluePages=new Set(['01','03','05','07','22','41','43','form']);
let screens={},content={},current='01',previous='01',navigationLocked=false,menuOpen=false,problemIndex=0;
let mobileDocumentMode='none',mobilePageIds=[],mobileScrollFrame=0,layoutMode='',pageThemeTimer=0,mobileThemeTimer=0;
let i18n={apply(){},text(value){return value;}};
const problemDelay=5000;
let problemTimer=0,problemPaused=matchMedia('(prefers-reduced-motion:reduce)').matches,problemFocusPaused=false;
let formValues={name:'',email:'',phone:''};
const stage=$('#stage'),screen=$('#screen');
const mobileBreakpoint=1024;
const template=s=>{const t=document.createElement('template');t.innerHTML=s;return t.content.firstElementChild;};
function resize(){
 const mobile=innerWidth<=mobileBreakpoint,s=mobile?1:Math.min(innerHeight/1158,innerWidth/1440);
 document.documentElement.style.setProperty('--scale',s);
 document.documentElement.style.setProperty('--rail',mobile?'52px':`${100*s}px`);
 document.documentElement.style.setProperty('--hero-mobile-scale',Math.min((innerWidth-92)/701,.6));
 document.documentElement.style.setProperty('--comparison-scale',Math.min((innerWidth-98)/521,1));
 document.documentElement.style.setProperty('--challenge-scale',Math.min((innerWidth-98)/380,1));
 document.documentElement.style.setProperty('--onboarding-scale',Math.min((innerWidth-98)/380,1));
 stage.style.width=mobile?'100%':`${innerWidth/s}px`;
 $$('.developer-gallery',stage).forEach(syncDeveloperGallery);
 $$('.mobile-testimonials',stage).forEach(syncTestimonialsCarousel);
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
 if(mobileDocumentMode==='sequence'){
  const index=mobilePageIds.indexOf(current),target=mobilePageIds[index+delta];
  if(target)go(target);
  return;
 }
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
function contactHtml(){return `<section class="contact-modal"><h2>Свяжитесь с нами</h2><p>Поможем разобраться в возможностях RECRM и начать работу.</p><div class="contact-modal__links"><a href="https://t.me/sitemech?text=Хочу получить демо-доступ в RECRM" target="_blank" rel="noopener">Telegram</a><a href="mailto:support@recrm.online">support@recrm.online</a><a href="tel:+74997537723">+7 (499) 753-77-23</a></div><p class="contact-modal__hours">В рабочие дни с 9:00 до 17:00 (UTC+3).</p></section>`;}
function showVideo(url,title){openMedia(`<h2>${esc(title)}</h2><iframe src="${esc(url)}?rel=0" title="${esc(title)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`);}
function picture(src,title){openMedia(`<h2>${esc(title)}</h2><img src="${esc(src)}" alt="${esc(title)}">`);}
function setupComparisonIllustrations(root){
 const start=$('[data-name="btn / left"]',root),stop=$('[data-name="btn / right"]',root),segments=document.createElement('div');
 segments.className='comparison-segmented comparison-animation-step comparison-animation-step--1';start.classList.add('comparison-start-button');stop.classList.add('comparison-stop-button');start.before(segments);segments.append(start,stop);setComparisonRunMode(segments.parentElement,false);
 const title=$$('p',root).find(p=>p.textContent.trim()==='Автоподбор'),toggle=$('[data-name="toggler / yes"]',title.parentElement),matching=document.createElement('div');
 $('[data-name="Adv3"]',root).classList.add('comparison-matching-animation');
 matching.className='comparison-matching-toggle';title.classList.add('comparison-matching-title');toggle.before(matching);matching.append(toggle,title);
 const label=$$('p',root).find(p=>p.textContent.trim()==='Заявка 2-ком квартира – Варианты').parentElement,counter=$('[data-name="counter / variants"]',root),matches=document.createElement('div');
 matches.className='comparison-matches';label.classList.add('comparison-matches-label','comparison-match-step','comparison-match-step--2');counter.classList.add('comparison-counter');label.before(matches);matches.append(label,counter);
 const counterNumber=document.createElement('span');counterNumber.className='comparison-counter-number';counter.append(counterNumber);
 const toggleImage=$('img',toggle);if(toggleImage)toggleImage.src='./assets/8c37c.svg';
 const toggleOn=document.createElement('img');toggleOn.src='./assets/e9d96.svg';toggleOn.alt='';toggleOn.className='comparison-matching-toggle-on';toggle.append(toggleOn);toggle.classList.add('comparison-match-toggle');
 title.classList.add('comparison-match-step','comparison-match-step--1');
 $$('p',root).find(p=>p.textContent.trim()==='32 000 000 ₽').classList.add('comparison-property-price');
 const card=$('[data-name="Adv1"]',root);card?.classList.add('comparison-animation-card');
 const warning=$('img[src*="0f0dc.svg"]',card)?.parentElement,platform=$$('p',card).find(p=>p.textContent.trim()==='Рекламное объявление')?.parentElement;
 [warning,platform].forEach(node=>node?.classList.add('comparison-animation-step','comparison-animation-step--2'));
 warning?.classList.add('comparison-advertisement-warning');platform?.classList.add('comparison-advertisement-label');
 if(warning&&platform){const heading=document.createElement('div');heading.className='comparison-advertisement-heading';warning.before(heading);heading.append(warning,platform);}
 const clicks=$$('p',card).find(p=>p.textContent.trim()==='1435 / 21');
 const countNode=clicks?.parentElement,linkIcon=$('img[src*="c66d5.svg"]',card)?.parentElement;
 if(clicks){clicks.setAttribute('data-i18n-ignore','');clicks.innerHTML='<span class="comparison-view-count">1426</span> <span class="comparison-view-unit">Просмотров</span> / <span class="comparison-click-count">16</span> <span class="comparison-click-unit">Кликов</span>';clicks.classList.add('comparison-mobile-large');countNode.classList.add('comparison-animation-step','comparison-animation-step--3','comparison-advertisement-count');localizeComparisonCountUnits(countNode);}
 linkIcon?.classList.add('comparison-animation-step','comparison-animation-step--3','comparison-advertisement-count-icon');
 if(countNode&&linkIcon){const stats=document.createElement('div');stats.className='comparison-advertisement-stats';linkIcon.before(stats);stats.append(linkIcon,countNode);}

 const sources=$('[data-name="Adv2"]',root),sourceFirst=$$('p',sources).find(p=>p.textContent.trim()==='Внутренняя база'),sourceLabels=sourceFirst?.parentElement;
 sources.classList.add('comparison-sources-animation');
 if(sourceLabels){sourceLabels.classList.add('comparison-sources-labels');$$('p',sourceLabels).filter(p=>p.textContent.replaceAll('\u200b','').trim()).forEach((p,index)=>p.classList.add('comparison-source-row',`comparison-source-row--${index+1}`));}
 $$('[data-name="icn / check"]',sources).forEach((check,index)=>check.classList.add('comparison-source-check',`comparison-source-check--${index+1}`));
 $('[data-name="draw-polygon-solid 2"]',sources)?.classList.add('comparison-source-polygon');
 $('[data-name="icn / map-marker"]',sources)?.classList.add('comparison-source-map-marker');
 $('[data-name="icn / search-solid"]',sources)?.classList.add('comparison-source-search');
 $('[data-name="icn / caret-down-solid"]',sources)?.classList.add('comparison-source-caret');

 const sendCard=$('[data-name="Adv4"]',root),sendText=$$('p',sendCard).find(p=>p.textContent.trim()==='Отправить');
 const sendButton=$('[data-name="btn / blue"]',sendCard),checkBox=$('[data-name="checkbox"]',sendCard),checkMark=$('[data-name="icn / check"]',checkBox),pdf=$$('[data-name="Vector"]',sendCard).find(node=>node.querySelector('img'));
 sendCard?.classList.add('comparison-send-animation');
 sendText?.classList.add('comparison-send-label');sendButton?.classList.add('comparison-send-button');
 if(sendText)sendText.style.color='#929292';const sendNormal=$('[data-name="btn / normal"]',sendButton);if(sendNormal)sendNormal.style.borderColor='#bdbdbd';
 checkBox?.classList.add('comparison-send-checkbox');checkMark?.classList.add('comparison-send-check');pdf?.classList.add('comparison-send-pdf');
 for(const paragraph of $$('p',sendCard).filter(p=>p.textContent.trim().startsWith('Объект 54321')||p.textContent.trim().startsWith('154,2 м²')||p.textContent.trim()==='32 000 000 ₽'))paragraph.classList.add('comparison-send-property');
}
function preserveComparisonMobileText(root){
 const labels=new Set(['Рекламное объявление','Заявка 2-ком квартира – Варианты','Внутренняя база','База партнеров','Интернет','Объект 54321 — Офис /','154,2 м² / ул. Гоголя, 60 /','32 000 000 ₽','Этажей в здании','Этаж','Последний этаж','Интеграция с','Облачной АТС','1435 Просмотров / 21 Кликов']);
 for(const p of $$('p',root))if(labels.has(p.textContent.trim()))p.classList.add('comparison-mobile-large');
}
function playComparisonAnimation(root=stage){
 const card=$('.comparison-animation-card',root);if(!card)return;
 const matching=$('[data-name="Adv3"]',root),sources=$('[data-name="Adv2"]',root),send=$('[data-name="Adv4"]',root);
 const counter=$('.comparison-counter',root),number=$('.comparison-counter-number',counter);
 const statsCard=$('[data-name="Adv1"]',root),views=$('.comparison-view-count',statsCard),clicks=$('.comparison-click-count',statsCard);
 for(const [timers,key] of [[comparisonCountTimers,counter],[comparisonStatTimers,statsCard],[comparisonModeTimers,card]]){const timer=timers.get(key);if(timer)clearTimeout(timer);timers.delete(key);}
 if(counter){number.textContent='';counter.classList.remove('is-counting');}
 setComparisonRunMode(card,false);
 [card,matching,sources,send].filter(Boolean).forEach(node=>node.classList.remove('is-animating'));
 void card.offsetWidth;
 [card,matching,sources,send].filter(Boolean).forEach(node=>node.classList.add('is-animating'));
 if(counter&&number){counter.classList.add('is-counting');const groupDelay=(parseFloat(getComputedStyle(matching).getPropertyValue('--comparison-sequence-delay'))||0)*1000;const timer=setTimeout(()=>{let value=1;number.textContent=String(value);const tick=()=>{if(value>=9)return;value++;number.textContent=String(value);comparisonCountTimers.set(counter,setTimeout(tick,90));};comparisonCountTimers.set(counter,setTimeout(tick,90));},groupDelay+1500);comparisonCountTimers.set(counter,timer);}
 if(views&&clicks){views.textContent='1426';clicks.textContent='16';const timer=setTimeout(()=>{let step=0;const tick=()=>{step++;views.textContent=String(1426+step);clicks.textContent=String(Math.round(16+5*step/9));if(step<9)comparisonStatTimers.set(statsCard,setTimeout(tick,75));};tick();},1750);comparisonStatTimers.set(statsCard,timer);}
 const switchTimer=setTimeout(()=>setComparisonRunMode(card,true),1100);comparisonModeTimers.set(card,switchTimer);
}
function setupBenefitsAnimations(root){
 const phoneCard=$('[data-name="Adv1"]',root),phoneVisual=$('[data-name="CURRENCY"]',phoneCard)?.parentElement,prefixTable=$('[data-name="PHONES"]',phoneCard);
 if(phoneVisual&&prefixTable){
  phoneCard.classList.add('benefits-phone-animation');
  prefixTable.classList.add('benefits-prefix-table');
  prefixTable.replaceChildren();
  const countries=[
   ['United Arab Emirates (\u202Bالإمارات العربية المتحدة\u202C\u200E)','+971','flag-uae.svg'],
   ['United Kingdom','+44','flag-uk.svg'],
   ['United States','+1','flag-usa.svg']
  ];
  for(const [index,[country,prefix,flag]] of countries.entries()){
   const row=document.createElement('div');row.className=`benefits-prefix-row benefits-prefix-row--${index+1}`;
   row.innerHTML=`<img src="./assets/${flag}" alt="" aria-hidden="true"><span class="benefits-country-name">${country}</span><span class="benefits-dial-code">${prefix}</span>`;
   prefixTable.append(row);
  }
  $('[data-name="language-solid 1"]',phoneVisual)?.classList.add('benefits-phone-language-icon');
  for(const [index,currencyName] of ['USD','EUR','RUB'].entries()){
   const currency=$(`[data-name="${currencyName}"]`,phoneVisual);if(!currency)continue;
   currency.classList.add('benefits-currency-option',`benefits-currency-option--${index+1}`);
   $$('p',currency).forEach(label=>label.classList.add('benefits-currency-label'));
   $('[data-name="checkbox"] img',currency)?.classList.add('benefits-currency-mark',`benefits-currency-mark--${index+1}`);
  }
 }
 const orderCard=$('[data-name="Adv3"]',root),orderVisual=$('[data-name="VIS"]',orderCard);
 if(orderVisual){
  orderCard.classList.add('benefits-order-animation');
  const labels=$$('p',orderVisual).filter(p=>['Этажей в здании','Этаж','Последний этаж'].includes(p.textContent.trim())).map(p=>p.parentElement);
  const toggles=$$('[data-name="toggler / yes"]',orderVisual).sort((a,b)=>parseFloat(a.style.top)-parseFloat(b.style.top));
  const colorRows=$$('[data-name="color-property-type"]',orderVisual).sort((a,b)=>parseFloat(a.style.top)-parseFloat(b.style.top));
  const ellipsis=$('[data-name="icn / ellipsis-v"]',orderVisual);
  const rows=[[labels[0],toggles[0],colorRows[0]],[labels[1],toggles[1],colorRows[1]],[labels[2],toggles[2],colorRows[2]]];
  for(const [index,row] of rows.entries())for(const element of row)element?.classList.add('benefits-order-row',`benefits-order-row--${index+1}`);
  ellipsis?.classList.add('benefits-order-ellipsis');
  for(const toggle of toggles){const image=$('img',toggle);if(image)image.src='./assets/8c37c.svg';}
  if(toggles[1]){const enabled=document.createElement('img');enabled.src='./assets/e9d96.svg';enabled.alt='';enabled.className='benefits-toggle-on';toggles[1].append(enabled);toggles[1].classList.add('benefits-middle-toggle');}
 }
 const taskCard=$('[data-name="Adv2"]',root),taskVisual=$('[data-name="VIS-7"]',taskCard);
 if(taskVisual){
  taskCard.classList.add('benefits-task-animation');
  const labels=$$('p',taskVisual).filter(p=>['Провести встречу','Подготовить агентский договор','Подписать агентский договор'].includes(p.textContent.trim()));
  const checkboxes=$$('[data-name="checkbox"]',taskVisual).sort((a,b)=>parseFloat(a.style.top)-parseFloat(b.style.top));
  for(const [index,label] of labels.entries()){
   const text=document.createElement('span');text.className='benefits-task-text';
   while(label.firstChild)text.append(label.firstChild);
   label.append(text);label.classList.add('benefits-task-label',`benefits-task-label--${index+1}`);
  }
  for(const [index,checkbox] of checkboxes.entries()){
   checkbox.style.opacity='1';checkbox.classList.add('benefits-task-checkbox',`benefits-task-checkbox--${index+1}`);
   $('img',checkbox)?.classList.add('benefits-task-mark',`benefits-task-mark--${index+1}`);
  }
 }
 const integrationCard=$('[data-name="Adv4"]',root),integrationVisual=$('[data-name="VIS"]',integrationCard);
 if(integrationVisual){
  integrationCard.classList.add('benefits-integrations-animation');
  const check=$('[data-name="checkbox"]',integrationVisual),key=$$('p',integrationVisual).find(p=>p.textContent.trim()==='c3c1ec1e-bc3d-4b1d-...');
  const integrationText=$$('p',integrationVisual).find(p=>p.textContent.trim()==='Облачной АТС')?.parentElement;
  check?.classList.add('benefits-integration-checkbox');$('img',check)?.classList.add('benefits-integration-mark');
  key?.classList.add('benefits-integration-key');integrationText?.classList.add('benefits-integration-text');
  $('[data-name="telegram-brands 1"]',integrationVisual)?.classList.add('benefits-integration-telegram');
  $('[data-name="bell-solid 1"]',integrationVisual)?.classList.add('benefits-integration-bell');
 }
}
function playBenefitsAnimation(root=stage){
 for(const card of $$('.benefits-order-animation,.benefits-task-animation,.benefits-integrations-animation',root)){
  card.classList.remove('is-animating');void card.offsetWidth;card.classList.add('is-animating');
 }
 const phoneCard=$('.benefits-phone-animation',root);
 if(phoneCard){phoneCard.classList.remove('is-animating');void phoneCard.offsetWidth;phoneCard.classList.add('is-animating');}
}
function sourceScreen(id){
 const root=template(screens[id]);root.className='design-screen desktop-layout';root.style.width='100%';root.style.height='1158px';
 for(const n of [...root.children]){const name=n.dataset.name||'';if(['HEADER','FOOTER','MENU'].includes(name)||n.style.width==='100px')n.remove();}
 root.querySelectorAll('[data-name="FOOTER"],[data-name="Carrot"]').forEach(n=>n.remove());
 if(id==='07')applyMobileAppProductImages(root);
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
  const intro=$('[data-name="01-INTRO"]',root);
  const copy=document.createElement('section');copy.className='hero-copy';
  copy.innerHTML=`<h1>Простая и эффективная CRM для агентств недвижимости</h1><div class="hero-rule"></div><p class="hero-description"><span>С 2012 года помогаем руководителям и сотрудникам агентств недвижимости получать максимум прибыли от сделок с недвижимостью. </span><span>Более 3000 риэлторов ежедневно используют RECRM в своей работе.</span></p><div class="hero-price"><span>от</span><strong>6 300 ₽</strong><span class="hero-price-meta"><small>/мес.</small><small>за всю компанию</small></span></div><button class="hero-cta hero-demo-button" data-open-form>Получить демо →</button>`;
  $$('[data-name="TITLE"],[data-name="PRICE"],[data-name="Try4free"]',intro).forEach(n=>n.remove());
  $('[data-name="VIS"]',intro).classList.add('hero-visual');intro.append(copy);
 }
 if(id==='31'){
  const cards=$$('div',root).filter(n=>n.style.height==='614px'&&n.style.width==='335px');
  cards.forEach(card=>card.remove());root.append(template(pricingHtml('desktop')));
 }

 if(id==='03'){
  const intro=$$('p',root).find(n=>n.textContent.startsWith('Мы оцифровываем агентства недвижимости'));if(intro)intro.style.left=$('[data-name="H1"]',root).style.left;
  const note=$$('p',root).find(n=>n.textContent.startsWith('Наш продукт разработан'));if(note)note.classList.add('testimonial-note');
  $$('[data-name^="feedback"]',root).forEach(card=>card.remove());
  const carousel=document.createElement('section');carousel.className='testimonial-carousel';carousel.setAttribute('aria-label','Отзывы клиентов');
  carousel.innerHTML=`<div class="reviews-grid">${content.testimonials.slice(0,3).map(testimonialCardHtml).join('')}</div>`;root.append(carousel);
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
 if(id==='04'||id==='06')preserveComparisonMobileText(root);
 if(id==='06')setupBenefitsAnimations(root);
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
    title.textContent='Полезные материалы';description.classList.add('onboarding-materials');
    const articles=['choosing-crm','competitive-advantages','sales-funnel','mobile-crm-guide'].map(slug=>content.articles.find(article=>article.slug===slug)).filter(Boolean);
    description.replaceChildren(template(`<div class="onboarding-material-links">${articles.map(article=>`<a href="#${esc(article.slug)}">${esc(article.title)}</a>`).join('')}</div>`));
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
  const [firstList,lastList]=grid.children;
  if(firstList&&lastList){
   for(const item of [...firstList.children].slice(0,4))lastList.append(item);
   for(const item of [...lastList.children].slice(0,5))firstList.append(item);
  }
  for(const child of [...section.children])if(child.style.fontSize==='0px')child.remove();
  const title=$(':scope > p',section);title.setAttribute('role','heading');title.setAttribute('aria-level','1');section.append(grid);
 }
 if(id==='10'){
  $$('img',root).filter(n=>/99c59|5c8ef/.test(n.src)).forEach(n=>n.parentElement.remove());
  $$('[data-name^="Scroll"],[data-name="SCROLL"],[data-name="scroll-bg"],[data-name="scroll-button"]',root).forEach(n=>n.remove());
  root.append(template(developerGalleryHtml()));
 }
 if(['03','08'].includes(id))setupSlider(root,id);
 if(id==='08')for(const p of $$('p',root))if(p.textContent.includes('Ознакомьтесь с подробным'))action(p,()=>openMedia(`<h2>Выгрузка объявлений на площадки</h2><p>Авито, Циан, Яндекс Недвижимость, Домклик, Юла, N1, МирКвартир и другие интернет-площадки.</p><p style="margin-top:20px"><a href="https://recrm.ru/" target="_blank" rel="noopener">Подробный список на сайте RECRM ↗</a></p>`));
 if(id==='07'){action($$('img',root).find(n=>n.src.includes('24533'))?.parentElement,()=>window.open('https://apps.apple.com/ru/app/recrm-app/id1448632364?l=ru&ls=1','_blank','noopener'));action($$('img',root).find(n=>n.src.includes('7bc21'))?.parentElement,()=>window.open('https://play.google.com/store/apps/details?id=com.recrm.online','_blank','noopener'));}
 if(id==='09')for(const p of $$('.onboarding-material p',root))p.dataset.supportLink='';
 return root;
}
function setupSlider(root,id){
 const old=$('[data-name="Scroll"]',root)||$('[data-name="SCROLL"]',root);if(old)old.remove();
 $$('[data-name="scroll-bg"],[data-name="scroll-button"]',root).forEach(n=>n.remove());
 const slider=document.createElement('input');slider.type='range';slider.min=0;slider.max=id==='03'?Math.max(0,content.testimonials.length-3):100;slider.step=1;slider.value=0;slider.className='carousel-control';slider.setAttribute('aria-label',id==='03'?'Отзывы клиентов':id==='08'?'Площадки выгрузки':'Фотографии разработчика');
 if(id==='08')slider.style.top='826px';
 if(id==='03'){
  const carousel=$('.testimonial-carousel',root),grid=$('.reviews-grid',carousel);carousel.append(slider);
  slider.addEventListener('input',()=>{const start=Number(slider.value);grid.innerHTML=content.testimonials.slice(start,start+3).map((review,i)=>testimonialCardHtml(review,start+i)).join('');i18n.apply(grid);});
 }else{
  root.append(slider);
  const candidates=[$('[data-name="LOGOS"]',root)||$('[data-name="Logos"]',root)||$$('div',root).find(n=>n.style.gap==='100px')].filter(Boolean);
  slider.addEventListener('input',()=>candidates.forEach(n=>{n.style.translate=`${-Number(slider.value)*4}px 0`;}));
 }
}
function developerGalleryHtml(){
 return `<section class="developer-gallery" aria-label="Фотографии разработчика"><div class="developer-gallery-viewport">${content.developerGallery.map(image=>`<div class="developer-photo"><img src="${esc(image)}" alt="" decoding="async"></div>`).join('')}</div><input class="carousel-control" type="range" min="0" max="100" step="1" value="0" aria-label="Фотографии разработчика"></section>`;
}
function syncDeveloperGallery(gallery){
 const viewport=$('.developer-gallery-viewport',gallery),distance=viewport.scrollWidth-viewport.clientWidth;
 $('.carousel-control',gallery).value=distance>0?viewport.scrollLeft/distance*100:0;
}
function syncTestimonialsCarousel(carousel){
 const viewport=$('.mobile-testimonials-viewport',carousel),cards=$$('.testimonial-card',viewport),slider=$('.carousel-control',carousel);
 if(!cards.length)return;
 const gap=parseFloat(getComputedStyle(viewport).columnGap)||0,step=cards[0].getBoundingClientRect().width+gap;
 slider.value=step?Math.min(cards.length-1,Math.round(viewport.scrollLeft/step)):0;
}
function testimonialCardHtml(review,index){
 const quote=review.original?`<a class="testimonial-quote" href="${esc(review.original)}" data-testimonial-original="${index}" title="Посмотреть оригинал отзыва">${esc(review.quote)}</a>`:`<p class="testimonial-quote">${esc(review.quote)}</p>`;
 return `<article class="testimonial-card" data-testimonial="${esc(review.id)}"><img class="testimonial-logo" src="${esc(review.logo)}" alt="Логотип клиента">${quote}<div class="testimonial-divider" aria-hidden="true"><svg width="104" height="21" viewBox="0 0 104 21" fill="none"><path d="M0 1.5H84.5V19L102 1.5H104" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg><span></span></div><div class="testimonial-caption"><img class="testimonial-avatar" src="${esc(review.avatar)}" alt="Фото автора отзыва"><p class="testimonial-author">${review.authorLines.map(line=>`<span>${esc(line)}</span>`).join('')}</p></div></article>`;
}
function videosHtml(){return `<h1>Почему мы?</h1><div class="title-rule"></div><div class="video-grid">${content.videos.slice(0,3).map((v,i)=>`<button class="video-card" data-video="${i}"><div class="thumbnail"><img src="${esc(v.image)}" alt="${esc(v.title)}"><span class="play" aria-hidden="true">▶</span></div><small>${esc(v.title)}</small></button>`).join('')}</div><div class="photo-grid">${content.offices.slice(0,3).map((v,i)=>`<button class="video-card" data-office="${i}"><img src="${esc(v.image)}" alt="${esc(v.title)}"><small>${esc(v.title)}</small></button>`).join('')}</div>`;}
const faqTitles=['Вопросы по настройке системы','Вопросы по сайту-витрине агентства','Вопросы по наполнению базы и удалению из неё данных','Вопросы по ведению заявок','Вопросы по поиску в CRM','Вопросы по задачам','Вопросы по выгрузке объявлений на интернет-площадки','Вопросы по отчетам','Цены, хостинг, тех. поддержка','Доработки'];

function supportHtml(){return `<h1>Поддержка</h1><div class="title-rule"></div><p>Не нашли ответ? Свяжитесь с нами</p><div class="support-grid"><div class="support-contact"><p>Вы можете <a href="https://t.me/recrmtechsupport_bot" target="_blank" rel="noopener">написать нам в Telegram</a> или позвонить по тел. <a href="tel:+74997537723">+7 (499) 753-77-23</a> с 9.00 до 17.00 по Москве в рабочие дни.</p><p>Электронные письма отправляйте в любое время на адрес: <a href="mailto:support@recrm.online">support@recrm.online</a></p></div><aside><h3>Полезно посмотреть</h3><a href="https://www.youtube.com/playlist?list=PLAs1mEzxDu2OVJimbjaamUuvv_17ABhPr" target="_blank" rel="noopener">Обучающие видеоролики по использованию RECRM</a><a href="https://recrm.ru/support/" target="_blank" rel="noopener">Руководство пользователя RECRM</a><a href="http://docs.google.com/document/d/1jMP1yBEX3UG6_LHVKTegBipkyP1CVAZh/" target="_blank" rel="noopener">Документация по API</a></aside></div><h3 style="margin-top:35px">Ответы на часто задаваемые вопросы</h3><div class="faq-list">${content.faq.map((g,i)=>`<button class="faq-link" data-faq="${i}">${esc(g.title)}</button>`).join('')}</div>`;}
function blogHtml(){
 return `<h1>Полезные статьи для риэлторов</h1><div class="title-rule"></div><div class="blog-layout">${content.articles.map(a=>`<article class="blog-card"><a href="#${esc(a.slug)}"><img src="${esc(a.image)}" alt="${esc(a.title)}"></a><div><h2><a href="#${esc(a.slug)}">${esc(a.title)}</a></h2><p>${esc(a.text)}</p></div></article>`).join('')}</div>`;
}
function articleHtml(id){
 const index=content.articles.findIndex(article=>article.id===id),a=content.articles[index],previousArticle=content.articles[index-1],nextArticle=content.articles[index+1];
 const pageLink=(entry,direction)=>{
  if(!entry)return '';
  const title=`<span class="article-page-title">${esc(entry.title)}</span>`;
  return `<a class="article-page article-page--${direction}" rel="${direction}" href="#${esc(entry.slug)}">${direction==='prev'?`<span aria-hidden="true">←</span>&nbsp;${title}`:`${title}&nbsp;<span aria-hidden="true">→</span>`}</a>`;
 };
 const pagination=previousArticle||nextArticle?`<nav class="article-pagination" aria-label="Навигация по статьям">${pageLink(previousArticle,'prev')}${pageLink(nextArticle,'next')}</nav>`:'';
 const body=a.fullHtml||esc(a.fullText),trial=body.includes('data-open-form')?'':'<p class="article-actions"><a href="#free-trial" data-open-form>Попробовать бесплатно</a></p>';
 return `<a class="back-to-blog" href="#blog">← Все статьи</a><h1 class="article-title">${esc(a.title)}</h1><div class="article"><img class="article-cover" src="${esc(a.image)}" alt="${esc(a.title)}"><div class="article-text" tabindex="0"><div class="article-body">${body}</div>${trial}${pagination}</div></div>`;
}
function casesHtml(){
 const cases=[...content.cases],ownersIndex=cases.findIndex(c=>c.title==='Поиск собственников в интернете');
 if(ownersIndex>=0)cases.push(cases.splice(ownersIndex,1)[0]);
 return `<h1 style="font-size:48px">Бизнес-кейсы</h1><div class="case-list">${cases.map(c=>`<details ${c.title==='Ведение сделки в CRM'?'open':''}><summary>${esc(c.title)}</summary><div class="case-content${c.image?'':' case-content--text'}">${c.image?`<img src="${esc(c.image)}" alt="${esc(c.title)}">`:""}<div class="case-copy">${c.text.split(/\n{2,}/).map(p=>`<p>${esc(p).replaceAll('\n','<br>')}</p>`).join('')}</div></div></details>`).join('')}</div>`;
}
function reviewsHtml(){return `<h1>Отзывы наших клиентов</h1><div class="title-rule"></div><div class="written-reviews">${[0,1,2].map(i=>{const r=content.reviews[i];return `<article>${r?.images[0]?`<img class="review-logo" src="${esc(r.images[0])}" alt="Логотип клиента">`:''}<div class="review-text">${esc(r?.text||'').replaceAll('\n\n','<br><br>')}</div>${r?.images.length?`<button class="review-original" data-letter="${i}">Посмотреть оригинал ↗</button>`:""}</article>`;}).join('')}</div>`;}
function pricingHtml(layout){
 return `<div class="pricing-grid">${content.pricing.plans.map(plan=>{
  const panelId=`pricing-${layout}-${plan.id}`,summary=`<div class="pricing-summary"><strong>${esc(plan.price)}</strong><span>${esc(plan.unit)}</span></div>`;
  return `<article class="pricing-card pricing-card--${plan.id}"><h2><button class="pricing-toggle" data-pricing-toggle aria-expanded="false" aria-controls="${panelId}" aria-label="Тариф «${esc(plan.name)}»: цены по количеству сотрудников">${esc(plan.name)}</button></h2><p class="pricing-subscription"><strong>${esc(plan.employees)}</strong><span>${esc(plan.subscription)}</span></p><div class="pricing-body"><div class="pricing-overview" data-pricing-overview><table class="pricing-table pricing-features"><caption class="sr-only">Возможности тарифа «${esc(plan.name)}»</caption><colgroup><col><col></colgroup><tbody>${content.pricing.featureLabels.map((label,i)=>`<tr><th scope="row">${esc(label)}</th><td>${plan.features[i]===true?`<span class="pricing-check" role="img" aria-label="Включено"><svg aria-hidden="true" viewBox="0 0 16 12"><path d="M1.5 6.5 5.5 10 14.5 1.5"/></svg></span>${plan.note&&i===3?'<sup>*</sup>':''}`:esc(plan.features[i]===false?'—':plan.features[i])}</td></tr>`).join('')}</tbody></table>${summary}${plan.note?`<small class="pricing-note">${esc(plan.note)}</small>`:''}</div><div class="pricing-details" data-pricing-details id="${panelId}" hidden>${summary}<table class="pricing-table pricing-tiers"><caption class="sr-only">Стоимость тарифа «${esc(plan.name)}» по количеству сотрудников</caption><colgroup><col><col></colgroup><tbody>${plan.tiers.map(([employees,price])=>`<tr><th scope="row">${esc(employees)}</th><td>${esc(price)}</td></tr>`).join('')}</tbody></table>${plan.note?`<small class="pricing-note">${esc(plan.note)}</small>`:''}<button class="pricing-cta" data-open-form>Попробовать бесплатно</button></div></div></article>`;
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
 if(id==='21')return `<h1>Зачем вам нужна CRM?</h1><div class="title-rule"></div><p class="lead">Автоматизация работы агентства недвижимости на основе RECRM</p>${content.why.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}<div class="icon-features">${content.why.features.map(f=>`<div class="icon-feature"><img src="${esc(f.image)}" alt=""><span>${esc(f.text)}</span></div>`).join('')}</div><p>Наконец, риелтор может избавиться от рутины и посвятить свое время тому, чего за него не сделает ни одна программа — человеческому общению с клиентами.</p>`;
 if(id==='24')return casesHtml();
 if(id==='41')return videosHtml();
 if(id==='42')return reviewsHtml();
 if(id==='43')return `<h1>Более 3000 риэлторов используют<br>RECRM ежедневно в своей работе</h1><div class="title-rule"></div><strong class="map-year">2020</strong><img src="./assets/client-map.svg" alt="География клиентов RECRM по всей России" class="client-map"><input class="map-slider" type="range" min="2012" max="2020" value="2020" aria-label="Год на карте клиентов">`;
 if(id==='51')return supportHtml();if(id==='61')return blogHtml();if(articleIds.has(id))return articleHtml(id);return '';
}
function featuresListHtml(){return `<ul class="features-list">${featureHighlights.map(text=>`<li><span>${esc(text)}</span></li>`).join('')}</ul>`;}
function mobileHtml(id,desktop){
 if(id==='01')return `<h1>Простая и эффективная CRM для агентств недвижимости</h1><p class="hero-description"><span>С 2012 года помогаем руководителям и сотрудникам агентств недвижимости получать максимум прибыли от сделок с недвижимостью. </span><span>Более 3000 риэлторов ежедневно используют RECRM в своей работе.</span></p><div class="mobile-hero-visual">${$('[data-name="VIS"]',desktop)?.outerHTML||''}</div><div class="hero-price"><span>от</span><strong>6 300 ₽</strong><span class="hero-price-meta"><small>/мес.</small><small>за всю компанию</small></span></div><button class="mobile-cta hero-cta-link hero-demo-button" data-open-form>Получить демо →</button>`;
 if(id==='02')return `<h1>Ключевые возможности нашего продукта</h1><div class="features-mobile-visual"><img src="./assets/70364.png" alt="Интерфейс RECRM"><button data-overview aria-label="Смотреть видеообзор RECRM"><img src="./assets/777e8.svg" alt=""></button></div>${featuresListHtml()}`;
 if(id==='05')return `<h1>Топ-3 проблемы, которые мы решаем</h1>${$('.challenges-grid',desktop).outerHTML}`;
 if(id==='09')return `<h1>Настройка и запуск «под ключ»</h1>${$('.support-cards-grid',desktop).outerHTML}`;
 if(id==='23')return `<h1>Возможности RECRM</h1>${$('.capabilities-grid',desktop).outerHTML}`;
 if(id==='04'||id==='06'){
  const cards=$$('.feature-row',desktop).flatMap(row=>$$('.comparison-card',row).sort((a,b)=>Number(a.style.gridColumn)-Number(b.style.gridColumn)));
  const title=$$('[data-name="H1"] p',desktop).map(p=>{const copy=p.cloneNode(true);$$('br',copy).forEach(br=>br.replaceWith(' '));return copy.textContent.trim();}).join(' ');
  return `<h1>${esc(title)}</h1><div class="comparison-grid">${cards.map(card=>card.outerHTML).join('')}</div>`;
 }
 if(id==='07'){const localized=['en','ka'].includes(i18n.locale);return `<h1><span>Адаптивная веб-версия и мобильные</span> <span>приложения для iOS и Android</span></h1><div class="mobile-app-download"><div class="mobile-app-visual"><div class="mobile-app-desktop-frame"><img class="mobile-app-desktop" src="./assets/${localized?'mobile-app-desktop-en.webp':'mobile-app-desktop-ru.webp'}" alt="Веб-версия RECRM"></div><div class="mobile-app-phone"><img src="./assets/${localized?'mobile-app-phone-en.webp':'30bfe.png'}" alt="Мобильное приложение RECRM"></div></div><div class="mobile-app-stores"><a href="https://apps.apple.com/ru/app/recrm-app/id1448632364?l=ru&amp;ls=1" target="_blank" rel="noopener noreferrer"><img src="./assets/24533.svg" alt="App Store"></a><a href="https://play.google.com/store/apps/details?id=com.recrm.online" target="_blank" rel="noopener noreferrer"><img src="./assets/7bc21.svg" alt="Google Play"></a></div></div>`;}
 if(['21','24','41','42','43','51','61'].includes(id)||articleIds.has(id))return customHtml(id);
 if(id==='22')return problemHtml(true);
 if(id==='31')return `<h1>Сколько это стоит?</h1><p>${esc(content.pricing.caption)}</p>${pricingHtml('mobile')}`;
 if(id==='10'){
  const title=$('[data-name="H1"] p',desktop).textContent,intro=$('.section-lead',desktop),description=$$('p',desktop).find(p=>p.textContent.startsWith('Нами разработано'));
  const company='Site-Mechanics',remainder=intro.textContent.startsWith(company)?intro.textContent.slice(company.length):intro.textContent;
  const companyUrl=['en','ka'].includes(i18n.locale)?'https://site-mechanics.com/':'http://www.site-mechanics.ru/';
  return `<h1>${esc(title)}</h1><p class="section-lead"><a class="about-company-link" href="${companyUrl}" target="_blank" rel="noopener noreferrer" data-i18n-ignore>${company}</a>${esc(remainder)}</p>${developerGalleryHtml()}<p>${esc(description.textContent)}</p>`;
 }
 const mainImage={'07':'a900d.png','10':'99c59.png'}[id];
 const seen=new Set();const paragraphs=$$('p',desktop).map(n=>n.textContent.trim()).filter(t=>t&&t!=='​'&&!seen.has(t)&&seen.add(t));
 const title=paragraphs.shift()||definitions.find(d=>d[0]===id)?.[1];
 if(id==='03'){
  return `<h1>Почему мы?</h1><p>Мы оцифровываем агентства недвижимости с 2012 года.</p><section class="mobile-testimonials" role="region" aria-roledescription="карусель" aria-label="Отзывы клиентов"><div class="mobile-testimonials-viewport">${content.testimonials.map(testimonialCardHtml).join('')}</div><input class="carousel-control" type="range" min="0" max="${Math.max(0,content.testimonials.length-1)}" step="1" value="0" aria-label="Отзывы клиентов"></section>`;
 }
 if(id==='08')return `<h1>Выгрузка на площадки</h1><p>Автоматизированная отправка объявлений на профильные интернет-площадки экономит рабочее время сотрудников агентства.</p><div class="mobile-logos">${['c6ebe.svg','7de75.svg','c463d.svg','e6077.svg','2966d.png'].map(s=>`<img src="./assets/${s}" alt="Рекламная площадка">`).join('')}</div>`;
 return `<h1>${esc(title)}</h1>${mainImage?`<img class="mobile-image" src="./assets/${mainImage}" alt="Интерфейс RECRM">`:''}${paragraphs.map(t=>`<p style="margin-bottom:16px">${esc(t)}</p>`).join('')}`;
}
function problemHtml(mobile=false){
 const prefix=mobile?'problem-mobile':'problem-desktop';
 return `<section class="problem-carousel" role="region" aria-roledescription="карусель" aria-label="RECRM решает вопросы"><h2>RECRM решает вопросы</h2><div class="problem-controls"><div class="problem-tabs" role="group" aria-label="Выбрать слайд">${content.problems.map((p,i)=>`<button data-problem="${i}" class="${problemIndex===i?'active':''}" aria-label="${esc(p.title)}" aria-controls="${prefix}-${i}" aria-pressed="${problemIndex===i}"></button>`).join('')}</div><button class="problem-toggle" data-problem-toggle aria-label="${problemPaused?'Включить автоматическую смену слайдов':'Приостановить смену слайдов'}" aria-pressed="${problemPaused}"><span aria-hidden="true">${problemPaused?'▶':'Ⅱ'}</span></button></div><div class="problem-slides" aria-live="off">${content.problems.map((p,i)=>`<article class="problem-slide" id="${prefix}-${i}" data-problem-slide="${i}" role="group" aria-roledescription="слайд" aria-label="${i+1} из ${content.problems.length}" ${problemIndex===i?'':'hidden inert'}><div class="problem-copy"><h1>${esc(p.title)}</h1><div class="title-rule"></div><p>${esc(p.text)}</p></div><img class="problem-visual" src="${esc(p.image)}" alt="${esc(p.title)}" draggable="false"></article>`).join('')}</div><span class="problem-status sr-only" role="status"></span></section>`;
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
function formHtml(){return `<div class="form-content"><h1>Хочу попробовать<br>RECRM в деле</h1><div class="title-rule"></div><p class="form-contact-copy"><span>Для получения демо-доступа пишите в </span><a href="https://recrm.ru/how-it-works/#:~:text=%D0%B4%D0%BE%D1%81%D1%82%D1%83%D0%BF%D0%B0%20%D0%BF%D0%B8%D1%88%D0%B8%D1%82%D0%B5%20%D0%B2-,Telegram,-%2C" target="_blank" rel="noopener noreferrer">Telegram</a><span> или на почту </span><a href="mailto:support@recrm.online" data-i18n-ignore>support@recrm.online</a></p></div>`;}
function wire(){
 $$('.developer-gallery',stage).forEach(gallery=>{
  const viewport=$('.developer-gallery-viewport',gallery),slider=$('.carousel-control',gallery);
  slider.oninput=()=>{viewport.scrollLeft=(viewport.scrollWidth-viewport.clientWidth)*Number(slider.value)/100;};
  viewport.onscroll=()=>syncDeveloperGallery(gallery);
 });
 $$('.mobile-testimonials',stage).forEach(carousel=>{
  const viewport=$('.mobile-testimonials-viewport',carousel),slider=$('.carousel-control',carousel);
  slider.oninput=()=>{
   const card=$('.testimonial-card',viewport),gap=parseFloat(getComputedStyle(viewport).columnGap)||0;
   if(card)viewport.scrollLeft=(card.getBoundingClientRect().width+gap)*Number(slider.value);
  };
  viewport.onscroll=()=>syncTestimonialsCarousel(carousel);
 });
 stage.onclick=e=>{const link=e.target.closest('[data-testimonial-original]');if(link){e.preventDefault();picture(content.testimonials[Number(link.dataset.testimonialOriginal)].original,'Отзыв клиента RECRM');}};
 $$('[data-support-link]',stage).forEach(n=>action(n,()=>go('51')));
 $$('[data-faq]',stage).forEach(b=>b.onclick=()=>{const g=content.faq[Number(b.dataset.faq)];openMedia('<h2>'+esc(g.title)+'</h2><div class="faq-modal">'+g.items.map(i=>'<h3>'+esc(i.question)+'</h3><p>'+esc(i.answer)+'</p>').join('')+'</div>');});

 $$('[data-legal]',stage).forEach(a=>a.onclick=e=>{e.preventDefault();openMedia('<h2>'+ (a.dataset.legal==='privacy'?'Политика конфиденциальности':'Условия использования')+'</h2><p>'+esc(content.legal)+'</p><p style="margin-top:20px">Демонстрационный прототип. Форма не передаёт и не сохраняет данные на сервере.</p><p><a href="https://recrm.ru/" target="_blank" rel="noopener">Действующие условия на сайте RECRM ↗</a></p>');});
 $$('[data-open-form]').forEach(n=>n.onclick=e=>{e.preventDefault();if(menuOpen)setMenu(false);go('form');});
 $$('[data-video]',stage).forEach(n=>n.onclick=()=>{const v=content.videos[Number(n.dataset.video)];showVideo(v.url,v.title);});
 $$('[data-office]',stage).forEach(n=>n.onclick=()=>{const v=content.offices[Number(n.dataset.office)];picture(v.image,v.title);});
 $$('[data-letter]',stage).forEach(n=>n.onclick=()=>{const r=content.reviews[Number(n.dataset.letter)];picture(r.images[r.images.length-1],'Отзыв клиента RECRM');});
 if($('.problem-carousel',stage))setupProblemCarousel();
 if($('.pricing-card',stage))setupPricingCards();
 $$('[data-overview]',stage).forEach(n=>n.onclick=()=>showVideo('https://www.youtube.com/embed/iy-JT9-9Grw','Обзор RECRM'));
 $$('.case-list details',stage).forEach(n=>n.addEventListener('toggle',()=>{if(n.open)$$('.case-list details',n.parentElement).forEach(s=>{if(s!==n)s.open=false;});}));
 const map=$('.map-slider',stage);if(map)map.oninput=()=>{$('.map-year',stage).textContent=map.value;};
 const form=$('#trialForm');if(form){
  form.oninput=()=>{formValues=Object.fromEntries(new FormData(form));$$('input',form).forEach(input=>input.setCustomValidity(''));};
  form.onsubmit=e=>{e.preventDefault();const phone=$('#phone'),digits=phone.value.replace(/\D/g,'');if(digits.length<10||digits.length>15||!/^[+0-9 ()-]+$/.test(phone.value)){phone.setCustomValidity(i18n.text('Укажите номер телефона: от 10 до 15 цифр'));phone.reportValidity();return;}const el=$('.form-content');el.innerHTML=`<h1>Спасибо, <span data-i18n-ignore>${esc(formValues.name)}</span>!</h1><div class="title-rule"></div><div class="form-success" role="status"><h2>Форма заполнена</h2><p>Это демонстрация отправки заявки. Данные остались только в открытой вкладке и не передавались на сервер.</p><p>Для получения демо-доступа напишите <a href="mailto:sales@recrm.ru">sales@recrm.ru</a>.</p><button class="submit-button" id="backFromSuccess">Вернуться к сайту</button></div>`;$('#backFromSuccess').onclick=()=>go(previous);i18n.apply(el);};
 }
}
function desktopPage(id){
 const blue=bluePages.has(id);
 if(id==='22')return template(`<div class="design-screen desktop-layout" style="background:#368cfb">${problemHtml()}</div>`);
 if(screens[id]&&id!=='24')return sourceScreen(id);
 return template(`<div class="design-screen desktop-layout"><section class="custom-screen ${blue?'blue':''}">${customHtml(id)}</section></div>`);
}
function mobilePage(id){
 const page=document.createElement('section');
 page.className='mobile-layout mobile-page'+(bluePages.has(id)?' is-blue-page':'')+(id==='07'?' mobile-app-screen':'')+(id==='form'?' form-page':'');
 page.dataset.mobilePage=id;
 if(id==='form')page.innerHTML=formHtml();
 else page.innerHTML=mobileHtml(id,desktopPage(id));
 return page;
}
function pageGroup(id){
 return id==='form'?'form':id==='10'?'10':id==='03'?'03':id.startsWith('0')?'01':id[0]==='2'?'21':id==='31'?'31':id[0]==='4'?'41':id==='51'?'51':'61';
}
function applyPageTheme(id){const blue=bluePages.has(id);document.body.classList.toggle('is-blue',blue);document.body.classList.toggle('form-open',id==='form');$('#backdrop').style.background=blue?'#368cfb':'white';}
function scheduleMobilePageTheme(){clearTimeout(mobileThemeTimer);mobileThemeTimer=setTimeout(()=>applyPageTheme(current),200);}
function updateMobilePageState(id,{updateHash=false,announce=false,deferTheme=false}={}){
 const previousPage=current;
 current=id;
 if(!deferTheme)applyPageTheme(id);document.body.dataset.screen=id;
 $('.trial').hidden=id==='form';$('#menuToggle').setAttribute('aria-expanded','false');
 $('#menuToggle').setAttribute('aria-label',id==='form'?'Закрыть форму':'Открыть меню');
 $('.screen-controls').hidden=id==='form'||articleIds.has(id);
 const group=pageGroup(id);
 $$('.menu-links a').forEach(a=>{const active=a.hash===routeHash(group);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 const title=id==='form'?'Попробовать бесплатно':routes.find(d=>d[0]===id)?.[1]||'Помогаем получить максимум прибыли';
 document.title=`${i18n.text(title)} — RECRM`;
 if(announce)$('#announcer').textContent=i18n.text(title);
 if(updateHash&&location.hash!==routeHash(id))history.replaceState(null,'',routeHash(id));
 if(id==='04')playComparisonAnimation($(`[data-mobile-page="${id}"]`,stage));
 if(id==='06')playBenefitsAnimation($(`[data-mobile-page="${id}"]`,stage));
 if(previousPage==='22'||id==='22')restartProblemPlayback();
}
function scrollToMobilePage(id,animate=true){
 const page=$$('.mobile-page',stage).find(node=>node.dataset.mobilePage===id);if(!page)return;
 const smooth=animate&&!matchMedia('(prefers-reduced-motion:reduce)').matches;
 if(!smooth||Math.abs(page.offsetTop-stage.scrollTop)<2)updateMobilePageState(id);
 stage.scrollTo({top:page.offsetTop,behavior:smooth?'smooth':'auto'});
 if(smooth)scheduleMobilePageTheme();
}
function syncMobilePageFromScroll(){
 if(mobileDocumentMode!=='sequence'||mobileScrollFrame)return;
 mobileScrollFrame=requestAnimationFrame(()=>{
  mobileScrollFrame=0;
  const marker=stage.scrollTop+Math.max(120,stage.clientHeight*.4);
  const pages=$$('.mobile-page',stage);
  const page=pages.find(node=>marker>=node.offsetTop&&marker<node.offsetTop+node.offsetHeight)||pages.at(-1);
  if(page){if(page.dataset.mobilePage!==current)updateMobilePageState(page.dataset.mobilePage,{updateHash:true,deferTheme:true});scheduleMobilePageTheme();}
 });
}
function renderMobileDocument(id,mode,animate){
 const rebuild=mobileDocumentMode!==mode||(mode==='single'&&mobilePageIds[0]!==id);
 if(rebuild){
  mobileDocumentMode=mode;document.body.classList.add('continuous-mobile');
  stage.className='continuous-mobile-stage';stage.innerHTML='';
  mobilePageIds=mode==='sequence'
   ?definitions.filter(([pageId,,slug])=>pageId==='form'||!sequenceExcluded.has(slug)).map(([pageId])=>pageId)
   :[id];
  mobilePageIds.forEach(pageId=>stage.append(mobilePage(pageId)));
  stage.onscroll=syncMobilePageFromScroll;
  wire();i18n.apply(stage);resize();
 }
 layoutMode='mobile';
 if(mode==='sequence'&&mobilePageIds.includes(id))scrollToMobilePage(id,animate);
 else updateMobilePageState(id);
}
function render(id,animate=true){
 clearTimeout(problemTimer);problemTimer=0;problemFocusPaused=false;
 clearTimeout(pageThemeTimer);clearTimeout(mobileThemeTimer);
 if(!routes.some(d=>d[0]===id)&&id!=='form')id='01';
 if(innerWidth<=mobileBreakpoint){
  const slug=routes.find(([pageId])=>pageId===id)?.[2]||'';
  const mode=id==='form'||(!articleIds.has(id)&&!sequenceExcluded.has(slug))?'sequence':'single';
  renderMobileDocument(id,mode,animate);
  return;
 }
 mobileDocumentMode='none';mobilePageIds=[];document.body.classList.remove('continuous-mobile');stage.className='';stage.onscroll=null;
 layoutMode='desktop';
 $$('#screen > .transition-out').forEach(n=>n.remove());
 const last=current,transition=animate&&stage.children.length&&!matchMedia('(prefers-reduced-motion:reduce)').matches;
 if(transition){
  const old=stage.cloneNode(true);old.id='';old.className='transition-out '+(routes.findIndex(d=>d[0]===id)<routes.findIndex(d=>d[0]===last)?'screen-exit-up':'screen-exit-down');old.inert=true;old.setAttribute('aria-hidden','true');screen.append(old);setTimeout(()=>old.remove(),700);
 }
 current=id;if(menuOpen)setMenu(false);
 const blue=bluePages.has(id);stage.classList.toggle('is-blue-screen',blue);stage.classList.toggle('is-white-screen',!blue);
 document.body.dataset.screen=id;
 $('.trial').hidden=id==='form';$('#menuToggle').setAttribute('aria-expanded','false');$('#menuToggle').setAttribute('aria-label',id==='form'?'Закрыть форму':'Открыть меню');$('.screen-controls').hidden=id==='form'||articleIds.has(id);
 stage.innerHTML='';
 if(id==='form'){const wrapper=document.createElement('div');wrapper.className=blue?'is-blue-screen':'is-white-screen';wrapper.innerHTML=formHtml();stage.append(wrapper);}else{
  let desktop=desktopPage(id);
  desktop.classList.add(blue?'is-blue-screen':'is-white-screen');
  stage.append(desktop);const mobile=document.createElement('div');mobile.className='mobile-layout'+(id==='07'?' mobile-app-screen':'');mobile.innerHTML=mobileHtml(id,desktop);mobile.scrollTop=0;stage.append(mobile);
 }
 if(animate&&!matchMedia('(prefers-reduced-motion:reduce)').matches){stage.classList.remove('stage-in-down','stage-in-up');void stage.offsetWidth;stage.classList.add(routes.findIndex(d=>d[0]===id)<routes.findIndex(d=>d[0]===last)?'stage-in-up':'stage-in-down');}
 if(id==='04')playComparisonAnimation(stage);
 if(id==='06')playBenefitsAnimation(stage);
 if(transition)pageThemeTimer=setTimeout(()=>applyPageTheme(id),700);else applyPageTheme(id);
 $('#next').setAttribute('aria-label','Следующий экран');
 const group=pageGroup(id);
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
document.addEventListener('recrm:locale-change',()=>{applyMobileAppProductImages(stage);localizeComparisonCountUnits(stage);$$('#trialForm input').forEach(input=>{if(input.validity.customError){input.setCustomValidity('');input.setCustomValidity(i18n.text(fieldError(input)));}});});
$$('.menu-links a,.menu-actions a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('pointerdown',e=>{if(current==='31'&&!e.target.closest('.pricing-card'))$$('.pricing-card.is-expanded',stage).forEach(card=>setPricingCard(card,false));});
$('.skip-link').onclick=e=>{e.preventDefault();screen.focus();};
$('#footerContact').onclick=e=>{e.preventDefault();openMedia(contactHtml());};
$('#menuToggle').onclick=()=>current==='form'?go(previous):setMenu(!menuOpen);$('#menuShade').onclick=()=>setMenu(false);
$('#next').onclick=()=>move(1);
$$('.dialog-close').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('#media').addEventListener('close',()=>{$('#mediaContent').replaceChildren();restartProblemPlayback();});
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close();}));
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){if(e.target.tagName==='SELECT')return;if(menuOpen)setMenu(false);else if(current==='form')go(previous);return;}
 if(menuOpen&&e.key==='Tab'){const focus=[$('#menuToggle'),...$$('a,button',$('#menu'))];const first=focus[0],last=focus.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}return;}
 if(mobileDocumentMode!=='none'&&!['Home','End'].includes(e.key))return;
 if(menuOpen||articleIds.has(current)||$('dialog[open]')||/INPUT|TEXTAREA|SELECT|SUMMARY/.test(e.target.tagName)||(e.key===' '&&e.target.closest('button,a,details')))return;
 if(['ArrowDown','PageDown',' '].includes(e.key)){e.preventDefault();move(1);}if(['ArrowUp','PageUp'].includes(e.key)){e.preventDefault();move(-1);}if(e.key==='Home'){e.preventDefault();go('01');}if(e.key==='End'){e.preventDefault();go(definitions.at(-1)[0]);}
});
let wheelSum=0,wheelTime=0;
addEventListener('wheel',e=>{
 if(mobileDocumentMode!=='none')return;
 if(menuOpen||articleIds.has(current)||$('dialog[open]')||e.target.closest('input,textarea,select')||e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
 const scrollables='.mobile-layout,.form-content,.case-list,.case-content,.article-text,.faq-list,.blog-layout';
 for(let scroller=e.target.closest(scrollables);scroller;scroller=scroller.parentElement?.closest(scrollables)){
  if(scroller.scrollHeight>scroller.clientHeight+3){const down=e.deltaY>0;if((down&&scroller.scrollTop+scroller.clientHeight<scroller.scrollHeight-3)||(!down&&scroller.scrollTop>3))return;}
 }
 e.preventDefault();const now=Date.now();if(navigationLocked)return;if(now-wheelTime>180)wheelSum=0;wheelTime=now;wheelSum+=e.deltaY;if(Math.abs(wheelSum)>55){navigationLocked=true;move(wheelSum>0?1:-1);wheelSum=0;setTimeout(()=>navigationLocked=false,850);}
},{passive:false});
let touchStart=null;
screen.addEventListener('touchstart',e=>{touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY,target:e.target};},{passive:true});
screen.addEventListener('touchend',e=>{if(mobileDocumentMode!=='none'||!touchStart||menuOpen||articleIds.has(current)||touchStart.target.closest('input,textarea,select')){touchStart=null;return;}const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;const scroller=touchStart.target.closest('.mobile-layout,.form-content');if(scroller&&scroller.scrollHeight>scroller.clientHeight+3&&((dy<0&&scroller.scrollTop+scroller.clientHeight<scroller.scrollHeight-3)||(dy>0&&scroller.scrollTop>3))){touchStart=null;return;}if(Math.abs(dy)>65&&Math.abs(dy)>Math.abs(dx)*1.3)move(dy<0?1:-1);touchStart=null;},{passive:true});
addEventListener('resize',()=>{resize();const mode=innerWidth<=mobileBreakpoint?'mobile':'desktop';if(layoutMode&&mode!==layoutMode)syncRoute(false);});addEventListener('hashchange',()=>syncRoute());
document.addEventListener('visibilitychange',restartProblemPlayback);
const localizationReady=createLocalization().then(instance=>{i18n=instance;window.recrmI18n=instance;});
try{[screens,content]=await Promise.all([...['./screens.json?v=53','./content.json?v=53'].map(async url=>{const r=await fetch(url);if(!r.ok)throw Error(url);return r.json();}),localizationReady]);syncRoute(false);}catch(error){console.error(error);await localizationReady.catch(()=>{});$('#loadError').hidden=false;i18n.apply($('#loadError'));}
