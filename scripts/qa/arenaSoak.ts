import { writeFileSync, mkdirSync } from 'node:fs';
import { cpus, totalmem, platform, release } from 'node:os';
import assert from 'node:assert/strict';
import { createCombatBot } from '../../src/app/combatBot';
import { ARENA_FIGHTERS } from '../../src/arena/teams';
import { EXPANDED_ARENA, EXPANDED_PICKUPS, TEAM_SPAWNS } from '../../src/arena/expandedArena';
import { ArenaMatch, MATCH_RULES } from '../../src/core/match';
import { Pickups } from '../../src/core/pickups';
import { BOT_DIFFICULTIES, actorCenter, perceive, type BotDifficulty } from '../../src/core/bot';
import { WEAPONS } from '../../src/core/combat';
import type { Vec3 } from '../../src/core/types';

// Deterministic starting variations, not a production RNG or altered combat rules.
const random = (seed: number) => () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
const distance = (a: Vec3, b: Vec3) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
const out = process.argv[2] ?? 'docs/qa/m2-6/soak.json';
const firstSeed = Number(process.argv[3] ?? 1), lastSeed = Number(process.argv[4] ?? 10);
const reports = [];
for (const difficulty of Object.keys(BOT_DIFFICULTIES) as BotDifficulty[]) for (let seed = firstSeed; seed <= lastSeed; seed++) {
  const rand = random(seed);
  const roster = ARENA_FIGHTERS.map(fighter => ({ ...fighter, facing: fighter.facing + (rand() - .5),
    spawn: { ...TEAM_SPAWNS[fighter.id]!, x: TEAM_SPAWNS[fighter.id]!.x + (rand() - .5), z: TEAM_SPAWNS[fighter.id]!.z + (rand() - .5) * .6 } }));
  const bots = [];
  for (const fighter of roster) { const bot = await createCombatBot(fighter, roster, EXPANDED_ARENA, true); bot.setDifficulty(difficulty); bots.push(bot); }
  const match = new ArenaMatch(roster), pickups = new Pickups(EXPANDED_PICKUPS); match.start();
  const progress = new Map<string, { position: Vec3; tick: number }>();
  const stuck: unknown[] = [], surfaces = new Map(bots.map(bot => [bot.fighter.id, new Set<string>()]));
  const collected: Record<string, number> = {}, combat: Record<string, { shots: number; contacts: number; damage: number }> = {};
  const trace: unknown[] = [];
  const started = performance.now();
  try {
    while (match.snapshot().phase === 'running') {
      const before = match.snapshot(), tick = before.tick + 1;
      const actors = bots.map(bot => ({ life: before.actors[bot.fighter.id]!, position: bot.snapshot().position }));
      const attacks = bots.map(bot => ({ id: bot.fighter.id, ...bot.stepActors(tick, before.actors[bot.fighter.id]!, actors.filter(actor => actor.life.id !== bot.fighter.id), pickups.snapshot()) }));
      match.step(attacks.flatMap(attack => attack.damage), attacks.filter(attack => attack.attacked).map(attack => attack.id));
      const after = match.snapshot();
      const remainingDamage = new Map(actors.map(actor => [actor.life.id, Math.max(0,
        actor.life.hp + actor.life.armor - after.actors[actor.life.id]!.hp - after.actors[actor.life.id]!.armor)]));
      for (const [i, bot] of bots.entries()) {
        const id = bot.fighter.id, own = bot.snapshot(), life = after.actors[id]!, attack = attacks[i]!, inventory = bot.weapons.snapshot();
        assert.ok(Object.values(own.position).every(Number.isFinite) && Math.abs(own.position.x) < 29 && Math.abs(own.position.z) < 19 && own.position.y > -8);
        assert.ok(life.hp >= 0 && life.hp <= 100 && life.armor >= 0 && life.armor <= 100 && inventory.ammo >= 0 && inventory.ammo <= 54 && inventory.railAmmo! >= 0 && inventory.railAmmo! <= 6);
        if (bot.decision?.targetId) assert.notEqual(before.actors[bot.decision.targetId]!.team, bot.fighter.team);
        if (own.surface) surfaces.get(id)!.add(own.surface);
        const statsFor = (weapon: string, targetId?: string | null) => {
          const target = actors.find(actor => actor.life.id === targetId);
          const visible = !!target && !!perceive(bot.world, own.position, own.facing, { id: target.life.id, center: actorCenter(target.position), radius: .6 });
          const bucket = [weapon, target ? distance(own.position, target.position) < 6 ? 'near' : 'far' : 'no-target', visible ? 'visible' : 'hidden',
            Math.hypot(own.velocity.x, own.velocity.z) > .3 ? 'moving' : 'holding'].join('/');
          return combat[bucket] ??= { shots: 0, contacts: 0, damage: 0 };
        };
        if (attack.attacked) statsFor(attack.weapon, bot.decision?.targetId).shots++;
        for (const hit of attack.damage) if (before.actors[hit.target]?.team !== bot.fighter.team && before.actors[hit.target]) {
          // Current weapon damage quanta are distinct. Classify at impact, so a
          // Pulse still in flight is not attributed to a subsequently selected Arc.
          const weapon = hit.amount === WEAPONS.rail.damage ? 'rail' : hit.amount === WEAPONS.pulse.damage ? 'pulse' : 'arc';
          const stats = statsFor(weapon, hit.target);
          stats.contacts++;
          // Resolve attribution in the same order as ArenaMatch; never count
          // overkill twice when several actors hit the same life in one tick.
          const accepted = Math.min(hit.amount, remainingDamage.get(hit.target) ?? 0);
          stats.damage += accepted; remainingDamage.set(hit.target, (remainingDamage.get(hit.target) ?? 0) - accepted);
        }
        // Holding in weapon range or waiting for reaction is not a failed movement request.
        const wantsMove = life.alive && bot.intent?.requested
          && (distance(own.position, bot.intent.goal) > .5 || own.surface !== bot.intent.surface);
        const old = progress.get(id);
        if (!wantsMove || !old || distance(old.position, own.position) > .5 || life.alive !== before.actors[id]!.alive) progress.set(id, { position: own.position, tick });
        else if (tick - old.tick >= 300) {
          stuck.push({ id, tick, position: own.position, intent: bot.intent, resource: bot.resourceGoal, decision: bot.decision, nearby: actors });
          progress.set(id, { position: own.position, tick });
        }
        if (life.alive !== before.actors[id]!.alive) { bot.clear(); if (life.alive) bot.reset(); }
        if (after.phase === 'running') pickups.step(tick, life.alive ? bot.snapshot() : null, bot.world, (kind, amount) => {
          const taken = kind === 'rail' ? bot.weapons.addRailAmmo(amount) : kind === 'pulse' || kind === 'ammo' ? bot.weapons.addAmmo(amount, kind === 'pulse') : match.restore(id, kind === 'health' ? 'hp' : 'armor', amount);
          if (taken) collected[`${id}/${kind}`] = (collected[`${id}/${kind}`] ?? 0) + taken;
          return taken;
        });
      }
      if (tick % 300 === 0) trace.push({ tick, scores: after.scores, bots: bots.map(bot => ({ id: bot.fighter.id, position: bot.snapshot().position, goal: bot.resourceGoal, mode: bot.decision?.mode })) });
      assert.ok(tick <= MATCH_RULES.durationTicks);
    }
    const report = { difficulty, seed, seconds: match.snapshot().tick / 60, scores: match.snapshot().scores, reason: match.snapshot().reason,
      simulatedMs: Math.round(performance.now() - started), surfaces: Object.fromEntries([...surfaces].map(([id, values]) => [id, [...values]])), collected, combat, stuck, trace };
    reports.push(report);
    console.log(JSON.stringify({ difficulty, seed, seconds: report.seconds, scores: report.scores, stuck: stuck.length }));
  } finally { bots.forEach(bot => bot.dispose()); }
}
mkdirSync('docs/qa/m2-6', { recursive: true });
writeFileSync(out, JSON.stringify({ hardware: { cpu: cpus()[0]?.model, logicalCpus: cpus().length, ramGiB: +(totalmem() / 2 ** 30).toFixed(1), platform: platform(), release: release(), node: process.version }, reports }, null, 2) + '\n');
if (reports.some(report => report.stuck.length)) process.exitCode = 1;
