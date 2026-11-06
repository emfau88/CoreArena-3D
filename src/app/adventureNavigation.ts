import type {AdventureLevel} from '../core/adventureCampaign';
export function adventureUrl(level:AdventureLevel|'menu',extra:Record<string,string>={}){
  const url=new URL(location.pathname,location.origin);
  url.search=new URLSearchParams({mode:'pve',adventure:'1',combat:'prototype',
    ...(level==='menu'?{campaign:'menu'}:{level}),...(level==='stone'?{environment:'warden-ravine'}:{}),...extra}).toString();
  return url.href;
}
/** Keep the session alive when storage is blocked; no save data is transported in the URL. */
export function navigateAdventure(url:string){history.pushState(null,'',url);window.dispatchEvent(new Event('adventure:navigate'));}
export function isAdventureHub(params:URLSearchParams,allowed:boolean){return allowed&&params.get('mode')==='pve'&&params.get('adventure')==='1'&&params.get('combat')==='prototype'&&params.get('campaign')==='menu';}
