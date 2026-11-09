update(dt, now) {
  this.syncControls();
  if (this.downed) return;

  /* ---------- movimiento ---------- */
  let dx = 0, dy = 0;
  const kb = this.controls;
  if (Input.keys[kb.up])    dy -= 1;
  if (Input.keys[kb.down])  dy += 1;
  if (Input.keys[kb.left])  dx -= 1;
  if (Input.keys[kb.right]) dx += 1;

  const sticks = this.controlId === 'p1' && Gamepad.connected ? Gamepad.pollSticks() : null;
  const gx = sticks ? sticks.lx : 0;
  const gy = sticks ? sticks.ly : 0;
  const tx = Input.touchMoveX || 0;
  const ty = Input.touchMoveY || 0;
  const hasTouchMove = this.controlId === 'p1' && (Math.abs(tx) > 0.08 || Math.abs(ty) > 0.08);
  const hasGamepadMove = Math.abs(gx) > 0.01 || Math.abs(gy) > 0.01;
  const rageMul = (now < this.rageUntil) ? 1.3 : 1.0;

  if (this.isDashing(now)) {
    const s = dt / 1000;
    this.x += this.dashVx * s;
    this.y += this.dashVy * s;
    Game.clampPlayer(this);
  } else if (hasTouchMove) {
    const mag = Math.min(1, Math.hypot(tx, ty));
    const len = Math.hypot(tx, ty) || 1;
    const step = this.speed * rageMul * mag * (dt / 16.6);
    this.x += (tx / len) * step;
    this.y += (ty / len) * step;
    Game.clampPlayer(this);
  } else if (hasGamepadMove) {
    const mag = Math.min(1, Math.hypot(gx, gy));
    const len = Math.hypot(gx, gy) || 1;
    const step = this.speed * rageMul * mag * (dt / 16.6);
    this.x += (gx / len) * step;
    this.y += (gy / len) * step;
    Game.clampPlayer(this);
  } else {
    if (dx && dy) { dx *= 0.707; dy *= 0.707; }
    const step = this.speed * rageMul * (dt / 16.6);
    this.x += dx * step;
    this.y += dy * step;
    Game.clampPlayer(this);
  }

  /* ---------- apuntado ---------- */
  let usingGamepadAim = false;
  if (sticks && (Math.abs(sticks.rx) > 0.15 || Math.abs(sticks.ry) > 0.15)) {
    const targetAng = Math.atan2(sticks.ry, sticks.rx);
    let diff = targetAng - this._lastAimAngle;
    while (diff >  Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this._lastAimAngle += diff * Gamepad.aimSmoothing;
    this.aimAngle = this._lastAimAngle;
    usingGamepadAim = true;
  }

  if (!usingGamepadAim) {
    const canvas = document.getElementById('game');
    const rect = canvas.getBoundingClientRect();
    const hasMouse = Input._mx !== undefined && Input._my !== undefined;
    if (this.controlId === 'p1' && hasMouse) {
      const mouseX = Input._mx * (CFG.W / rect.width);
      const mouseY = Input._my * (CFG.H / rect.height);
      const dxm = mouseX - this.x, dym = mouseY - this.y;
      if (Math.hypot(dxm, dym) > 4) {
        this.aimAngle = Math.atan2(dym, dxm);
        this._lastAimAngle = this.aimAngle;
      }
    }
  }

  const autoTarget = this.findNearestTarget();
  this.autoTarget = autoTarget;
  if (autoTarget) {
    this.autoAngle = Math.atan2(autoTarget.y - this.y, autoTarget.x - this.x);
  } else {
    this.autoAngle = this.aimAngle;
  }
  if (this.controlId === 'p2' && autoTarget) this.aimAngle = this.autoAngle;
  this.angle = autoTarget ? this.autoAngle : this.aimAngle;

  /* ---------- AUTO-FIRE (BLOQUE 3: respeta toggle global) ---------- */
  this.tryAutoBasic(now);

  /* ---------- acciones por teclado ---------- */
  if (Input.keys[kb.dash] || (this.controlId === 'p1' && Input.touchButtons.dash)) this.tryDash(now);
  if (Input.consumePress(kb.block) || (this.controlId === 'p1' && Input.touchButtons.block)) {
    this.tryBlock(now);
    if (this.controlId === 'p1') Input.touchButtons.block = false;
  }
  if (Input.keys[kb.melee] || (this.controlId === 'p1' && Input.touchButtons.melee)) this.tryMelee(now);
  if (Input.keys[kb.long] || (this.controlId === 'p1' && Input.touchButtons.long)) this.tryLong(now);
  if (Input.keys[kb.basic] || (this.controlId === 'p1' && (Input.mouseDown || Input.touchButtons.basic))) {
    this.tryBasicManual(now);
  }
  if (this.controlId === 'p1' && Input.touchButtons.interact && Game.battleActive && !Game.paused) {
    Input.touchButtons.interact = false;
    Game.tryInteract();
  }

  /* ---------- acciones por gamepad ---------- */
  if (this.controlId === 'p1' && Gamepad.connected) {
    const M = Gamepad.MAPPING;
    if (Gamepad.justPressed(M.dash)) this.tryDash(now);
    if (Gamepad.justPressed(M.block)) this.tryBlock(now);
    if (Gamepad.justPressed(M.melee)) {
      const nearStall = Game._nearestStall(this);
      const nearChest = Game._nearestChest(this);
      const r = Game.currentRoom;
      const gachaNear = r && r.type === 'upgrade' && r.gachaMachine &&
        Math.hypot(this.x - r.gachaMachine.x, this.y - r.gachaMachine.y) < r.gachaMachine.radius + this.size;
      if (nearStall || nearChest || gachaNear) {
        Game.tryInteract();
      } else {
        this.tryMelee(now);
      }
    }
    if (Gamepad.justPressed(M.long))  this.tryLong(now);
    if (Gamepad.isDown(M.basic)) this.tryBasicManual(now);

    if (Gamepad.justPressed(12)) { const s = UI.getConsumableSlots(); if (s[0]) Game.useConsumable(s[0].id, this); }
    if (Gamepad.justPressed(15)) { const s = UI.getConsumableSlots(); if (s[1]) Game.useConsumable(s[1].id, this); }
    if (Gamepad.justPressed(13)) { const s = UI.getConsumableSlots(); if (s[2]) Game.useConsumable(s[2].id, this); }
    if (Gamepad.justPressed(14)) { const s = UI.getConsumableSlots(); if (s[3]) Game.useConsumable(s[3].id, this); }

    // 👇 BLOQUE 3: cambio de arma con botón del gamepad (usa MAPPING.switchWeapon si existe, si no usa el botón 4)
    const switchBtn = (typeof M.switchWeapon === 'number') ? M.switchWeapon : 4;
    if (Gamepad.justPressed(switchBtn) && this.trySwitchWeapon) this.trySwitchWeapon();
  }

  /* ---------- acciones P2 ---------- */
  if (this.controlId === 'p2') {
    if (Input.keys[kb.interact]) Game.tryRevive(this);
    for (let i = 0; i < kb.consumables.length; i++) {
      if (Input.keys[kb.consumables[i]]) {
        const slots = UI.getConsumableSlots();
        if (slots[i]) Game.useConsumable(slots[i].id, this);
      }
    }
    if (Input.keys[kb.switchWeapon] && this.trySwitchWeapon) this.trySwitchWeapon();
  }

  if (this.hitFlash > 0) this.hitFlash--;
}