/* ================================================================
   ICE RUN — js/weapons.js
   Sistema de armas + mecánicas de disparo + alcance por arma.
   Requiere: config.js (CFG, RARITY), save.js (save, Save.write),
             player.js (Player).
   ================================================================ */
'use strict';

/* ================================================================
   1) WEAPONS_DB — 51 armas
   ================================================================
   - stats (ranged): { damageMul, fireRate, projectileSpeed, projectileSize,
                       projectileCount, spread, piercing, projectileColor,
                       slowDuration?, range }
   - meleeStats (CUERPO A CUERPO): { rangeMul, arcMul, damageMul,
                                     cooldownMul, knockbackMul }
   - attackSpeed / mobility / special → UI de la armería
   ================================================================ */
const WEAPONS_DB = {

  /* ==================== PISTOLAS (10) ==================== */
  avispon: {
    id:'avispon', name:'AVISPÓN', category:'PISTOLAS', icon:'🔫',
    desc:'Subfusil automático', art:'╞════╪══', rarity:'common',
    attackSpeed:18, mobility:16, special:-12,
    upgrade:'Ráfaga estable y cargador ampliado.',
    unlockLevel:1, unlockRole:'support', cost:350,
    stats:{ damageMul:0.85, fireRate:260, projectileSpeed:11, projectileSize:4,
            projectileCount:1, spread:0.05, piercing:false, projectileColor:'#4dffff',
            range:240 },
  },
  centinela: {
    id:'centinela', name:'CENTINELA', category:'PISTOLAS', icon:'🔫',
    desc:'Pistola de precisión', art:'╞═══◉', rarity:'rare',
    attackSpeed:8, mobility:8, special:4,
    upgrade:'Proyectiles perforantes.',
    unlockLevel:1, unlockRole:'hunter', cost:500,
    stats:{ damageMul:1.3, fireRate:480, projectileSpeed:13, projectileSize:5,
            projectileCount:1, spread:0, piercing:true, projectileColor:'#7bffd0',
            range:260 },
  },
  hielo: {
    id:'hielo', name:'NÚCLEO HIELO', category:'PISTOLAS', icon:'🔫',
    desc:'Catalizador elemental', art:'◈══✧', rarity:'epic',
    attackSpeed:-4, mobility:-4, special:32,
    upgrade:'Efecto elemental amplificado.',
    unlockLevel:5, unlockRole:'elementalist', cost:900,
    stats:{ damageMul:1.2, fireRate:420, projectileSpeed:10, projectileSize:6,
            projectileCount:1, spread:0, piercing:false, projectileColor:'#00e5ff',
            slowDuration:1800, range:260 },
  },
  pistola_escarcha: {
    id:'pistola_escarcha', name:'PISTOLA ESCARCHA', category:'PISTOLAS', icon:'🔫',
    desc:'Cadencia alta, daño bajo.', art:'╞════╪', rarity:'rare',
    attackSpeed:20, mobility:14, special:-6,
    upgrade:'Ráfaga helada mejorada.',
    unlockLevel:2, unlockRole:'runner', cost:550,
    stats:{ damageMul:0.85, fireRate:320, projectileSpeed:11, projectileSize:4,
            projectileCount:1, spread:0.03, piercing:false, projectileColor:'#a0ffff',
            range:240 },
  },
  pistola_berilo: {
    id:'pistola_berilo', name:'PISTOLA DE BERILO', category:'PISTOLAS', icon:'🔫',
    desc:'Perfora hasta 2 enemigos.', art:'◈═══◉', rarity:'epic',
    attackSpeed:6, mobility:6, special:16,
    upgrade:'Perforación doble.',
    unlockLevel:8, unlockRole:'hunter', cost:1200,
    stats:{ damageMul:1.3, fireRate:520, projectileSpeed:12, projectileSize:5,
            projectileCount:1, spread:0, piercing:true, projectileColor:'#7bffd0',
            range:260 },
  },
  'mass-pistolas-1': {
    id:'mass-pistolas-1', name:'PISTOLA ÁRTICA', category:'PISTOLAS', icon:'🔫',
    desc:'Arma desbloqueable de pistolas.', art:'╞═════✦', rarity:'common',
    attackSpeed:10, mobility:8, special:4,
    upgrade:'Núcleo mejorado al máximo.',
    unlockLevel:5, unlockRole:'support', cost:700,
    stats:{ damageMul:1.0, fireRate:420, projectileSpeed:11, projectileSize:5,
            projectileCount:1, spread:0.02, piercing:false, projectileColor:'#4dffff',
            range:260 },
  },
  'mass-pistolas-2': {
    id:'mass-pistolas-2', name:'PISTOLA DE RÁFAGA', category:'PISTOLAS', icon:'🔫',
    desc:'Arma desbloqueable de pistolas.', art:'╞═════✦', rarity:'rare',
    attackSpeed:16, mobility:6, special:2,
    upgrade:'Núcleo mejorado al máximo.',
    unlockLevel:6, unlockRole:'runner', cost:800,
    stats:{ damageMul:0.9, fireRate:320, projectileSpeed:11, projectileSize:4,
            projectileCount:1, spread:0.04, piercing:false, projectileColor:'#a0ffff',
            range:240 },
  },
  'mass-pistolas-3': {
    id:'mass-pistolas-3', name:'PISTOLA MAGNÉTICA', category:'PISTOLAS', icon:'🔫',
    desc:'Arma desbloqueable de pistolas.', art:'╞═════✦', rarity:'epic',
    attackSpeed:8, mobility:10, special:10,
    upgrade:'Núcleo mejorado al máximo.',
    unlockLevel:8, unlockRole:'hunter', cost:1200,
    stats:{ damageMul:1.2, fireRate:400, projectileSpeed:13, projectileSize:5,
            projectileCount:1, spread:0.02, piercing:true, projectileColor:'#7bffd0',
            range:260 },
  },
  'mass-pistolas-4': {
    id:'mass-pistolas-4', name:'PISTOLA DE PRECISIÓN', category:'PISTOLAS', icon:'🔫',
    desc:'Arma desbloqueable de pistolas.', art:'╞═════✦', rarity:'epic',
    attackSpeed:4, mobility:6, special:14,
    upgrade:'Núcleo mejorado al máximo.',
    unlockLevel:9, unlockRole:'hunter', cost:1300,
    stats:{ damageMul:1.4, fireRate:520, projectileSpeed:14, projectileSize:5,
            projectileCount:1, spread:0, piercing:true, projectileColor:'#7bffd0',
            range:260 },
  },

  /* ==================== RIFLES (14) ==================== */
  granada: {
    id:'granada', name:'GLACIADOR', category:'RIFLES', icon:'🔫',
    desc:'Rifle de asalto', art:'╞════╪═', rarity:'rare',
    attackSpeed:4, mobility:-4, special:14,
    upgrade:'Ráfaga táctica mejorada.',
    unlockLevel:3, unlockRole:'tactician', cost:700,
    stats:{ damageMul:1.3, fireRate:340, projectileSpeed:12, projectileSize:4,
            projectileCount:2, spread:0.06, piercing:false, projectileColor:'#4dffff',
            range:600 },
  },
  rifle_glacial: {
    id:'rifle_glacial', name:'RIFLE GLACIAL', category:'RIFLES', icon:'🔫',
    desc:'Doble cañón, cadencia media.', art:'╞══════╪', rarity:'rare',
    attackSpeed:4, mobility:-6, special:8,
    upgrade:'Doble proyectil helado.',
    unlockLevel:3, unlockRole:'tactician', cost:800,
    stats:{ damageMul:1.3, fireRate:340, projectileSpeed:12, projectileSize:4,
            projectileCount:2, spread:0.06, piercing:false, projectileColor:'#4dffff',
            range:600 },
  },
  rifle_boreal: {
    id:'rifle_boreal', name:'RIFLE BOREAL', category:'RIFLES', icon:'🔫',
    desc:'Tres proyectiles por ráfaga.', art:'╞══════╪╪', rarity:'epic',
    attackSpeed:0, mobility:-8, special:14,
    upgrade:'Ráfaga triple congelante.',
    unlockLevel:8, unlockRole:'ghostSniper', cost:1500,
    stats:{ damageMul:1.1, fireRate:420, projectileSpeed:13, projectileSize:4,
            projectileCount:3, spread:0.10, piercing:false, projectileColor:'#7dffff',
            slowDuration:1200, range:600 },
  },
  rifle_aurora: {
    id:'rifle_aurora', name:'RIFLE AURORA', category:'RIFLES', icon:'🔫',
    desc:'Ráfaga de 4. Daño masivo.', art:'╞══════╪╪╪', rarity:'legend',
    attackSpeed:-2, mobility:-10, special:22,
    upgrade:'Ráfaga legendaria.',
    unlockLevel:15, unlockRole:'tactician', cost:3000,
    stats:{ damageMul:1.6, fireRate:380, projectileSpeed:14, projectileSize:5,
            projectileCount:4, spread:0.12, piercing:false, projectileColor:'#ffd54f',
            range:600 },
  },
  rifle_plasma: {
    id:'rifle_plasma', name:'RIFLE DE PLASMA', category:'RIFLES', icon:'🔫',
    desc:'Proyectiles de plasma.', art:'╞════╪══', rarity:'rare',
    attackSpeed:6, mobility:-4, special:10,
    upgrade:'Plasma sobrecargado.',
    unlockLevel:4, unlockRole:'elementalist', cost:900,
    stats:{ damageMul:1.4, fireRate:380, projectileSpeed:12, projectileSize:5,
            projectileCount:1, spread:0.02, piercing:false, projectileColor:'#b48aff',
            range:600 },
  },
  rifle_hielo: {
    id:'rifle_hielo', name:'RIFLE DE HIELO', category:'RIFLES', icon:'🔫',
    desc:'Rifle criogénico.', art:'╞══════❄', rarity:'rare',
    attackSpeed:2, mobility:-4, special:12,
    upgrade:'Ralentización mejorada.',
    unlockLevel:5, unlockRole:'elementalist', cost:1000,
    stats:{ damageMul:1.2, fireRate:380, projectileSpeed:12, projectileSize:5,
            projectileCount:1, spread:0.03, piercing:false, projectileColor:'#7dffff',
            slowDuration:1500, range:600 },
  },
  rifle_pulsos: {
    id:'rifle_pulsos', name:'RIFLE DE PULSOS', category:'RIFLES', icon:'🔫',
    desc:'Pulsos de energía.', art:'╞════╪╪═', rarity:'rare',
    attackSpeed:8, mobility:-2, special:8,
    upgrade:'Cadencia aumentada.',
    unlockLevel:3, unlockRole:'tactician', cost:850,
    stats:{ damageMul:1.1, fireRate:300, projectileSpeed:13, projectileSize:4,
            projectileCount:1, spread:0.04, piercing:false, projectileColor:'#00e5ff',
            range:600 },
  },
  rifle_franco: {
    id:'rifle_franco', name:'RIFLE FRANCOTIRADOR', category:'RIFLES', icon:'🔭',
    desc:'Rifle de largo alcance.', art:'╞═══════◉', rarity:'epic',
    attackSpeed:-14, mobility:-12, special:20,
    upgrade:'Precisión extrema.',
    unlockLevel:10, unlockRole:'ghostSniper', cost:2000,
    stats:{ damageMul:2.4, fireRate:800, projectileSpeed:16, projectileSize:5,
            projectileCount:1, spread:0, piercing:true, projectileColor:'#ff7dff',
            range:600 },
  },
  rifle_radar: {
    id:'rifle_radar', name:'RIFLE DE RADAR', category:'RIFLES', icon:'📡',
    desc:'Detecta y dispara al enemigo.', art:'╞════╪📡', rarity:'rare',
    attackSpeed:4, mobility:-2, special:14,
    upgrade:'Autoapuntado mejorado.',
    unlockLevel:4, unlockRole:'tactician', cost:900,
    stats:{ damageMul:1.2, fireRate:360, projectileSpeed:12, projectileSize:4,
            projectileCount:2, spread:0.08, piercing:false, projectileColor:'#7bff9f',
            range:600 },
  },
  rifle_tormenta: {
    id:'rifle_tormenta', name:'RIFLE TORMENTA', category:'RIFLES', icon:'⚡',
    desc:'Rifle eléctrico.', art:'╞══════⚡', rarity:'epic',
    attackSpeed:6, mobility:-6, special:16,
    upgrade:'Ráfaga eléctrica.',
    unlockLevel:9, unlockRole:'tactician', cost:1800,
    stats:{ damageMul:1.5, fireRate:340, projectileSpeed:14, projectileSize:4,
            projectileCount:2, spread:0.05, piercing:false, projectileColor:'#ffe45e',
            range:600 },
  },
  rifle_perforante: {
    id:'rifle_perforante', name:'RIFLE PERFORANTE', category:'RIFLES', icon:'🔫',
    desc:'Atraviesa enemigos.', art:'╞════╪══◉', rarity:'epic',
    attackSpeed:-4, mobility:-8, special:18,
    upgrade:'Perforación total.',
    unlockLevel:8, unlockRole:'ghostSniper', cost:1600,
    stats:{ damageMul:1.8, fireRate:460, projectileSpeed:15, projectileSize:5,
            projectileCount:1, spread:0, piercing:true, projectileColor:'#b48aff',
            range:600 },
  },
  'mass-rifles-1': {
    id:'mass-rifles-1', name:'RIFLE DE HIELO II', category:'RIFLES', icon:'🔫',
    desc:'Arma desbloqueable de rifles.', art:'╞═════✦', rarity:'rare',
    attackSpeed:2, mobility:-4, special:10,
    upgrade:'Núcleo mejorado al máximo.',
    unlockLevel:6, unlockRole:'tactician', cost:900,
    stats:{ damageMul:1.3, fireRate:360, projectileSpeed:12, projectileSize:4,
            projectileCount:1, spread:0.03, piercing:false, projectileColor:'#7dffff',
            range:600 },
  },
  'mass-rifles-2': {
    id:'mass-rifles-2', name:'RIFLE DE PULSOS II', category:'RIFLES', icon:'🔫',
    desc:'Arma desbloqueable de rifles.', art:'╞═════✦', rarity:'rare',
    attackSpeed:6, mobility:-2, special:8,
    upgrade:'Núcleo mejorado al máximo.',
    unlockLevel:7, unlockRole:'tactician', cost:950,
    stats:{ damageMul:1.2, fireRate:340, projectileSpeed:12, projectileSize:4,
            projectileCount:2, spread:0.06, piercing:false, projectileColor:'#7bff9f',
            range:600 },
  },
  'mass-rifles-3': {
    id:'mass-rifles-3', name:'RIFLE TORMENTA II', category:'RIFLES', icon:'⚡',
    desc:'Arma desbloqueable de rifles.', art:'╞═════✦', rarity:'legend',
    attackSpeed:4, mobility:-6, special:22,
    upgrade:'Núcleo mejorado al máximo.',
    unlockLevel:14, unlockRole:'tactician', cost:3000,
    stats:{ damageMul:1.8, fireRate:340, projectileSpeed:14, projectileSize:5,
            projectileCount:3, spread:0.08, piercing:false, projectileColor:'#ffe45e',
            range:600 },
  },

  /* ==================== FRANCOTIRADORES (11) ==================== */
  'precision-rifle': {
    id:'precision-rifle', name:'RIFLE DE PRECISIÓN', category:'FRANCOTIRADORES', icon:'🔭',
    desc:'Francotirador de precisión', art:'╞═══════◉', rarity:'epic',
    attackSpeed:-35, mobility:-24, special:42,
    upgrade:'Disparo perforante de largo alcance.',
    unlockLevel:1, unlockRole:'ghostSniper', cost:2200,
    stats:{ damageMul:3.2, fireRate:900, projectileSpeed:20, projectileSize:5,
            projectileCount:1, spread:0, piercing:true, projectileColor:'#ff7dff',
            range:1400 },
  },
  'rail-cannon': {
    id:'rail-cannon', name:'CAÑÓN DE RIEL', category:'FRANCOTIRADORES', icon:'🔭',
    desc:'Cañón de riel', art:'╞════════◉', rarity:'legend',
    attackSpeed:-40, mobility:-28, special:48,
    upgrade:'Rayo perforante masivo.',
    unlockLevel:12, unlockRole:'ghostSniper', cost:4000,
    stats:{ damageMul:4.2, fireRate:1200, projectileSpeed:24, projectileSize:6,
            projectileCount:1, spread:0, piercing:true, projectileColor:'#d86cff',
            slowDuration:2000, range:1400 },
  },
  'ice-sniper': {
    id:'ice-sniper', name:'FRANCOTIRADOR DE HIELO', category:'FRANCOTIRADORES', icon:'🔭',
    desc:'Francotirador criogénico', art:'╞══════❄', rarity:'epic',
    attackSpeed:-32, mobility:-22, special:40,
    upgrade:'Rayo congelante.',
    unlockLevel:6, unlockRole:'elementalist', cost:2400,
    stats:{ damageMul:3.0, fireRate:950, projectileSpeed:18, projectileSize:5,
            projectileCount:1, spread:0, piercing:true, projectileColor:'#7dffff',
            slowDuration:2500, range:1400 },
  },
  kar98: {
    id:'kar98', name:'KAR98', category:'FRANCOTIRADORES', icon:'🔭',
    desc:'Fusil de cerrojo legendario. Precisión letal.', art:'╞════════❉', rarity:'legend',
    attackSpeed:-38, mobility:-26, special:46,
    upgrade:'Un disparo, una baja. Perfora todo.',
    unlockLevel:14, unlockRole:'ghostSniper', cost:4500,
    stats:{ damageMul:4.8, fireRate:1400, projectileSpeed:22, projectileSize:6,
            projectileCount:1, spread:0, piercing:true, projectileColor:'#ffe08a',
            range:1400 },
  },
  barrett_m82: {
    id:'barrett_m82', name:'BARRETT M82', category:'FRANCOTIRADORES', icon:'🔭',
    desc:'Rifle antimateria. Daño devastador.', art:'╞══════════◉', rarity:'legend',
    attackSpeed:-42, mobility:-30, special:50,
    upgrade:'Dispara a través de muros y enemigos.',
    unlockLevel:16, unlockRole:'tank', cost:5200,
    stats:{ damageMul:5.2, fireRate:1600, projectileSpeed:20, projectileSize:7,
            projectileCount:1, spread:0, piercing:true, projectileColor:'#ff6b3d',
            slowDuration:1500, range:1400 },
  },
  awm_glacial: {
    id:'awm_glacial', name:'AWM GLACIAL', category:'FRANCOTIRADORES', icon:'🔭',
    desc:'Francotirador polar. Ralentiza al impactar.', art:'╞═══════❄◉', rarity:'epic',
    attackSpeed:-34, mobility:-24, special:44,
    upgrade:'Ralentización masiva tras el disparo.',
    unlockLevel:12, unlockRole:'elementalist', cost:3800,
    stats:{ damageMul:3.8, fireRate:1200, projectileSpeed:20, projectileSize:6,
            projectileCount:1, spread:0, piercing:true, projectileColor:'#7dffff',
            slowDuration:2800, range:1400 },
  },
  dragunov: {
    id:'dragunov', name:'DRAGUNOV', category:'FRANCOTIRADORES', icon:'🔭',
    desc:'Semi-automático de precisión.', art:'╞══════◉═', rarity:'epic',
    attackSpeed:-28, mobility:-18, special:38,
    upgrade:'Cadencia mejorada. Perfora 2 enemigos.',
    unlockLevel:10, unlockRole:'hunter', cost:3200,
    stats:{ damageMul:3.0, fireRate:900, projectileSpeed:19, projectileSize:5,
            projectileCount:1, spread:0, piercing:true, projectileColor:'#ffd54f',
            range:1400 },
  },
  vss_vintorez: {
    id:'vss_vintorez', name:'VSS VINTOREZ', category:'FRANCOTIRADORES', icon:'🔭',
    desc:'Francotirador silencioso. Rápido y letal.', art:'╞═════◉~~', rarity:'rare',
    attackSpeed:-22, mobility:-14, special:30,
    upgrade:'Disparos rápidos y precisos.',
    unlockLevel:8, unlockRole:'assassin', cost:2600,
    stats:{ damageMul:2.6, fireRate:800, projectileSpeed:18, projectileSize:5,
            projectileCount:1, spread:0.01, piercing:true, projectileColor:'#b48aff',
            range:1400 },
  },
  m24_sniper: {
    id:'m24_sniper', name:'M24 SNIPER', category:'FRANCOTIRADORES', icon:'🔭',
    desc:'Fusil de francotirador militar estándar.', art:'╞═══════◉═', rarity:'rare',
    attackSpeed:-26, mobility:-16, special:34,
    upgrade:'Precisión militar. Perfora enemigos.',
    unlockLevel:7, unlockRole:'tactician', cost:2400,
    stats:{ damageMul:2.8, fireRate:1000, projectileSpeed:19, projectileSize:5,
            projectileCount:1, spread:0, piercing:true, projectileColor:'#7bffd0',
            range:1400 },
  },
  svd_dragunov: {
    id:'svd_dragunov', name:'SVD DRAGUNOV', category:'FRANCOTIRADORES', icon:'🔭',
    desc:'Rifle de tirador selectivo.', art:'╞══════◉══', rarity:'epic',
    attackSpeed:-24, mobility:-16, special:36,
    upgrade:'Doble impacto perforante.',
    unlockLevel:11, unlockRole:'specter', cost:3400,
    stats:{ damageMul:3.2, fireRate:950, projectileSpeed:19, projectileSize:5,
            projectileCount:1, spread:0, piercing:true, projectileColor:'#c47dff',
            range:1400 },
  },
  trg_42: {
    id:'trg_42', name:'TRG-42', category:'FRANCOTIRADORES', icon:'🔭',
    desc:'Francotirador finlandés de élite.', art:'╞════════◉', rarity:'legend',
    attackSpeed:-36, mobility:-22, special:44,
    upgrade:'Precisión ártica extrema.',
    unlockLevel:13, unlockRole:'ghostSniper', cost:4200,
    stats:{ damageMul:4.2, fireRate:1300, projectileSpeed:21, projectileSize:6,
            projectileCount:1, spread:0, piercing:true, projectileColor:'#4dffff',
            slowDuration:1200, range:1400 },
  },

  /* ==================== ESCOPETAS (10) ==================== */
  rompehielo: {
    id:'rompehielo', name:'ROMPEHIELO', category:'ESCOPETAS', icon:'💥',
    desc:'Escopeta táctica', art:'╞════╤══', rarity:'rare',
    attackSpeed:-10, mobility:-12, special:18,
    upgrade:'Dispersión congelante mejorada.',
    unlockLevel:1, unlockRole:'tank', cost:600,
    stats:{ damageMul:0.55, fireRate:650, projectileSpeed:9, projectileSize:5,
            projectileCount:5, spread:0.35, piercing:false, projectileColor:'#7dffff',
            range:180 },
  },
  escopeta_escarcha: {
    id:'escopeta_escarcha', name:'ESCOPETA ESCARCHA', category:'ESCOPETAS', icon:'💥',
    desc:'5 perdigones en abanico.', art:'╞════╤══', rarity:'rare',
    attackSpeed:-8, mobility:-10, special:14,
    upgrade:'Perdigones helados.',
    unlockLevel:5, unlockRole:'tank', cost:800,
    stats:{ damageMul:0.55, fireRate:650, projectileSpeed:9, projectileSize:5,
            projectileCount:5, spread:0.35, piercing:false, projectileColor:'#7dffff',
            range:180 },
  },
  escopeta_glacial: {
    id:'escopeta_glacial', name:'ESCOPETA GLACIAL', category:'ESCOPETAS', icon:'💥',
    desc:'7 perdigones congelantes.', art:'╞════╤═╪', rarity:'epic',
    attackSpeed:-10, mobility:-12, special:18,
    upgrade:'Ralentización al impactar.',
    unlockLevel:9, unlockRole:'elementalist', cost:1600,
    stats:{ damageMul:0.6, fireRate:700, projectileSpeed:9, projectileSize:5,
            projectileCount:7, spread:0.42, piercing:false, projectileColor:'#a0ffff',
            slowDuration:1500, range:180 },
  },
  escopeta_meteoro: {
    id:'escopeta_meteoro', name:'ESCOPETA METEORO', category:'ESCOPETAS', icon:'💥',
    desc:'8 perdigones. Crítico letal.', art:'╞════╤══☄', rarity:'legend',
    attackSpeed:-8, mobility:-14, special:24,
    upgrade:'Meteoro helado.',
    unlockLevel:15, unlockRole:'iceBerserker', cost:3200,
    stats:{ damageMul:0.75, fireRate:750, projectileSpeed:10, projectileSize:5,
            projectileCount:8, spread:0.45, piercing:false, projectileColor:'#ff9b3d',
            range:180 },
  },
  escopeta_pesada: {
    id:'escopeta_pesada', name:'ESCOPETA PESADA', category:'ESCOPETAS', icon:'💥',
    desc:'Escopeta pesada de alto impacto.', art:'╞════╪══', rarity:'common',
    attackSpeed:-12, mobility:-14, special:10,
    upgrade:'Impacto brutal.',
    unlockLevel:1, unlockRole:'tank', cost:500,
    stats:{ damageMul:0.7, fireRate:800, projectileSpeed:8, projectileSize:5,
            projectileCount:4, spread:0.30, piercing:false, projectileColor:'#ff5577',
            range:180 },
  },
  escopeta_doble: {
    id:'escopeta_doble', name:'ESCOPETA DOBLE', category:'ESCOPETAS', icon:'💥',
    desc:'Doble cañón.', art:'╞════╤╤═', rarity:'rare',
    attackSpeed:-6, mobility:-10, special:12,
    upgrade:'Doble ráfaga.',
    unlockLevel:4, unlockRole:'tank', cost:900,
    stats:{ damageMul:0.6, fireRate:600, projectileSpeed:9, projectileSize:5,
            projectileCount:6, spread:0.38, piercing:false, projectileColor:'#7dffff',
            range:180 },
  },
  escopeta_glaciar: {
    id:'escopeta_glaciar', name:'ESCOPETA GLACIAR', category:'ESCOPETAS', icon:'💥',
    desc:'Escopeta glaciar.', art:'╞════╤══❄', rarity:'rare',
    attackSpeed:-8, mobility:-8, special:16,
    upgrade:'Hielo masivo.',
    unlockLevel:6, unlockRole:'iceBerserker', cost:1000,
    stats:{ damageMul:0.65, fireRate:680, projectileSpeed:9, projectileSize:5,
            projectileCount:5, spread:0.36, piercing:false, projectileColor:'#7dffff',
            slowDuration:1200, range:180 },
  },
  escopeta_asalto: {
    id:'escopeta_asalto', name:'ESCOPETA DE ASALTO', category:'ESCOPETAS', icon:'💥',
    desc:'Escopeta automática.', art:'╞════╪═══', rarity:'epic',
    attackSpeed:2, mobility:-6, special:16,
    upgrade:'Ráfaga automática.',
    unlockLevel:8, unlockRole:'tactician', cost:1400,
    stats:{ damageMul:0.5, fireRate:420, projectileSpeed:10, projectileSize:4,
            projectileCount:4, spread:0.30, piercing:false, projectileColor:'#7bff9f',
            range:180 },
  },
  'mass-escopetas-1': {
    id:'mass-escopetas-1', name:'ESCOPETA POLAR', category:'ESCOPETAS', icon:'💥',
    desc:'Arma desbloqueable de escopetas.', art:'╞═════✦', rarity:'rare',
    attackSpeed:-8, mobility:-10, special:14,
    upgrade:'Núcleo mejorado al máximo.',
    unlockLevel:7, unlockRole:'tank', cost:1000,
    stats:{ damageMul:0.6, fireRate:700, projectileSpeed:9, projectileSize:5,
            projectileCount:5, spread:0.36, piercing:false, projectileColor:'#7dffff',
            range:180 },
  },
  'mass-escopetas-2': {
    id:'mass-escopetas-2', name:'ESCOPETA SÍSMICA', category:'ESCOPETAS', icon:'💥',
    desc:'Arma desbloqueable de escopetas.', art:'╞═════✦', rarity:'epic',
    attackSpeed:-10, mobility:-12, special:18,
    upgrade:'Núcleo mejorado al máximo.',
    unlockLevel:9, unlockRole:'tank', cost:1400,
    stats:{ damageMul:0.65, fireRate:720, projectileSpeed:9, projectileSize:5,
            projectileCount:6, spread:0.40, piercing:false, projectileColor:'#ff9b3d',
            range:180 },
  },

  /* ==================== CUERPO A CUERPO (10) ==================== */
  cuchilla: {
    id:'cuchilla', name:'CUCHILLA', category:'CUERPO A CUERPO', icon:'🗡️',
    desc:'Dagas gemelas criogénicas', art:'╞═══✦', rarity:'rare',
    attackSpeed:12, mobility:12, special:10,
    upgrade:'Corte en arco mejorado.',
    unlockLevel:1, unlockRole:'assassin', cost:450,
    meleeStats:{ rangeMul:1.25, arcMul:1.2, damageMul:1.8, cooldownMul:0.9, knockbackMul:1.2 },
  },
  guante: {
    id:'guante', name:'GUANTES DE HIELO', category:'CUERPO A CUERPO', icon:'🥊',
    desc:'Golpe sísmico', art:'✊══✦', rarity:'epic',
    attackSpeed:2, mobility:4, special:24,
    upgrade:'Impacto congelante de área.',
    unlockLevel:5, unlockRole:'iceBerserker', cost:950,
    meleeStats:{ rangeMul:1.4, arcMul:1.4, damageMul:2.6, cooldownMul:1.2, knockbackMul:2.0 },
  },
  espada_glacial: {
    id:'espada_glacial', name:'ESPADA GLACIAL', category:'CUERPO A CUERPO', icon:'🗡️',
    desc:'Melee potenciado.', art:'╞═══✦', rarity:'rare',
    attackSpeed:10, mobility:10, special:8,
    upgrade:'Mayor rango y arco.',
    unlockLevel:3, unlockRole:'assassin', cost:600,
    meleeStats:{ rangeMul:1.25, arcMul:1.2, damageMul:1.8, cooldownMul:0.9, knockbackMul:1.2 },
  },
  hacha_titan: {
    id:'hacha_titan', name:'HACHA DEL TITÁN', category:'CUERPO A CUERPO', icon:'🪓',
    desc:'Daño demoledor.', art:'✊═══✦', rarity:'epic',
    attackSpeed:-6, mobility:4, special:16,
    upgrade:'Knockback masivo.',
    unlockLevel:9, unlockRole:'tank', cost:1400,
    meleeStats:{ rangeMul:1.4, arcMul:1.4, damageMul:2.6, cooldownMul:1.35, knockbackMul:2.0 },
  },
  guadana_abisal: {
    id:'guadana_abisal', name:'GUADAÑA ABISAL', category:'CUERPO A CUERPO', icon:'⚔️',
    desc:'Melee 360°. Barre todo.', art:'☽═══☾', rarity:'legend',
    attackSpeed:0, mobility:8, special:24,
    upgrade:'Barrido total.',
    unlockLevel:15, unlockRole:'assassin', cost:2800,
    meleeStats:{ rangeMul:1.5, arcMul:2.0, damageMul:3.2, cooldownMul:1.1, knockbackMul:1.5 },
  },
  daga_espectral: {
    id:'daga_espectral', name:'DAGA ESPECTRAL', category:'CUERPO A CUERPO', icon:'🗡️',
    desc:'Daga rápida y letal.', art:'╞══✦', rarity:'rare',
    attackSpeed:16, mobility:14, special:6,
    upgrade:'Velocidad de ataque extrema.',
    unlockLevel:2, unlockRole:'assassin', cost:500,
    meleeStats:{ rangeMul:1.0, arcMul:1.1, damageMul:1.6, cooldownMul:0.7, knockbackMul:0.8 },
  },
  cuchillo_crionico: {
    id:'cuchillo_crionico', name:'CUCHILLO CRIÓNICO', category:'CUERPO A CUERPO', icon:'🗡️',
    desc:'Cuchillo congelante.', art:'╞══✦❄', rarity:'rare',
    attackSpeed:14, mobility:12, special:10,
    upgrade:'Congelación al golpear.',
    unlockLevel:4, unlockRole:'iceBerserker', cost:650,
    meleeStats:{ rangeMul:1.0, arcMul:1.2, damageMul:1.7, cooldownMul:0.8, knockbackMul:1.0 },
  },
  hacha_hielo: {
    id:'hacha_hielo', name:'HACHA DE HIELO', category:'CUERPO A CUERPO', icon:'🪓',
    desc:'Hacha criogénica.', art:'✊══✦❄', rarity:'epic',
    attackSpeed:-2, mobility:6, special:14,
    upgrade:'Impacto de área congelante.',
    unlockLevel:7, unlockRole:'iceBerserker', cost:1200,
    meleeStats:{ rangeMul:1.3, arcMul:1.3, damageMul:2.2, cooldownMul:1.2, knockbackMul:1.8 },
  },
  martillo_polar: {
    id:'martillo_polar', name:'MARTILLO POLAR', category:'CUERPO A CUERPO', icon:'🔨',
    desc:'Martillo de área.', art:'✊═══✦', rarity:'epic',
    attackSpeed:-8, mobility:2, special:18,
    upgrade:'Onda sísmica.',
    unlockLevel:10, unlockRole:'tank', cost:1500,
    meleeStats:{ rangeMul:1.5, arcMul:1.5, damageMul:2.4, cooldownMul:1.4, knockbackMul:2.2 },
  },
  'mass-cuerpo-a-cuerpo-1': {
    id:'mass-cuerpo-a-cuerpo-1', name:'CUCHILLAS GEMELAS', category:'CUERPO A CUERPO', icon:'⚔️',
    desc:'Arma desbloqueable de cuerpo a cuerpo.', art:'╞═════✦', rarity:'rare',
    attackSpeed:12, mobility:10, special:6,
    upgrade:'Núcleo mejorado al máximo.',
    unlockLevel:8, unlockRole:'assassin', cost:900,
    meleeStats:{ rangeMul:1.1, arcMul:1.2, damageMul:1.9, cooldownMul:0.9, knockbackMul:1.1 },
  },
  'mass-cuerpo-a-cuerpo-2': {
    id:'mass-cuerpo-a-cuerpo-2', name:'LANZA GLACIAL', category:'CUERPO A CUERPO', icon:'🗡️',
    desc:'Arma desbloqueable de cuerpo a cuerpo.', art:'╞═════✦', rarity:'epic',
    attackSpeed:4, mobility:8, special:12,
    upgrade:'Núcleo mejorado al máximo.',
    unlockLevel:10, unlockRole:'assassin', cost:1400,
    meleeStats:{ rangeMul:1.4, arcMul:1.0, damageMul:2.4, cooldownMul:1.0, knockbackMul:1.6 },
  },
};

/* ================================================================
   2) HELPERS
   ================================================================ */
const DEFAULT_WEAPON_ID = 'avispon';

function getWeapon(id) {
  return (id && WEAPONS_DB[id]) || WEAPONS_DB[DEFAULT_WEAPON_ID];
}

function isMeleeWeapon(w) {
  if (!w) return false;
  return w.category === 'CUERPO A CUERPO' || !!(w.meleeStats && !w.stats);
}

/* ================================================================
   3) WEAPON SYSTEM
   ================================================================ */
const WeaponSystem = {
  ensureSave() {
    if (!save.equippedWeapons) save.equippedWeapons = { primary: DEFAULT_WEAPON_ID, secondary: 'centinela' };
    if (!save.equippedWeapons.primary || !WEAPONS_DB[save.equippedWeapons.primary]) {
      save.equippedWeapons.primary = DEFAULT_WEAPON_ID;
    }
    if (!save.equippedWeapons.secondary || !WEAPONS_DB[save.equippedWeapons.secondary]) {
      save.equippedWeapons.secondary = 'centinela';
    }
    if (!save.weaponSlot) save.weaponSlot = 'primary';
  },

  get equipped() { this.ensureSave(); return save.equippedWeapons; },

  getActiveSlot() {
    this.ensureSave();
    return save.weaponSlot === 'secondary' ? 'secondary' : 'primary';
  },

  getActiveWeapon() {
    this.ensureSave();
    const slot = this.getActiveSlot();
    return getWeapon(save.equippedWeapons[slot]);
  },

  switchSlot() {
    this.ensureSave();
    save.weaponSlot = this.getActiveSlot() === 'primary' ? 'secondary' : 'primary';
    if (typeof Save !== 'undefined' && Save.write) Save.write();
    this.applyToPlayer();
    if (typeof UI !== 'undefined' && UI.updateWeaponHud) UI.updateWeaponHud();
    return save.weaponSlot;
  },

  equip(slot, weaponId) {
    if (!WEAPONS_DB[weaponId]) return false;
    this.ensureSave();
    save.equippedWeapons[slot] = weaponId;
    if (typeof Save !== 'undefined' && Save.write) Save.write();
    this.applyToPlayer();
    if (typeof UI !== 'undefined' && UI.updateWeaponHud) UI.updateWeaponHud();
    return true;
  },

  getEffectiveStats(weapon) {
    const w = weapon || this.getActiveWeapon();
    const id = w.id;
    const lvl = (save.customization && save.customization.weaponLevels && save.customization.weaponLevels[id]) || 1;
    const upMul = 1 + (lvl - 1) * 0.08;

    if (isMeleeWeapon(w)) {
      const m = w.meleeStats || {};
      return {
        isMelee: true,
        level: lvl,
        damageMul: (m.damageMul || 1) * upMul,
        rangeMul:  m.rangeMul  || 1,
        arcMul:    m.arcMul    || 1,
        cooldownMul: m.cooldownMul || 1,
        knockbackMul: m.knockbackMul || 1,
        fireRate: CFG.MELEE.cooldown * (m.cooldownMul || 1),
      };
    }

    const s = w.stats;
    return {
      isMelee: false,
      level: lvl,
      damageMul: s.damageMul * upMul,
      fireRate: Math.max(60, s.fireRate),
      projectileSpeed: s.projectileSpeed,
      projectileSize: s.projectileSize,
      projectileCount: s.projectileCount,
      spread: s.spread || 0,
      piercing: !!s.piercing,
      projectileColor: s.projectileColor || '#4dffff',
      slowDuration: s.slowDuration || 0,
      range: s.range || 600,
    };
  },

  applyToPlayer() {
    if (typeof Game === 'undefined' || !Game.player) return;
    if (typeof Game.player._refreshWeaponStats === 'function') Game.player._refreshWeaponStats();
  },
};

/* ================================================================
   4) PARCHE A Player
   ================================================================ */
(function patchPlayer() {
  if (typeof Player === 'undefined' || !Player.prototype) {
    console.warn('[weapons] Player no está definido todavía. Carga weapons.js después de player.js.');
    return;
  }
  if (Player.prototype._weaponsPatched) return;
  Player.prototype._weaponsPatched = true;

  Player.prototype._refreshWeaponStats = function () {
    const w = WeaponSystem.getActiveWeapon();
    const s = WeaponSystem.getEffectiveStats(w);
    this.activeWeapon = w;
    this.activeWeaponStats = s;
    if (s.isMelee) {
      this._weaponCooldown = CFG.MELEE.cooldown * s.cooldownMul;
    } else {
      this._weaponCooldown = s.fireRate;
    }
  };

  Player.prototype.basicReady = function (now) {
    const cd = this._weaponCooldown || CFG.BASIC.cooldown;
    return now - this.lastBasic >= cd;
  };

  Player.prototype._fireBasic = function (ang) {
    if (typeof Game === 'undefined') return;
    const w = this.activeWeapon || WeaponSystem.getActiveWeapon();
    const s = this.activeWeaponStats || WeaponSystem.getEffectiveStats(w);

    if (s.isMelee) {
      this._meleeAttack(ang);
      return;
    }

    const now = performance.now();
    if (typeof Game.markCombat === 'function') Game.markCombat();
    const rageMul = (now < this.rageUntil) ? 1.6 : 1.0;

    const count = Math.max(1, s.projectileCount + (this.extraBasicProj || 0));
    const totalSpread = (s.spread || 0) + (this.fanBasic >= 3 ? 0.25 : 0);
    const damageBase = this.atk * CFG.BASIC.damageMul * s.damageMul * rageMul * (this._challengeDmgMul || 1);

    const angles = [];
    if (count === 1) {
      angles.push(ang);
    } else {
      for (let i = 0; i < count; i++) {
        const t = (i / (count - 1)) - 0.5;
        angles.push(ang + t * totalSpread * 2);
      }
    }

    for (const a of angles) {
      const crit = Math.random() < this.crit;
      const dmg = damageBase * (crit ? (this._challengeCritDmgMul || 2) : 1);
      const px = this.x + Math.cos(a) * (this.size + 4);
      const py = this.y + Math.sin(a) * (this.size + 4);

      Game.projectiles.push({
        x: px, y: py,
        vx: Math.cos(a) * s.projectileSpeed,
        vy: Math.sin(a) * s.projectileSpeed,
        dmg, crit,
        size: s.projectileSize,
        life: CFG.BASIC.life, dead: false,
        color: crit ? '#ffd54f' : s.projectileColor,
        fromBoss: false,
        kind: 'basic',
        piercing: s.piercing,
        hitSet: s.piercing ? new Set() : null,
        slowDuration: s.slowDuration || 0,
        weaponId: w.id,
        range: s.range,
        originX: px,
        originY: py,
      });
    }
    if (typeof Audio2 !== 'undefined' && Audio2.shoot) Audio2.shoot();
  };

  Player.prototype._meleeAttack = function (ang) {
    const w = this.activeWeapon || WeaponSystem.getActiveWeapon();
    const s = this.activeWeaponStats || WeaponSystem.getEffectiveStats(w);

    this.meleeActiveUntil = performance.now() + CFG.MELEE.activeTime;
    this.meleeAngle = ang;
    this.meleeCooldownUntil = performance.now() + CFG.MELEE.cooldown * this.cooldownMul * s.cooldownMul;

    if (typeof Audio2 !== 'undefined' && Audio2.melee) Audio2.melee();
    if (typeof Game.markCombat === 'function') Game.markCombat();

    const meleeRange = CFG.MELEE.range * (s.rangeMul || 1);
    const halfArc = (CFG.MELEE.arc * (1 + (this.meleeArcBonus || 0)) * (s.arcMul || 1)) / 2;
    const rageMul = (performance.now() < this.rageUntil) ? 1.6 : 1.0;
    const meleeDmg = this.atk * CFG.MELEE.damageMul * (s.damageMul || 1) * rageMul * (this._challengeDmgMul || 1);
    const kb = CFG.MELEE.knockback * (s.knockbackMul || 1);

    let hitSomething = false;
    const targets = [...(Game.enemies || [])];
    if (Game.boss && !Game.boss.dead) targets.push(Game.boss);

    for (const e of targets) {
      const dx = e.x - this.x, dy = e.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist > meleeRange + e.size) continue;
      const angTo = Math.atan2(dy, dx);
      const diff = Math.abs(((angTo - this.meleeAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (diff > halfArc) continue;
      const crit = Math.random() < this.crit;
      const dmg = meleeDmg * (crit ? (this._challengeCritDmgMul || 2) : 1);
      e.takeDamage(dmg, crit);
      e.x += Math.cos(angTo) * kb;
      e.y += Math.sin(angTo) * kb;
      hitSomething = true;
    }

    if (Game.currentRoom && Array.isArray(Game.currentRoom.obstacles)) {
      for (const o of Game.currentRoom.obstacles) {
        if (o.hp <= 0) continue;
        const cx = Math.max(o.x, Math.min(this.x, o.x + o.w));
        const cy = Math.max(o.y, Math.min(this.y, o.y + o.h));
        if (Math.hypot(this.x - cx, this.y - cy) > meleeRange) continue;
        const angTo = Math.atan2(cy - this.y, cx - this.x);
        const diff = Math.abs(((angTo - this.meleeAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
        if (diff > halfArc + 0.3) continue;
        if (typeof Game.damageObstacle === 'function') Game.damageObstacle(o, meleeDmg);
        hitSomething = true;
      }
    }

    if (Array.isArray(Game.projectiles)) {
      for (let i = Game.projectiles.length - 1; i >= 0; i--) {
        const pr = Game.projectiles[i];
        if (!pr.fromBoss) continue;
        if (Math.hypot(pr.x - this.x, pr.y - this.y) > meleeRange) continue;
        const angTo = Math.atan2(pr.y - this.y, pr.x - this.x);
        const diff = Math.abs(((angTo - this.meleeAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
        if (diff > halfArc + 0.2) continue;
        if (typeof Game.spawnParticles === 'function') Game.spawnParticles(pr.x, pr.y, '#ffd54f', 10);
        const reflected = Math.atan2(pr.vy, pr.vx) + Math.PI;
        Game.projectiles.push({
          x: pr.x, y: pr.y,
          vx: Math.cos(reflected) * 9, vy: Math.sin(reflected) * 9,
          dmg: this.atk * 1.25 * (this._challengeDmgMul || 1),
          crit: false, size: 6, life: 900, dead: false,
          color: '#ffd54f', fromBoss: false, kind: 'basic', reflected: true,
        });
        pr.dead = true;
        hitSomething = true;
      }
    }

    if (hitSomething && typeof Gamepad !== 'undefined' && Gamepad.rumble) Gamepad.rumble(0.55, 90);
    if (typeof UI !== 'undefined' && UI.updateAbilityCooldowns) UI.updateAbilityCooldowns();
  };

  Player.prototype.tryMelee = function (now) {
    if (!this.meleeReady(now)) return;
    this._meleeAttack(this.aimAngle);
  };

  Player.prototype.trySwitchWeapon = function () {
    const slot = WeaponSystem.switchSlot();
    this._refreshWeaponStats();
    if (typeof UI !== 'undefined' && UI.toast) {
      UI.toast(`🔫 ${this.activeWeapon.name}`, 'gold');
    }
    return slot;
  };

  const _origUpdate = Player.prototype.update;
  Player.prototype.update = function (dt, now) {
    if (!this.activeWeapon) this._refreshWeaponStats();
    return _origUpdate.call(this, dt, now);
  };
})();

/* ================================================================
   5) INPUT — tecla de cambio de arma
   ================================================================ */
(function bindWeaponInputs() {
  if (typeof window === 'undefined') return;
  const handler = (e) => {
    if (typeof Game === 'undefined' || !Game.battleActive || Game.paused) return;
    const k = (e.key || '').toLowerCase();
    const kb = (typeof save !== 'undefined' && save.keybinds) ? save.keybinds : {};
    const switchKey = (kb.switchWeapon || 'x').toLowerCase();
    if (k === switchKey) {
      e.preventDefault();
      if (Game.player) Game.player.trySwitchWeapon();
    }
  };
  window.addEventListener('keydown', handler);
})();

/* ================================================================
   6) EXPORTS GLOBALES
   ================================================================ */
if (typeof window !== 'undefined') {
  window.WEAPONS_DB = WEAPONS_DB;
  window.getWeapon = getWeapon;
  window.isMeleeWeapon = isMeleeWeapon;
  window.WeaponSystem = WeaponSystem;
}