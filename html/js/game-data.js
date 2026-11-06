/* ============================================================
   ICE RUN - Datos de progresión, arsenal y armaduras
   ============================================================ */
const ICE_RUN_DATA = (() => {
  const expRequerida = nivel => Math.round(100 * Math.pow(nivel, 1.5));

  const roles = [
    { id:'tanque', nombre:'Tanque', habilidadPasiva:'Regeneración de escudo', habilidadActiva:'Dash explosivo', comboIdeal:'Escopeta + Escudo', statsBase:{ ataque:5, movilidad:2, especial:7 } },
    { id:'asesino', nombre:'Asesino', habilidadPasiva:'Invisibilidad al quedarse quieto', habilidadActiva:'Golpe crítico garantizado', comboIdeal:'Francotirador + Daga', statsBase:{ ataque:3, movilidad:6, especial:9 } },
    { id:'soporte', nombre:'Soporte', habilidadPasiva:'Aura de curación', habilidadActiva:'Dron de rescate', comboIdeal:'Subfusil + Pistola médica', statsBase:{ ataque:6, movilidad:8, especial:4 } },
    { id:'tactico', nombre:'Táctico', habilidadPasiva:'Visión de radar', habilidadActiva:'Torreta automática', comboIdeal:'Rifle de asalto + Lanzagranadas', statsBase:{ ataque:8, movilidad:5, especial:6 } },
    { id:'corredor', nombre:'Corredor', habilidadPasiva:'Pies ligeros', habilidadActiva:'Dash de hielo', comboIdeal:'Subfusil dual + Dagas', statsBase:{ ataque:9, movilidad:10, especial:3 } },
    { id:'elementalista', nombre:'Elementalista', habilidadPasiva:'Munición incendiaria', habilidadActiva:'Bola de fuego', comboIdeal:'Lanzallamas + Pistola de plasma', statsBase:{ ataque:5, movilidad:3, especial:10 } },
    { id:'espectro', nombre:'Espectro', habilidadPasiva:'Paso silencioso', habilidadActiva:'Marca del cazador', comboIdeal:'Ballesta + Cuchillas gemelas', statsBase:{ ataque:8, movilidad:8, especial:5 } },
    { id:'paladin', nombre:'Paladín', habilidadPasiva:'Escudo reactivo', habilidadActiva:'Muro de hielo', comboIdeal:'Escopeta de asalto + Escudo de energía', statsBase:{ ataque:3, movilidad:2, especial:8 } },
    { id:'cazadora', nombre:'Cazadora', habilidadPasiva:'Olfato de presa', habilidadActiva:'Trampa de red', comboIdeal:'Rifle de precisión + Pistola de anestesia', statsBase:{ ataque:6, movilidad:5, especial:9 } },
    { id:'alquimista', nombre:'Alquimista', habilidadPasiva:'Sangre ácida', habilidadActiva:'Bomba de humo gélido', comboIdeal:'Pistola de ácido + Rifle de asalto', statsBase:{ ataque:7, movilidad:5, especial:6 } },
    { id:'medico', nombre:'Médico', habilidadPasiva:'Aura de curación', habilidadActiva:'Dron de rescate', comboIdeal:'Subfusil + Pistola médica', statsBase:{ ataque:4, movilidad:9, especial:4 } },
    { id:'francotirador', nombre:'Francotirador', habilidadPasiva:'Camuflaje térmico', habilidadActiva:'Disparo perforante', comboIdeal:'Francotirador + Cuchillo', statsBase:{ ataque:2, movilidad:4, especial:10 } },
    { id:'berserker', nombre:'Berserker', habilidadPasiva:'Piel de escarcha', habilidadActiva:'Golpe sísmico', comboIdeal:'Escopeta doble + Guantes de hielo', statsBase:{ ataque:5, movilidad:1, especial:9 } },
  ].map(role => ({
    ...role,
    nivel: 1,
    experiencia: 0,
    nivelMaximo: 50,
    expRequerida: nivel => expRequerida(nivel),
  }));

  const crearArmas = (tipo, nombres, rol, base) => nombres.map((nombre, index) => ({
    id: `${tipo.toLowerCase()}-${index + 1}`,
    nombre,
    tipo,
    rolDesbloqueo: rol,
    nivelDesbloqueo: 1 + (index % 5) * 10,
    stats: {
      daño: base.daño + index * 2,
      velocidadAtaque: base.velocidadAtaque + (index % 4) * 2,
      movilidad: base.movilidad + (index % 3) * 2,
    },
  }));

  const pistolas = crearArmas('Pistolas', ['Pistola ártica','Pistola de plasma','Pistola médica','Pistola de ácido','Pistola centella','Pistola de ráfaga','Pistola glacial','Pistola silente','Pistola magnética','Pistola de precisión'], 'soporte', { daño:12, velocidadAtaque:8, movilidad:4 });
  const rifles = crearArmas('Rifles', ['Rifle de plasma','Rifle boreal','Rifle de asalto','Rifle de hielo','Rifle de pulsos','Rifle francotirador','Rifle de radar','Rifle tormenta','Rifle perforante','Rifle aurora'], 'tactico', { daño:24, velocidadAtaque:3, movilidad:-3 });
  const escopetas = crearArmas('Escopetas', ['Escopeta pesada','Escopeta doble','Escopeta glaciar','Escopeta de asalto','Escopeta rompehielo','Escopeta polar','Escopeta sísmica','Escopeta de carga','Escopeta nevada','Escopeta devastadora'], 'tanque', { daño:34, velocidadAtaque:-5, movilidad:-6 });
  const cuerpoACuerpo = crearArmas('Cuerpo a cuerpo', ['Daga espectral','Cuchillo criónico','Hacha de hielo','Martillo polar','Cuchillas gemelas','Guantes de combate','Lanza glacial','Garras boreales','Espada de escarcha','Bastón de ventisca'], 'asesino', { daño:20, velocidadAtaque:10, movilidad:8 });
  const armas = [...pistolas, ...rifles, ...escopetas, ...cuerpoACuerpo];

  const crearArmaduras = (tipo, nombres, rarezas, modificadores) => nombres.map((nombre, index) => ({
    id: `${tipo.toLowerCase()}-${index + 1}`,
    nombre,
    tipo,
    rareza: rarezas[index % rarezas.length],
    modificadores: modificadores(index),
  }));

  const pantalones = crearArmaduras('Pantalones', ['Corredor ártico','Trineo táctico','Pies de ventisca','Guardia ligera','Ráfaga polar','Nómada de hielo','Paso glacial','Veloz boreal','Explorador blanco','Impulso cero'], ['Común','Raro','Épico'], i => ({ movilidad:2 + (i % 5) * 2, velocidadAtaque:1 + (i % 4) * 2 }));
  const chaquetas = crearArmaduras('Chaquetas', ['Placa glaciar','Abrigo de asalto','Coraza aurora','Manto del paladín','Chaqueta criónica','Blindaje de tormenta','Armadura escarcha','Núcleo protector','Barrera polar','Exotraje hielo'], ['Común','Raro','Épico'], i => ({ defensa:2 + (i % 5) * 2, especial:1 + (i % 4) * 2 }));
  const cascos = crearArmaduras('Cascos', ['Visor ártico','Casco centinela','Máscara de cazador','Corona boreal','Visor espectral','Casco de radar','Lente glacial','Cúpula táctica','Visor de precisión','Yelmo de escarcha'], ['Común','Raro','Épico'], i => ({ velocidadAtaque:2 + (i % 5) * 2, precision:1 + (i % 4) * 2 }));
  const armaduras = [...pantalones, ...chaquetas, ...cascos];

  const inventarioMeta = {
    armasDesbloqueadas: [],
    armadurasDesbloqueadas: [],
    rolesNivel50: [],
    logros: [],
    monedas: 0,
    gemas: 0,
    totalArmas: armas.length,
    totalArmaduras: armaduras.length,
    totalRoles: roles.length,
    resumen() {
      return {
        armas: `${this.armasDesbloqueadas.length}/${this.totalArmas}`,
        armaduras: `${this.armadurasDesbloqueadas.length}/${this.totalArmaduras}`,
        rolesNivel50: `${this.rolesNivel50.length}/${this.totalRoles}`,
        logros: this.logros.length,
      };
    },
  };

  return {
    roles,
    expRequerida,
    armas,
    pistolas,
    rifles,
    escopetas,
    cuerpoACuerpo,
    armaduras,
    pantalones,
    chaquetas,
    cascos,
    inventarioMeta,
  };
})();
