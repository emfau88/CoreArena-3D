import test from 'node:test';
import assert from 'node:assert/strict';
import { STONE_ADVENTURE, STONE_ADVENTURE_PICKUPS, STONE_ADVENTURE_JUMP, stoneRoomAt } from '../src/arena/stoneAdventure';
import { createSpatialWorld } from '../src/physics/rapierWorld';
import { Simulation } from '../src/core/simulation';
import { Pickups } from '../src/core/pickups';
import { ArenaCamera } from '../src/render/camera';
import * as THREE from 'three';

test('the real adventure motor traverses the main route, side stairs and all three raised landings', async () => {
  const world = await createSpatialWorld(STONE_ADVENTURE, { stepHeight: .32 });
  try {
    const sim = new Simulation(world, STONE_ADVENTURE.spawn, STONE_ADVENTURE_JUMP), visited = new Set<string>();
    const go = (x: number, z: number) => {
      for (let i = 0; i < 420; i++) {
        const s = sim.snapshot(), dx = x-s.position.x, dz = z-s.position.z, distance = Math.hypot(dx,dz);
        const room = stoneRoomAt(s.position); if (room) visited.add(room.id);
        if (distance < .12 && s.grounded) return s;
        sim.step({ x: distance < .12 ? 0 : dx / Math.max(1,distance), z: distance < .12 ? 0 : dz / Math.max(1,distance), sprint: false });
      }
      assert.fail(`Cannot reach ${x}, ${z}: ${JSON.stringify(sim.snapshot())}`);
    };
    for (const [x,z] of [[0,33],[0,26],[0,18.5],[-3,18.5],[0,18.5],[0,8],[0,2],[-10,2]] as const) go(x,z);
    assert.equal(go(-13.5,4).surface,'side-terrace');
    assert.ok(Math.abs(sim.snapshot().position.y-1.1)<.06);
    for (const [x,z] of [[-13.5,0],[-9,-.4],[-10,2],[0,2],[0,8],[11,8],[11,6.5],[11,-1],[11,-7]] as const) go(x,z);
    assert.equal(sim.snapshot().surface,'thrower-plinth');
    for (const [x,z] of [[11,-1],[0,-1],[0,-14],[0,-19],[13,-19],[13,-20],[0,-20],[0,-23],[-12,-23]] as const) go(x,z);
    assert.equal(sim.snapshot().surface,'boss-health-plateau');
    for (const [x,z] of [[0,-23],[0,-19],[-16,-19],[-16,-37],[-13,-37],[0,-38.5],[0,-40]] as const) go(x,z);
    assert.deepEqual([...visited].sort(),['A','B','C','D','E','F','G','H']);
    for (let i=0;i<120;i++) sim.step({ x:0,z:-1,sprint:true });
    assert.ok(sim.snapshot().position.z > -42,'closed north gate blocks physical movement');
  } finally { world.dispose(); }
});

test('adventure pickups preserve partial contents, remain consumed and reset only explicitly', async () => {
  const world = await createSpatialWorld(STONE_ADVENTURE, { stepHeight: .32 });
  try {
    const item = STONE_ADVENTURE_PICKUPS.find(p => p.id==='side-health')!;
    const sim = new Simulation(world, item.position); sim.reset();
    for(let i=0;i<12;i++) sim.step({x:0,z:0,sprint:false});
    const pickups = new Pickups([item],false);
    pickups.step(1,sim.snapshot(),world,() => 5);
    assert.equal(pickups.snapshot()[0]!.remaining,30);
    pickups.step(800,null,world,() => 0);
    assert.equal(pickups.snapshot()[0]!.remaining,30);
    pickups.step(801,sim.snapshot(),world,(_kind,amount) => amount);
    pickups.step(1800,sim.snapshot(),world,() => assert.fail('consumed pickup must not respawn'));
    assert.equal(pickups.snapshot()[0]!.remaining,0);
    pickups.reset(); assert.equal(pickups.snapshot()[0]!.remaining,35);
  } finally { world.dispose(); }
});

test('adventure camera follows the whole level and snaps to spawn without changing the arena default', () => {
  const camera = new ArenaCamera(); camera.resize(1366,768);
  const start = STONE_ADVENTURE.spawn; camera.trackPlayer(start,1.2,'side');
  assert.equal(camera.mode,'side');
  const startScreen = new THREE.Vector3(start.x,0,start.z).project(camera.camera);
  const aheadScreen = new THREE.Vector3(start.x,0,start.z-10).project(camera.camera);
  assert.ok(aheadScreen.x > startScreen.x && Math.abs(aheadScreen.y-startScreen.y)<.001,'northward route goes right on screen');
  assert.ok(camera.basis().right.z < -.99,'D/right joystick advances along the route');
  assert.ok(Math.abs(new THREE.Vector3(start.x,0,start.z).project(camera.camera).x)<.001);
  for(let i=0;i<180;i++) camera.follow({x:0,y:0,z:-40},1/60);
  assert.ok(Math.abs(new THREE.Vector3(0,0,-40).project(camera.camera).y)<.001);
  camera.toggle(); camera.snap(start);
  assert.equal(camera.mode,'straight');
  const p = new THREE.Vector3(start.x,0,start.z).project(camera.camera);
  assert.ok(Math.hypot(p.x,p.y)<.001);
  camera.toggle(); assert.equal(camera.mode,'isometric');
  camera.toggle(); assert.equal(camera.mode,'side');
  camera.resize(844,390); const desktopHeight = camera.camera.top-camera.camera.bottom;
  camera.resize(844,390,true);
  assert.ok(Math.abs(desktopHeight/(camera.camera.top-camera.camera.bottom)-1.45)<.001);
  camera.snap(start);
  for(let i=0;i<120;i++) camera.follow(start,1/60,{x:0,y:0,z:-7.2});
  assert.ok(new THREE.Vector3(start.x,0,start.z).project(camera.camera).x<-.05,'mobile camera leaves space ahead');
  camera.resize(844,390,false); camera.snap(start);
  for(let i=0;i<120;i++) camera.follow(start,1/60,{x:0,y:0,z:-7.2});
  assert.ok(Math.abs(new THREE.Vector3(start.x,0,start.z).project(camera.camera).x)<.001,'desktop camera keeps its framing');
  const old = new ArenaCamera(); old.snap({x:10,y:0,z:0});
  assert.ok(Math.abs(old.camera.position.x-4.2)<.001);
});

test('adventure jump lands in about 0.7 seconds and still clears the side terrace', async (t) => {
  const world = await createSpatialWorld(STONE_ADVENTURE,{stepHeight:.32});
  try {
    const flight = (profile?: typeof STONE_ADVENTURE_JUMP) => {
      const sim = new Simulation(world,STONE_ADVENTURE.spawn,profile); sim.reset();
      for(let i=0;i<12;i++) sim.step({x:0,z:0,sprint:false});
      const ground = sim.snapshot().position.y;
      let s = sim.step({x:0,z:0,sprint:false,jump:true}), ticks = 1, height = 0;
      while(!s.grounded && ticks<120) {
        height = Math.max(height,s.position.y-ground);
        s = sim.step({x:0,z:0,sprint:false}); ticks++;
      }
      assert.ok(s.grounded); return {seconds:ticks/60,height};
    };
    const before = flight(), after = flight(STONE_ADVENTURE_JUMP);
    assert.ok(after.seconds>=.65 && after.seconds<=.76);
    assert.ok(after.height>=1.9 && after.height<=2.3);
    assert.ok(after.seconds<before.seconds*.8 && after.height<before.height*.85);
    const sim = new Simulation(world,{x:-11.5,y:.06,z:8},STONE_ADVENTURE_JUMP); sim.reset();
    for(let i=0;i<12;i++) sim.step({x:0,z:0,sprint:false});
    sim.step({x:0,z:-1,sprint:false,jump:true});
    for(let i=0;i<60 && !sim.snapshot().grounded;i++) sim.step({x:0,z:-1,sprint:false});
    assert.equal(sim.snapshot().surface,'side-terrace');
    t.diagnostic(JSON.stringify({before,after,landing:sim.snapshot().surface}));
  } finally { world.dispose(); }
});
