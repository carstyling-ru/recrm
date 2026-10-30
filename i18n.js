export const supportedLocales = ['ru', 'en', 'ka'];
export const normalizeMessage = value => String(value).replace(/[\u200b\u0003]/g, ' ').replace(/\s+/g, ' ').trim();
export function preferredLocale(search, saved) {
 const requested = new URLSearchParams(search).get('lang');
 return supportedLocales.includes(requested) ? requested : supportedLocales.includes(saved) ? saved : 'ru';
}
export function formatDate(value, locale) {
 // Some browsers ship without Georgian ICU data and silently use the system language.
 if (locale === 'ka' && !Intl.DateTimeFormat.supportedLocalesOf('ka-GE').length) {
  const [year,month,day] = value.split('-').map(Number);
  const months = ['იანვარი','თებერვალი','მარტი','აპრილი','მაისი','ივნისი','ივლისი','აგვისტო','სექტემბერი','ოქტომბერი','ნოემბერი','დეკემბერი'];
  return `${day} ${months[month-1]}, ${year}`;
 }
 return new Intl.DateTimeFormat({ru:'ru-RU',en:'en-GB',ka:'ka-GE'}[locale], {day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(`${value}T12:00:00Z`));
}
const storageKey = 'recrm.locale';
const attributes = ['aria-label', 'aria-roledescription', 'alt', 'title', 'placeholder'];
const ignored = 'script,style,option,textarea,[data-i18n-ignore],[translate="no"],[data-i18n-date]';
const failures = {
 ru:'Не удалось загрузить перевод. Попробуйте ещё раз.',
 en:'The translation could not be loaded. Please try again.',
 ka:'თარგმანის ჩატვირთვა ვერ მოხერხდა. სცადეთ ხელახლა.'
};

export class Localization {
 constructor(source, localeLoader) {
  this.locale = 'ru';
  this.catalogs = new Map([['ru', source.messages]]);
  this.sourceIndex = new Map(Object.entries(source.messages).map(([id,value]) => [normalizeMessage(value), id]));
  this.sources = source.messages;
  this.loader = localeLoader;
  this.textStates = new WeakMap();
  this.attributeStates = new WeakMap();
  this.missing = new Map();
  this.request = 0;
 }
 text(value) {
  const original = String(value), source = normalizeMessage(original);
  if (this.locale === 'ru' || !source) return original;
  const id = this.sourceIndex.get(source), translation = this.catalogs.get(this.locale)?.[id];
  if (translation !== undefined) return original.match(/^\s*/)[0] + translation + original.match(/\s*$/)[0];
  if (source.endsWith(' — RECRM')) return this.text(source.slice(0,-8)) + ' — RECRM';
  const slide = source.match(/^(\d+) из (\d+)$/);
  if (slide) return this.locale === 'en' ? `${slide[1]} of ${slide[2]}` : `${slide[1]} / ${slide[2]}`;
  if (/[А-Яа-яЁё]/.test(source) && !/^(https?:|mailto:)/.test(source)) {
   if (!this.missing.has(this.locale)) this.missing.set(this.locale,new Set());
   this.missing.get(this.locale).add(source);
  }
  return original;
 }
 original(value) {
  if (this.sourceIndex.has(normalizeMessage(value))) return value;
  for (const [locale,catalog] of this.catalogs) {
   if (locale === 'ru') continue;
   const entry = Object.entries(catalog).find(([,translated]) => normalizeMessage(translated) === normalizeMessage(value));
   if (entry) return this.sources[entry[0]];
  }
  return value;
 }
 applyText(node) {
  if (!node.parentElement || node.parentElement.closest(ignored)) return;
  let state = this.textStates.get(node);
  if (!state || node.nodeValue !== state.output) state = {source:this.original(node.nodeValue)};
  const output = this.text(state.source);
  if (node.nodeValue !== output) node.nodeValue = output;
  state.output = output;
  this.textStates.set(node,state);
 }
 applyElement(element) {
  if (element.closest('script,style,option,[data-i18n-ignore],[translate="no"]')) return;
  let states = this.attributeStates.get(element);
  if (!states) { states = new Map(); this.attributeStates.set(element,states); }
  const names = element.matches('meta[name="description"]') ? [...attributes,'content'] : attributes;
  for (const name of names) {
   if (!element.hasAttribute(name)) continue;
   const current = element.getAttribute(name);
   let state = states.get(name);
   if (!state || current !== state.output) state = {source:this.original(current)};
   const output = this.text(state.source);
   if (current !== output) element.setAttribute(name,output);
   state.output = output;
   states.set(name,state);
  }
  if (element.hasAttribute('data-i18n-date')) element.textContent = formatDate(element.dataset.i18nDate,this.locale);
 }
 apply(root = document) {
  if (root.nodeType === Node.TEXT_NODE) { this.applyText(root); return; }
  const walker = document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes = []; let node;
  while ((node = walker.nextNode())) nodes.push(node);
  for (const text of nodes) this.applyText(text);
  if (root.nodeType === Node.ELEMENT_NODE) this.applyElement(root);
  for (const element of root.querySelectorAll('*')) this.applyElement(element);
 }
 async setLocale(locale, {persist=true,updateUrl=true} = {}) {
  if (!supportedLocales.includes(locale)) locale = 'ru';
  const request = ++this.request, selector = document.querySelector('#siteLanguage');
  selector.disabled = true;
  selector.setAttribute('aria-busy','true');
  try {
   if (!this.catalogs.has(locale)) this.catalogs.set(locale,(await this.loader(locale)).messages);
   if (request !== this.request) return;
   this.locale = locale;
   document.documentElement.lang = locale;
   selector.value = locale;
   if (persist) { try { localStorage.setItem(storageKey,locale); } catch {} }
   if (updateUrl) {
    const url = new URL(location.href); url.searchParams.set('lang',locale);
    history.replaceState(history.state,'',url);
   }
   this.apply();
   if (locale === 'ka') await document.fonts.load('400 16px "Noto Sans Georgian"');
   if (request !== this.request) return;
   document.documentElement.dataset.localeReady = locale;
   document.dispatchEvent(new CustomEvent('recrm:locale-change',{detail:{locale}}));
   const message = document.querySelector('#languageMessage'); if (message) message.hidden = true;
  } finally {
   if (request === this.request) { selector.value = this.locale; selector.disabled = false; selector.removeAttribute('aria-busy'); }
  }
 }
 showFailure(locale) {
  const message = document.querySelector('#languageMessage');
  if (message) { message.textContent = failures[locale] || failures.ru; message.hidden = false; }
 }
}

export async function createLocalization() {
 const loader = async locale => {
  const response = await fetch(`./locales/${locale}.json?v=32`);
  if (!response.ok) throw new Error(`Cannot load locale ${locale}: ${response.status}`);
  return response.json();
 };
 const localizer = new Localization(await loader('ru'),loader);
 let saved; try { saved = localStorage.getItem(storageKey); } catch {}
 const requested = preferredLocale(location.search,saved);
 try { await localizer.setLocale(requested); }
 catch { await localizer.setLocale('ru'); localizer.showFailure(requested); }
 document.querySelector('#siteLanguage').addEventListener('change',event => {
  const locale = event.target.value;
  localizer.setLocale(locale).catch(() => localizer.showFailure(locale));
 });
 addEventListener('popstate',() => {
  const locale = preferredLocale(location.search,localizer.locale);
  if (locale !== localizer.locale) localizer.setLocale(locale).catch(() => localizer.showFailure(locale));
 });
 return localizer;
}
