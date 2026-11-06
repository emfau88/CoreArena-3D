import test from 'node:test';
import assert from 'node:assert/strict';
import {AdventureCampaign} from '../src/core/adventureCampaign';
import {ADVENTURE_SAVE_KEY,createAdventureSave,decodeAdventureSave} from '../src/app/adventureSave';
test('milestones grant exactly one permanent alternative per boss; practice and mission progress are distinct',()=>{
  let writes=0;const campaign=new AdventureCampaign(undefined,()=>writes++);
  assert.deepEqual(campaign.availableMods(),['base']);assert.equal(campaign.select('hook'),false);
  assert.equal(campaign.defeat('frost'),null);assert.equal(campaign.complete('stone'),false);
  assert.equal(campaign.defeat('stone'),'hook');assert.equal(campaign.defeat('stone'),null);
  assert.equal(campaign.canPractice('stone'),true);assert.equal(campaign.canEnter('frost'),false);
  assert.equal(campaign.select('hook'),true);assert.equal(campaign.select('base'),true);
  assert.equal(campaign.complete('stone'),true);assert.equal(campaign.complete('stone'),false);
  assert.equal(campaign.snapshot().next,'frost');assert.equal(campaign.canEnter('frost'),true);
  assert.equal(campaign.defeat('frost'),'fork');assert.deepEqual(campaign.availableMods(),['base','hook','fork']);
  assert.equal(campaign.complete('frost'),true);assert.equal(campaign.snapshot().next,null);assert.equal(writes,6);
  const copy=campaign.snapshot();copy.defeated.length=0;assert.equal(campaign.canPractice('frost'),true);
});
test('save whitelist ignores volatile/foreign state, validates progress and isolates the namespace',()=>{
  const values=new Map<string,string>([['arena','keep'],['corearena.legacy','keep']]);
  const storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);}};
  const saved=createAdventureSave(()=>storage);saved.campaign.defeat('stone');saved.campaign.select('hook');
  const reloaded=createAdventureSave(()=>storage);assert.equal(reloaded.campaign.snapshot().selectedMod,'hook');
  assert.equal(reloaded.campaign.canPractice('stone'),true);assert.equal(reloaded.campaign.canEnter('frost'),false);
  reloaded.campaign.complete('stone');assert.equal(createAdventureSave(()=>storage).campaign.snapshot().next,'frost');
  assert.equal(values.get('arena'),'keep');assert.equal(values.get('corearena.legacy'),'keep');
  assert.deepEqual(Object.keys(JSON.parse(values.get(ADVENTURE_SAVE_KEY)!)).sort(),['completed','defeated','next','selectedMod','version']);
  const invalid=decodeAdventureSave(JSON.stringify({version:1,completed:['frost','alien'],defeated:['frost'],selectedMod:'fork',next:'alien',hp:999}));
  assert.equal(invalid.progress.selectedMod,'base');assert.deepEqual(invalid.progress.completed,[]);assert.equal(invalid.progress.next,'stone');
});
test('bad JSON, future versions and blocked storage never prevent a playable session',()=>{
  assert.equal(decodeAdventureSave('{').status,'corrupt');assert.equal(decodeAdventureSave(null).status,'ready');
  let writes=0;const future=createAdventureSave(()=>({getItem:()=>'{"version":99}',setItem:()=>{writes++;}}));
  future.campaign.defeat('stone');assert.equal(writes,0);assert.equal(future.status(),'unsupported');
  const blocked=createAdventureSave(()=>{throw new Error('denied');});blocked.campaign.defeat('stone');assert.equal(blocked.campaign.select('hook'),true);
  assert.equal(blocked.status(),'unavailable');
  const quota=createAdventureSave(()=>({getItem:()=>null,setItem:()=>{throw new Error('quota');}}));
  quota.campaign.defeat('stone');assert.equal(quota.status(),'unavailable');assert.equal(quota.campaign.canPractice('stone'),true);
});
