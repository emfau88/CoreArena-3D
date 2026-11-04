import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveAdventureEntry} from '../src/app/adventureVariant';

test('environment selection requires its own build and full Stone prototype mission',()=>{
  const base='mode=pve&level=stone&adventure=1&combat=prototype';
  const route=(q:string,enabled=true)=>resolveAdventureEntry(new URLSearchParams(q),false,true,enabled);
  assert.equal(route(base+'&environment=outpost-test')?.environment,'outpost-test');
  assert.equal(route(base+'&environment=reference')?.environment,'reference');
  assert.equal(route(base)?.environment,'reference');
  assert.equal(route(base+'&environment=typo')?.environment,'reference');
  assert.equal(route(base+'&environment=outpost-test',false)?.environment,undefined);
  for(const suffix of ['&explore=1','&lab=boss','&lab=typo'])assert.equal(route(base+'&environment=outpost-test'+suffix)?.environment,undefined);
  assert.equal(route('mode=pve&level=stone&adventure=1&environment=outpost-test')?.environment,undefined);
  for(const q of ['mode=arena','mode=pve&level=frost&adventure=1','mode=pve&level=ember&adventure=1'])
    assert.equal(route(q+'&combat=prototype&environment=outpost-test'),null);
  assert.deepEqual(route(base+'&environment=outpost-test',false),route(base,false));
});
