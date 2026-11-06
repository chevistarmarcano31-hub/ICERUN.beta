const Util = {
  clamp: (v,a,b) => Math.max(a, Math.min(b, v)),
  dist:  (a,b) => Math.hypot(a.x-b.x, a.y-b.y),
  rand:  (a,b) => Math.random()*(b-a)+a,
  randInt: (a,b) => Math.floor(Math.random()*(b-a+1))+a,
  pick: arr => arr[Math.floor(Math.random()*arr.length)],
  weightedPick: (arr, weights) => {
    let total = 0;
    for (const w of weights) total += w;
    let r = Math.random() * total;
    for (let i = 0; i < arr.length; i++) {
      r -= weights[i];
      if (r <= 0) return arr[i];
    }
    return arr[arr.length - 1];
  },
  circleCollide: (a,b,ra,rb) => (a.x-b.x)**2+(a.y-b.y)**2 < (ra+rb)**2,
  pointInRect: (px, py, r) => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h,
  shuffle: arr => { for (let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; },
  rectsOverlap: (a,b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y,
};

/* ================================================================
   FX — gradientes y colores cacheados.
   Crear un gradiente radial por frame y por criatura es caro en
   móvil; aquí se crean una vez (en el origen) y se reutilizan con
   translate().
   ================================================================ */
const Fx = {
  _rgba: new Map(),
  _glow: new Map(),

  color(hex, alpha) {
    const key = hex + '|' + alpha;
    const cached = this._rgba.get(key);
    if (cached) return cached;
    let r = 255, g = 255, b = 255;
    if (typeof hex === 'string' && hex[0] === '#') {
      const h = hex.slice(1);
      if (h.length === 3) {
        r = parseInt(h[0] + h[0], 16);
        g = parseInt(h[1] + h[1], 16);
        b = parseInt(h[2] + h[2], 16);
      } else if (h.length >= 6) {
        r = parseInt(h.slice(0, 2), 16);
        g = parseInt(h.slice(2, 4), 16);
        b = parseInt(h.slice(4, 6), 16);
      }
    }
    const out = `rgba(${r},${g},${b},${alpha})`;
    this._rgba.set(key, out);
    return out;
  },

  glow(ctx, hex, radius, alpha = 0.4, inner = 2) {
    const key = `${hex}|${radius}|${alpha}|${inner}`;
    let grad = this._glow.get(key);
    if (!grad) {
      grad = ctx.createRadialGradient(0, 0, inner, 0, 0, radius);
      grad.addColorStop(0, this.color(hex, alpha));
      grad.addColorStop(1, this.color(hex, 0));
      this._glow.set(key, grad);
    }
    return grad;
  },

  drawGlow(ctx, x, y, radius, hex, alpha = 0.4, inner = 2) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = this.glow(ctx, hex, radius, alpha, inner);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
};


/* ===== save.js ===== */
const Save = {
  KEY: 'iceRun_v14',
  defaults() {
    return {
      bestFloor:0, totalRuns:0, totalKills:0, metaCoins:5000, metaGems:0,
      totalWins:0,
      totalUpgradesBought:0,
      bestLevelReached:1,
      totalGachaRolls:0,
      bestItemsInRun:0,
      bestSynergiesInRun:0,
      totalObstaclesDestroyed:0,
      totalConsumablesUsed:0,
      achievements: {},
      upgrades: { atk:0, def:0, maxHp:0, speed:0, crit:0 },
      options: {
        volume:70, sfx:80, music:true, minimap:true, difficulty:'normal',
        hud: {
          scale: 1,
          opacity: 1,
          autoHide: true,
          autoHideDelay: 6,
          show: {
            hp:true, abilities:true, floor:true, rooms:true, coins:true,
            stats:true, xp:true, consumables:true, minimap:true,
          },
        },
        mobileHud: {
          landscape: {},
          portrait: {},
        },
        lobbyLayouts: {
          desktop: {},
          tablet: {},
          mobileLandscape: {},
          mobilePortrait: {},
        },
      },
      customization: {
        sprite:'default', p1:'default', p2:'personaje-1',
        role:'tank', primary:'vigilante', secondary:'centinela',
        skinParts:{ shirt:0, pants:0, helmet:0 },
        armors:{ pants:null, jackets:null, helmets:null },
        armorLevels:{},
        weaponLevels:{},
        unlockedArmory:{ vigilante:true, avispon:true, centinela:true, rompehielo:true, cuchilla:true, hielo:true, granada:true, guante:true },
        roleProgress:{},
        expandedRole:'',
      },
      keybinds: {
        up:'w', down:'s', left:'a', right:'d',
        pause:'escape',
        basic:'z',
        melee:'e',
        long:'q',
        dash:'shift',
        block:'f',
        interact:'e',
        inventory:'i',
      },
      gamepad: {
        basic:7, melee:2, long:3, dash:1, block:0,
        pause:9, inventory:8, confirm:0, cancel:1,
      },
    };
  },
  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return this.defaults();
      const d = JSON.parse(raw);
      const def = this.defaults();
      const savedOptions = d.options || {};
      const savedHud = savedOptions.hud || {};
      return {
        ...def, ...d,
        upgrades: { ...def.upgrades, ...(d.upgrades||{}) },
        options:  {
          ...def.options, ...savedOptions,
          mobileHud: {
            ...def.options.mobileHud, ...(savedOptions.mobileHud || {}),
            landscape: { ...def.options.mobileHud.landscape, ...(savedOptions.mobileHud?.landscape || {}) },
            portrait: { ...def.options.mobileHud.portrait, ...(savedOptions.mobileHud?.portrait || {}) },
          },
          lobbyLayouts: {
            ...def.options.lobbyLayouts, ...(savedOptions.lobbyLayouts || {}),
            desktop: { ...def.options.lobbyLayouts.desktop, ...(savedOptions.lobbyLayouts?.desktop || {}) },
            tablet: { ...def.options.lobbyLayouts.tablet, ...(savedOptions.lobbyLayouts?.tablet || {}) },
            mobileLandscape: { ...def.options.lobbyLayouts.mobileLandscape, ...(savedOptions.lobbyLayouts?.mobileLandscape || {}) },
            mobilePortrait: { ...def.options.lobbyLayouts.mobilePortrait, ...(savedOptions.lobbyLayouts?.mobilePortrait || {}) },
          },
          hud: {
            ...def.options.hud, ...savedHud,
            show: { ...def.options.hud.show, ...(savedHud.show||{}) },
          },
        },
        customization: {
          ...def.customization, ...(d.customization||{}),
          skinParts: { ...def.customization.skinParts, ...(d.customization?.skinParts || {}) },
          armors: { ...def.customization.armors, ...(d.customization?.armors || {}) },
          armorLevels: { ...def.customization.armorLevels, ...(d.customization?.armorLevels || {}) },
          weaponLevels: { ...def.customization.weaponLevels, ...(d.customization?.weaponLevels || {}) },
          unlockedArmory: { ...def.customization.unlockedArmory, ...(d.customization?.unlockedArmory || {}) },
          roleProgress: { ...def.customization.roleProgress, ...(d.customization?.roleProgress || {}) },
        },
        keybinds: { ...def.keybinds, ...(d.keybinds||{}) },
        gamepad:  { ...def.gamepad,  ...(d.gamepad||{}) },
        achievements: { ...(d.achievements||{}) },
      };
    } catch { return this.defaults(); }
  },
  write() { try { localStorage.setItem(this.KEY, JSON.stringify(save)); } catch {} },
  clear() { try { localStorage.removeItem(this.KEY); } catch {} },
};
let save = Save.load();


/* ===== customization.js ===== */
