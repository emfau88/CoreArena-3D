import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveAdventureEntry} from '../src/app/adventureVariant';
import {channelZ,installColliders,makeTerrain} from '../src/experiments/adventureEnvironment/retainingCorner';
import {createSpatialWorld} from '../src/physics/rapierWorld';

test('environment selection requires its own build and full Stone prototype mission',()=>{
  const base='mode=pve&level=stone&adventure=1&combat=prototype';
  const route=(q:string,enabled=true)=>resolveAdventureEntry(new URLSearchParams(q),false,true,enabled);
  assert.equal(route(base+'&environment=outpost-test')?.environment,'outpost-test');
  assert.equal(route(base+'&environment=stone-yard')?.environment,'stone-yard');
  assert.equal(route(base+'&environment=stone-yard',false)?.environment,undefined);
  assert.equal(route(base+'&environment=rocky-bank')?.environment,'rocky-bank');
  assert.equal(route(base+'&environment=rocky-bank',false)?.environment,undefined);
  assert.equal(route(base+'&environment=retaining-corner')?.environment,'retaining-corner');
  assert.equal(route(base+'&environment=retaining-corner',false)?.environment,undefined);
  assert.equal(route(base+'&environment=warden-ravine')?.environment,'warden-ravine');
  assert.equal(route(base+'&environment=warden-ravine',false)?.environment,undefined);
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

test('the retaining wing is solid down its steep cap, and the channel crosses the middle opening',async()=>{
  const world=await createSpatialWorld({spawn:{x:0,y:0,z:33},boxes:[]});
  const terrain=makeTerrain();
  try {
    installColliders(world);
    world.move({x:0,y:0,z:0});
    for(const t of [.2,.5,.85]) {
      const hit=world.raycast({origin:{x:-15.76-2.29*t,y:1,z:37.94+3.44*t},direction:{x:0,y:-1,z:0}},15,true);
      assert.equal(hit?.id,'stone-retaining-wing');
      assert.ok(Math.abs(hit.point.y-(-.43-8.63*t))<.02);
      assert.ok(hit.normal.y<.7);
    }
    for(const x of [-5.3,-4.15,-3])assert.ok(Math.abs(channelZ(x)-44.14)<.15);
    assert.equal(terrain.index!.count/3,11200);
  } finally { terrain.dispose();world.dispose(); }
});
