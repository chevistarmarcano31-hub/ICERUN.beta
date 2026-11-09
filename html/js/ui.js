var dineroJugador = 0;

function mejorarItem(itemId, tipo) {
  return UI.mejorarItem(itemId, tipo);
}

function calcularStatsTotales(personaje, armaEquipada, armadurasEquipadas) {
  return UI.calcularStatsTotales(personaje, armaEquipada, armadurasEquipadas);
}

function verificarLogros() {
  return UI.checkAchievements();
}

const UI = {
  screens: {},
  current: 'menu',
  _lastScreen: 'menu',
  _invModalOpen: false,
  _bossLockTimer: 0,
  _menuFocusIndex: 0,
  _menuNavCooldown: 0,
  _menuLastActiveOverlay: null,
  customizationPlayer: null,
  _gpBind: null,
  _rebindHandler: null,
  _hudDim: false,
  _openHudFrom: 'options',
  _mobileHudEditing: false,
  _mobileHudSelected: null,
  _customizationReturn: 'lobby',
  _customizationSpriteIndex: 0,
  _openArmorCategories: new Set(),
  _openArmoryRoles: new Set(),
  _lobbyEditing: false,
  _lobbySelected: null,
  _lobbyEditReturn: 'hud',
  _abilityElements: null,
  _cooldownRenderState: {},
  _shopCategory: 'all',
  _shopSubcategory: 'all',
  _shopSort: 'featured',
  _shopMissingOnly: false,
  _shopSelectedId: null,
  _selectedWeaponId: null,
  ARMORY_ROLES: {
    tank:{ name:'EL TANQUE', icon:'🛡', desc:'Regeneración de escudo.', passive:'Regeneración de escudo', active:'Dash explosivo', combo:'Escopeta + Escudo', stats:{ attackSpeed:5, mobility:2, special:7 } },
    assassin:{ name:'EL ASESINO', icon:'⚡', desc:'Invisibilidad al quedarse quieto.', passive:'Invisibilidad al quedarse quieto', active:'Golpe crítico garantizado', combo:'Francotirador + Daga', stats:{ attackSpeed:3, mobility:6, special:9 } },
    support:{ name:'EL SOPORTE', icon:'✦', desc:'Aura de curación.', passive:'Aura de curación', active:'Dron de rescate', combo:'Subfusil + Pistola médica', stats:{ attackSpeed:6, mobility:8, special:4 } },
    tactician:{ name:'EL TÁCTICO', icon:'⌖', desc:'Visión de radar.', passive:'Visión de radar', active:'Torreta automática', combo:'Rifle de asalto + Lanzagranadas', stats:{ attackSpeed:8, mobility:5, special:6 } },
    runner:{ name:'EL CORREDOR', icon:'➤', desc:'Pies ligeros.', passive:'Pies ligeros', active:'Dash de hielo', combo:'Subfusil dual + Dagas', stats:{ attackSpeed:9, mobility:10, special:3 } },
    elementalist:{ name:'EL ELEMENTALISTA', icon:'🔥', desc:'Munición incendiaria.', passive:'Munición incendiaria', active:'Bola de fuego', combo:'Lanzallamas + Pistola de plasma', stats:{ attackSpeed:5, mobility:3, special:10 } },
    specter:{ name:'EL ESPECTRO', icon:'◌', desc:'Paso silencioso.', passive:'Paso silencioso', active:'Marca del cazador', combo:'Ballesta + Cuchillas gemelas', stats:{ attackSpeed:8, mobility:8, special:5 } },
    paladin:{ name:'EL PALADÍN', icon:'✚', desc:'Escudo reactivo.', passive:'Escudo reactivo', active:'Muro de hielo', combo:'Escopeta de asalto + Escudo de energía', stats:{ attackSpeed:3, mobility:2, special:8 } },
    hunter:{ name:'LA CAZADORA', icon:'⌁', desc:'Olfato de presa.', passive:'Olfato de presa', active:'Trampa de red', combo:'Rifle de precisión + Pistola de anestesia', stats:{ attackSpeed:6, mobility:5, special:9 } },
    alchemist:{ name:'EL ALQUIMISTA', icon:'⚗', desc:'Sangre ácida.', passive:'Sangre ácida', active:'Bomba de humo gélido', combo:'Pistola de ácido + Rifle de asalto', stats:{ attackSpeed:7, mobility:5, special:6 } },
    combatMedic:{ name:'MÉDICO DE COMBATE', icon:'✚', desc:'Aura de curación.', passive:'Aura de curación', active:'Dron de rescate', combo:'Subfusil + Pistola médica', stats:{ attackSpeed:4, mobility:9, special:4 } },
    ghostSniper:{ name:'FRANCOTIRADOR FANTASMA', icon:'◉', desc:'Camuflaje térmico.', passive:'Camuflaje térmico', active:'Disparo perforante', combo:'Francotirador + Cuchillo', stats:{ attackSpeed:2, mobility:4, special:10 } },
    iceBerserker:{ name:'BERSERKER DE HIELO', icon:'✹', desc:'Piel de escarcha.', passive:'Piel de escarcha', active:'Golpe sísmico', combo:'Escopeta de doble cañón + Guantes de hielo', stats:{ attackSpeed:5, mobility:1, special:9 } },
  },
  ARMORY_WEAPONS: {
    vigilante:{ name:'VIGILANTE', type:'RIFLES', desc:'Rifle de francotirador', art:'╞═══════◉', attackSpeed:-18, mobility:-20, special:28, upgrade:'Precisión extrema y daño crítico.' },
    avispon:{ name:'AVISPÓN', type:'PISTOLAS', desc:'Subfusil automático', art:'╞════╪══', attackSpeed:18, mobility:16, special:-12, upgrade:'Ráfaga estable y cargador ampliado.' },
    centinela:{ name:'CENTINELA', type:'PISTOLAS', desc:'Pistola de precisión', art:'╞═══◉', attackSpeed:8, mobility:8, special:4, upgrade:'Proyectiles perforantes.' },
    rompehielo:{ name:'ROMPEHIELO', type:'ESCOPETAS', desc:'Escopeta táctica', art:'╞════╤══', attackSpeed:-10, mobility:-12, special:18, upgrade:'Dispersión congelante mejorada.' },
    cuchilla:{ name:'CUCHILLA', type:'CUERPO A CUERPO', desc:'Dagas gemelas criogénicas', art:'╞═══✦', attackSpeed:12, mobility:12, special:10, upgrade:'Corte en arco mejorado.' },
    hielo:{ name:'NÚCLEO HIELO', type:'PISTOLAS', desc:'Catalizador elemental', art:'◈══✧', attackSpeed:-4, mobility:-4, special:32, upgrade:'Efecto elemental amplificado.' },
    granada:{ name:'GLACIADOR', type:'RIFLES', desc:'Rifle de asalto', art:'╞════╪═', attackSpeed:4, mobility:-4, special:14, upgrade:'Ráfaga táctica mejorada.' },
    guante:{ name:'GUANTES DE HIELO', type:'CUERPO A CUERPO', desc:'Golpe sísmico', art:'✊══✦', attackSpeed:2, mobility:4, special:24, upgrade:'Impacto congelante de área.' },
  },
  ROLE_PROGRESS: (() => {
    const roles = [
      ['tank', 'Escudo de energía'], ['assassin', 'Daga espectral'], ['support', 'Pistola médica'],
      ['tactician', 'Lanzagranadas'], ['runner', 'Subfusil dual'], ['elementalist', 'Pistola de plasma'],
      ['specter', 'Ballesta de hielo'], ['paladin', 'Escopeta de asalto'], ['hunter', 'Rifle de precisión'],
      ['alchemist', 'Pistola de ácido'], ['combatMedic', 'Dron médico'], ['ghostSniper', 'Rifle de plasma'],
      ['iceBerserker', 'Escopeta pesada'],
    ];
    return roles.reduce((result, [id, signature], index) => {
      result[id] = {
        level: 1, exp: 0, expTotal: 0,
        unlocks: [
          { level: 5, name: 'Habilidad activa mejorada' },
          { level: 10, name: signature },
          { level: 25, name: 'Habilidad pasiva mejorada' },
          { level: 40, name: 'Combo definitivo' },
        ],
      };
      return result;
    }, {});
  })(),
  ARMORY_FILTER: 'PISTOLAS',
  ARMOR_DATA: (() => {
    const categories = [
      ['pants', 'PANTALONES', ['Movilidad', 'Velocidad de ataque']],
      ['jackets', 'CHAQUETAS', ['Defensa', 'Poder especial']],
      ['helmets', 'CASCOS', ['Velocidad de ataque', 'Precisión']],
    ];
    const names = {
      pants: ['Corredor ártico', 'Trineo táctico', 'Pies de ventisca', 'Guardia ligera', 'Ráfaga polar', 'Nómada de hielo', 'Paso glacial', 'Veloz boreal', 'Explorador blanco', 'Impulso cero'],
      jackets: ['Placa glaciar', 'Abrigo de asalto', 'Coraza aurora', 'Manto del paladín', 'Chaqueta criónica', 'Blindaje de tormenta', 'Armadura escarcha', 'Núcleo protector', 'Barrera polar', 'Exotraje hielo'],
      helmets: ['Visor ártico', 'Casco centinela', 'Máscara de cazador', 'Corona boreal', 'Visor espectral', 'Casco de radar', 'Lente glacial', 'Cúpula táctica', 'Visor de precisión', 'Yelmo de escarcha'],
    };
    const output = [];
    for (const [category, type, statNames] of categories) {
      names[category].forEach((name, index) => {
        const primary = 2 + (index % 5) * 2;
        const secondary = 1 + ((index + 2) % 4) * 2;
        const modifiers = category === 'pants'
          ? { mobility: primary, attackSpeed: secondary, special: 0 }
          : category === 'jackets'
            ? { mobility: 0, attackSpeed: 0, special: secondary, defense: primary }
            : { mobility: 0, attackSpeed: primary, special: 0, precision: secondary };
        output.push({ id: `${category}-${index + 1}`, name, category, type, unlockLevel: 1 + index * 4, modifiers, statNames, baseStats: { mobility: modifiers.mobility, defense: modifiers.defense || 0, special: modifiers.special, attackSpeed: modifiers.attackSpeed } });
      });
    }
    return output;
  })(),
  ensureMassiveArmory() {
    this.ARMORY_WEAPONS.hielo.type = 'PISTOLAS';
    const sniperCategory = typeof ICE_RUN_DATA !== 'undefined' ? ICE_RUN_DATA.francotiradores : null;
    sniperCategory?.armas.forEach(weapon => {
      const stats = { ...sniperCategory.statsBase, ...weapon.statsBase };
      this.ARMORY_WEAPONS[weapon.id] = {
        name: weapon.name,
        type: sniperCategory.name,
        categoryId: sniperCategory.id,
        desc: `${sniperCategory.name} · impacto instantáneo y penetración lineal`,
        art: '╞═══════◉',
        attackSpeed: -35,
        mobility: -24,
        special: 42,
        statsBase: {
          damage: stats.damage,
          cadence: Math.max(1, Math.round(stats.fireRate * 10)),
          mobility: -24,
          bullets: stats.ammoCapacity,
          range: stats.range,
          fireRate: stats.fireRate,
          ammoCapacity: stats.ammoCapacity,
          projectileBehavior: stats.projectileBehavior,
          penetration: stats.penetration,
        },
        costoMejora: 180,
        nivelActual: 1,
        upgrade: 'Disparo perforante de largo alcance.',
        unlockLevel: 1,
        unlockRole: 'ghostSniper',
      };
    });
    const catalog = {
      PISTOLAS: ['Pistola ártica', 'Pistola de plasma', 'Pistola médica', 'Pistola de ácido', 'Pistola centella', 'Pistola de ráfaga', 'Pistola glacial', 'Pistola silente', 'Pistola magnética', 'Pistola de precisión'],
      RIFLES: ['Rifle de plasma', 'Rifle boreal', 'Rifle de asalto', 'Rifle de hielo', 'Rifle de pulsos', 'Rifle francotirador', 'Rifle de radar', 'Rifle tormenta', 'Rifle perforante', 'Rifle aurora'],
      ESCOPETAS: ['Escopeta pesada', 'Escopeta doble', 'Escopeta glaciar', 'Escopeta de asalto', 'Escopeta rompehielo', 'Escopeta polar', 'Escopeta sísmica', 'Escopeta de carga', 'Escopeta nevada', 'Escopeta devastadora'],
      'CUERPO A CUERPO': ['Daga espectral', 'Cuchillo criónico', 'Hacha de hielo', 'Martillo polar', 'Cuchillas gemelas', 'Guantes de combate', 'Lanza glacial', 'Garras boreales', 'Espada de escarcha', 'Bastón de ventisca'],
    };
    const roleIds = Object.keys(this.ROLE_PROGRESS);
    let index = 0;
    Object.entries(catalog).forEach(([type, names]) => {
      const existing = Object.values(this.ARMORY_WEAPONS).filter(item => item.type === type).length;
      names.slice(existing, 10).forEach((name, position) => {
      const absolutePosition = existing + position;
      const id = `mass-${type.toLowerCase().replace(/[^a-z]+/g, '-')}-${position + 1}`;
      const attackSpeed = (absolutePosition % 5) * 4 - (type === 'ESCOPETAS' ? 8 : 0);
      const mobility = (absolutePosition % 4) * 3 - (type === 'ESCOPETAS' ? 8 : 0);
      const special = 4 + (absolutePosition % 6) * 4;
      this.ARMORY_WEAPONS[id] = {
        name, type, desc: `Arma desbloqueable de ${type.toLowerCase()}`,
        art: '╞═════✦', attackSpeed, mobility, special,
        statsBase: {
          damage: type === 'PISTOLAS' ? 18 + absolutePosition * 2 : type === 'RIFLES' ? 30 + absolutePosition * 3 : type === 'ESCOPETAS' ? 42 + absolutePosition * 2 : 25 + absolutePosition * 2,
          cadence: type === 'PISTOLAS' ? 92 - absolutePosition : type === 'RIFLES' ? 58 - absolutePosition : type === 'ESCOPETAS' ? 34 - absolutePosition : 76,
          mobility: type === 'CUERPO A CUERPO' ? 100 : Math.max(30, 82 - absolutePosition * 3),
          bullets: type === 'ESCOPETAS' ? 12 + absolutePosition : type === 'PISTOLAS' ? 8 + absolutePosition % 3 : type === 'RIFLES' ? 30 : 1,
        },
        costoMejora: 80 + absolutePosition * 15,
        nivelActual: 1,
        upgrade: 'Núcleo mejorado al máximo.',
        unlockLevel: 5 + (absolutePosition % 6) * 5,
        unlockRole: roleIds[index++ % roleIds.length],
      };
      });
    });
  },
  LOBBY_TARGETS: [
    ['lobby-title', 'Título'],
    ['lobby-stats', 'Estadísticas'],
    ['btn-new-run', 'Iniciar run'],
    ['btn-coop-run', 'Cooperativo'],
    ['btn-survival', 'Supervivencia'],
    ['btn-endless', 'Endless'],
    ['btn-shop-perm', 'Tienda'],
    ['btn-inv-meta', 'Inventario'],
    ['btn-customize', 'Personalizar personaje'],
    ['btn-skin-lobby', 'Personalizar skin'],
    ['btn-armory', 'Armería'],
    ['btn-collection-lobby', 'Colección'],
    ['btn-achievements-lobby', 'Logros'],
    ['btn-options-lobby', 'Opciones'],
    ['btn-back-menu', 'Volver'],
  ],
  MOBILE_HUD_TARGETS: [
    ['hud-hp', 'Vida'],
    ['hud-p2', 'Vida jugador 2'],
    ['abilityBar', 'Habilidades'],
    ['abilitySlot', 'Botón dash HUD'],
    ['basicSlot', 'Botón ataque HUD'],
    ['meleeSlot', 'Botón melee HUD'],
    ['longSlot', 'Botón ráfaga HUD'],
    ['blockSlot', 'Botón bloqueo HUD'],
    ['hud-top-center', 'Piso / jefe'],
    ['hud-rooms', 'Salas'],
    ['hud-coins', 'Monedas'],
    ['hud-stats', 'Estadísticas'],
    ['hud-xp', 'Nivel / XP'],
    ['consumableBar', 'Consumibles'],
    ['minimap', 'Minimapa'],
    ['bossLockMsg', 'Aviso de cámara bloqueada'],
    ['touchJoystick', 'Joystick'],
    ['touchActions', 'Grupo de acciones'],
    ['touchDash', 'Botón dash'],
    ['touchBasic', 'Botón ataque'],
    ['touchMelee', 'Botón melee'],
    ['touchLong', 'Botón ráfaga'],
    ['touchBlock', 'Botón bloqueo'],
    ['touchInteract', 'Botón interactuar'],
  ],

  HUD_ELEMENTS: [
    ['hp',          'HP / vida'],
    ['abilities',   'Habilidades'],
    ['floor',       'Piso / jefe'],
    ['rooms',       'Salas'],
    ['coins',       'Monedas'],
    ['stats',       'Estadísticas'],
    ['xp',          'Nivel / XP'],
    ['consumables', 'Consumibles'],
    ['minimap',     'Minimapa'],
  ],

  KEYBIND_LABELS: {
    up:'Arriba', down:'Abajo', left:'Izquierda', right:'Derecha',
    pause:'Pausa',
    basic:'Ataque Básico', melee:'Melee', long:'Ráfaga Larga',
    dash:'Dash', block:'Bloqueo', interact:'Interactuar', inventory:'Inventario',
  },

  init() {
    dineroJugador = save.metaCoins;
    this.ensureMassiveArmory();
    this.screens = {
      menu:          document.getElementById('screen-menu'),
      lobby:         document.getElementById('screen-lobby'),
      options:       document.getElementById('screen-options'),
      hud:           document.getElementById('screen-hud'),
      stats:         document.getElementById('screen-stats'),
      achievements:  document.getElementById('screen-achievements'),
      shopPerm:      document.getElementById('screen-shop-perm'),
      invMeta:       document.getElementById('screen-inv-meta'),
      shop:          document.getElementById('screen-shop'),
      chest:         document.getElementById('screen-chest'),
      upgrade:       document.getElementById('screen-upgrade'),
      levelup:       document.getElementById('screen-levelup'),
      pause:         document.getElementById('screen-pause'),
      gameover:      document.getElementById('screen-gameover'),
      invModal:      document.getElementById('screen-inventory-modal'),
      customize:     document.getElementById('screen-customize'),
      armory:        document.getElementById('screen-armory'),
      roleProgress:  document.getElementById('screen-role-progress'),
    };

    const bind = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', () => { Audio2.click(); fn(); });
    };

    bind('btn-play',    () => this.show('lobby'));
    bind('btn-survival-menu', () => Game.startRun(false, false, true));
    bind('btn-options', () => this.showOptions('menu'));
    bind('btn-stats',   () => { this.refreshStats(); this.show('stats'); });
    bind('btn-achievements', () => { this.refreshAchievements(); this.show('achievements'); });
    bind('btn-collection-menu', () => { this._lastScreen = 'menu'; this.show('armory'); });
    bind('btn-skin-menu', () => { this._customizationReturn = 'menu'; this.openCustomization(false); });
    bind('btn-role-progress-menu', () => { this._lastScreen = 'menu'; this.show('roleProgress'); });
    bind('btn-inv-meta-menu', () => { this._lastScreen = 'menu'; this.refreshInvMeta(); this.show('invMeta'); });

    bind('btn-new-run',    () => Game.startRun(false, false));
    bind('btn-coop-run',   () => this.startCoopCharacterSelection());
    bind('btn-survival',   () => Game.startRun(false, false, true));
    bind('btn-endless',    () => { if (save.bestFloor >= CFG.ENDLESS_UNLOCK) Game.startRun(true); });
    bind('btn-shop-perm',  () => { this.refreshPermShop(); this.show('shopPerm'); });
    bind('btn-inv-meta',   () => { this.refreshInvMeta(); this.show('invMeta'); });
    bind('btn-customize',  () => { this._customizationReturn = 'lobby'; this.openCustomization(false); });
    bind('btn-skin-lobby', () => { this._customizationReturn = 'lobby'; this.openCustomization(false); });
    bind('btn-armory', () => { this._lastScreen = 'lobby'; this.show('armory'); });
    bind('btn-collection-lobby', () => { this._lastScreen = 'lobby'; this.show('armory'); });
    bind('btn-armory-back', () => this.show(this._lastScreen === 'menu' ? 'menu' : 'lobby'));
    bind('btn-role-progress-back', () => this.show(this._lastScreen === 'menu' ? 'menu' : 'lobby'));
    bind('btn-armory-skin', () => { this._customizationReturn = 'armory'; this.openCustomization(false); });
  bind('btn-armory-equip', () => {
  const slot = document.querySelector('[data-weapon-slot].selected')?.dataset.weaponSlot || 'primary';
  if (!this._selectedWeaponId) {
    this.toast('Selecciona un arma primero', 'gold');
    return;
  }
  if (typeof WeaponSystem !== 'undefined') {
    WeaponSystem.equip(slot, this._selectedWeaponId);
  }
  this.refreshArmory();
  this.updateWeaponHud();
  this.toast('Combo de armas equipado', 'gold');
});
    document.getElementById('armoryRoleGrid')?.addEventListener('click', e => {
      const role = e.target.closest('[data-role]')?.dataset.role;
      if (role) {
        if (e.target.closest('.armory-role-toggle')) {
          if (this._openArmoryRoles.has(role)) this._openArmoryRoles.delete(role);
          else this._openArmoryRoles.add(role);
        }
        this.selectArmoryRole(role);
      }
    });
    document.getElementById('armoryWeaponGrid')?.addEventListener('click', e => {
      const weapon = e.target.closest('[data-weapon]')?.dataset.weapon;
      if (weapon) this.selectArmoryWeapon(weapon);
    });
    document.getElementById('armoryFilterBar')?.addEventListener('click', e => {
      const filter = e.target.closest('[data-armory-filter]')?.dataset.armoryFilter;
      if (filter) { this.ARMORY_FILTER = filter; this.refreshArmory(); }
    });
    bind('btn-upgrade-selected', () => {
      const slot = document.querySelector('[data-weapon-slot].selected')?.dataset.weaponSlot || 'primary';
      this.mejorarItem(save.customization[slot], 'arma');
    });
    document.getElementById('roleProgressList')?.addEventListener('click', e => {
      const role = e.target.closest('[data-progress-role]')?.dataset.progressRole;
      if (role) this.toggleRoleProgress(role);
    });
    document.getElementById('customizationArmorGrid')?.addEventListener('click', e => {
      const category = e.target.closest('[data-armor-category]')?.dataset.armorCategory;
      if (category) {
        if (this._openArmorCategories.has(category)) this._openArmorCategories.delete(category);
        else this._openArmorCategories.add(category);
        this.refreshCustomization();
        return;
      }
      const upgrade = e.target.closest('[data-upgrade-armor]')?.dataset.upgradeArmor;
      if (upgrade) { this.upgradeArmor(upgrade); return; }
      const armor = e.target.closest('[data-armor-id]')?.dataset.armorId;
      if (armor) this.selectArmor(armor);
    });
    document.querySelectorAll('[data-weapon-slot]').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('[data-weapon-slot]').forEach(item => {
          item.classList.remove('selected', 'seleccionado');
        });
        button.classList.add('selected', 'seleccionado');
        this.refreshArmory();
      });
    });
    document.querySelectorAll('[data-skin-part]').forEach(button => {
      button.addEventListener('click', () => this.selectSkinPart(button.dataset.skinPart));
    });
    bind('skinPrev', () => this.cycleSkinPart(-1));
    bind('skinNext', () => this.cycleSkinPart(1));
    bind('skinPrevCustomize', () => this.cycleSkinPart(-1));
    bind('skinNextCustomize', () => this.cycleSkinPart(1));
    bind('characterPrev', () => this.cycleCharacter(-1));
    bind('characterNext', () => this.cycleCharacter(1));
    bind('btn-select-p1', () => this.selectCustomizationPlayer('p1'));
    bind('btn-select-p2', () => this.selectCustomizationPlayer('p2'));
    bind('btn-start-coop-selected', () => {
      Game.startRun(false, true);
    });
    bind('btn-customize-back', () => {
      this.show(this._customizationReturn);
    });
    bind('btn-achievements-lobby', () => { this.refreshAchievements(); this.show('achievements'); });
    bind('btn-options-lobby',() => this.showOptions('lobby'));
    bind('btn-back-menu',  () => this.show('menu'));

    bind('btn-options-back', () => {
      if (this._lastScreen === 'pause') { this.show('pause'); return; }
      this.show(this._lastScreen === 'lobby' ? 'lobby' : 'menu');
    });
    bind('btn-reset-keys',   () => this.resetKeys());
    bind('btn-reset-pad',    () => this.resetGamepad());
    bind('btn-hud-options',  () => this.openHud('options'));
    bind('btn-hud-pause',    () => this.openHud('pause'));
    bind('btn-hud-back',     () => this.closeHud());
    bind('btn-hud-reset',    () => this.resetHud());
    bind('btn-mobile-hud-edit', () => this.toggleMobileHudEditor());
    bind('btn-reset-save',   () => {
      if (confirm('¿Borrar TODO el progreso?')) {
        Save.clear(); save = Save.load();
        this.refreshLobby(); this.refreshOptionsUI(); this.show('menu');
      }
    });

    bind('btn-stats-back', () => this.show('menu'));
    bind('btn-ach-back',   () => this.show(this._lastScreen === 'lobby' ? 'lobby' : 'menu'));
    bind('btn-perm-back',  () => this.show('lobby'));
    document.getElementById('screen-shop-perm')?.addEventListener('click', e => {
      const category = e.target.closest('[data-shop-category]')?.dataset.shopCategory;
      const subcategory = e.target.closest('[data-shop-subcategory]')?.dataset.shopSubcategory;
      const card = e.target.closest('[data-shop-item-id]');
      const buy = e.target.closest('[data-shop-buy]');
      if (category) {
        this._shopCategory = category;
        this._shopSubcategory = 'all';
        this._shopMissingOnly = false;
        this.refreshPermShop();
      } else if (subcategory) {
        this._shopSubcategory = subcategory;
        this.refreshPermShop();
      } else if (buy) {
        e.stopPropagation();
        if (buy.dataset.shopUpgrade) this.buyPermanentUpgrade(buy.dataset.shopUpgrade);
        else this.unlockArmoryItem(buy.dataset.shopBuy);
      } else if (card) {
        this._shopSelectedId = card.dataset.shopItemId;
        this.refreshPermShop();
      }
    });
    document.getElementById('permShopSort')?.addEventListener('change', e => {
      this._shopSort = e.target.value;
      this.refreshPermShop();
    });
    document.getElementById('permShopMissing')?.addEventListener('click', () => {
      this._shopMissingOnly = !this._shopMissingOnly;
      this.refreshPermShop();
    });
    bind('btn-inv-back',   () => this.show('lobby'));

    bind('btn-resume',        () => Game.resume());
    bind('btn-options-pause', () => this.showOptions('pause'));
    bind('btn-abandon',       () => Game.abandon());

    bind('btn-go-lobby', () => this.show('lobby'));
    bind('btn-go-retry', () => {
      this.show('battle');
      Game.startRun(Game.endless, Game.coop, Game.survivalMode);
    });

    bind('btn-inv-modal-close', () => this.closeInventoryModal());

    const volEl = document.getElementById('optVolume');
    const sfxEl = document.getElementById('optSfx');
    if (volEl) {
      volEl.value = save.options.volume;
      document.getElementById('volVal').textContent = save.options.volume;
      volEl.addEventListener('input', e => {
        save.options.volume = +e.target.value;
        document.getElementById('volVal').textContent = e.target.value;
        Audio2.updateMusicVolume();
        Save.write();
      });
    }
    if (sfxEl) {
      sfxEl.value = save.options.sfx;
      document.getElementById('sfxVal').textContent = save.options.sfx;
      sfxEl.addEventListener('input', e => {
        save.options.sfx = +e.target.value;
        document.getElementById('sfxVal').textContent = e.target.value;
        Save.write();
      });
    }

    document.querySelectorAll('[data-toggle="minimap"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setSelectedInGroup('[data-toggle="minimap"]', btn);
        save.options.minimap = btn.dataset.value === 'on';
        save.options.hud.show.minimap = save.options.minimap;
        Save.write();
        this.applyMinimapVisibility();
      });
    });

    document.querySelectorAll('[data-toggle="music"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setSelectedInGroup('[data-toggle="music"]', btn);
        save.options.music = btn.dataset.value === 'on';
        Audio2.setMusicEnabled(save.options.music);
        Save.write();
      });
    });
    this.setSelectedInGroup('[data-toggle="music"]', document.querySelector(`[data-toggle="music"][data-value="${save.options.music ? 'on' : 'off'}"]`));

    document.querySelectorAll('[data-diff]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setSelectedInGroup('[data-diff]', btn);
        save.options.difficulty = btn.dataset.diff;
        Save.write();
      });
    });

    const hudScale = document.getElementById('hudScale');
    if (hudScale) hudScale.addEventListener('input', e => {
      save.options.hud.scale = +e.target.value / 100;
      document.getElementById('hudScaleVal').textContent = e.target.value;
      Save.write();
      this.applyHudSettings();
      window.addEventListener('resize', () => {
        if (!this._lobbyEditing) this.applyLobbyLayout();
      });
    });
    const hudOpacity = document.getElementById('hudOpacity');
    if (hudOpacity) hudOpacity.addEventListener('input', e => {
      save.options.hud.opacity = +e.target.value / 100;
      document.getElementById('hudOpacityVal').textContent = e.target.value;
      Save.write();
      this.applyHudSettings();
    });
    const hudDelay = document.getElementById('hudDelay');
    if (hudDelay) hudDelay.addEventListener('input', e => {
      save.options.hud.autoHideDelay = +e.target.value;
      document.getElementById('hudDelayVal').textContent = e.target.value;
      Save.write();
      this.updateHudDim(performance.now());
    });
    const mobileHudSize = document.getElementById('mobileHudSize');
    if (mobileHudSize) mobileHudSize.addEventListener('input', e => {
      const value = Number(e.target.value);
      const label = document.getElementById('mobileHudSizeVal');
      if (label) label.textContent = value;
      this.setMobileHudScale(value / 100);
    });
    document.querySelectorAll('[data-hud-autohide]').forEach(btn => {
      btn.addEventListener('click', () => {
        save.options.hud.autoHide = btn.dataset.hudAutohide === 'on';
        Save.write();
        this.refreshHudUI();
        this.updateHudDim(performance.now());
      });
    });
    document.querySelectorAll('[data-hud-preset]').forEach(btn => {
      btn.addEventListener('click', () => this.applyHudPreset(btn.dataset.hudPreset));
    });

    this.buildKeybindList();
    this.buildGamepadBindList();
    this.applyHudSettings();
    // Escape cancela una asignación de mando pendiente.
    window.addEventListener('keydown', e => {
      if (this._gpBind && e.key === 'Escape') {
        e.preventDefault();
        this.cancelGamepadBind();
        this.toast('🎮 Asignación cancelada', 'danger');
      }
    });
    this.refreshLobby();
    this.refreshStats();
    this.refreshAchievements();
    this.refreshOptionsUI();
    this.applyMinimapVisibility();
    this.updateConsumableBar();
    this.updateKeyLabels();
    this.updateXpBar();
    this.updateChallengeBadge();
  },

  applyMinimapVisibility() {
    const mm = document.getElementById('minimap');
    if (!mm) return;
    const on = !!(save.options.hud && save.options.hud.show.minimap);
    save.options.minimap = on;
    if (on) {
      mm.classList.remove('hidden');
    } else {
      mm.classList.add('hidden');
      const c = mm.getContext('2d');
      c.clearRect(0, 0, mm.width, mm.height);
    }
  },

  /* ================================================================
     HUD PERSONALIZABLE
     ================================================================ */
  mobileHudOrientation() {
    return window.matchMedia('(orientation: landscape)').matches ? 'landscape' : 'portrait';
  },

  mobileHudLayout() {
    if (!save.options.mobileHud) {
      save.options.mobileHud = { landscape: {}, portrait: {} };
    }
    const orientation = this.mobileHudOrientation();
    return save.options.mobileHud[orientation] || (save.options.mobileHud[orientation] = {});
  },

  lobbyProfile() {
    const width = window.innerWidth;
    if (width <= 760) {
      return this.mobileHudOrientation() === 'landscape' ? 'mobileLandscape' : 'mobilePortrait';
    }
    return width <= 1100 ? 'tablet' : 'desktop';
  },

  lobbyLayout() {
    if (!save.options.lobbyLayouts) {
      save.options.lobbyLayouts = {
        desktop: {}, tablet: {}, mobileLandscape: {}, mobilePortrait: {},
      };
    }
    const profile = this.lobbyProfile();
    return save.options.lobbyLayouts[profile] || (save.options.lobbyLayouts[profile] = {});
  },

  applyLobbyLayout() {
    const layout = this.lobbyLayout();
    for (const [id] of this.LOBBY_TARGETS) {
      const el = document.getElementById(id);
      if (!el) continue;
      const item = layout[id];
      if (!item) {
        el.style.left = '';
        el.style.top = '';
        el.style.right = '';
        el.style.bottom = '';
        el.style.transform = '';
        el.style.removeProperty('--lobby-scale');
        continue;
      }
      el.style.left = `${item.x}%`;
      el.style.top = `${item.y}%`;
      el.style.right = 'auto';
      el.style.bottom = 'auto';
      el.style.setProperty('--lobby-scale', item.scale || 1);
      el.style.transform = `scale(${item.scale || 1})`;
    }
  },

  lobbyProfileLabel() {
    return {
      desktop: 'ESCRITORIO',
      tablet: 'TABLET',
      mobileLandscape: 'MÓVIL HORIZONTAL',
      mobilePortrait: 'MÓVIL VERTICAL',
    }[this.lobbyProfile()];
  },

  openLobbyEditor() {
    this._lobbyEditReturn = this.current === 'hud' ? 'hud' : 'options';
    this._lobbyEditing = true;
    this.show('lobby');
    const lobby = this.screens.lobby;
    if (lobby) lobby.classList.add('lobby-editing');
    this.installLobbyDraggers();
    this.createLobbyToolbar();
    this.toast(`Editando lobby · ${this.lobbyProfileLabel()}`, 'gold');
  },

  createLobbyToolbar() {
    const app = document.getElementById('app');
    if (!app || document.getElementById('lobbyLayoutToolbar')) return;
    const toolbar = document.createElement('div');
    toolbar.id = 'lobbyLayoutToolbar';
    toolbar.className = 'mobile-hud-toolbar lobby-layout-toolbar';
    toolbar.innerHTML = `
      <strong>EDITAR LOBBY</strong>
      <span>${this.lobbyProfileLabel()}</span>
      <label>Tamaño <input type="range" min="60" max="150" value="100" id="lobbyToolbarSize"></label>
      <button type="button" id="lobbyLayoutReset">↻ Restablecer</button>
      <button type="button" id="lobbyLayoutDone">✓ Guardar</button>
    `;
    app.appendChild(toolbar);
    toolbar.querySelector('#lobbyToolbarSize').addEventListener('input', event => {
      this.setLobbyScale(Number(event.target.value) / 100);
    });
    toolbar.querySelector('#lobbyLayoutReset').addEventListener('click', () => this.resetLobbyLayout());
    toolbar.querySelector('#lobbyLayoutDone').addEventListener('click', () => this.closeLobbyEditor());
  },

  closeLobbyEditor() {
    this._lobbyEditing = false;
    this._lobbySelected = null;
    this.screens.lobby?.classList.remove('lobby-editing');
    document.getElementById('lobbyLayoutToolbar')?.remove();
    Save.write();
    this.show(this._lobbyEditReturn);
    this.toast(`Lobby guardado · ${this.lobbyProfileLabel()}`, 'gold');
  },

  resetLobbyLayout() {
    const profile = this.lobbyProfile();
    save.options.lobbyLayouts[profile] = {};
    this.applyLobbyLayout();
    Save.write();
    this.toast(`Perfil ${this.lobbyProfileLabel()} restablecido`, 'gold');
  },

  selectLobbyElement(id) {
    this._lobbySelected = id;
    const item = this.lobbyLayout()[id];
    const size = document.getElementById('lobbyToolbarSize');
    if (size) size.value = Math.round((item?.scale || 1) * 100);
    document.querySelectorAll('[data-lobby-target]').forEach(el => {
      el.classList.toggle('lobby-edit-selected', el.dataset.lobbyTarget === id);
    });
  },

  setLobbyScale(scale) {
    const id = this._lobbySelected;
    if (!id) return;
    const layout = this.lobbyLayout();
    if (!layout[id]) {
      const el = document.getElementById(id);
      const rect = el.getBoundingClientRect();
      const appRect = document.getElementById('app').getBoundingClientRect();
      layout[id] = {
        x: ((rect.left - appRect.left) / appRect.width) * 100,
        y: ((rect.top - appRect.top) / appRect.height) * 100,
        scale: 1,
      };
    }
    layout[id].scale = scale;
    const el = document.getElementById(id);
    if (el) el.style.transform = `scale(${scale})`;
    Save.write();
  },

  installLobbyDraggers() {
    const app = document.getElementById('app');
    if (!app || app.dataset.lobbyDraggers === 'true') return;
    app.dataset.lobbyDraggers = 'true';
    for (const [id, label] of this.LOBBY_TARGETS) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.dataset.lobbyTarget = id;
      el.title = `Arrastrar: ${label}`;
      el.addEventListener('pointerdown', event => {
        if (!this._lobbyEditing) return;
        event.preventDefault();
        event.stopPropagation();
        this.selectLobbyElement(id);
        const appRect = app.getBoundingClientRect();
        const rect = el.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;
        const move = moveEvent => {
          const layout = this.lobbyLayout();
          const x = Math.max(0, Math.min(100, ((moveEvent.clientX - appRect.left - offsetX) / appRect.width) * 100));
          const y = Math.max(0, Math.min(100, ((moveEvent.clientY - appRect.top - offsetY) / appRect.height) * 100));
          if (!layout[id]) layout[id] = { x, y, scale: 1 };
          layout[id].x = x;
          layout[id].y = y;
          el.style.left = `${x}%`;
          el.style.top = `${y}%`;
          el.style.right = 'auto';
          el.style.bottom = 'auto';
        };
        const stop = () => {
          document.removeEventListener('pointermove', move);
          document.removeEventListener('pointerup', stop);
          Save.write();
        };
        document.addEventListener('pointermove', move);
        document.addEventListener('pointerup', stop, { once: true });
      });
    }
  },

  applyMobileHudPositions() {
    const layout = this.mobileHudLayout();
    const touchControls = document.getElementById('touchControls');
    const touchTargets = [
      'touchJoystick', 'touchActions', 'touchDash', 'touchBasic',
      'touchMelee', 'touchLong', 'touchBlock', 'touchInteract',
    ];
    const abilityTargets = [
      'abilityBar', 'abilitySlot', 'basicSlot', 'meleeSlot', 'longSlot', 'blockSlot',
    ];
    const hasCustomTouchLayout = touchTargets.some(id => layout[id]);
    const hasIndividualTouchLayout = touchTargets.slice(2).some(id => layout[id]);
    const hasIndividualAbilityLayout = abilityTargets.slice(1).some(id => layout[id]);
    touchControls?.classList.toggle('mobile-hud-custom-layout', hasCustomTouchLayout);
    touchControls?.classList.toggle('mobile-hud-individual-layout', hasIndividualTouchLayout);
    document.getElementById('abilityBar')?.classList.toggle(
      'mobile-hud-individual-layout', hasIndividualAbilityLayout,
    );
    for (const [id] of this.MOBILE_HUD_TARGETS) {
      const el = document.getElementById(id);
      if (!el) continue;
      const item = layout[id];
      if (!item) {
        el.style.removeProperty('left');
        el.style.removeProperty('top');
        el.style.removeProperty('right');
        el.style.removeProperty('bottom');
        el.style.removeProperty('position');
        el.style.removeProperty('--mobile-hud-scale');
        el.style.removeProperty('transform');
        continue;
      }
      el.style.setProperty('left', `${item.x}%`, 'important');
      el.style.setProperty('top', `${item.y}%`, 'important');
      el.style.setProperty('right', 'auto', 'important');
      el.style.setProperty('bottom', 'auto', 'important');
      if (touchTargets.includes(id) || abilityTargets.includes(id)) {
        el.style.setProperty('position', 'absolute', 'important');
      }
      const scale = item.scale || 1;
      el.style.setProperty('--mobile-hud-scale', scale);
      el.style.setProperty('transform', id === 'hud-top-center'
        ? `translateX(-50%) scale(calc(var(--hud-scale) * ${scale}))`
        : `scale(calc(var(--hud-scale) * ${scale}))`);
    }
  },

  toggleMobileHudEditor() {
    this._mobileHudEditing = !this._mobileHudEditing;
    const app = document.getElementById('app');
    const button = document.getElementById('btn-mobile-hud-edit');
    if (app) app.classList.toggle('mobile-hud-editing', this._mobileHudEditing);
    if (button) button.textContent = this._mobileHudEditing ? '✓ Terminar edición' : '✋ Editar HUD móvil';
    if (this._mobileHudEditing) {
      this.installMobileHudDraggers();
      this.createMobileHudToolbar();
      this.show('battle');
      this.toast('Arrastra los elementos para colocarlos', 'gold');
    } else {
      document.getElementById('mobileHudToolbar')?.remove();
      Save.write();
      this.show('hud');
      this.toast('HUD móvil guardado', 'gold');
    }
  },

  createMobileHudToolbar() {
    const app = document.getElementById('app');
    if (!app || document.getElementById('mobileHudToolbar')) return;
    const toolbar = document.createElement('div');
    toolbar.id = 'mobileHudToolbar';
    toolbar.className = 'mobile-hud-toolbar';
    toolbar.innerHTML = `
      <strong>EDITAR HUD</strong>
      <label>Tamaño <input type="range" min="60" max="150" value="100" id="mobileHudToolbarSize"></label>
      <button type="button" id="mobileHudToolbarReset">↻ Restablecer</button>
      <button type="button" id="mobileHudToolbarDone">✓ Guardar</button>
    `;
    app.appendChild(toolbar);
    toolbar.querySelector('#mobileHudToolbarSize').addEventListener('input', event => {
      this.setMobileHudScale(Number(event.target.value) / 100);
    });
    toolbar.querySelector('#mobileHudToolbarReset').addEventListener('click', () => {
      const orientation = this.mobileHudOrientation();
      save.options.mobileHud[orientation] = {};
      this._mobileHudSelected = null;
      this.applyMobileHudPositions();
      Save.write();
    });
    toolbar.querySelector('#mobileHudToolbarDone').addEventListener('click', () => this.toggleMobileHudEditor());
  },

  selectMobileHudElement(id) {
    this._mobileHudSelected = id;
    const item = this.mobileHudLayout()[id];
    const size = document.getElementById('mobileHudSize');
    const label = document.getElementById('mobileHudSizeVal');
    const value = Math.round((item?.scale || 1) * 100);
    if (size) size.value = value;
    if (label) label.textContent = value;
    document.querySelectorAll('[data-mobile-hud-target]').forEach(el => {
      el.classList.toggle('mobile-hud-selected', el.dataset.mobileHudTarget === id);
    });
  },

  setMobileHudScale(scale) {
    const id = this._mobileHudSelected;
    if (!id) return;
    const layout = this.mobileHudLayout();
    if (!layout[id]) layout[id] = { x: 0, y: 0, scale: 1 };
    layout[id].scale = scale;
    const el = document.getElementById(id);
    if (el) el.style.setProperty('--mobile-hud-scale', scale);
    Save.write();
  },

  installMobileHudDraggers() {
    const app = document.getElementById('app');
    if (!app || app.dataset.mobileHudDraggers === 'true') return;
    app.dataset.mobileHudDraggers = 'true';
    for (const [id, label] of this.MOBILE_HUD_TARGETS) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.dataset.mobileHudTarget = id;
      el.title = `Arrastrar: ${label}`;
      el.addEventListener('pointerdown', event => {
        if (!this._mobileHudEditing) return;
        event.preventDefault();
        event.stopPropagation();
        this.selectMobileHudElement(id);
        const appRect = app.getBoundingClientRect();
        const rect = el.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;
        const move = moveEvent => {
          const layout = this.mobileHudLayout();
          const x = Math.max(0, Math.min(100, ((moveEvent.clientX - appRect.left - offsetX) / appRect.width) * 100));
          const y = Math.max(0, Math.min(100, ((moveEvent.clientY - appRect.top - offsetY) / appRect.height) * 100));
          if (!layout[id]) layout[id] = { x, y, scale: 1 };
          layout[id].x = x;
          layout[id].y = y;
          el.style.left = `${x}%`;
          el.style.top = `${y}%`;
          el.style.right = 'auto';
          el.style.bottom = 'auto';
        };
        const stop = () => {
          document.removeEventListener('pointermove', move);
          document.removeEventListener('pointerup', stop);
          Save.write();
        };
        document.addEventListener('pointermove', move);
        document.addEventListener('pointerup', stop, { once: true });
      });
    }
  },

  openHud(from = 'options') {
    this._openHudFrom = from;
    this.refreshHudUI();
    this.applyMobileHudPositions();
    this.show('hud');
  },

  closeHud() {
    this.show(this._openHudFrom === 'pause' ? 'pause' : 'options');
  },

  refreshHudUI() {
    const h = save.options.hud;
    const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    const scale = document.getElementById('hudScale');
    const scalePct = Math.round(h.scale * 100);
    if (scale) scale.value = scalePct;
    setVal('hudScaleVal', scalePct);

    const opacity = document.getElementById('hudOpacity');
    const opacityPct = Math.round(h.opacity * 100);
    if (opacity) opacity.value = opacityPct;
    setVal('hudOpacityVal', opacityPct);

    const delay = document.getElementById('hudDelay');
    if (delay) delay.value = h.autoHideDelay;
    setVal('hudDelayVal', h.autoHideDelay);

    document.querySelectorAll('[data-hud-autohide]').forEach(b => {
      b.classList.toggle('active', (b.dataset.hudAutohide === 'on') === !!h.autoHide);
    });
    this._buildHudToggles();
  },

  _buildHudToggles() {
    const wrap = document.getElementById('hudElementToggles');
    if (!wrap) return;
    wrap.innerHTML = '';
    for (const [key, label] of this.HUD_ELEMENTS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hud-chip' + (save.options.hud.show[key] ? ' active' : '');
      btn.innerHTML = `<span class="hud-chip-dot"></span><span>${label}</span>`;
      btn.addEventListener('click', () => {
        save.options.hud.show[key] = !save.options.hud.show[key];
        this.applyHudSettings();
        Save.write();
        btn.classList.toggle('active', save.options.hud.show[key]);
      });
      wrap.appendChild(btn);
    }
  },

  applyHudSettings() {
    const hud = document.getElementById('hud');
    if (!hud || !save.options.hud) return;
    const h = save.options.hud;
    hud.style.setProperty('--hud-scale', h.scale);
    hud.style.setProperty('--hud-opacity', h.opacity);
    for (const [key] of this.HUD_ELEMENTS) {
      if (key === 'minimap') continue;
      hud.classList.toggle('hud-hide-' + key, !h.show[key]);
    }
    this.applyMinimapVisibility();
  },

  applyHudPreset(name) {
    const h = save.options.hud;
    const all = {
      hp:true, abilities:true, floor:true, rooms:true, coins:true,
      stats:true, xp:true, consumables:true, minimap:true,
    };
    if (name === 'compact') {
      Object.assign(h, { scale: 0.85, opacity: 0.95, autoHide: true, autoHideDelay: 5 });
      h.show = { ...all, rooms:false, coins:false, stats:false, minimap:false };
    } else if (name === 'immersive') {
      Object.assign(h, { scale: 0.8, opacity: 0.9, autoHide: true, autoHideDelay: 3 });
      h.show = { ...all, floor:false, rooms:false, coins:false, stats:false, xp:false, minimap:false };
    } else {
      Object.assign(h, { scale: 1, opacity: 1, autoHide: false, autoHideDelay: 6 });
      h.show = { ...all };
    }
    this.applyHudSettings();
    Save.write();
    this.refreshHudUI();
    this.updateHudDim(performance.now());
    const label = name === 'compact' ? 'Compacto' : name === 'immersive' ? 'Inmersivo' : 'Completo';
    this.toast(`🎛 HUD: ${label}`, 'gold');
  },

  resetHud() {
    save.options.hud = Save.defaults().options.hud;
    save.options.mobileHud = { landscape: {}, portrait: {} };
    this._mobileHudEditing = false;
    document.getElementById('app')?.classList.remove('mobile-hud-editing');
    this.applyHudSettings();
    Save.write();
    this.refreshHudUI();
    this.updateHudDim(performance.now());
    this.toast('🎛 HUD restaurado', 'gold');
  },

  updateHudDim(now) {
    const hud = document.getElementById('hud');
    if (!hud || !save.options.hud) return;
    const h = save.options.hud;
    let dim = false;
    if (h.autoHide && Game.battleActive && !Game.paused && !this._invModalOpen) {
      dim = now - (Game.lastCombatAt || 0) > (h.autoHideDelay || 6) * 1000;
    }
    if (dim !== this._hudDim) {
      this._hudDim = dim;
      hud.classList.toggle('is-dim', dim);
    }
  },

  show(name) {
    const app = document.getElementById('app');
    if (app) app.classList.toggle('overlay-open', name !== 'battle');
    if (name !== 'shop') {
      const title = document.querySelector('#screen-shop .screen-title');
      if (title) title.innerHTML = '🏪 MERCADILLO DEL PISO <span id="shopFloor">1</span>';
      const subtitle = document.querySelector('#screen-shop p');
      if (subtitle) subtitle.textContent = 'Bienes perecederos y reliquias. Los consumibles se acumulan (máx. por tipo).';
    }

    Object.values(this.screens).forEach(s => s && s.classList.remove('active'));
    if (name === 'battle') { this.current = 'battle'; this._menuLastActiveOverlay = null; return; }
    const el = this.screens[name];
    if (el) { el.classList.add('active'); this.current = name; }
    if (name === 'lobby')         { this.refreshLobby(); this.applyLobbyLayout(); }
    if (name === 'stats')         this.refreshStats();
    if (name === 'achievements')  this.refreshAchievements();
    if (name === 'shopPerm')      this.refreshPermShop();
    if (name === 'invMeta')       this.refreshInvMeta();
    if (name === 'options')       this.refreshOptionsUI();
    if (name === 'customize')     this.refreshCustomization();
    if (name === 'armory')        this.refreshArmory();
    if (name === 'roleProgress')  this.refreshRoleProgress();
    this._menuLastActiveOverlay = null;
    this._menuFocusIndex = 0;

    setTimeout(() => {
      this.updateKeyLabels();
      this.updateInputModeBadge();
    }, 30);
  },

  showOptions(from) { this._lastScreen = from; this.show('options'); },

  showBossLockMessage() {
    const el = document.getElementById('bossLockMsg');
    if (!el) return;
    el.style.display = 'block';
    clearTimeout(this._bossLockTimer);
    this._bossLockTimer = setTimeout(() => {
      el.style.display = 'none';
    }, 2200);
  },

  toggleInventoryModal() {
    if (this._invModalOpen) this.closeInventoryModal();
    else this.openInventoryModal();
  },
  openInventoryModal() {
    this._invModalOpen = true;
    Game.paused = true;
    this.renderInventoryModal();
    this.screens.invModal.classList.add('active');
    const app = document.getElementById('app');
    if (app) app.classList.add('overlay-open');
  },
  closeInventoryModal() {
    this._invModalOpen = false;
    this.screens.invModal.classList.remove('active');
    if (Game.battleActive) {
      Game.paused = false;
      this.current = 'battle';
      const app = document.getElementById('app');
      if (app) app.classList.remove('overlay-open');
    }
  },

  goBack() {
    if (this._invModalOpen) { this.closeInventoryModal(); return true; }
    if (this.current === 'hud') { this.closeHud(); return true; }
    if (this.current === 'options') {
      this.show(this._lastScreen === 'lobby' ? 'lobby' : this._lastScreen === 'pause' ? 'pause' : 'menu');
      return true;
    }
    if (Game.paused && Game.battleActive) {
      if (this.current === 'levelup') {
        const firstCard = document.querySelector('#levelupGrid .levelup-card');
        if (firstCard) { firstCard.click(); return true; }
      }
      if (this.current === 'upgrade') {
        const closeButton = document.querySelector('#upgradeGrid .shop-item:last-child .shop-item-buy');
        if (closeButton) { closeButton.click(); return true; }
      }
      Game.resume();
      return true;
    }
    const backMap = {
      'armory':        this._lastScreen === 'menu' ? 'menu' : 'lobby',
      'customize':     this._customizationReturn,
      'stats':        'menu',
      'achievements': this._lastScreen === 'lobby' ? 'lobby' : 'menu',
      'shopPerm':     'lobby',
      'invMeta':      'lobby',
      'lobby':        'menu',
      'gameover':     'lobby',
    };
    if (backMap[this.current]) { this.show(backMap[this.current]); return true; }
    return false;
  },

  renderInventoryModal() {
    document.getElementById('invModalCoins').textContent = Game.run.coins;
    document.getElementById('invModalItemsCount').textContent = Game.run.items.length;
    const lvlEl = document.getElementById('invModalLevel');
    if (lvlEl) lvlEl.textContent = Game.run.level;
    document.getElementById('invModalBoss').textContent =
      (Game.boss && !Game.boss.dead) ? Game.boss.name : '—';

    // Reto del piso
    const cEl = document.getElementById('invModalChallenge');
    if (cEl) {
      if (Game.floorChallenge) {
        cEl.innerHTML = `<span style="font-size:18px;">${Game.floorChallenge.icon}</span> <strong style="color:#ff8aa3;letter-spacing:2px;">RETO DEL PISO:</strong> ${Game.floorChallenge.name} — <em>${Game.floorChallenge.desc}</em>`;
      } else {
        cEl.innerHTML = '';
        cEl.style.display = 'none';
      }
    }

    const synEl = document.getElementById('invModalSynergies');
    synEl.innerHTML = '';
    const active = SYNERGIES.filter(s => s.ids.every(id => Game.run.items.includes(id)));
    if (active.length === 0) {
      synEl.innerHTML = '<span class="synergy-empty">Sin sinergias activas.</span>';
    } else {
      for (const s of active) {
        const tag = document.createElement('div');
        tag.className = 'synergy-tag';
        const bonusText = Object.entries(s.bonus).map(([k,v]) => `+${v} ${k.toUpperCase()}`).join(', ');
        tag.textContent = `${s.name} · ${bonusText}`;
        synEl.appendChild(tag);
      }
    }

    const grid = document.getElementById('invModalItems');
    grid.innerHTML = '';
    if (Game.run.items.length === 0) {
      grid.innerHTML = '<span class="synergy-empty">Aún no tienes items esta run.</span>';
    } else {
      for (const id of Game.run.items) {
        const item = ITEMS_DB.find(i => i.id === id);
        if (!item) continue;
        const rar = RARITY[item.rarity];
        const div = document.createElement('div');
        div.className = 'inv-modal-item';
        div.style.borderColor = rar.color;
        div.innerHTML = `
          <div class="inv-modal-icon" style="filter:drop-shadow(0 0 8px ${rar.color});">${item.icon}</div>
          <div class="inv-modal-name">${item.name}</div>
          <div class="inv-modal-desc">${item.desc}</div>
          <div class="inv-modal-rarity" style="color:${rar.color};">${rar.label}</div>
        `;
        grid.appendChild(div);
      }
    }

    const consGrid = document.getElementById('invModalConsumables');
    if (consGrid) {
      consGrid.innerHTML = '';
      const inv = Game.run.consumables || {};
      const entries = Object.entries(inv).filter(([_, c]) => c > 0);
      if (entries.length === 0) {
        consGrid.innerHTML = '<span class="synergy-empty">Sin consumibles. Compra en el mercadillo.</span>';
      } else {
        for (const [id, count] of entries) {
          const def = CONSUMABLES_DB.find(c => c.id === id);
          if (!def) continue;
          const rar = RARITY[def.rarity];
          const div = document.createElement('div');
          div.className = 'inv-modal-item';
          div.style.borderColor = rar.color;
          div.innerHTML = `
            <div class="inv-modal-icon" style="filter:drop-shadow(0 0 8px ${rar.color});">${def.icon}</div>
            <div class="inv-modal-name">${def.name}</div>
            <div class="inv-modal-desc">${def.desc}</div>
            <div class="inv-modal-rarity" style="color:${rar.color};">x${count} · ${rar.label}</div>
          `;
          consGrid.appendChild(div);
        }
      }
    }
  },

  /* 🗺️ Actualiza el badge del reto del piso en el HUD */
  updateChallengeBadge() {
    const badge = document.getElementById('challengeBadge');
    const iconEl = document.getElementById('challengeIcon');
    const textEl = document.getElementById('challengeText');
    if (!badge || !iconEl || !textEl) return;

    if (!Game.floorChallenge) {
      badge.style.display = 'none';
      return;
    }
    const c = Game.floorChallenge;
    badge.style.display = 'flex';
    // Quitar clases previas y añadir la actual
    badge.classList.remove('easy', 'medium', 'hard', 'extreme');
    badge.classList.add(c.severity || 'medium');
    iconEl.textContent = c.icon;
    textEl.textContent = c.name;
    badge.title = c.desc;
  },

  expRequired(level) {
    return Math.round(100 * Math.pow(level, 1.5));
  },

  setSelectedInGroup(selector, selected) {
    document.querySelectorAll(selector).forEach(button => {
      const active = button === selected;
      button.classList.toggle('active', active);
      button.classList.toggle('seleccionado', active);
    });
  },

  syncEconomy() {
    dineroJugador = save.metaCoins || 0;
  },

  mejorarItem(itemId, tipo) {
    const isWeapon = tipo === 'arma' || tipo === 'weapon';
    const item = isWeapon
      ? this.ARMORY_WEAPONS[itemId]
      : this.ARMOR_DATA.find(armor => armor.id === itemId);
    if (!item) return false;
    const levels = isWeapon ? save.customization.weaponLevels : save.customization.armorLevels;
    const currentLevel = Math.max(1, Math.min(50, Number(levels[itemId]) || 1));
    if (currentLevel >= 50) {
      this.toast('Este objeto ya está en el nivel máximo', 'gold');
      return false;
    }
    const cost = currentLevel * 100;
    this.syncEconomy();
    if (dineroJugador < cost) {
      alert(`No tienes suficiente dinero. Necesitas ${cost} monedas.`);
      return false;
    }
    dineroJugador -= cost;
    save.metaCoins = dineroJugador;
    levels[itemId] = currentLevel + 1;
    save.totalUpgradesBought = (save.totalUpgradesBought || 0) + 1;
    Save.write();
    if (isWeapon) this.refreshArmory();
    else this.refreshCustomization();
    this.refreshLobby();
    this.verificarLogros();
    this.toast(`${item.name} mejorado al nivel ${currentLevel + 1}`, 'gold');
    return true;
  },

  calcularStatsTotales(personaje, armaEquipada, armadurasEquipadas) {
    const role = typeof personaje === 'string'
      ? (this.ARMORY_ROLES[personaje] || this.ARMORY_ROLES.tank)
      : (personaje || this.ARMORY_ROLES.tank);
    const weapon = typeof armaEquipada === 'string' ? this.ARMORY_WEAPONS[armaEquipada] : armaEquipada;
    const weaponStats = weapon ? this.weaponStats({ ...weapon, id: weapon.id || armaEquipada }) : {};
    const armorList = Array.isArray(armadurasEquipadas)
      ? armadurasEquipadas
      : Object.values(armadurasEquipadas || {}).map(id => this.ARMOR_DATA.find(item => item.id === id)).filter(Boolean);
    const stats = {
      damage: role.stats?.damage || 10,
      cadence: role.stats?.attackSpeed || 0,
      mobility: role.stats?.mobility || 0,
      bullets: role.stats?.bullets || 0,
    };
    stats.damage += weaponStats.damage || 0;
    stats.cadence += weaponStats.cadence || weapon?.attackSpeed || 0;
    stats.mobility += weaponStats.mobility || weapon?.mobility || 0;
    stats.bullets += weaponStats.bullets || 0;
    armorList.forEach(armor => {
      const values = this.armorStats(armor);
      stats.damage += values.damage || 0;
      stats.cadence += values.attackSpeed || 0;
      stats.mobility += values.mobility || 0;
      stats.bullets += values.bullets || 0;
    });
    return Object.fromEntries(Object.entries(stats).map(([key, value]) => [key, Math.max(0, Math.round(value))]));
  },

  ganarPartidaPrueba() {
    const roleId = save.customization.role || 'tank';
    const level = this.addRoleExp(roleId, 500);
    Save.write();
    this.refreshRoleProgress();
    this.refreshCustomization();
    this.refreshArmory();
    this.verificarLogros();
    this.toast(`+500 EXP · Nivel ${level}`, 'gold');
  },

  addRoleExp(roleId, amount) {
    const progress = this.roleProgress(roleId);
    let level = progress.level;
    let exp = progress.exp + Math.max(0, amount);
    while (level < 50 && exp >= this.expRequired(level)) {
      exp -= this.expRequired(level);
      level += 1;
    }
    save.customization.roleProgress[roleId] = {
      level,
      exp,
      expTotal: (progress.expTotal || 0) + Math.max(0, amount),
    };
    save.bestRoleLevel = Math.max(save.bestRoleLevel || 1, level);
    this.unlockRoleWeapons(roleId, level);
    return level;
  },

  unlockRoleWeapons(roleId, level) {
    Object.entries(this.ARMORY_WEAPONS).forEach(([id, item]) => {
      if ((item.unlockRole === roleId || !item.unlockRole) && (item.unlockLevel || 1) <= level) {
        save.customization.unlockedArmory[id] = true;
      }
    });
  },

  roleProgress(roleId) {
    const saved = save.customization.roleProgress?.[roleId] || {};
    return {
      level: Math.max(1, Math.min(50, saved.level || 1)),
      exp: Math.max(0, saved.exp || 0),
    };
  },

  roleUnlocks(roleId) {
    return this.ROLE_PROGRESS[roleId]?.unlocks || [];
  },

  toggleRoleProgress(roleId) {
    const state = save.customization.expandedRole === roleId ? '' : roleId;
    save.customization.expandedRole = state;
    Save.write();
    this.refreshRoleProgress();
  },

  refreshRoleProgress() {
    const list = document.getElementById('roleProgressList');
    if (!list) return;
    list.innerHTML = Object.entries(this.ARMORY_ROLES).map(([id, role]) => {
      const progress = this.roleProgress(id);
      const required = this.expRequired(progress.level);
      const unlocks = this.roleUnlocks(id);
      const next = unlocks.find(item => item.level > progress.level);
      const expanded = save.customization.expandedRole === id;
      const details = expanded ? `<div class="role-progress-details">${unlocks.map(item =>
        `<div><span>NIVEL ${item.level}</span><strong>${item.name}</strong></div>`).join('')}</div>` : '';
      return `<article class="role-progress-card ${expanded ? 'expanded' : ''}" data-progress-role="${id}">
        <div class="role-progress-summary"><b>${role.icon}</b><div><h3>${role.name}</h3>
          <span>NIVEL ${progress.level}/50 · ${progress.exp}/${required} EXP</span>
          <i><em style="width:${Math.min(100, progress.exp / required * 100)}%"></em></i>
          <small>Próximo desbloqueo: ${next ? `${next.name} (Nivel ${next.level})` : 'Arsenal completo'}</small>
        </div><strong>›</strong></div>${details}
      </article>`;
    }).join('');
  },

  selectedArmorModifiers() {
    const equipped = save.customization.armors || {};
    return Object.values(equipped).reduce((total, id) => {
      const armor = this.ARMOR_DATA.find(item => item.id === id);
      if (!armor) return total;
      Object.entries(armor.modifiers).forEach(([key, value]) => { total[key] = (total[key] || 0) + value; });
      return total;
    }, { attackSpeed: 0, mobility: 0, special: 0, defense: 0, precision: 0 });
  },

  isArmoryUnlocked(id) {
    return Boolean(save.customization.unlockedArmory?.[id]);
  },

  armoryItemCost(item) {
    return item.category ? 120 + item.unlockLevel * 12 : 180 + (item.unlockLevel || 1) * 18;
  },

  armorLevel(id) {
    return Math.max(1, Math.min(50, Number(save.customization.armorLevels?.[id]) || 1));
  },

  weaponLevel(id) {
    return Math.max(1, Math.min(50, Number(save.customization.weaponLevels?.[id]) || 1));
  },

  armorStats(armor) {
    const level = this.armorLevel(armor.id);
    const scale = 1 + (level - 1) * 0.05;
    return Object.fromEntries(Object.entries(armor.baseStats || armor.modifiers).map(([key, value]) => [key, Math.round(value * scale)]));
  },

  upgradeArmor(id) {
    return this.mejorarItem(id, 'armadura');
  },

  weaponStats(item) {
    const level = this.weaponLevel(item.id);
    const base = item.statsBase || { damage: 10, cadence: item.attackSpeed, mobility: item.mobility, bullets: 1 };
    return { level, damage: Math.round(base.damage + level * 1.5), cadence: Math.round(base.cadence), mobility: Math.round(base.mobility + level * 0.4), bullets: base.bullets };
  },

  upgradeWeapon(id) {
    return this.mejorarItem(id, 'arma');
  },

  unlockArmoryItem(id) {
    const item = this.ARMORY_WEAPONS[id] || this.ARMOR_DATA.find(armor => armor.id === id);
    if (!item || this.isArmoryUnlocked(id)) return;
    const requiredLevel = item.unlockLevel || 1;
    const requiredRole = item.unlockRole || save.customization.role || 'tank';
    if (this.roleProgress(requiredRole).level < requiredLevel) {
      this.toast(`Requiere nivel ${requiredLevel} del rol`, 'gold');
      return;
    }
    const cost = this.armoryItemCost(item);
    if ((save.metaCoins || 0) < cost) {
      this.toast(`Necesitas ${cost} monedas meta para desbloquearlo`, 'gold');
      return;
    }
    save.metaCoins -= cost;
    save.customization.unlockedArmory[id] = true;
    Save.write();
    Audio2.buy();
    this.refreshPermShop();
    this.refreshArmory();
    this.refreshCustomization();
    this.refreshLobby();
    this.toast(`${item.name} desbloqueado`, 'gold');
  },

  selectArmor(id) {
    const armor = this.ARMOR_DATA.find(item => item.id === id);
    if (!armor) return;
    if (!this.isArmoryUnlocked(id)) {
      this.toast('Desbloquea esta armadura en la Tienda Permanente', 'gold');
      return;
    }
    save.customization.armors[armor.category] = id;
    Save.write();
    this.refreshCustomization();
    this.refreshArmory();
  },

  armoryWeaponStats() {
    const role = this.ARMORY_ROLES[save.customization.role] || this.ARMORY_ROLES.tank;
    const primary = this.ARMORY_WEAPONS[save.customization.primary] || this.ARMORY_WEAPONS.vigilante;
    const secondary = this.ARMORY_WEAPONS[save.customization.secondary] || this.ARMORY_WEAPONS.centinela;
    const armor = this.selectedArmorModifiers();
    return {
      attackSpeed: Math.max(10, Math.min(100, role.stats.attackSpeed * 10 + primary.attackSpeed + secondary.attackSpeed + armor.attackSpeed)),
      mobility: Math.max(10, Math.min(100, role.stats.mobility * 10 + primary.mobility + secondary.mobility + armor.mobility)),
      special: Math.max(10, Math.min(100, role.stats.special * 10 + primary.special + secondary.special + armor.special)),
    };
  },

  refreshArmory() {
    const roleGrid = document.getElementById('armoryRoleGrid');
    const weaponGrid = document.getElementById('armoryWeaponGrid');
    let normalized = false;
    if (!this.ARMORY_ROLES[save.customization.role]) { save.customization.role = 'tank'; normalized = true; }
    if (!this.ARMORY_WEAPONS[save.customization.primary]) { save.customization.primary = 'vigilante'; normalized = true; }
    if (!this.ARMORY_WEAPONS[save.customization.secondary]) { save.customization.secondary = 'centinela'; normalized = true; }
    if (normalized) Save.write();
    const role = this.ARMORY_ROLES[save.customization.role] || this.ARMORY_ROLES.tank;
    const skinPreview = document.getElementById('armorySkinPreview');
    if (skinPreview && typeof PlayerCustomization !== 'undefined') {
      PlayerCustomization.renderPreview(skinPreview.getContext('2d'), PlayerCustomization.selected(), 180);
    }
    const selectedSlot = document.querySelector('[data-weapon-slot].selected')?.dataset.weaponSlot || 'primary';
    document.querySelectorAll('[data-armory-filter]').forEach(button => {
      const active = button.dataset.armoryFilter === this.ARMORY_FILTER;
      button.classList.toggle('selected', active);
      button.classList.toggle('seleccionado', active);
    });
    document.querySelectorAll('[data-weapon-slot]').forEach(button => {
      const active = button.dataset.weaponSlot === selectedSlot;
      button.classList.toggle('selected', active);
      button.classList.toggle('seleccionado', active);
    });
    if (roleGrid) {
      roleGrid.innerHTML = Object.entries(this.ARMORY_ROLES).map(([id, item]) => `
        <article class="armory-role ${id === save.customization.role ? 'seleccionado' : ''} ${this._openArmoryRoles.has(id) ? 'open' : ''}" data-role="${id}">
          <button class="armory-role-toggle" type="button">
            <b>${item.icon}</b><strong>${item.name}</strong><span>${this._openArmoryRoles.has(id) ? '▲' : '▼'}</span>
          </button>
          <div class="armory-role-details"><small>${item.desc}</small><em>Pasiva: ${item.passive}</em><em>Activa: ${item.active}</em><em>Combo: ${item.combo}</em></div>
        </article>
      `).join('');
    }
    if (weaponGrid) {
      const groups = {};
      for (const [id, item] of Object.entries(this.ARMORY_WEAPONS)) {
        if (this.ARMORY_FILTER === 'FALTANTES' && this.isArmoryUnlocked(id)) continue;
        if (this.ARMORY_FILTER !== 'FALTANTES') {
          const matchesSniperCategory = this.ARMORY_FILTER === 'snipers' && item.categoryId === this.ARMORY_FILTER;
          if (!matchesSniperCategory && item.type !== this.ARMORY_FILTER) continue;
        }
        (groups[item.type] ||= []).push([id, item]);
      }
      weaponGrid.innerHTML = Object.entries(groups).map(([type, weapons]) => `
        <div class="armory-weapon-group"><h4>${type}</h4>
            <div class="armory-weapon-group-grid">${weapons.map(([id, item]) => `
              ${(() => {
                const locked = !this.isArmoryUnlocked(id);
                const stats = this.weaponStats({ ...item, id });
                const required = item.unlockLevel || 1;
                return `<button class="armory-weapon ${id === save.customization[selectedSlot] ? 'seleccionado' : ''} ${locked ? 'locked' : ''}" type="button" data-weapon="${id}" ${locked ? 'disabled' : ''}>
                <strong>${locked ? '🔒 ' : ''}${item.name}</strong><small>${item.desc}</small><div class="weapon-art">${item.art}</div><em>${locked ? `NIVEL ${required} REQUERIDO` : `NIVEL ${stats.level}/50 · DAÑO ${stats.damage} · ${stats.bullets} BALAS`}</em>
              </button>`;
              })()}
            `).join('')}</div>
        </div>
      `).join('');
    }
    const primary = this.ARMORY_WEAPONS[save.customization.primary] || this.ARMORY_WEAPONS.vigilante;
    const secondary = this.ARMORY_WEAPONS[save.customization.secondary] || this.ARMORY_WEAPONS.centinela;
    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    set('primaryWeaponName', primary.name);
    set('secondaryWeaponName', secondary.name);
    set('armoryComboLabel', `${primary.name} + ${secondary.name}`);
    set('armoryComboHint', `${role.name} // Combo ideal: ${role.combo} // ${role.passive}`);
    set('armoryPassive', role.passive);
    set('armoryActive', role.active);
    const stats = this.calcularStatsTotales(save.customization.role, save.customization[selectedSlot], save.customization.armors);
    const labels = [['damage', 'Daño'], ['cadence', 'Cadencia'], ['mobility', 'Movilidad'], ['bullets', 'Balas']];
    const bars = document.getElementById('armoryStatBars');
    if (bars) bars.innerHTML = labels.map(([key, label]) => {
      const value = stats[key] || 0;
      const max = key === 'bullets' ? 50 : 100;
      return `
      <div class="armory-stat"><div><span>${label}</span><b>${value}</b></div><i><em style="width:${Math.min(100, value / max * 100)}%"></em></i></div>
    `;
    }).join('');
    const selected = this.ARMORY_WEAPONS[save.customization[selectedSlot]] || primary;
    const selectedId = save.customization[selectedSlot];
    const selectedLevel = this.weaponLevel(selectedId);
    set('armoryUpgradeLevel', `NIVEL ${selectedLevel}/50`);
    const upgradeButton = document.getElementById('btn-upgrade-selected');
    if (upgradeButton) upgradeButton.disabled = selectedLevel >= 50 || !this.isArmoryUnlocked(selectedId);
    set('armoryWeaponUpgrade', `${selected.name}: ${selected.upgrade}`);
    const skinPart = document.querySelector('[data-skin-part].selected')?.dataset.skinPart || 'shirt';
    this.selectSkinPart(skinPart, false);
  },

  selectArmoryRole(role) {
    if (!this.ARMORY_ROLES[role]) return;
    save.customization.role = role;
    Save.write();
    this.refreshArmory();
  },

  selectArmoryWeapon(weapon) {
  if (!WEAPONS_DB[weapon]) return;
  const item = WEAPONS_DB[weapon];

  // 🔑 Guardar el seleccionado para que el botón EQUIPAR lo use
  this._selectedWeaponId = weapon;

  // Guardar también en customization (compatibilidad con la armería antigua)
  const slot = document.querySelector('[data-weapon-slot].selected')?.dataset.weaponSlot || 'primary';
  save.customization[slot] = weapon;

  // 🔥 Equipar YA en WeaponSystem (efecto inmediato en gameplay)
  if (typeof WeaponSystem !== 'undefined') {
    WeaponSystem.equip(slot, weapon);
  }

  Save.write();
  this.refreshArmory();
  this.updateWeaponHud();
},

  selectSkinPart(part, write = true) {
    const labels = { shirt:'CAMISA', pants:'PANTALÓN', helmet:'CASCO' };
    document.querySelectorAll('[data-skin-part]').forEach(button => {
      button.classList.toggle('selected', button.dataset.skinPart === part);
    });
    const label = document.getElementById('armorySkinPart');
    if (label) label.textContent = labels[part] || labels.shirt;
    const customizeLabel = document.getElementById('customizeSkinPart');
    const variant = Number(save.customization.skinParts?.[part]) || 0;
    if (customizeLabel) customizeLabel.textContent = `${labels[part] || labels.shirt} ${variant + 1}`;
    if (write) {
      save.customization.skinParts.active = part;
      Save.write();
    }
  },

  cycleSkinPart(direction) {
    const parts = ['shirt', 'pants', 'helmet'];
    const active = document.querySelector('[data-skin-part].selected')?.dataset.skinPart || 'shirt';
    const current = Number(save.customization.skinParts?.[active]) || 0;
    const nextIndex = (current + direction + 5) % 5;
    save.customization.skinParts[active] = nextIndex;
    Save.write();
    this.selectSkinPart(active, false);
  },

  refreshLobby() {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('lobbyCoins', save.metaCoins || 0);
    set('lobbyGems',  save.metaGems || 0);
    set('lobbyBest',  save.bestFloor || 0);
    const btn = document.getElementById('btn-endless');
    if (btn) {
      btn.disabled = save.bestFloor < CFG.ENDLESS_UNLOCK;
      btn.textContent = save.bestFloor >= CFG.ENDLESS_UNLOCK ? '∞ Modo Endless' : `∞ Endless (Piso ${CFG.ENDLESS_UNLOCK})`;
    }
  },

  refreshCustomization() {
    const grid = document.getElementById('customizationGrid');
    const preview = document.getElementById('customizationPreview');
    const selectedLabel = document.getElementById('customizationSelected');
    if (!grid || !preview || !selectedLabel) return;

    const selected = PlayerCustomization.selected(this.customizationPlayer);
    const selectedIndex = PLAYER_SPRITES.findIndex(sprite => sprite.id === selected.id);
    if (selectedIndex >= 0) this._customizationSpriteIndex = selectedIndex;
    selectedLabel.textContent = `${this.customizationPlayer ? this.customizationPlayer.toUpperCase() + ' · ' : ''}Seleccionado: ${selected.name}`;
    grid.innerHTML = '';
    const ctx = preview.getContext('2d');
    ctx.clearRect(0, 0, preview.width, preview.height);
    ctx.fillStyle = '#071a2e';
    ctx.fillRect(0, 0, preview.width, preview.height);
    PlayerCustomization.renderPreview(ctx, selected, 128);

    for (const sprite of PLAYER_SPRITES) {
      const button = document.createElement('button');
      button.className = `customization-card${sprite.id === selected.id ? ' selected' : ''}`;
      button.type = 'button';
      const thumbnail = document.createElement('canvas');
      thumbnail.width = 64;
      thumbnail.height = 64;
      thumbnail.className = 'customization-card-preview';
      PlayerCustomization.renderPreview(thumbnail.getContext('2d'), sprite);
      button.appendChild(thumbnail);
      const name = document.createElement('span');
      name.className = 'customization-card-name';
      name.textContent = sprite.name;
      button.appendChild(name);
      const file = document.createElement('span');
      file.className = 'customization-card-file';
      file.textContent = sprite.src || 'Personaje original';
      button.appendChild(file);
      button.addEventListener('click', () => PlayerCustomization.select(sprite.id, this.customizationPlayer));
      grid.appendChild(button);
    }
    const controls = document.getElementById('coopCharacterControls');
    const hint = document.getElementById('customizationHint');
    if (controls) controls.classList.toggle('is-hidden', !this.customizationPlayer);
    if (hint) hint.innerHTML = this.customizationPlayer
      ? 'Elige un personaje para cada jugador. Pueden ser diferentes.'
      : 'Selecciona un sprite de <strong>player.customize</strong>. Las skins son estéticas; las armaduras sí modifican estadísticas.';
    const p1 = document.getElementById('btn-select-p1');
    const p2 = document.getElementById('btn-select-p2');
    if (p1) p1.textContent = `P1: ${PlayerCustomization.selected('p1').name}`;
    if (p2) p2.textContent = `P2: ${PlayerCustomization.selected('p2').name}`;
    const armorGrid = document.getElementById('customizationArmorGrid');
    if (armorGrid) {
      const armorCategories = [
        ['helmets', 'CASCOS'],
        ['jackets', 'CHAQUETAS'],
        ['pants', 'PANTALONES'],
      ];
      const renderArmor = armor => {
        const equipped = save.customization.armors?.[armor.category] === armor.id;
        const unlocked = this.isArmoryUnlocked(armor.id);
        const level = this.armorLevel(armor.id);
        const stats = this.armorStats(armor);
        const modifierText = Object.entries(stats).filter(([, value]) => value).map(([key, value]) => `${key} +${value}`).join(' · ');
        const cost = Math.round((armor.costoMejora || 100) * (1 + level * 0.12));
        return `<article class="armor-card ${equipped ? 'selected' : ''} ${unlocked ? '' : 'locked'}" data-armor-id="${armor.id}">
          <button type="button" class="armor-card-select" ${unlocked ? '' : 'disabled'}>
          <strong>${unlocked ? '' : '🔒 '}${armor.name}</strong><small>${armor.type}${unlocked ? '' : ' · TIENDA PERMANENTE'}</small><span>${modifierText}</span>
          </button>
          <button type="button" class="btn-hielo armor-upgrade" data-upgrade-armor="${armor.id}" ${!unlocked || level >= 50 ? 'disabled' : ''}>MEJORAR (NIVEL ${level}/50) · ${cost} ◈</button>
        </article>`;
      };
      armorGrid.innerHTML = armorCategories.map(([category, label]) => `
        <section class="armor-category-column ${this._openArmorCategories.has(category) ? 'open' : ''}">
          <button type="button" class="armor-category-toggle" data-armor-category="${category}">${label} <span>${this._openArmorCategories.has(category) ? '▲' : '▼'}</span></button>
          <div class="armor-category-list">${this.ARMOR_DATA.filter(armor => armor.category === category).map(renderArmor).join('')}</div>
        </section>
      `).join('');
    }
    const progress = this.roleProgress(save.customization.role || 'tank');
    const required = this.expRequired(progress.level);
    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    set('customizationRoleLevel', progress.level);
    set('customizationRoleExp', `${progress.exp} / ${required} EXP`);
    set('customizationNextLevel', `${Math.max(0, required - progress.exp)} EXP restantes`);
    const fill = document.getElementById('customizationRoleExpFill');
    if (fill) fill.style.width = `${Math.min(100, progress.exp / required * 100)}%`;
  },

  openCustomization(coop = false) {
    this.customizationPlayer = coop ? (this.customizationPlayer || 'p1') : null;
    this._openArmorCategories.clear();
    this.refreshCustomization();
    this.show('customize');
  },

  cycleCharacter(direction) {
    const count = PLAYER_SPRITES.length;
    this._customizationSpriteIndex = (this._customizationSpriteIndex + direction + count) % count;
    const sprite = PLAYER_SPRITES[this._customizationSpriteIndex];
    PlayerCustomization.select(sprite.id, this.customizationPlayer);
  },

  startCoopCharacterSelection() {
    this.customizationPlayer = 'p1';
    this.refreshCustomization();
    this.show('customize');
  },

  selectCustomizationPlayer(playerId) {
    this.customizationPlayer = playerId;
    this.refreshCustomization();
  },

  refreshOptionsUI() {
    const volEl = document.getElementById('optVolume');
    const sfxEl = document.getElementById('optSfx');
    if (volEl) { volEl.value = save.options.volume; document.getElementById('volVal').textContent = save.options.volume; }
    if (sfxEl) { sfxEl.value = save.options.sfx; document.getElementById('sfxVal').textContent = save.options.sfx; }
    const money = document.getElementById('optionMoney');
    if (money) money.textContent = save.metaCoins || 0;
    document.querySelectorAll('[data-toggle="minimap"]').forEach(b => {
      const on = save.options.minimap && b.dataset.value === 'on';
      const off = !save.options.minimap && b.dataset.value === 'off';
      const active = on || off;
      b.classList.toggle('active', active);
      b.classList.toggle('seleccionado', active);
    });
    document.querySelectorAll('[data-diff]').forEach(b => {
      const active = save.options.difficulty === b.dataset.diff;
      b.classList.toggle('active', active);
      b.classList.toggle('seleccionado', active);
    });
    this.buildGamepadBindList();
  },

  refreshStats() {
    const grid = document.getElementById('statsGrid');
    if (!grid) return;
    grid.innerHTML = `
      <div class="stat-row"><span class="label">Mejor piso</span><span class="value">${save.bestFloor || 0} / ${CFG.MAX_FLOORS}</span></div>
      <div class="stat-row"><span class="label">Runs totales</span><span class="value">${save.totalRuns || 0}</span></div>
      <div class="stat-row"><span class="label">Victorias</span><span class="value">${save.totalWins || 0}</span></div>
      <div class="stat-row"><span class="label">Kills totales</span><span class="value">${save.totalKills || 0}</span></div>
      <div class="stat-row"><span class="label">Monedas meta</span><span class="value">${save.metaCoins || 0}</span></div>
      <div class="stat-row"><span class="label">Gemas meta</span><span class="value">${save.metaGems || 0}</span></div>
      <div class="stat-row"><span class="label">Mejoras compradas</span><span class="value">${save.totalUpgradesBought || 0}</span></div>
      <div class="stat-row"><span class="label">Mejor nivel</span><span class="value">${save.bestLevelReached || 1}</span></div>
      <div class="stat-row"><span class="label">Tiradas gacha</span><span class="value">${save.totalGachaRolls || 0}</span></div>
      <div class="stat-row"><span class="label">Obstáculos destruidos</span><span class="value">${save.totalObstaclesDestroyed || 0}</span></div>
      <div class="stat-row"><span class="label">Consumibles usados</span><span class="value">${save.totalConsumablesUsed || 0}</span></div>
      <div class="stat-row"><span class="label">Logros</span><span class="value">${Object.keys(save.achievements || {}).length} / ${ACHIEVEMENTS_DB.length}</span></div>
    `;
  },

  refreshAchievements() {
    const grid = document.getElementById('achGrid');
    if (!grid) return;
    grid.innerHTML = '';
    let unlockedCount = 0;

    for (const ach of ACHIEVEMENTS_DB) {
      const unlocked = !!save.achievements[ach.id];
      const current = this.achievementCurrent(ach);
      const pct = Math.min(100, Math.round((current / ach.goal) * 100));
      const coinReward = ach.reward || 100;
      const expReward = ach.rewardExp || Math.max(100, ach.goal * 25);
      if (unlocked) unlockedCount++;

      const card = document.createElement('div');
      card.className = `ach-card ${unlocked ? 'unlocked' : 'locked'}`;
      card.innerHTML = `
        ${unlocked ? '<div class="ach-card-badge">✓</div>' : ''}
        <div class="ach-card-icon" style="color:${unlocked ? '#ffd54f' : '#7a9ab0'};">${ach.icon}</div>
        <div class="ach-card-name">${ach.name}</div>
        <div class="ach-card-desc">${ach.desc}</div>
        <div class="ach-card-reward">Recompensa: ${coinReward} ◆ · ${expReward} EXP</div>
        <div class="ach-card-progress">${unlocked ? 'Desbloqueado' : `${current} / ${ach.goal}`}</div>
        <div class="ach-progress-bar">
          <div class="ach-progress-fill" style="width:${unlocked ? 100 : pct}%;"></div>
        </div>
      `;
      grid.appendChild(card);
    }

    const countEl = document.getElementById('achCount');
    const totalEl = document.getElementById('achTotal');
    const pctEl = document.getElementById('achPercent');
    if (countEl) countEl.textContent = unlockedCount;
    if (totalEl) totalEl.textContent = ACHIEVEMENTS_DB.length;
    if (pctEl) pctEl.textContent = Math.round((unlockedCount / ACHIEVEMENTS_DB.length) * 100) + '%';
  },

  checkAchievements() {
    let changed = false;
    for (const ach of ACHIEVEMENTS_DB) {
      if (save.achievements[ach.id]) continue;
      const current = this.achievementCurrent(ach);
      if (current >= ach.goal) {
        save.achievements[ach.id] = true;
        const coinReward = ach.reward || 100;
        const expReward = ach.rewardExp || Math.max(100, ach.goal * 25);
        const roleId = save.customization.role || 'tank';
        save.metaCoins = (save.metaCoins || 0) + coinReward;
        const levelBefore = this.roleProgress(roleId).level;
        const levelAfter = this.addRoleExp(roleId, expReward);
        this.syncEconomy();
        changed = true;
        Audio2.achievement();
        Gamepad.rumble(0.8, 300);
        this._showAchievementToast(ach, coinReward, expReward, levelAfter > levelBefore);
      }
    }
    if (changed) {
      Save.write();
      this.refreshAchievements();
      this.refreshRoleProgress();
      this.refreshCustomization();
      this.refreshArmory();
      this.refreshLobby();
    }
  },

  verificarLogros() {
    return this.checkAchievements();
  },

  achievementCurrent(ach) {
    if (ach.stat === 'bestWeaponLevel') return Math.max(1, ...Object.values(save.customization.weaponLevels || {}).map(Number));
    if (ach.stat === 'bestRoleLevel') return Math.max(1, ...Object.values(this.ROLE_PROGRESS).map((_, index) => this.roleProgress(Object.keys(this.ROLE_PROGRESS)[index]).level));
    if (ach.stat === 'unlockedArmorCount') return this.ARMOR_DATA.filter(item => this.isArmoryUnlocked(item.id)).length;
    return save[ach.stat] || 0;
  },

  _showAchievementToast(ach, coinReward = 0, expReward = 0, leveledUp = false) {
    const el = document.createElement('div');
    el.className = 'toast achievement';
    el.innerHTML = `🏆 <strong>LOGRO:</strong> ${ach.icon} ${ach.name}<br><small>+${coinReward} ◆ · +${expReward} EXP${leveledUp ? ' · ¡NIVEL SUBIDO!' : ''}</small>`;
    document.getElementById('toasts').appendChild(el);
    setTimeout(() => el.remove(), 3200);
  },

  buyPermanentUpgrade(id) {
    const upgrades = {
      atk: { icon: '⚔', name: '+2 ATK', cost: 75 },
      def: { icon: '🛡', name: '+2 DEF', cost: 75 },
      maxHp: { icon: '♥', name: '+5 HP', cost: 100 },
      speed: { icon: '💨', name: '+0.15 VEL', cost: 85 },
      crit: { icon: '🎯', name: '+2% CRIT', cost: 110 },
    };
    const upgrade = upgrades[id];
    const level = save.upgrades[id] || 0;
    const cost = upgrade ? upgrade.cost + level * 45 : 0;
    if (!upgrade || level >= 10 || (save.metaCoins || 0) < cost) {
      this.toast(level >= 10 ? 'Esta mejora ya está al máximo' : `Necesitas ${cost} monedas meta`, 'gold');
      return;
    }
    save.metaCoins -= cost;
    save.upgrades[id] = level + 1;
    save.totalUpgradesBought = (save.totalUpgradesBought || 0) + 1;
    Save.write();
    Audio2.buy();
    Gamepad.rumble(0.3, 60);
    this.refreshPermShop();
    this.refreshLobby();
    this.checkAchievements();
  },

  permanentShopCatalog() {
    const rarity = level => level >= 25 ? ['legendary', 'LEGENDARIO'] : level >= 15 ? ['epic', 'ÉPICO'] : level >= 8 ? ['rare', 'RARO'] : ['common', 'COMÚN'];
    const catalog = [];
    Object.entries(this.ARMORY_WEAPONS).forEach(([id, item]) => {
      const [rarityId, rarityLabel] = rarity(item.unlockLevel || 1);
      catalog.push({ id, name: item.name, type: item.type, group: 'weapons', icon: '⚔', desc: item.desc, level: item.unlockLevel || 1, unlockRole: item.unlockRole, price: this.armoryItemCost(item), rarity: rarityId, rarityLabel, stats: { 'Velocidad': item.attackSpeed, 'Movilidad': item.mobility, 'Especial': item.special } });
    });
    this.ARMOR_DATA.forEach(item => {
      const [rarityId, rarityLabel] = rarity(item.unlockLevel);
      catalog.push({ id: item.id, name: item.name, type: item.type, group: 'armor', icon: item.category === 'helmets' ? '⛑' : item.category === 'jackets' ? '🥋' : '👖', desc: 'Armadura equipable: modifica tus estadísticas.', level: item.unlockLevel, price: this.armoryItemCost(item), rarity: rarityId, rarityLabel, stats: item.modifiers });
    });
    [
      ['atk', '⚔', '+2 ATK', 'Aumenta el ataque permanente.', 75],
      ['def', '🛡', '+2 DEF', 'Aumenta la defensa permanente.', 75],
      ['maxHp', '♥', '+5 HP', 'Aumenta la vida máxima.', 100],
      ['speed', '💨', '+0.15 VEL', 'Aumenta la velocidad base.', 85],
      ['crit', '🎯', '+2% CRIT', 'Aumenta la probabilidad crítica.', 110],
    ].forEach(([id, icon, name, desc, price]) => catalog.push({ id: `upgrade-${id}`, upgradeId: id, name, type: 'MEJORAS', group: 'boosts', icon, desc, level: 1, price, rarity: 'rare', rarityLabel: 'RARO', stats: { 'Nivel máximo': '10' } }));
    return catalog;
  },

  shopLevelMet(item) {
    if (item.group === 'boosts') return true;
    const roleId = item.unlockRole || save.customization.role || 'tank';
    return this.roleProgress(roleId).level >= (item.level || 1);
  },

  refreshPermShop() {
    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    set('permShopCoins', save.metaCoins || 0);
    const grid = document.getElementById('permShopGrid');
    if (!grid) return;
    const categories = { all: 'TODO', weapons: 'ARMAS', armor: 'ARMADURAS', boosts: 'MEJORAS' };
    document.querySelectorAll('[data-shop-category]').forEach(button => button.classList.toggle('active', button.dataset.shopCategory === this._shopCategory));
    document.querySelectorAll('[data-shop-subcategory]').forEach(button => button.classList.toggle('active', button.dataset.shopSubcategory === this._shopSubcategory));
    const visibleSubcategories = this._shopCategory === 'weapons'
      ? ['all', 'PISTOLAS', 'RIFLES', 'FRANCOTIRADORES', 'ESCOPETAS', 'CUERPO A CUERPO']
      : this._shopCategory === 'armor'
        ? ['all', 'PANTALONES', 'CHAQUETAS', 'CASCOS']
        : this._shopCategory === 'boosts'
          ? []
          : ['all', 'PISTOLAS', 'RIFLES', 'FRANCOTIRADORES', 'ESCOPETAS', 'CUERPO A CUERPO', 'PANTALONES', 'CHAQUETAS', 'CASCOS'];
    document.querySelectorAll('[data-shop-subcategory]').forEach(button => {
      button.hidden = !visibleSubcategories.includes(button.dataset.shopSubcategory);
    });
    if (!visibleSubcategories.includes(this._shopSubcategory)) {
      this._shopSubcategory = 'all';
    }
    document.querySelectorAll('[data-shop-subcategory]').forEach(button => {
      button.classList.toggle('active', button.dataset.shopSubcategory === this._shopSubcategory);
    });
    const sort = document.getElementById('permShopSort');
    if (sort) sort.value = this._shopSort;
    const missingButton = document.getElementById('permShopMissing');
    if (missingButton) missingButton.textContent = this._shopMissingOnly ? 'MOSTRAR TODO' : 'MOSTRAR FALTANTES';
    const catalog = this.permanentShopCatalog().filter(item => {
      if (this._shopCategory !== 'all' && item.group !== this._shopCategory) return false;
      if (this._shopSubcategory !== 'all' && item.type !== this._shopSubcategory) return false;
      const unlocked = item.group === 'boosts' ? false : this.isArmoryUnlocked(item.id);
      return !this._shopMissingOnly || !unlocked;
    });
    const rarityWeight = { common: 1, rare: 2, epic: 3, legendary: 4 };
    catalog.sort((a, b) => this._shopSort === 'price-asc' ? a.price - b.price : this._shopSort === 'price-desc' ? b.price - a.price : this._shopSort === 'rarity' ? rarityWeight[b.rarity] - rarityWeight[a.rarity] : this._shopSort === 'level' ? a.level - b.level : a.name.localeCompare(b.name));
    set('permShopResult', `${categories[this._shopCategory]} · ${catalog.length} OBJETOS`);
    const sections = [
      ['PISTOLAS', '🔫 PISTOLAS'],
      ['RIFLES', '⚡ RIFLES'],
      ['FRANCOTIRADORES', '◉ FRANCOTIRADORES'],
      ['ESCOPETAS', '💥 ESCOPETAS'],
      ['CUERPO A CUERPO', '⚔ CUERPO A CUERPO'],
      ['PANTALONES', '👖 PANTALONES'],
      ['CHAQUETAS', '🥋 CHAQUETAS'],
      ['CASCOS', '⛑ CASCOS'],
      ['MEJORAS', '✚ MEJORAS'],
    ];
    const renderCard = item => {
      const unlocked = item.group === 'boosts' ? false : this.isArmoryUnlocked(item.id);
      const level = item.upgradeId ? save.upgrades[item.upgradeId] || 0 : 0;
      const affordable = (save.metaCoins || 0) >= item.price;
      const levelMet = this.shopLevelMet(item);
      const available = !unlocked && affordable && levelMet;
      const selected = this._shopSelectedId === item.id;
      const requirement = item.upgradeId ? `NIVEL ${level}/10` : `NIVEL ${item.level}`;
      return `<article class="ice-shop-card rarity-${item.rarity} ${unlocked ? 'unlocked' : 'locked'} ${selected ? 'selected' : ''}" data-shop-item-id="${item.id}" tabindex="0">
        <div class="ice-shop-card-art">${item.icon}</div>
        <h3>${item.name}</h3><small>${item.type} · ${item.rarityLabel}</small><small>${requirement}${!levelMet ? ' · BLOQUEADO' : ''}</small>
        <div class="ice-shop-card-footer"><span class="ice-shop-card-price ${affordable ? '' : 'cant'}">${unlocked ? '✓ LISTO' : `◆ ${item.price}`}</span>
          <button class="ice-shop-buy" type="button" data-shop-${item.upgradeId ? 'upgrade' : 'buy'}="${item.upgradeId || item.id}" ${unlocked || !available ? 'disabled' : ''}>${unlocked ? 'LISTO' : level >= 10 ? 'MÁXIMO' : 'COMPRAR'}</button>
        </div></article>`;
    };
    grid.innerHTML = sections.map(([type, label]) => {
      const items = catalog.filter(item => item.type === type);
      if (!items.length) return '';
      return `<section class="ice-shop-section">
        <h3 class="ice-shop-section-title">${label}<span>${items.length} OBJETOS</span></h3>
        <div class="ice-shop-section-grid">${items.map(renderCard).join('')}</div>
      </section>`;
    }).join('') || '<p class="modal-hint">No hay objetos con estos filtros.</p>';
    this.refreshPermShopPreview(catalog.find(item => item.id === this._shopSelectedId) || catalog[0]);
  },

  refreshPermShopPreview(item) {
    const icon = document.getElementById('permShopPreviewIcon');
    const type = document.getElementById('permShopPreviewType');
    const name = document.getElementById('permShopPreviewName');
    const desc = document.getElementById('permShopPreviewDesc');
    const stats = document.getElementById('permShopPreviewStats');
    const action = document.getElementById('permShopPreviewAction');
    if (!icon || !type || !name || !desc || !stats || !action) return;
    if (!item) {
      icon.textContent = '❄'; type.textContent = 'SELECCIONA UN OBJETO'; name.textContent = 'Catálogo de hielo'; desc.textContent = 'Selecciona una tarjeta para consultar sus estadísticas y requisitos.'; stats.innerHTML = ''; action.disabled = true; action.textContent = 'SELECCIONA UN OBJETO'; return;
    }
    const unlocked = item.group === 'boosts' ? false : this.isArmoryUnlocked(item.id);
    icon.textContent = item.icon; type.textContent = `${item.type} · ${item.rarityLabel}`; name.textContent = item.name; desc.textContent = `${item.desc} Requiere nivel ${item.level}.`;
    stats.innerHTML = Object.entries(item.stats).map(([label, value]) => `<div class="ice-preview-stat"><span>${label}</span><strong>${typeof value === 'number' && value > 0 ? '+' : ''}${value}</strong></div>`).join('');
    const levelMet = this.shopLevelMet(item);
    action.disabled = unlocked || !levelMet || (save.metaCoins || 0) < item.price;
    action.textContent = unlocked ? '✓ DESBLOQUEADO' : !levelMet ? `NIVEL ${item.level} REQUERIDO` : `◆ ${item.price} · COMPRAR`;
    action.onclick = () => item.upgradeId ? this.buyPermanentUpgrade(item.upgradeId) : this.unlockArmoryItem(item.id);
  },

  refreshInvMeta() {
    const grid = document.getElementById('invMetaGrid');
    if (!grid) return;
    const weaponIds = Object.keys(this.ARMORY_WEAPONS);
    const unlockedWeapons = weaponIds.filter(id => this.isArmoryUnlocked(id));
    const unlockedArmor = Object.keys(save.customization.unlockedArmory || {}).filter(id =>
      this.ARMOR_DATA.some(item => item.id === id));
    const maxedRoles = Object.values(save.customization.roleProgress || {}).filter(item => (item.level || 1) >= 50).length;
    const cards = [
      ['⚔', 'ARMAS DESBLOQUEADAS', `${unlockedWeapons.length}/${weaponIds.length}`, 'missingWeapons'],
      ['🛡', 'ARMADURAS DESBLOQUEADAS', `${unlockedArmor.length}/${this.ARMOR_DATA.length}`, 'customize'],
      ['📈', 'ROLES NIVEL 50', `${maxedRoles}/${ICE_RUN_DATA.roles.length}`, 'roleProgress'],
      ['🏆', 'LOGROS', `${Object.keys(save.achievements || {}).length}/${ACHIEVEMENTS_DB.length}`, 'achievements'],
      ['◆', 'MONEDAS META', `${save.metaCoins || 0}`, 'shopPerm'],
      ['✦', 'GEMAS META', `${save.metaGems || 0}`, 'shopPerm'],
    ];
    grid.innerHTML = cards.map(([icon, label, value, target]) => `
      <button class="meta-inventory-card" type="button" data-meta-target="${target}">
        <span class="meta-card-icon">${icon}</span>
        <span class="label">${label}</span>
        <strong class="value">${value}</strong>
        <small>ABRIR ›</small>
      </button>
    `).join('');
    const total = weaponIds.length + this.ARMOR_DATA.length + ICE_RUN_DATA.roles.length + ACHIEVEMENTS_DB.length;
    const completed = unlockedWeapons.length + unlockedArmor.length + maxedRoles + Object.keys(save.achievements || {}).length;
    const percent = total ? Math.round(completed / total * 100) : 0;
    const percentEl = document.getElementById('metaGlobalPercent');
    const fillEl = document.getElementById('metaGlobalFill');
    if (percentEl) percentEl.textContent = `${percent}%`;
    if (fillEl) fillEl.style.width = `${percent}%`;
    grid.querySelectorAll('[data-meta-target]').forEach(card => {
      card.addEventListener('click', () => {
        const target = card.dataset.metaTarget;
        if (target === 'customize') this.openCustomization(false);
        else if (target === 'armory' || target === 'missingWeapons') {
          this.ARMORY_FILTER = target === 'missingWeapons' ? 'FALTANTES' : 'TODAS';
          this.show('armory');
        }
        else if (target === 'roleProgress') this.show('roleProgress');
        else if (target === 'achievements') { this.refreshAchievements(); this.show('achievements'); }
        else if (target === 'shopPerm') { this.refreshPermShop(); this.show('shopPerm'); }
      });
    });
  },

  buildKeybindList() {
    const list = document.getElementById('keybindList');
    if (!list) return;
    list.innerHTML = '';
    for (const [key, label] of Object.entries(this.KEYBIND_LABELS)) {
      const row = document.createElement('div');
      row.className = 'keybind-row';
      row.innerHTML = `<span class="keybind-label">${label}</span><button class="keybind-key" type="button" data-key="${key}">${this._keyLabel(save.keybinds[key])}</button>`;
      row.querySelector('.keybind-key').addEventListener('click', e => this.startRebind(e.currentTarget, key));
      list.appendChild(row);
    }
    this.updateKeyLabels();
  },

  _keyLabel(k) {
    if (!k) return '—';
    const special = {
      ' ': 'Espacio', arrowup: '↑', arrowdown: '↓', arrowleft: '←', arrowright: '→',
      shift: 'Shift', control: 'Ctrl', alt: 'Alt', escape: 'Esc',
    };
    return special[k] || k.toUpperCase();
  },

  startRebind(btn, key) {
    if (this._rebindHandler) this.cancelRebind();
    btn.classList.add('listening');
    btn.textContent = '…';
    const finish = () => {
      window.removeEventListener('keydown', this._rebindHandler, true);
      this._rebindHandler = null;
      this.buildKeybindList();
    };
    this._rebindHandler = e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const k = e.key.toLowerCase();
      if (k !== 'escape') {
        const previous = save.keybinds[key];
        const conflict = Object.keys(save.keybinds).find(a => a !== key && save.keybinds[a] === k);
        save.keybinds[key] = k;
        if (conflict) {
          save.keybinds[conflict] = previous;
          this.toast(`↔ ${this.KEYBIND_LABELS[conflict] || conflict} ahora usa ${this._keyLabel(previous)}`, 'gold');
        }
        Save.write();
      }
      finish();
    };
    window.addEventListener('keydown', this._rebindHandler, true);
  },

  cancelRebind() {
    if (!this._rebindHandler) return;
    window.removeEventListener('keydown', this._rebindHandler, true);
    this._rebindHandler = null;
    this.buildKeybindList();
  },

  updateKeyLabels() {
    const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    const setHTML = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

    if (typeof Gamepad !== 'undefined' && Gamepad.connected) {
      const G = Gamepad;
      const brand = G._getBrand();

      const buildLabel = (action) => {
        const icon = G.getButtonIcon(action);
        const text = G.getButtonLabel(action);
        return `<span class="gp-icon">${icon}</span><span class="gp-label">${text}</span>`;
      };

      setHTML('dashKey',  buildLabel('dash'));
      setHTML('basicKey', buildLabel('basic'));
      setHTML('meleeKey', buildLabel('melee'));
      setHTML('longKey',  buildLabel('long'));
      setHTML('blockKey', buildLabel('block'));

      ['dashKey','basicKey','meleeKey','longKey','blockKey'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('gamepad-label', 'brand-xbox', 'brand-ps', 'brand-switch', 'brand-8bitdo');
        el.classList.add('gamepad-label', 'brand-' + brand);
      });

      this.updateInputModeBadge();
      return;
    }

    const kb = save.keybinds;
    ['dashKey','basicKey','meleeKey','longKey','blockKey'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('gamepad-label', 'brand-xbox', 'brand-ps', 'brand-switch', 'brand-8bitdo');
    });
    setText('dashKey',  (kb.dash  || '').toUpperCase());
    setText('basicKey', (kb.basic || '').toUpperCase());
    setText('meleeKey', (kb.melee || '').toUpperCase());
    setText('longKey',  (kb.long  || '').toUpperCase());
    setText('blockKey', (kb.block || 'f').toUpperCase());
    this.updateInputModeBadge();
  },

  updateInputModeBadge() {
    const badge = document.getElementById('inputModeBadge');
    if (!badge) return;
    badge.classList.remove('brand-xbox', 'brand-ps', 'brand-switch', 'brand-8bitdo');
    if (typeof Gamepad !== 'undefined' && Gamepad.connected) {
      const brand = Gamepad._getBrand();
      badge.textContent = Gamepad.getBrandName();
      badge.style.display = 'inline-block';
      badge.classList.add('brand-' + brand);
    } else {
      badge.style.display = 'none';
      badge.textContent = '';
    }
  },

  resetKeys() {
    save.keybinds = Save.defaults().keybinds;
    Save.write();
    this.buildKeybindList();
    this.toast('↻ Controles restaurados', 'gold');
  },

  /* ================================================================
     MAPEO DEL MANDO
     ================================================================ */
  _gamepadActions: [
    ['basic',     'Ataque'],
    ['melee',     'Melee'],
    ['long',      'Ráfaga'],
    ['dash',      'Dash'],
    ['block',     'Bloqueo'],
    ['pause',     'Pausa'],
    ['inventory', 'Inventario'],
    ['confirm',   'Confirmar (menú)'],
    ['cancel',    'Volver (menú)'],
  ],

  _gamepadActionLabel(action) {
    const found = this._gamepadActions.find(([id]) => id === action);
    return found ? found[1] : action;
  },

  buildGamepadBindList() {
    const list = document.getElementById('gamepadBindList');
    if (!list) return;
    list.innerHTML = '';
    for (const [action, label] of this._gamepadActions) {
      const value = save.gamepad ? save.gamepad[action] : undefined;
      const listening = !!(this._gpBind && this._gpBind.action === action);
      const row = document.createElement('div');
      row.className = 'keybind-row';
      row.innerHTML = `<span class="keybind-label">${label}</span>` +
        `<button class="keybind-key${listening ? ' listening' : ''}" type="button">${listening ? '…' : Gamepad.buttonName(value)}</button>`;
      row.querySelector('.keybind-key').addEventListener('click', e => {
        e.stopPropagation();
        this.startGamepadBind(e.currentTarget, action);
      });
      list.appendChild(row);
    }
    this._updateGamepadStatus();
  },

  refreshGamepadSection() {
    this.buildGamepadBindList();
  },

  startGamepadBind(btn, action) {
    if (!Gamepad.connected) {
      this.toast('🎮 Mando no detectado: conéctalo y pulsa un botón', 'danger');
      return;
    }
    if (this._gpBind && this._gpBind.action === action) { this.cancelGamepadBind(); return; }
    this.cancelGamepadBind();
    this._gpBind = { action, btn };
    btn.classList.add('listening');
    btn.textContent = '…';
    this.toast('🎮 Pulsa el botón que quieras asignar', 'gold');
  },

  cancelGamepadBind() {
    if (!this._gpBind) return;
    this._gpBind = null;
    this.buildGamepadBindList();
  },

  _captureGamepadBind() {
    if (!this._gpBind) return;
    const gp = Gamepad.get();
    if (!gp) { this.cancelGamepadBind(); return; }
    for (let i = 0; i < gp.buttons.length; i++) {
      if (!Gamepad.justPressedUI(i)) continue;
      const action = this._gpBind.action;
      const sharedWith = Object.keys(save.gamepad)
        .filter(a => a !== action && save.gamepad[a] === i)
        .map(a => this._gamepadActionLabel(a));
      save.gamepad[action] = i;
      Save.write();
      this._gpBind = null;
      Audio2.click();
      this.buildGamepadBindList();
      this.updateKeyLabels();
      const extra = sharedWith.length ? ` · comparte con ${sharedWith.join(', ')}` : '';
      this.toast(`🎮 ${this._gamepadActionLabel(action)} → ${Gamepad.buttonName(i)}${extra}`, 'gold');
      return;
    }
  },

  resetGamepad() {
    save.gamepad = Gamepad.defaultMapping();
    Save.write();
    this._gpBind = null;
    this.buildGamepadBindList();
    this.updateKeyLabels();
    this.toast('🎮 Mapeo del mando restaurado', 'gold');
  },

  _updateGamepadStatus() {
    const el = document.getElementById('gamepadStatus');
    if (!el) return;
    if (!navigator.getGamepads) {
      el.textContent = '⚠ Este navegador no expone la Gamepad API. Usa Chrome o Edge actualizados.';
      el.className = 'pad-status offline';
      return;
    }
    if (!Gamepad.connected) {
      el.textContent = '🔌 Mando no detectado. Conéctalo por USB/Bluetooth, pulsa un botón con la pestaña activa y, si no aparece, recarga la página.';
      el.className = 'pad-status offline';
      return;
    }
    const pressed = Gamepad.pressedList();
    const names = pressed.map(i => `${Gamepad.buttonName(i)} [${i}]`).join(' + ');
    const mode = Gamepad.isStandardMapping() ? 'estándar' : 'genérico — remapea si algo no coincide';
    el.textContent = `🎮 ${Gamepad._shortName(Gamepad.id)} · mapeo ${mode} · pulsados: ${pressed.length ? names : 'ninguno'}`;
    el.className = 'pad-status online';
  },

  updateHud() {
    const p = Game.player;
    if (p) {
      document.getElementById('hpFill').style.width = (p.hp / p.maxHp * 100) + '%';
      document.getElementById('hpText').textContent = `${Math.ceil(p.hp)} / ${p.maxHp}`;
      document.getElementById('statsText').textContent =
        `${p.atk.toFixed(0)} · ${p.def.toFixed(0)} · ${p.speed.toFixed(1)} · ${(p.crit*100).toFixed(0)}%`;
    }
    const p2 = Game.coop ? Game.players[1] : null;
    const p2Hud = document.getElementById('hud-p2');
    if (p2Hud) {
      p2Hud.classList.toggle('is-hidden', !p2);
      if (p2) {
        document.getElementById('p2HpFill').style.width = Math.max(0, p2.hp / p2.maxHp * 100) + '%';
        document.getElementById('p2HpText').textContent = p2.downed
          ? 'CAÍDO — acércate para revivir'
          : `${Math.ceil(p2.hp)} / ${p2.maxHp}${p2.shieldUntil > performance.now() ? ' · 🛡' : ''}`;
      }
    }
    document.getElementById('floorText').textContent = Game.floor;
    const cleared = Game.rooms ? Game.rooms.flat().filter(r => r && r.cleared).length : 0;
    const total = Game.rooms ? Game.rooms.flat().filter(r => r).length : 0;
    document.getElementById('roomsText').textContent = `${cleared} / ${total}`;
    const coinsEl = document.getElementById('runCoinsText');
    if (coinsEl) coinsEl.textContent = `◆ ${Game.run.coins}`;
    const bossInline = document.getElementById('bossInline');
    if (Game.boss && !Game.boss.dead) {
      bossInline.style.display = 'flex';
      document.getElementById('bossInlineName').textContent = Game.boss.name;
      document.getElementById('bossInlineFill').style.width = (Game.boss.hp / Game.boss.maxHp * 100) + '%';
      document.getElementById('bossInlineHp').textContent =
        `${Math.ceil(Game.boss.hp)}/${Game.boss.maxHp}`;
    } else {
      bossInline.style.display = 'none';
    }
    this.updateAbilityCooldowns();
    this.updateConsumableBar();
    this.updateXpBar();
    this.updateChallengeBadge();
  },

  updateAbilityCooldowns() {
    const now = performance.now();
    const p = Game.player;
    if (!p) return;
    this._updateSlot('abilitySlot', 'dashCooldown', p.dashReady(now), p.dashCooldownUntil, now);
    const basicReady = now - p.lastBasic >= CFG.BASIC.cooldown * (p._challengeFireRateMul || 1);
    const basicUntil = p.lastBasic + CFG.BASIC.cooldown * (p._challengeFireRateMul || 1);
    this._updateSlot('basicSlot', 'basicCooldown', basicReady, basicUntil, now);
    this._updateSlot('meleeSlot', 'meleeCooldown', p.meleeReady(now), p.meleeCooldownUntil, now);
    this._updateSlot('longSlot', 'longCooldown', p.longReady(now), p.longCooldownUntil, now);
    this._updateSlot('blockSlot', 'blockCooldown', p.blockReady(now), p.blockCooldownUntil, now);
  },

  _updateSlot(slotId, cdId, ready, until, now) {
    if (!this._abilityElements) this._abilityElements = {};
    let elements = this._abilityElements[slotId];
    if (!elements) {
      elements = {
        slot: document.getElementById(slotId),
        cooldown: document.getElementById(cdId),
      };
      this._abilityElements[slotId] = elements;
    }
    const slot = elements.slot;
    const cd = elements.cooldown;
    if (!slot || !cd) return;
    const stateKey = ready ? 'ready' : `${Math.max(0, Math.ceil((until - now) / 100))}`;
    if (this._cooldownRenderState[slotId] === stateKey) return;
    this._cooldownRenderState[slotId] = stateKey;
    if (ready) {
      slot.classList.remove('cooling');
      slot.classList.add('ready');
      cd.textContent = '';
    } else {
      slot.classList.remove('ready');
      slot.classList.add('cooling');
      const remainingMs = until - now;
      if (remainingMs > 300) {
        const remaining = (remainingMs / 1000).toFixed(1);
        cd.textContent = remaining + 's';
      } else {
        cd.textContent = '';
      }
    }
  },

  getConsumableSlots() {
    const inv = (Game.run && Game.run.consumables) || {};
    const entries = Object.entries(inv).filter(([id, count]) => count > 0);
    entries.sort((a, b) => {
      const ia = CONSUMABLES_DB.findIndex(c => c.id === a[0]);
      const ib = CONSUMABLES_DB.findIndex(c => c.id === b[0]);
      return ia - ib;
    });
    return entries.slice(0, 4).map(([id, count]) => ({ id, count }));
  },

  updateConsumableBar() {
    const bar = document.getElementById('consumableBar');
    if (!bar) return;
    const slots = this.getConsumableSlots();
    bar.innerHTML = '';
    const now = performance.now();
    const p = Game.player;

    for (let i = 0; i < 4; i++) {
      const slot = slots[i];
      const div = document.createElement('div');
      div.className = 'consumable-slot';

      if (p && p.shieldUntil > now) div.classList.add('shielded');
      if (p && p.rageUntil > now)   div.classList.add('rage');

      if (!slot) {
        div.classList.add('empty');
        div.innerHTML = `<div class="cs-icon" style="opacity:0.3;">·</div><div class="cs-key">${i+1}</div>`;
      } else {
        const def = CONSUMABLES_DB.find(c => c.id === slot.id);
        div.innerHTML = `
          <div class="cs-icon">${def ? def.icon : '?'}</div>
          <div class="cs-count">${slot.count}</div>
          <div class="cs-key">${i+1}</div>
        `;
        div.title = def ? `${def.name} — ${def.desc}` : '';
        div.addEventListener('click', () => {
          if (Game.battleActive && !Game.paused) Game.useConsumable(slot.id);
        });
      }
      bar.appendChild(div);
    }
  },

  updateXpBar() {
    const r = Game.run;
    if (!r) return;
    const pct = Math.max(0, Math.min(100, (r.xp / r.xpToNext) * 100));
    const fill = document.getElementById('xpFill');
    const text = document.getElementById('xpText');
    const lvl = document.getElementById('levelText');
    if (fill) fill.style.width = pct + '%';
    if (text) text.textContent = `${r.xp} / ${r.xpToNext}`;
    if (lvl)  lvl.textContent = r.level;
  },

  showLevelUp(perks) {
    const grid = document.getElementById('levelupGrid');
    const titleEl = document.getElementById('levelupTitle');
    const subEl = document.getElementById('levelupSub');
    if (titleEl) titleEl.textContent = `NIVEL ${Game.run.level}`;
    if (subEl) subEl.textContent = 'Elige una mejora';
    grid.innerHTML = '';

    for (const perk of perks) {
      const rar = RARITY[perk.rarity];
      const card = document.createElement('div');
      card.className = `levelup-card rarity-${perk.rarity}`;
      card.innerHTML = `
        <div>
          <div class="levelup-card-rarity" style="background:${rar.color}22; color:${rar.color}; border:1px solid ${rar.color};">${rar.label}</div>
          <div class="levelup-card-icon" style="color:${rar.color};">${perk.icon}</div>
          <div class="levelup-card-name">${perk.name}</div>
          <div class="levelup-card-desc">${perk.desc}</div>
        </div>
        <button class="levelup-card-select" type="button">ELEGIR</button>
      `;
      const select = () => {
        if (card.dataset.selected === 'true') return;
        card.dataset.selected = 'true';
        Audio2.buy();
        Gamepad.rumble(0.5, 150);
        this.show('battle');
        Game.applyLevelUpPerk(perk);
      };
      card.addEventListener('pointerup', event => {
        if (event.pointerType === 'touch') {
          event.preventDefault();
          select();
        }
      });
      card.addEventListener('click', select);
      card.querySelector('.levelup-card-select').addEventListener('click', event => {
        event.stopPropagation();
        select();
      });
      grid.appendChild(card);
    }

    this.show('levelup');
  },

  showStall(stall, coins, items, onBuy, onClose) {
    document.getElementById('shopCoins').textContent = coins;
    const title = document.querySelector('#screen-shop .screen-title');
    if (title) title.innerHTML = `${stall.icon} ${stall.name.toUpperCase()}`;
    const subtitle = document.querySelector('#screen-shop p');
    if (subtitle) subtitle.textContent = stall.desc;

    const grid = document.getElementById('shopGrid');
    grid.innerHTML = '';

    if (items.length === 0) {
      grid.innerHTML = '<p style="color:var(--ice-frost);font-size:12px;">Este puesto no tiene stock disponible.</p>';
    }

    for (const item of items) {
      const rar = RARITY[item.rarity];
      const cost = Math.round(item.baseCost * rar.priceMul);
      const isConsumable = item._kind === 'consumable';
      let alreadyOwned = false;
      let stockText = '';
      if (isConsumable) {
        const inv = Game.run.consumables || {};
        const cur = inv[item.id] || 0;
        stockText = `x${cur}/${item.maxStack}`;
        alreadyOwned = cur >= item.maxStack;
      } else {
        alreadyOwned = Game.run.items.includes(item.id);
      }
      const canBuy = !alreadyOwned && coins >= cost;

      const div = document.createElement('div');
      div.className = `shop-item rarity-${item.rarity}`;
      if (isConsumable) div.classList.add('shop-item-consumable');

      const badge = isConsumable
        ? `<div class="shop-item-badge">CONSUMIBLE</div>`
        : `<div class="shop-item-badge perm">PERMANENTE</div>`;

      const stockLine = isConsumable
        ? `<div class="shop-item-stock">${stockText}</div>`
        : '';

      div.innerHTML = `
        ${badge}
        <div class="shop-item-icon" style="filter:drop-shadow(0 0 8px ${rar.color});">${item.icon}</div>
        <div class="shop-item-name">${item.name}</div>
        <div class="shop-item-desc">${item.desc}<br><small style="color:${rar.color};">${rar.label}</small></div>
        ${stockLine}
        <div class="shop-item-price ${canBuy ? '' : 'cant'}">◆ ${cost}</div>
        <button class="shop-item-buy" ${canBuy ? '' : 'disabled'}>
          ${alreadyOwned ? (isConsumable ? 'STACK LLENO' : 'COMPRADO') : (coins < cost ? 'SIN FONDOS' : 'COMPRAR')}
        </button>
      `;

      if (canBuy) {
        div.querySelector('.shop-item-buy').addEventListener('click', () => {
          if (onBuy(item)) {
            document.getElementById('shopCoins').textContent = Game.run.coins;
            const inv = Game.run.consumables || {};
            const cur = inv[item.id] || 0;
            if (isConsumable) {
              const stockEl = div.querySelector('.shop-item-stock');
              if (stockEl) stockEl.textContent = `x${cur}/${item.maxStack}`;
              if (cur >= item.maxStack) {
                div.querySelector('.shop-item-buy').disabled = true;
                div.querySelector('.shop-item-buy').textContent = 'STACK LLENO';
              }
            } else {
              div.querySelector('.shop-item-buy').disabled = true;
              div.querySelector('.shop-item-buy').textContent = 'COMPRADO';
            }
            UI.updateConsumableBar();
            Gamepad.rumble(0.3, 60);
          }
        });
      }
      grid.appendChild(div);
    }

    const closeBtn = document.getElementById('btn-shop-close');
    if (closeBtn) {
      const newBtn = closeBtn.cloneNode(true);
      closeBtn.parentNode.replaceChild(newBtn, closeBtn);
      newBtn.addEventListener('click', () => { Audio2.click(); this.show('battle'); onClose(); });
    }
    this.show('shop');
  },

  showChestChoice(chest, choices, onPick, onClose) {
    const grid = document.getElementById('chestGrid');
    grid.innerHTML = '';

    const header = document.createElement('div');
    header.style.cssText = 'grid-column: 1/-1; text-align:center; color:#b48aff; font-weight:bold; letter-spacing:2px; margin-bottom:8px;';
    header.innerHTML = `
      <div style="font-size:20px;">📦 COFRE MISTERIOSO</div>
      <div style="font-size:11px; color:#b2ebf2; font-weight:normal; letter-spacing:1px; margin-top:4px;">Elige UN item de los 3 que aparecen</div>
    `;
    grid.appendChild(header);

    for (const item of choices) {
      const rar = RARITY[item.rarity];
      const div = document.createElement('div');
      div.className = `shop-item rarity-${item.rarity}`;
      div.innerHTML = `
        <div class="shop-item-icon" style="filter:drop-shadow(0 0 8px ${rar.color});">${item.icon}</div>
        <div class="shop-item-name">${item.name}</div>
        <div class="shop-item-desc">${item.desc}<br><small style="color:${rar.color};">${rar.label}</small></div>
        <button class="shop-item-buy">ELEGIR</button>
      `;
      div.querySelector('.shop-item-buy').addEventListener('click', () => {
        Audio2.buy(); Gamepad.rumble(0.5, 150);
        this.show('battle'); onPick(item);
      });
      grid.appendChild(div);
    }
    this.show('chest');
  },

  showGacha(baseCost, coins, onRoll, onClose) {
    const grid = document.getElementById('upgradeGrid');
    grid.innerHTML = '';

    const info = document.createElement('div');
    info.style.cssText = 'grid-column: 1/-1; text-align:center; color:#b2ebf2; font-size:12px; line-height:1.8;';
    const pity = Game.currentRoom ? (Game.currentRoom.gachaPity || 0) : 0;
    info.innerHTML = `
      <div style="font-size:14px;color:#7b61ff;font-weight:bold;letter-spacing:2px;margin-bottom:6px;">🎰 GACHA GLACIAL</div>
      <div>Obtén mejoras permanentes aleatorias para esta run.</div>
      <div style="color:#ffd54f;">Rarezas: Común · Rara · Épica · Legendaria</div>
      <div>Pity: <strong>${pity}/10</strong> — épico+ garantizado al llegar a 10.</div>
      <div style="margin-top:8px;">Monedas: <strong style="color:#ffd54f;">◆ ${coins}</strong></div>
    `;
    grid.appendChild(info);

    const singleCost = baseCost;
    const canSingle = coins >= singleCost;
    const divSingle = document.createElement('div');
    divSingle.className = 'shop-item rarity-rare';
    divSingle.innerHTML = `
      <div class="shop-item-icon" style="filter:drop-shadow(0 0 8px #00e5ff);">🎲</div>
      <div class="shop-item-name">Tirada simple</div>
      <div class="shop-item-desc">1 mejora aleatoria.</div>
      <div class="shop-item-price ${canSingle ? '' : 'cant'}">◆ ${singleCost}</div>
      <button class="shop-item-buy" ${canSingle ? '' : 'disabled'}>GIRAR</button>
    `;
    if (canSingle) {
      divSingle.querySelector('.shop-item-buy').addEventListener('click', () => onRoll('single'));
    }
    grid.appendChild(divSingle);

    const tripleCost = Math.round(baseCost * 3 * 0.9);
    const canTriple = coins >= tripleCost;
    const divTriple = document.createElement('div');
    divTriple.className = 'shop-item rarity-epic';
    divTriple.innerHTML = `
      <div class="shop-item-icon" style="filter:drop-shadow(0 0 8px #7b61ff);">🎲🎲🎲</div>
      <div class="shop-item-name">Tirada triple</div>
      <div class="shop-item-desc">3 mejoras. <strong style="color:#7bff9f;">-10% descuento</strong></div>
      <div class="shop-item-price ${canTriple ? '' : 'cant'}">◆ ${tripleCost}</div>
      <button class="shop-item-buy" ${canTriple ? '' : 'disabled'}>GIRAR x3</button>
    `;
    if (canTriple) {
      divTriple.querySelector('.shop-item-buy').addEventListener('click', () => onRoll('multi'));
    }
    grid.appendChild(divTriple);

    const divClose = document.createElement('div');
    divClose.className = 'shop-item';
    divClose.style.borderColor = '#7a9ab0';
    divClose.innerHTML = `
      <div class="shop-item-icon">🚪</div>
      <div class="shop-item-name">Salir</div>
      <div class="shop-item-desc">Abandonar el gacha.</div>
      <button class="shop-item-buy">CERRAR</button>
    `;
    divClose.querySelector('.shop-item-buy').addEventListener('click', () => {
      Audio2.click(); this.show('battle'); onClose();
    });
    grid.appendChild(divClose);

    this.show('upgrade');
  },

  showGachaResults(results) {
    const grid = document.getElementById('upgradeGrid');
    grid.innerHTML = '';

    const header = document.createElement('div');
    header.style.cssText = 'grid-column: 1/-1; text-align:center; margin-bottom:8px;';
    header.innerHTML = `<div style="font-size:20px;color:#ffd54f;font-weight:bold;letter-spacing:3px;">✦ RESULTADOS ✦</div>`;
    grid.appendChild(header);

    for (const roll of results) {
      const rar = RARITY[roll.rarity];
      const div = document.createElement('div');
      div.className = `shop-item rarity-${roll.rarity}`;
      div.style.borderWidth = '3px';
      div.innerHTML = `
        <div class="shop-item-icon" style="font-size:42px;filter:drop-shadow(0 0 12px ${rar.color});">${roll.icon}</div>
        <div class="shop-item-name" style="font-size:13px;color:${rar.color};">${roll.name}</div>
        <div class="shop-item-desc">${rar.label === 'Legendario' ? '⭐ ¡LEGENDARIO!' : rar.label === 'Épico' ? '💜 Épico' : rar.label === 'Raro' ? '💙 Raro' : 'Común'}</div>
      `;
      grid.appendChild(div);
    }

    const close = document.createElement('div');
    close.className = 'shop-item';
    close.style.gridColumn = '1/-1';
    close.style.maxWidth = '200px';
    close.style.margin = '0 auto';
    close.innerHTML = `
      <div class="shop-item-name">Continuar</div>
      <button class="shop-item-buy">OK</button>
    `;
    close.querySelector('.shop-item-buy').addEventListener('click', () => {
      Audio2.click();
      const baseCost = 50 + Game.floor * 12;
      UI.showGacha(baseCost, Game.run.coins, (tier) => {
        const rolls = tier === 'multi' ? 3 : 1;
        const cost = tier === 'multi' ? Math.round(baseCost * 3 * 0.9) : baseCost;
        if (Game.run.coins < cost) return false;
        Game.run.coins -= cost;
        const newResults = [];
        for (let i = 0; i < rolls; i++) newResults.push(Game._rollGacha());
        for (const r of newResults) Game._applyGacha(r);
        save.totalGachaRolls = (save.totalGachaRolls || 0) + rolls;
        Save.write();
        UI.updateHud();
        UI.checkAchievements();
        UI.showGachaResults(newResults);
        return true;
      }, () => { Game.paused = false; });
    });
    grid.appendChild(close);

    Gamepad.rumble(0.6, 200);
  },

  showGameOver(victory) {
    const title = document.getElementById('goTitle');
    const info = document.getElementById('goInfo');
    if (victory) {
      title.textContent = '🏆 ¡VICTORIA FINAL!';
      title.style.color = '#4dffff';
    } else {
      title.textContent = '💀 DERROTA';
      title.style.color = '#ff3d71';
    }
    const synergiesActive = SYNERGIES.filter(s => s.ids.every(id => Game.run.items.includes(id))).length;
    const consCount = Object.values(Game.run.consumables || {}).reduce((a,b) => a+b, 0);
    info.innerHTML = `
      <div>Piso alcanzado: <strong>${Game.floor}</strong></div>
      <div>Nivel final: <strong>${Game.run.level}</strong></div>
      <div>Salas limpiadas: <strong>${Game.run.roomsCleared}</strong></div>
      <div>Enemigos derrotados: <strong>${Game.run.kills}</strong></div>
      <div>Items obtenidos: <strong>${Game.run.items.length}</strong></div>
      <div>Consumibles restantes: <strong>${consCount}</strong></div>
      <div>Sinergias activas: <strong>${synergiesActive}</strong></div>
      <div>Monedas: <strong>${Game.run.coins}</strong></div>
    `;
    this.show('gameover');
  },

  toast(msg, type = '') {
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = msg;
    document.getElementById('toasts').appendChild(el);
    setTimeout(() => el.remove(), 2000);
  },

  /* ================================================================
     NAVEGACIÓN CON MANDO + ANIMACIÓN DE FOCO
     ================================================================ */
  handleGamepadMenuNav() {
    if (this._gpBind) { this._captureGamepadBind(); return; }
    if (this.current === 'options') this._updateGamepadStatus();
    const activeOverlay = document.querySelector('.overlay.active');
    if (!activeOverlay) {
      this._menuLastActiveOverlay = null;
      return;
    }
    if (activeOverlay !== this._menuLastActiveOverlay) {
      this._menuLastActiveOverlay = activeOverlay;
      this._menuFocusIndex = 0;
      this._menuNavCooldown = 0;
    }

    const buttons = Array.from(activeOverlay.querySelectorAll(
      'button:not([disabled]):not(.keybind-key), input[type="range"], .levelup-card, .ach-card, .shop-item'
    )).filter(el => {
      // Una tarjeta con botón debe ser un solo elemento navegable.
      // Así el mando no se detiene en la tarjeta antes de llegar a CERRAR.
      return (!el.classList.contains('shop-item') && !el.classList.contains('levelup-card')) ||
        !el.querySelector('button');
    });
    if (buttons.length === 0) return;

    const now = performance.now();
    const dpad = Gamepad.dpad();
    const sticks = Gamepad.pollSticks();
    const navDown  = dpad.down  || sticks.ly >  0.55;
    const navUp    = dpad.up    || sticks.ly < -0.55;
    const navRight = dpad.right || sticks.lx >  0.55;
    const navLeft  = dpad.left  || sticks.lx < -0.55;

    const gridContainer = activeOverlay.querySelector('.shop-grid, .levelup-grid, .ach-grid');
    let gridCols = 1;
    if (gridContainer) {
      gridCols = gridContainer.classList.contains('levelup-grid') ? 3
               : gridContainer.classList.contains('ach-grid') ? 3
               : 4;
    }

    if (now > this._menuNavCooldown) {
      if (navDown) {
        this._menuFocusIndex = (this._menuFocusIndex + gridCols) % buttons.length;
        this._menuNavCooldown = now + Gamepad.menuNavInterval;
      } else if (navUp) {
        this._menuFocusIndex = (this._menuFocusIndex - gridCols + buttons.length * 2) % buttons.length;
        this._menuNavCooldown = now + Gamepad.menuNavInterval;
      } else if (navRight) {
        this._menuFocusIndex = (this._menuFocusIndex + 1) % buttons.length;
        this._menuNavCooldown = now + Gamepad.menuNavInterval;
      } else if (navLeft) {
        this._menuFocusIndex = (this._menuFocusIndex - 1 + buttons.length) % buttons.length;
        this._menuNavCooldown = now + Gamepad.menuNavInterval;
      }
    }

    // ✨ Aplicar .focused con auto-scroll
    buttons.forEach((b, i) => {
      if (i === this._menuFocusIndex) {
        if (!b.classList.contains('focused')) {
          b.classList.add('focused');
          const scrollParent = b.closest('.ach-grid, .shop-grid, .overlay');
          if (scrollParent && scrollParent !== document.body) {
            if (scrollParent.classList.contains('overlay')) {
              if (typeof b.scrollIntoView === 'function') {
                try { b.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch(e) {}
              }
            } else {
              const bTop = b.offsetTop;
              const bBottom = bTop + b.offsetHeight;
              const pTop = scrollParent.scrollTop;
              const pBottom = pTop + scrollParent.clientHeight;
              if (bTop < pTop) {
                scrollParent.scrollTop = bTop - 8;
              } else if (bBottom > pBottom) {
                scrollParent.scrollTop = bBottom - scrollParent.clientHeight + 8;
              }
            }
          }
        }
      } else {
        b.classList.remove('focused');
      }
    });

    if (Gamepad.justPressedUI(Gamepad.MAPPING.confirm)) {
      const el = buttons[this._menuFocusIndex];
      if (el) { Audio2.click(); el.click(); }
    }
    if (Gamepad.justPressedUI(Gamepad.MAPPING.cancel)) {
      this.goBack();
    }
  },
};

/* ================================================================
   INIT
   ================================================================ */
window.addEventListener('load', () => {
  PlayerCustomization.init();
  Game.init();
  UI.init();
  Gamepad.init();
  UI.applyMobileHudPositions();
  window.addEventListener('resize', () => UI.applyMobileHudPositions());
  Audio2.musicEnabled = save.options.music !== false;
  Audio2.startMusic();
  const unlockAudio = () => Audio2.init();
  document.addEventListener('click', unlockAudio, true);
  document.addEventListener('pointerdown', unlockAudio, true);
  document.addEventListener('keydown', unlockAudio, true);
  setInterval(() => {
    if (Game.battleActive && !Game.paused) UI.updateAbilityCooldowns();
    if (UI.current === 'options') UI._updateGamepadStatus();
    UI.updateHudDim(performance.now());
  }, 100);
  console.log('❄ ICE RUN v14 — XP dura + Animación foco + Reto por piso');
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && Game.battleActive && !Game.paused) Game.togglePause();
});


/* ===== install.js ===== */
(() => {
  let installPrompt = null;
  const apkPath = 'downloads/los-magos-del-tiempo.apk';

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
  });

  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    if (typeof UI !== 'undefined') UI.toast('📱 Aplicación instalada', 'gold');
  });

  window.downloadGameApk = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const result = await installPrompt.userChoice;
      installPrompt = null;
      if (result.outcome === 'accepted' && typeof UI !== 'undefined') {
        UI.toast('📱 Instalación iniciada', 'gold');
      }
      return;
    }

    try {
      const response = await fetch(apkPath, { method: 'HEAD' });
      if (!response.ok) throw new Error(`APK no disponible (${response.status})`);
      const link = document.createElement('a');
      link.href = apkPath;
      link.download = 'los-magos-del-tiempo.apk';
      link.click();
    } catch (error) {
      console.error('No se pudo descargar la APK:', error);
      if (typeof UI !== 'undefined') {
        UI.toast('La APK aún no está publicada. Usa la instalación de Android o genera el APK.', 'danger');
      }
    }
  };

  const downloadButton = document.getElementById('btn-download-apk');
  if (downloadButton) {
    downloadButton.addEventListener('click', () => window.downloadGameApk());
  }

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(error => {
      console.warn('No se pudo activar el modo instalable:', error);
    });
  }
})();
