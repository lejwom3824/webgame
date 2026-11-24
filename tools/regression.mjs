// Run with Node 22+ and Chromium against a local Python HTTP server.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';

const base = process.argv[2] || 'http://127.0.0.1:8000';
const profile = await mkdtemp(join(tmpdir(), 'midgard-test-'));
const chrome = spawn(process.env.CHROMIUM || 'chromium', [
  ...(process.env.CHROMIUM_NO_SANDBOX === '1' ? ['--no-sandbox'] : []),
  '--headless', '--disable-dev-shm-usage', '--force-prefers-reduced-motion',
  '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank',
], {stdio: 'inherit'});
const closed = once(chrome, 'close');
let socket;

try {
  let port;
  for (let i = 0; i < 100 && !port; i++) {
    try {
      port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0];
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      await delay(100);
    }
  }
  assert.ok(port, 'Chromium debugging endpoint');
  const [tab] = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
  socket = new WebSocket(tab.webSocketDebuggerUrl);
  await Promise.race([once(socket, 'open'), delay(5000).then(() => {throw Error('DevTools connection timed out')})]);
  let onLoad;
  async function withDeadline(promise, label) {
    let timeout;
    try {
      return await Promise.race([promise, new Promise((_, reject) => {
        timeout = setTimeout(() => reject(Error(label + ' timed out')), 15000);
      })]);
    } finally {
      clearTimeout(timeout);
    }
  }
  const commands = new Map();
  let serial = 0;
  const errors = [];
  socket.onmessage = ({data}) => {
    const message = JSON.parse(data);
    if (message.method === 'Page.loadEventFired') onLoad?.();
    if (message.method === 'Runtime.exceptionThrown') {
      const detail = message.params.exceptionDetails;
      errors.push(detail.exception?.description || detail.text);
    }
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
      errors.push(message.params.args.map(arg => arg.description || arg.value).join(' '));
    }
    commands.get(message.id)?.(message);
  };
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++serial;
      const timeout = setTimeout(() => {
        commands.delete(id);
        reject(Error(method + ' timed out'));
      }, 15000);
      commands.set(id, message => {
        clearTimeout(timeout);
        commands.delete(id);
        if (message.error) reject(Error(message.error.message));
        else resolve(message.result);
      });
      socket.send(JSON.stringify({id, method, params}));
    });
  }
  async function evaluate(expression, awaitPromise = false) {
    const response = await send('Runtime.evaluate', {expression, awaitPromise, returnByValue: true});
    assert.ok(!response.exceptionDetails, response.exceptionDetails?.exception?.description);
    return response.result.value;
  }
  async function open(path) {
    const url = new URL(path, base).href;
    assert.equal((await fetch(url)).status, 200, path);
    const loaded = new Promise(resolve => {onLoad = resolve});
    await send('Page.navigate', {url});
    await withDeadline(loaded, 'Page load');
    for (let i = 0; i < 100; i++) {
      if (await evaluate('location.href === ' + JSON.stringify(url) + ' && typeof slotRead === "function" && !!document.querySelector("#ttlTap")')) return;
      await delay(100);
    }
    throw Error(path + ' did not boot');
  }
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', {source: `
    let testSeed = 12345;
    Math.random = () => {
      testSeed = (Math.imul(testSeed, 1664525) + 1013904223) >>> 0;
      return testSeed / 4294967296;
    };
  `});
  await open('/dist/midgard.html');
  assert.equal(await evaluate('$("#ttl").click(); $("#mSet").click(); !$("#modal").hidden'), true, 'Bundled menu and settings');
  console.log('PASS Standalone bundle boots and opens settings');
  await open('/index.html');
  const results = await evaluate('(' + scenarios.toString() + ')()', true);
  for (const result of results) console.log(result);
  await evaluate(`localStorage.clear(); S.run = newRun(rollHero('easy'));
    localStorage.setItem(SAVE_KEY, JSON.stringify(S.run));
    for (let i = 0; i < SLOT_MAX; i++) manualSave(i);
  `);
  await open('/index.html');
  const keptWhenFull = await evaluate('!!localStorage.getItem(SAVE_KEY) && slotCount() === SLOT_MAX');
  await evaluate(`slotDel(0); localStorage.setItem(SAVE_KEY, JSON.stringify(newRun(rollHero('easy'))));`);
  const {identifier} = await send('Page.addScriptToEvaluateOnNewDocument', {source: `
    const realStorageSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'ash-midgard-slot-0') throw new DOMException('Test quota', 'QuotaExceededError');
      return realStorageSet.call(this, key, value);
    };
  `});
  await open('/index.html');
  const keptOnError = await evaluate('!!localStorage.getItem(SAVE_KEY) && !slotRead(0)');
  await send('Page.removeScriptToEvaluateOnNewDocument', {identifier});
  await evaluate('if (!localStorage.getItem(SAVE_KEY)) localStorage.setItem(SAVE_KEY, JSON.stringify(newRun(rollHero("easy"))))');
  await open('/index.html');
  const moved = await evaluate('!localStorage.getItem(SAVE_KEY) && slotRead(0)?.data.slot === 0');
  for (const [ok, title] of [[keptWhenFull, 'Legacy save kept with full slots'], [keptOnError, 'Legacy save kept on write error'], [moved, 'Legacy save moved after successful write']]) {
    results.push((ok ? 'PASS ' : 'FAIL ') + title);
    console.log(results.at(-1));
  }
  assert.deepEqual(errors, [], 'Uncaught browser errors or console.error');
  assert.ok(results.every(line => line.startsWith('PASS ')), 'Scenario failure');
} finally {
  socket?.close();
  chrome.kill();
  await closed;
  await rm(profile, {recursive: true, force: true});
}

async function scenarios() {
  const results = [];
  const check = (ok, message) => {if (!ok) throw Error(message)};
  const click = selector => {
    const button = document.querySelector(selector);
    check(button && !button.disabled, 'Available control: ' + selector);
    button.dispatchEvent(new MouseEvent('click', {bubbles: true}));
  };
  const until = async (predicate, message) => {
    for (let i = 0; i < 70; i++) {
      if (predicate()) return;
      await new Promise(resolve => setTimeout(resolve, 25));
    }
    throw Error(message);
  };
  const reset = () => {
    localStorage.clear();
    $('#toast').replaceChildren();
    S.busy = false;
    S.C = null;
    S.pendingSlot = null;
    S.tb = null;
    S.hero = null;
    showTitle({menu: true});
  };
  const run = act => {
    S.run = newRun(rollHero('easy'));
    S.run.act = act;
    S.run.tut = false;
    S.run.traits = [];
    return S.run;
  };
  const battle = keys => {
    const r = S.run;
    r.deck = Array.from({length: 5}, () => ({id: 'slash', uid: UID++}));
    r.atk = 10;
    r.acc = 200;
    const enemies = keys.map(key => Object.assign(makeEnemy(key), {
      hp: 1000, maxHp: 1000, block: 0, traits: [], noFlee: true, lv: 4,
    }));
    r.at = {kind: 'combat', enemies: structuredClone(enemies)};
    startCombat(enemies);
    return enemies;
  };
  const select = type => {
    S.run.map.opts = [type];
    showMap();
    click('.mnode.avail');
  };
  const test = async (name, fn) => {
    reset();
    try {
      await fn();
      results.push('PASS ' + name);
    } catch (error) {
      results.push('FAIL ' + name + ' — ' + error.message);
    }
  };

  await test('Training UI, deck, attack, end turn, isolated slots', async () => {
    click('#mTrain');
    click('#trStart8');
    click('#trFxGo');
    await until(() => $('#trFxBtn') && S.run?.train && S.C?.turn === 1, 'Training combat');
    await until(() => !$('#modal').hidden, 'Training effects menu');
    closeModal();
    const c = S.C.hand.find(card => !canPlay(card));
    check(c, 'Playable card');
    await playCard(c.uid);
    check(!S.C.hand.includes(c), 'Card consumed');
    await endTurn();
    check(S.C.turn === 2 && slotCount() === 0, 'Next turn with no campaign saves');
  });

  await test('New game through title and tutorial prompt', () => {
    click('#mClimb');
    click('#tbNo');
    click('#pClimb');
    check(S.screen === 'map' && S.run.act === 1 && S.run.floor === 0 && slotCount() === 1, 'Chapter 1 starting map and autosave');
  });

  await test('Chapter 1 map, single combat, reward, shop and reload', async () => {
    const r = run(1);
    select('battle');
    check(S.screen === 'combat' && r.floor === 1 && liveFoes().length === 1, 'First map move');
    S.C.E.noFlee = true;
    await endTurn();
    check(S.C.turn === 2 && S.C.phase === 'player', 'Enemy turn completed');
    S.C.E.block = 0;
    const gold = r.gold;
    fixedDmg(S.C.E.hp, 'test');
    await until(() => S.screen === 'reward', 'Chapter 1 reward');
    check(r.gold > gold && r.exp === 0 && !$('#rwKill'), 'Chapter 1 reward and no kill choice');
    const store = (r.store || []).length;
    click('[data-rw]');
    check((r.store || []).length === store + 1 && !$('[data-rw]'), 'Reward granted once');
    click('#goR');
    select('shop');
    click('#screen [data-i="0"]');
    check(S.screen === 'shop', 'Shop entry');
    const cash = r.gold;
    r.gold += 10000;
    showShop();
    click('[data-bc]');
    if ($('#wBuy') && !$('#modal').hidden) click('#wBuy');
    check(r.gold < cash + 10000 && (r.store || []).length === store + 2, 'Shop purchase');
    click('#sLeave');
    const before = r.gold;
    openGameMenu();
    click('#gmSave');
    check(S.screen === 'title', 'Successful save returns to title');
    click('#mCont');
    click('[data-go="' + r.slot + '"]');
    check(S.screen === 'map' && S.run.gold === before && S.run !== r, 'Restored map and gold');
  });

  await test('Obsolete chapter 1 event save returns to the map', () => {
    const r = run(1);
    r.at = {kind: 'event', ev: 'counsel'};
    save();
    showTitle({menu: true});
    click('#mCont');
    click('[data-go="' + r.slot + '"]');
    check(S.screen === 'map' && !S.run.at && !slotRead(r.slot).data.at, 'Removed event recovered and autosaved');
  });

  await test('Save and exit storage failure retains the current run', () => {
    const r = run(1);
    showMap();
    const existing = localStorage.getItem(SLOT_KEY(r.slot));
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === SLOT_KEY(r.slot)) throw new DOMException('Test quota', 'QuotaExceededError');
      return set.call(this, key, value);
    };
    try {
      openGameMenu();
      click('#gmSave');
      check(S.run === r && S.screen === 'map' && !$('#modal').hidden, 'Save failed but player left the run');
      check(localStorage.getItem(SLOT_KEY(r.slot)) === existing, 'Existing save preserved');
    check(!$('#toast').textContent.includes('저장 기록에 저장했다'), 'No success toast after storage failure');
    } finally {
      Storage.prototype.setItem = set;
    }
  });

  await test('Save and exit with all slots reserved retains a manually loaded run', () => {
    const r = run(1);
    for (let i = 0; i < SLOT_MAX; i++) check(manualSave(i), 'Create manual slot');
    showTitle({menu: true});
    click('#mCont');
    click('[data-go="0"]');
    check(S.run.slot == null && slotCount() === SLOT_MAX, 'No automatic slot');
    const loaded = S.run;
    openGameMenu();
    click('#gmSave');
    check(S.run === loaded && !$('#modal').hidden, 'No free slot but player left the run');
  });

  await test('Menu cannot save the already credited combat before reward is persisted', async () => {
    const r = run(1);
    battle(['priest']);
    save();
    fixedDmg(S.C.E.hp, 'test');
    openGameMenu();
    const offered = !$('#modal').hidden && !!$('#gmSave');
    await until(() => S.screen === 'reward', 'Reward persisted');
    check(!offered && slotRead(r.slot).data.at.kind === 'reward', 'Save and exit offered during reward settlement');
    openGameMenu();
    check(!$('#modal').hidden && !!$('#gmSave'), 'Menu available on the reward screen');
  });

  await test('Chapter 1 boss phase change, knights and end-of-chapter gate', async () => {
    const r = run(1);
    r.maxHp = r.hp = 10000;
    r.map.row = r.floor = BOSS_ROW - 1;
    select('boss');
    const bishop = S.C.E;
    bishop.block = 0;
    fixedDmg(bishop.hp, 'test');
    check(bishop.pendPhase === 2, 'Boss enters pending phase 2');
    await endTurn();
    check(bishop.phase === 2 && knAlive().length >= 2, 'Phase 2 and knight summon');
    for (const knight of knAlive()) knight.hp = 0;
    setTarget(bishop);
    bishop.block = 0;
    fixedDmg(bishop.hp, 'test');
    await until(() => S.screen === 'reward', 'Boss reward');
    click('#goR');
    check(S.screen === 'a1end' && r.at.kind === 'a1end', 'Published chapter 1 ending');
  });

  await test('Chapter 2 gate remains in normal routing; skip opens the fall scene', async () => {
    run(1);
    skipToA2();
    check(S.screen === 'fall', 'Skip to fall');
    click('#fallcut');
    check(S.run.act === 2 && S.screen === 'event', 'Chapter 2 landing');
    resumeAt();
    check(S.screen === 'a1end', 'Chapter 2 resume gate');
    await new Promise(resolve => setTimeout(resolve, 225));
  });

  // The shipped resume and map routes gate chapter 2. Exercise its components
  // directly in this disposable browser, leaving their production routing intact.
  await test('Chapter 2 map movement, shop purchase and event', () => {
    const r = run(2);
    r.dir = 'E';
    r.m2 = genMap2(r.dir);
    r.gold = 100000;
    r.flags.melIntro = 1;
    r.flags.reg = {E: 1, W: 1, N: 1, S: 1};
    showMap2();
    const from = r.m2.cur;
    enterNode2(r.m2.nodes[from].adj.find(id => r.m2.nodes[id].kind !== 'center'));
    check(r.m2.cur !== from && r.floor === 1, 'Adjacent node movement');
    r.at = {kind: 'shop2', node: from};
    showShop2();
    const cash = r.gold;
    const count = (r.store || []).length;
    click('[data-bc]');
    check(r.gold < cash && (r.store || []).length === count + 1, 'Workshop card purchase');
    const [key, event] = Object.entries(GEV).find(([, e]) => e.place === 'nidavellir' &&
      e.choices.some(c => !c.chk && !c.cost && c.fx?.length === 0));
    const choice = event.choices.findIndex(c => !c.chk && !c.cost && c.fx?.length === 0);
    showEventKey(key);
    click('#screen [data-i="' + choice + '"]');
    check(r.flags.events.includes(key), 'Event choice recorded');
  });

  await test('Disabled companion recruitment skips the scene', () => {
    const r = run(2);
    const node = {fix: 'smith'};
    mateVisit(node);
    check(node.fixDone && !r.pal && !r.mates?.smith && S.screen === 'a1end', 'Recruitment rollback remains active');
  });

  await test('Chapter 2 target selection, card damage, multiple enemy turns and C.E restoration', async () => {
    run(2);
    const [first, chosen] = battle(['porter', 'mech']);
    setTarget(chosen);
    const card = S.C.hand[0];
    const energy = S.C.energy;
    await playCard(card.uid);
    check(first.hp === 1000 && chosen.hp < 1000 && S.C.energy < energy, 'Attack hit only selected foe');
    first.el = 3;
    chosen.burn = 5;
    await endTurn();
    check(first.hp < 1000 && !first.el && !chosen.burn && S.C.turn === 2 && S.C.E === chosen && !S.busy, 'Status and turn: ' + JSON.stringify({hp:first.hp, el:first.el, burn:chosen.burn, turn:S.C.turn, target:S.C.E.key, busy:S.busy}));
    try {
      await withFoe(first, async () => {await Promise.resolve(); throw Error('test rejection')});
    } catch (error) {
      check(error.message === 'test rejection', 'Expected rejection');
    }
    check(S.C.E === chosen, 'Target restored even when awaited action rejects');
    const swap = S.C;
    await withFoe(first, async () => {S.C = {...swap, E: chosen}});
    check(S.C !== swap && S.C.E === chosen, 'Asynchronous cleanup leaves the replacement combat alone');
  });

  for (const choice of ['Sub', 'Kill']) {
    await test('Chapter 2 direct defeat and reward choice ' + choice, async () => {
      const r = run(2);
      const [first, last] = battle(['porter', 'mech']);
      first.hp = last.hp = 1;
      await playCard(S.C.hand[0].uid);
      await until(() => S.C.E === last, 'Retarget last foe');
      const gold = r.gold;
      await playCard(S.C.hand[0].uid);
      await until(() => S.screen === 'reward', 'Multiple-foe reward');
      check(r.gold > gold && r.at.killEx > 0 && r.lvl === 1 && r.exp === 0, 'Reward before growth choice');
      click('#rw' + choice);
      check(r.at.killDone && !$('#rwKill'), 'Choice only available once');
      check(choice === 'Kill' ? r.flags.slain && (r.lvl > 1 || r.exp > 0) :
        !r.flags.slain && r.lvl === 1 && r.exp === 0, 'Expected growth and first-kill flag');
      const saved = slotRead(r.slot).data;
      check(saved.at.killDone && saved.lvl === r.lvl && saved.exp === r.exp, 'Choice persisted');
    });
  }

  await test('Chapter 2 single boss phase change and victory screen via internal setup', async () => {
    const r = run(2);
    r.maxHp = r.hp = 10000;
    const [clerk] = battle(['clerk']);
    save();
    fixedDmg(clerk.hp, 'test');
    check(clerk.pendPhase === 2, 'Clerk enters pending phase 2');
    await endTurn();
    check(clerk.phase === 2 && S.C.turn === 2, 'Clerk phase 2 and next turn');
    clerk.block = 0;
    fixedDmg(clerk.hp, 'test');
    await until(() => S.screen === 'victory', 'Chapter 2 ending');
    check($('#goT') && !slotRead(r.slot), 'Victory and completed autosave cleared');
  });

  await test('Chapter 2 damage over time gives no kill experience', async () => {
    const r = run(2);
    const [foe] = battle(['porter']);
    foe.el = foe.hp;
    await endTurn();
    await until(() => S.screen === 'reward', 'Damage-over-time reward');
    check(foe.dotKill && r.at.killEx === 0 && !$('#rwKill') && r.exp === 0, 'No direct-kill experience');
  });

  return results;
}
