
import { useState, useMemo, useRef } from "react";

// ─── DATOS: inspectores con códigos reales extraídos de hoja oculta de plantillas ──
const INSPECTORES = {
  "KAREN MEJIA":        { flex:"FLEX-E01", lux:"LX01",   tac:"TC01",   epl:"EPL01N", ept:"EPT-PA", mad:"MAD-01",    pdr:"PR A02",  mtm:"MTM 01",  dnm:"DNM-01" },
  "ALEJANDRO FRANCO":   { flex:"FLEX 01",  lux:"PLX01",  tac:"TC E01", epl:"EPL-E01",ept:"EPT04",  mad:"MAD E01",   pdr:"PR PN 01",mtm:"MTM E03", dnm:"DNM-01" },
  "MARLON PUELLO":      { flex:"FLEX 01P", lux:"LX 03",  tac:"TC E02", epl:"EPL03",  ept:"EPT-PA", mad:"MAD PN 02", pdr:"PR 03",   mtm:"MTM E02", dnm:"DNM-01" },
  "GUIOVANNY VALENCIA": { flex:"FLEX 04",  lux:"LX04",   tac:"TC04",   epl:"EPL04",  ept:"EPT-PA", mad:"MAD 04",    pdr:"PR04",    mtm:"MTM04",   dnm:"DNM-01" },
  "DIEGO SUAREZ":       { flex:"FLEX-PA",  lux:"LX02",   tac:"TC03",   epl:"EPL-01", ept:"EPTE01", mad:"MAD-PN-01", pdr:"PR-01",   mtm:"MTME01",  dnm:"DNM-02" },
  "CRISTIAN MEDINA":    { flex:"FLEX06",   lux:"LX06",   tac:"TC06",   epl:"EPL06",  ept:"EPTE01", mad:"MAD06",     pdr:"PR06",    mtm:"MTM06",   dnm:"DNM-02" },
  "ESTEBAN MEJIA":      { flex:"FLEX07",   lux:"LX07",   tac:"TC07",   epl:"EPL07",  ept:"EPT05",  mad:"MAD07",     pdr:"PR07",    mtm:"MTM07",   dnm:"DNM-02" },
  "BAIRON CORREA":      { flex:"FLEX08",   lux:"LX08",   tac:"TC08",   epl:"EPL08",  ept:"EPT05",  mad:"MAD08",     pdr:"PR08",    mtm:"MTM08",   dnm:"DNM-02" },
  "ALEXANDER COGUA":    { flex:"FLEX06",   lux:"LX06",   tac:"TC06",   epl:"EPL06",  ept:"EPTE01", mad:"MAD06",     pdr:"PR06",    mtm:"MTM06",   dnm:"DNM-02" },
  "WILFRIDO PUELLO":    { flex:"FLEX-E01", lux:"LX01",   tac:"TC01",   epl:"EPL01N", ept:"EPT-PA", mad:"MAD-01",    pdr:"PR A02",  mtm:"MTM 01",  dnm:"DNM-01" },
};
const ATESTADORES = ["DIEGO SUAREZ","ALEJANDRO FRANCO"];

// ─── EQUIPOS DE MEDICIÓN POR TIPO DE INFORME ─────────────────────────────────
// Extraídos de la hoja "Equipos utilizados" de cada plantilla real
// asc2012: TAC, MAD, EPL, EPT, PDR, FLEX, LUX  (ítems reales de hoja fotos equi medicion)
// asc2021: FLEX, LUX, TAC, EPL, EPT, MAD, PDR  (ítems reales de resultados EM)
// escram:  TAC, MAD, EPT, LUX, FLEX             (SIN pie de rey, SIN escala plana)
// puertas: LUX, EPL, DNM, FLEX                  (SIN tacómetro, SIN EPT, SIN MAD, SIN pie de rey)
const EQUIPOS_POR_TIPO = {
  asc2012: [
    { k:"tac",  nombre:"Tacómetro",             items:"94" },
    { k:"mad",  nombre:"Medidor ángulo digital", items:"77" },
    { k:"epl",  nombre:"Escala plana",           items:"133, 130, 134" },
    { k:"lux",  nombre:"Luxómetro",              items:"168, 79" },
    { k:"flex", nombre:"Flexómetro",             items:"131" },
    { k:"pdr",  nombre:"Pie de rey",             items:"111" },
  ],
  asc2021: [
    { k:"epl",  nombre:"Escala plana",           items:"4, 14, 30, 11, 32" },
    { k:"lux",  nombre:"Luxómetro",              items:"23, 137" },
    { k:"flex", nombre:"Flexómetro",             items:"7, 24, 52, 102, 112" },
    { k:"pdr",  nombre:"Pie de rey",             items:"34" },
    { k:"mad",  nombre:"Medidor ángulo digital", items:"69" },
    { k:"tac",  nombre:"Tacómetro",              items:"99" },
  ],
  escram: [
    { k:"mad",  nombre:"Medidor ángulo digital", items:"11, 12" },
    { k:"tac",  nombre:"Tacómetro",              items:"19, 20, 21" },
    { k:"ept",  nombre:"Escala punta",           items:"31" },
    { k:"lux",  nombre:"Luxómetro",              items:"77, 78" },
    { k:"flex", nombre:"Flexómetro",             items:"91, 92" },
    { k:"mtm",  nombre:"Multímetro",             items:"93" },
  ],
  puertas: [
    { k:"flex", nombre:"Flexómetro",             items:"5" },
    { k:"dnm",  nombre:"Dinamómetro",            items:"76" },
    { k:"lux",  nombre:"Luxómetro",              items:"81" },
  ],
};
const CIUDADES = ["PEREIRA","BOGOTA","CALI","MEDELLIN","BUCARAMANGA","BARRANQUILLA","MANIZALES","ARMENIA","JAMUNDI","OTRO"];

// ─── ÍTEMS (todos los reales extraídos de los xlsx) ─────────────────────────
// Se importan como constante JS compacta
const RAW = {
  asc2012:[{n:1,d:"No existe empresa encargada del mantenimiento ni conservación del aparato (contrato, bitácora, reporte técnico, etc.).",f:"G",na:false},{n:2,d:"No existe llave de apertura en la edificación o no es accesible.",f:"G",na:false},{n:3,d:"La puerta de acceso se abre sin llave especial o no puede introducirse.",f:"G",na:false},{n:4,d:"Cerraduras accesibles desde el exterior sin requerir herramienta para su apertura.",f:"MG",na:false},{n:5,d:"Cerraduras se encuentran inoperantes.",f:"MG",na:false},{n:6,d:"Falta seguridad eléctrica (series) de puertas, o están puenteadas.",f:"MG",na:false},{n:7,d:"El ascensor arranca con puerta abierta.",f:"MG",na:false},{n:8,d:"Al halar o abrir la puerta, la cabina deberá detenerse.",f:"MG",na:false},{n:9,d:"Falta o no funciona un interruptor accesible desde el piso para parar el ascensor durante mantenimiento o inspección en el foso.",f:"G",na:false},{n:10,d:"No se puede actuar sobre los dispositivos eléctricos de seguridad de parada de emergencia y/o son accesibles.",f:"G",na:false},{n:11,d:"El dispositivo de parada (stop) no se desactiva de forma involuntaria.",f:"MG",na:false},{n:12,d:"Foso con profundidad ≥ 1.50 m sin escalera.",f:"L",na:true},{n:13,d:"Encontrándose la cabina en la última parada, el contrapeso se encuentra a distancia ≤ 15 cm del tope de amortiguadores (no aplica en hidráulicos o sin contrapeso).",f:"G",na:false},{n:14,d:"Agua en el foso.",f:"G",na:false},{n:15,d:"Amortiguadores oxidados, fisurados, sueltos.",f:"MG",na:false},{n:16,d:"No existen topes elásticos, de resorte o hidráulicos para la cabina y contrapeso.",f:"MG",na:false},{n:17,d:"En ascensores con hueco compartido, existe separación del hueco en el foso.",f:"L",na:true},{n:18,d:"En amortiguadores hidráulicos, el nivel de aceite está fuera de la marca.",f:"G",na:false},{n:19,d:"No tiene o no actúa el dispositivo eléctrico de seguridad en amortiguadores hidráulicos.",f:"L",na:false},{n:20,d:"No se recupera el amortiguador hidráulico luego de comprimirse.",f:"MG",na:false},{n:21,d:"El dispositivo de parada (stop) funciona en cabinas sin puertas.",f:"MG",na:false},{n:22,d:"No existe paracaídas en contrapeso habiendo circulación de personas bajo el foso.",f:"L",na:false},{n:23,d:"El paracaídas de contrapeso no actúa (cuando aplica).",f:"MG",na:false},{n:24,d:"No existen rejillas de ventilación en cabina.",f:"G",na:false},{n:25,d:"Paredes de la cabina rígidas. Para cabinas en madera, se presentan zonas podridas, mal fijadas o con síntomas de defecto.",f:"G",na:false},{n:26,d:"No lleva puertas en cabina (equipos antiguos sin puerta deben tener Sensor de proximidad).",f:"G",na:true},{n:27,d:"Puertas de cabina no retroceden frente a un obstáculo por contacto o proximidad.",f:"G",na:false},{n:28,d:"Guardaescoba o zócalo en mal estado (oxidado, suelto, deteriorado, roto).",f:"L",na:false},{n:29,d:"No existe o no funciona el pulsador de apertura de puertas automáticas en botonera de cabina.",f:"G",na:false},{n:30,d:"Existe señalización de piso en cabina.",f:"L",na:false},{n:31,d:"No existe placa que indique capacidad máxima de carga en cabina (kg y/o pasajeros).",f:"L",na:false},{n:32,d:"No está independiente la acometida del ascensor y la acometida del alumbrado.",f:"L",na:false},{n:33,d:"El equipo de alarma no es autónomo (sin batería), inaudible o no funciona.",f:"G",na:false},{n:34,d:"No existe o no funciona el intercomunicador.",f:"G",na:false},{n:35,d:"No funciona el sistema de reapertura de puertas de acceso.",f:"G",na:false},{n:36,d:"No tiene acceso al cuarto de máquinas y/o incumplimiento normatividad de trabajo en altura.",f:"G",na:false},{n:37,d:"No existe inscripción de acceso prohibido.",f:"L",na:false},{n:38,d:"Puerta del cuarto de máquinas sin cerradura.",f:"G",na:false},{n:39,d:"El cuarto de máquinas es utilizado como bodega o para fines diferentes.",f:"G",na:false},{n:40,d:"Polea desgastada o tallada mayor a factor de deslizamiento de uno (1) (Véase Anexo E NTC 5926-1:2012).",f:"G",na:false},{n:41,d:"Se encuentran uno o más cables hundidos en la polea a diferente nivel que los demás.",f:"L",na:false},{n:42,d:"Falta protección que impida la salida de cables de tracción y/o cables de compensación.",f:"L",na:false},{n:43,d:"Puerta de inspección o socorro con apertura hacia el interior.",f:"MG",na:true},{n:44,d:"Puerta de inspección o socorro no es metálica y/o de alma llena.",f:"L",na:true},{n:45,d:"Puerta de inspección o socorro sin cerradura.",f:"G",na:true},{n:46,d:"Puerta de inspección o socorro no permite el cierre con enclavamiento al no tener la llave.",f:"L",na:true},{n:47,d:"Puerta de inspección o socorro sin contacto eléctrico de seguridad, o que no funcione.",f:"MG",na:true},{n:48,d:"Puerta del cuarto de poleas con cerraduras.",f:"G",na:true},{n:49,d:"Existe interruptor de parada en el cuarto de poleas.",f:"G",na:true},{n:50,d:"Para ascensores sin variador de velocidad, falta detector de inversión o ausencia de fase.",f:"L",na:true},{n:51,d:"Existencia de humedad en cuartos de máquinas, poleas y foso del ascensor.",f:"L",na:false},{n:52,d:"No existe interruptor general tripolar de corte de la alimentación.",f:"MG",na:false},{n:53,d:"Cada interruptor eléctrico (Breaker) no se identifica con el circuito que protege.",f:"G",na:false},{n:54,d:"Cuadro de maniobra con elementos sueltos o sin fijación (contactores, relevos, tarjetas, etc.).",f:"G",na:false},{n:55,d:"Cuadro de maniobra con empalmes sin aislamiento, fusibles puenteados, contactos suplementarios.",f:"MG",na:false},{n:56,d:"Cables con aislamiento deteriorado y/o conductores expuestos.",f:"G",na:false},{n:57,d:"Para ascensores de tracción con capacidad >6 personas: menos de 3 cables. <6 personas: menos de 2 cables.",f:"MG",na:false},{n:58,d:"En cinta de tracción, se presenta fisura, grieta y/o adelgazamiento de la cubierta en 1.5 m.",f:"MG",na:false},{n:59,d:"En ascensor sin cuarto de máquinas, no hay condiciones de rescate según Anexo D NTC 5926-1:2012.",f:"G",na:false},{n:60,d:"Limitador en el hueco del ascensor sin posibilidad de maniobrar (desaplicar) desde el exterior.",f:"G",na:true},{n:61,d:"Siendo el motor de corriente continua, el freno se encuentra alimentado por dicho motor.",f:"G",na:false},{n:62,d:"Faltan pasadores en articulaciones del mecanismo del freno.",f:"G",na:false},{n:63,d:"Ejes de freno en mal estado (desgaste, grietas o roturas de espiras en resortes).",f:"G",na:false},{n:64,d:"Los elementos del freno no son de doble mordaza.",f:"G",na:false},{n:65,d:"Muelles o resortes de freno deformados, fisurados, partidos u oxidados.",f:"G",na:false},{n:66,d:"La presión de frenado no es efectuada con resorte de compresión.",f:"L",na:false},{n:67,d:"Zapatas de freno con aceite.",f:"MG",na:false},{n:68,d:"Zapatas de freno desgastadas hasta un 40%.",f:"L",na:false},{n:69,d:"No es posible acceder o accionar la palanca de freno, o no existe.",f:"G",na:false},{n:70,d:"Falta o no está identificada la palanca de freno para mover el elevador a nivel de planta.",f:"MG",na:false},{n:71,d:"El freno no detiene la cabina.",f:"MG",na:false},{n:72,d:"El freno no funciona en ausencia de corriente eléctrica.",f:"MG",na:false},{n:73,d:"La alimentación del freno es la misma que la del grupo tractor.",f:"G",na:false},{n:74,d:"Falta indicación de sentido de giro en la máquina de tracción.",f:"L",na:false},{n:75,d:"Ausencia de marcas en cables de tracción y/o gobernador para identificar zona de desenclavamiento.",f:"G",na:false},{n:76,d:"Las partes móviles del cuarto de máquina no están identificadas o con marcas distintivas (amarillo).",f:"G",na:false},{n:77,d:"La holgura entre la corona, el sin fin y/o el acople supera 90° de giro en el volante sin moverse la polea.",f:"G",na:true},{n:78,d:"El volante tiene la manivela puesta en operación normal.",f:"MG",na:false},{n:79,d:"El alumbrado no existe, no funciona, o es inferior a 200 LX en cuarto de máquinas o 100 luxes en cuarto de poleas.",f:"G",na:false},{n:80,d:"En zonas circulantes alrededor de pozo parcialmente abierto, existen barreras de protección con altura inferior a 2.5 m a menos de 50 cm de partes móviles.",f:"G",na:true},{n:81,d:"Para ascensores con contrapeso y cabina en el mismo pozo, el contrapeso está guiado mediante cables guía.",f:"MG",na:false},{n:82,d:"No actúan las cuñas del paracaídas.",f:"MG",na:false},{n:83,d:"Cables del limitador inferior a 6 mm de diámetro.",f:"G",na:false},{n:84,d:"Cable de tracción roza con elementos de la instalación del equipo y/o de la obra civil.",f:"G",na:false},{n:85,d:"Cable del limitador roza con elementos de la instalación del equipo y/o de la obra civil.",f:"G",na:false},{n:86,d:"Cable del limitador deteriorado.",f:"MG",na:false},{n:87,d:"Existen empalmes en los cables (limitador velocidad).",f:"MG",na:false},{n:88,d:"Oxidación en cable del regulador de velocidad con desprendimiento de material o destrucción de hilos.",f:"G",na:false},{n:89,d:"Oxidación en cable del regulador con coloración característica del óxido sin pérdida de material.",f:"L",na:false},{n:90,d:"No existe y funciona el contacto eléctrico del limitador.",f:"MG",na:false},{n:91,d:"Limitador inaccesible para mantenimiento e inspección.",f:"G",na:false},{n:92,d:"Limitador oxidado, sin lubricación, desplomado y desajustado, o no anclado firmemente en 2 puntos.",f:"MG",na:false},{n:93,d:"Ausencia de placa de especificaciones del limitador o regulador de velocidad.",f:"L",na:false},{n:94,d:"El ascensor cumple la verificación de prueba del limitador de velocidad (Anexo C, C.1 NTC 5926-1).",f:"MG",na:false},{n:95,d:"El ascensor cumple la verificación de prueba del paracaídas (Anexo C, C.2).",f:"MG",na:false},{n:96,d:"Falla el trinquete del limitador al engancharse.",f:"MG",na:false},{n:97,d:"El desbloqueo del paracaídas requiere la intervención del personal competente.",f:"L",na:false},{n:98,d:"En hueco parcialmente cerrado, no existe cerramiento, corral o balaustrada encima de cabina y/o punto de fijación para arnés.",f:"L",na:false},{n:99,d:"No existe interruptor de parada encima de cabina.",f:"G",na:false},{n:100,d:"No existe o no funciona el conmutador normal/inspección y/o no está plenamente identificado.",f:"G",na:false},{n:101,d:"El techo no soporta sin deformación permanente el peso de dos personas (150 kg).",f:"G",na:false},{n:102,d:"Con el contrapeso sobre sus topes, no hay espacio para paralelepípedo 0.5m x 0.6m x 0.8m encima de cabina.",f:"L",na:false},{n:103,d:"Distancia de actuación del dispositivo eléctrico del final de carrera inferior a 12 cm.",f:"G",na:false},{n:104,d:"El dispositivo eléctrico de final de carrera no se activa antes de que la cabina/contrapeso hagan contacto con el amortiguador.",f:"MG",na:false},{n:105,d:"El interruptor final de carrera no se recupera al bajar o subir la cabina.",f:"G",na:false},{n:106,d:"Al estar activado el interruptor de final de carrera se recupera al moverse lateralmente la cabina.",f:"MG",na:false},{n:107,d:"No existe o no funcionan los dispositivos de final de carrera.",f:"MG",na:false},{n:108,d:"Los finales de carrera no son de apertura mecánica.",f:"G",na:false},{n:109,d:"Amarres de cable de tracción en cabina y/o contrapeso desajustados, sueltos o en mal estado.",f:"MG",na:false},{n:110,d:"Mezcla de diferentes tipos de amarres en los cables de tracción en el mismo punto.",f:"G",na:false},{n:111,d:"Diámetro de los cables de tracción inferior al 10% de su diámetro nominal.",f:"G",na:false},{n:112,d:"Cables con alambres rotos: hilos rotos >50% en un paso, o >2 hilos rotos por torón.",f:"MG",na:false},{n:113,d:"Oxidación en cable con coloración característica del óxido sin pérdida de material.",f:"L",na:false},{n:114,d:"Oxidación en cable con desprendimiento de material o destrucción paulatina de hilos.",f:"G",na:false},{n:115,d:"Existen empalmes en los cables.",f:"MG",na:false},{n:116,d:"Cables con alambres rotos superior a 2 hilos en un metro en el mismo torón (limitador velocidad).",f:"G",na:false},{n:117,d:"Zapata y/o deslizadera de cabina y/o contrapeso en mal estado.",f:"G",na:false},{n:118,d:"La distancia entre órganos móviles y la parte fija no cumple con dimensiones: distancia cabina-contrapeso ≤ 35mm.",f:"G",na:false},{n:119,d:"Al soporte le faltan tuercas y pasadores (contrapeso).",f:"L",na:false},{n:120,d:"Pesas rotas o fracturadas dentro del bastidor y/o sobresaliendo fuera del mismo.",f:"MG",na:false},{n:121,d:"No deberá existir posibilidad de movimiento de las pesas por ausencia de mecanismo de acuñamiento.",f:"MG",na:false},{n:122,d:"En caso de existir poleas sobre el contrapeso, no disponen de elementos para evitar la salida de cables.",f:"G",na:false},{n:123,d:"Las puertas de la cabina no son rígidas.",f:"G",na:false},{n:124,d:"Arranca con puertas de cabina abiertas o al abrirlas no se detiene durante el funcionamiento.",f:"MG",na:false},{n:125,d:"Es posible abrir una puerta sin estar la cabina en la zona de desenclavamiento.",f:"MG",na:false},{n:126,d:"Las cerraduras no pueden abrirse desde el interior del hueco sin necesidad de llave.",f:"G",na:false},{n:127,d:"Oxidación y corrosión en más de un 20% del área del elemento en puertas y/o marcos de acceso.",f:"G",na:false},{n:128,d:"Puertas de acceso, paneles, bisagras o marcos deformadas y afectan el funcionamiento.",f:"G",na:false},{n:129,d:"No hay solidez de la fijación de los marcos a la pared.",f:"G",na:false},{n:130,d:"La puerta de acceso deja excesivas holguras (>6mm operativo, hasta 10mm por desgaste de deslizadoras).",f:"G",na:false},{n:131,d:"Zona de desenclavamiento superior a 35 cm por encima o por debajo del nivel del piso.",f:"G",na:false},{n:132,d:"Distancia entre pisadera de cabina y pisadera de piso excede 35 mm.",f:"G",na:false},{n:133,d:"Distancia entre embrague mecánico de puerta de cabina y pisadera de pasillo es menor a 6 mm.",f:"G",na:false},{n:134,d:"Los elementos de enclavamiento no están encajados al menos 7 mm.",f:"G",na:false},{n:135,d:"El enclavamiento mecánico no es controlado eléctricamente.",f:"MG",na:false},{n:136,d:"En condiciones normales de funcionamiento, puertas de acceso no están cerradas y enclavadas sin la presencia de la cabina.",f:"MG",na:false},{n:137,d:"Contactos eléctricos accesibles desde el exterior (pasillo).",f:"G",na:false},{n:138,d:"Bornes o cables eléctricos mal conectados o con defectos de aislamiento en puertas.",f:"G",na:false},{n:139,d:"Existencia de elementos cortantes en puerta de acceso y recorrido sin puertas en cabina.",f:"MG",na:true},{n:140,d:"Mirilla de puertas rajada con protección (cristal armado, acrílico, malla).",f:"L",na:false},{n:141,d:"Mirilla de puerta rota con hueco.",f:"MG",na:false},{n:142,d:"Mirilla suelta, con mala fijación o desajustada.",f:"G",na:false},{n:143,d:"Las hojas de puertas son de vidrio y no llevan marcas identificativas.",f:"L",na:false},{n:144,d:"Existe piloto de presencia de cabina en puertas ciegas o visibilidad con mirilla.",f:"L",na:false},{n:145,d:"Las hojas de vidrio no llevan marcas identificativas.",f:"L",na:false},{n:146,d:"Para puertas de rescate, existe piloto, indicador o mirilla para detectar presencia de cabina.",f:"L",na:false},{n:147,d:"Hay más de 11 m entre dos paradas continuas sin apertura de socorro.",f:"L",na:true},{n:148,d:"No existencia de puertas en aberturas accesibles al hueco.",f:"G",na:true},{n:149,d:"Cable viajero y/o cordón de maniobra en mal estado.",f:"G",na:false},{n:150,d:"Las guías de la cabina presentan mal estado de fijación, deformaciones, desalineación y/o falta de paralelismo.",f:"L",na:false},{n:151,d:"Instalaciones o elementos ajenas al ascensor en pozo o sala de máquinas.",f:"MG",na:false},{n:152,d:"El hueco se utiliza para ventilación de otras áreas ajenas al ascensor.",f:"L",na:false},{n:153,d:"Agua en el foso con instalación eléctrica y/o mecánica en contacto con ella.",f:"MG",na:false},{n:154,d:"No lleva faldón guardapiés en cabina.",f:"G",na:false},{n:155,d:"No existe o no funciona el contacto de acuñamiento de cabina y/o contrapeso.",f:"MG",na:false},{n:156,d:"Falta o no funciona el dispositivo de control de rotura o aflojamiento del cable del limitador.",f:"G",na:false},{n:157,d:"Polea tensora del limitador roza con la pared y/o el suelo.",f:"G",na:false},{n:158,d:"Amarres del cable del limitador al sistema paracaídas desajustado, suelto o en mal estado.",f:"MG",na:false},{n:159,d:"El paracaídas no lleva cuñas.",f:"MG",na:false},{n:160,d:"Al bastidor y chasis le faltan tuercas o pasadores que afecten su rigidez.",f:"MG",na:false},{n:161,d:"Plataforma de cabina hecha de madera.",f:"G",na:false},{n:162,d:"No existe o no funciona el dispositivo de sobrecarga.",f:"L",na:false},{n:163,d:"En equipos hidráulicos con tracción indirecta sin paracaídas en cabina, actúa válvula de paracaídas en vacío.",f:"MG",na:false},{n:164,d:"En pozo cerrado, puertas de cabina con malla metálica: perforaciones superan 10mm x 6mm o están rotas.",f:"G",na:true},{n:165,d:"En equipos hidráulicos con tracción directa, no actúa la válvula de paracaídas en vacío.",f:"MG",na:false},{n:166,d:"Ausencia de dispositivo contra el sobre-calentamiento del fluido hidráulico.",f:"G",na:false},{n:167,d:"En hueco parcialmente abierto no existe una barrera de protección encima de cabina.",f:"L",na:false},{n:168,d:"La iluminación de los accesos es menor a 50 lux a 1 m del piso y 1 m de la puerta de acceso.",f:"L",na:false},{n:169,d:"Cuando el ascensor queda entre pisos, la distancia máxima entre la pisadera de cabina y el muro no es mayor a 125mm.",f:"L",na:false}],
  asc2021:[{n:1,d:"Puertas de acceso con panel de vidrio sin marcas identificativas o contrastes que prevengan chocar con la superficie.",f:"G",na:false},{n:2,d:"En puertas de acceso de vidrio, el contraste, la banda o marca no es fácilmente visible a 1 metro.",f:"G",na:false},{n:3,d:"Cuando se coloca contraste en puerta de vidrio: menos de 20 mm de alto, o borde inferior >1000 mm, o borde superior <700 mm del piso.",f:"L",na:false},{n:4,d:"La puerta de piso presenta holguras superiores a 10 mm.",f:"G",na:false},{n:5,d:"En condiciones normales, las puertas de acceso no están cerradas y enclavadas sin la presencia de cabina.",f:"MG",na:false},{n:6,d:"Existencia de elementos cortantes en puerta(s) de acceso(s) o en el recorrido cuando no existen puertas de cabina.",f:"MG",na:false},{n:7,d:"Oxidación y corrosión en más de un 20% del área del elemento en puertas y/o marcos de acceso.",f:"G",na:false},{n:8,d:"Puertas de acceso, paneles, bisagras o marcos deformadas y afectan el funcionamiento normal del ascensor.",f:"G",na:false},{n:9,d:"Cerraduras accesibles desde el exterior sin requerir herramientas de apertura.",f:"MG",na:false},{n:10,d:"Cerraduras se encuentran inoperantes.",f:"MG",na:false},{n:11,d:"La serie del circuito de seguridad de puertas no existe, está puenteada o al abrir la puerta no se detiene el ascensor.",f:"MG",na:false},{n:12,d:"Al intentar abrir o mover manualmente las puertas (sin abrirlas) se detiene la cabina.",f:"MG",na:false},{n:13,d:"Bornes o cables eléctricos mal conectados o con defectos de aislamiento en puertas.",f:"G",na:false},{n:14,d:"Los elementos de enclavamiento no están encajados al menos 7 mm.",f:"G",na:false},{n:15,d:"No funciona el sistema de reapertura de las puertas de acceso.",f:"G",na:false},{n:16,d:"El enclavamiento mecánico carece de un dispositivo eléctrico de seguridad que garantice la posición de cierre.",f:"MG",na:false},{n:17,d:"El ascensor arranca con puerta abierta.",f:"MG",na:false},{n:18,d:"Es posible abrir una puerta sin estar la cabina en la zona de desenclavamiento sin herramienta y el ascensor no se detiene.",f:"MG",na:false},{n:19,d:"Para puertas de piso de apertura manual, no existe mirilla o señal luminosa para detectar presencia de cabina.",f:"L",na:false},{n:20,d:"Para puertas de apertura manual con mirilla, ésta no es transparente o tiene protecciones que dificultan la visualización.",f:"L",na:false},{n:21,d:"Para puertas de apertura manual con mirilla, la mirilla se encuentra rota o con huecos.",f:"MG",na:false},{n:22,d:"Para puertas de apertura manual con mirilla, la mirilla se encuentra suelta, con mala fijación o desajustada.",f:"G",na:false},{n:23,d:"La iluminación de las inmediaciones de las puertas de piso es menor a 50 lux al nivel del suelo y a 1 m de la puerta.",f:"L",na:false},{n:24,d:"Zona de desenclavamiento superior a 35 cm por encima o por debajo del nivel de piso.",f:"G",na:false},{n:25,d:"No existe llave de apertura en la edificación o no es accesible.",f:"G",na:false},{n:26,d:"No está plenamente identificada la llave de apertura del ascensor.",f:"G",na:false},{n:27,d:"No existe protocolo para la administración, manejo, custodia, uso y manipulación de la llave de apertura.",f:"G",na:false},{n:28,d:"La puerta de acceso se abre sin requerir llave especificada para el modelo existente del mecanismo.",f:"MG",na:false},{n:29,d:"Las cerraduras no pueden abrirse desde el interior del hueco sin necesidad de llave.",f:"G",na:false},{n:30,d:"Al intentar abrir la puerta (cerrada) en la parte inferior, la holgura excede 30 mm (apertura central) o 45 mm (apertura lateral).",f:"MG",na:false},{n:31,d:"Existen empalmes en los cables.",f:"MG",na:false},{n:32,d:"Cables con alambres rotos: hilos rotos >50% en un mismo paso, o >2 hilos rotos por torón.",f:"MG",na:false},{n:33,d:"En cinta de tracción se presenta al menos una fisura, grieta y/o adelgazamiento de la cubierta en 1.5 m.",f:"MG",na:false},{n:34,d:"Diámetro de cables de tracción inferior en un 6% o más de su diámetro nominal.",f:"G",na:false},{n:35,d:"El número de cables de tracción instalados es inferior al indicado en la placa.",f:"MG",na:false},{n:36,d:"La cabina o el contrapeso se encuentran suspendidos mediante un único cable o cadena, o no son independientes.",f:"MG",na:false},{n:37,d:"Amarres de cable de tracción en cabina y/o contrapeso desajustados, sueltos o en mal estado.",f:"MG",na:false},{n:38,d:"Mezcla de diferentes tipos de amarres en los cables de tracción en el mismo punto.",f:"G",na:false},{n:39,d:"Encima de la cabina no hay espacio suficiente para paralelepípedo rectangular 0.5m x 0.6m x 0.8m.",f:"MG",na:false},{n:40,d:"Sin espacio suficiente encima de cabina para paralelepípedo 0.5m x 0.6m x 0.8m y no existe señal de seguridad.",f:"L",na:false},{n:41,d:"No existe o está deteriorada señal de seguridad indicando el tipo de postura para el espacio de refugio.",f:"L",na:false},{n:42,d:"En el foso no hay espacio suficiente para paralelepípedo 0.5m x 0.6m x 1.0m.",f:"MG",na:false},{n:43,d:"Sin espacio en foso para paralelepípedo 0.5m x 0.6m x 1.0m y no existe señal de seguridad.",f:"L",na:false},{n:44,d:"No existe o está deteriorada señal de seguridad en foso indicando tipo de postura para espacio de refugio.",f:"L",na:false},{n:45,d:"Oxidación en cable con coloración característica del óxido sin pérdida de material.",f:"L",na:false},{n:46,d:"Oxidación en cable con desprendimiento de material o destrucción paulatina de hilos.",f:"G",na:false},{n:47,d:"Cable de tracción roza con elementos de la instalación del equipo y/o de la obra civil.",f:"G",na:false},{n:48,d:"Protección anti-rotación para terminales de cables de tracción: deteriorada, suelta, sin grilletes o pernos.",f:"L",na:false},{n:49,d:"Estando la cabina vacía y subiendo en lenta velocidad, el freno no detiene la cabina al cortar la alimentación.",f:"MG",na:false},{n:50,d:"Faltan pines o pasadores en articulaciones del mecanismo de freno.",f:"G",na:false},{n:51,d:"Ejes y elementos de mecanismo de freno en mal estado (desgaste, grietas, roturas de espiras).",f:"G",na:false},{n:52,d:"No existe dispositivo de parada en posición fácilmente accesible a no más de 1 m del punto de entrada del personal.",f:"G",na:false},{n:53,d:"En ascensores con dos entradas, no existe o no funciona el dispositivo de parada en cada acceso sobre cabina.",f:"G",na:true},{n:54,d:"Los elementos del freno no son de doble mordaza.",f:"G",na:false},{n:55,d:"Muelles o resortes de freno deformados, fisurados, partidos u oxidados.",f:"G",na:false},{n:56,d:"El freno no funciona en ausencia de corriente eléctrica.",f:"MG",na:false},{n:57,d:"La presión de frenado no es efectuada con resorte de compresión.",f:"L",na:false},{n:58,d:"En equipos con maniobra de socorro manual, no existen o no es posible acceder o accionar los medios de maniobra.",f:"MG",na:false},{n:59,d:"En ascensores eléctricos con maniobra de socorro manual: falta indicación del sentido de desplazamiento sobre la máquina.",f:"MG",na:false},{n:60,d:"Zapatas del freno con aceite.",f:"MG",na:false},{n:61,d:"Para ascensores con zapata y freno de tambor, el espesor de las zapatas es igual o menor a 3 mm.",f:"G",na:false},{n:62,d:"Para ascensores con zapata y freno de tambor, existe contacto metálico entre el tambor y el soporte de zapatas.",f:"MG",na:false},{n:63,d:"En ascensores eléctricos con motor de corriente continua, el freno se encuentra alimentado por dicho motor.",f:"G",na:false},{n:64,d:"En equipos con maniobra eléctrica de socorro, no existe o no es posible acceder o accionar el conmutador.",f:"MG",na:false},{n:65,d:"Ausencia de medios para comprobar que la cabina esté en zona de desenclavamiento para maniobra de socorro.",f:"G",na:false},{n:66,d:"La alimentación del freno no es la misma que la del grupo tractor.",f:"G",na:false},{n:67,d:"En ascensores eléctricos con maniobra de socorro manual, cuando los medios para mover la cabina son fijos, la maniobra no consiste en un volante sin radios.",f:"G",na:false},{n:68,d:"La interrupción de la corriente eléctrica del freno electromecánico no es efectuada por al menos dos dispositivos eléctricos independientes.",f:"MG",na:false},{n:69,d:"En ascensores eléctricos con maniobra de socorro manual, la holgura entre la corona y el sin fin supera 90° de giro.",f:"G",na:false},{n:70,d:"En caso de requerir mantenimiento desde una plataforma, ésta no está instalada de forma permanente.",f:"G",na:false},{n:71,d:"Plataforma dentro del recorrido de viaje de la cabina o contrapeso no es retráctil.",f:"MG",na:false},{n:72,d:"La cabina no tiene dispositivo mecánico para inmovilizarla cuando la plataforma está desplegada en el recorrido.",f:"G",na:false},{n:73,d:"Plataforma retráctil no tiene dispositivo eléctrico de seguridad que impida el movimiento de la cabina cuando está desplegada.",f:"MG",na:false},{n:74,d:"Plataforma manipulada fuera del pozo no cuenta con acceso restringido.",f:"MG",na:false},{n:75,d:"Plataforma no está equipada con barandilla o balaustrada conforme a reglamentación vigente de trabajo en alturas.",f:"G",na:false},{n:76,d:"Plataforma tiene perforaciones que superan los 15 mm de diámetro.",f:"G",na:false},{n:77,d:"Cuando el volante para maniobra de socorro es desmontable, no existe o no funciona dispositivo eléctrico que impida funcionamiento normal hasta que sea retirado.",f:"MG",na:false},{n:78,d:"Cable del limitador deteriorado (torones rotos, hilos rotos, reducción de diámetro en su 10%).",f:"MG",na:false},{n:79,d:"Diámetro del cable del limitador inferior a 6 mm o al 6% de su diámetro nominal.",f:"G",na:false},{n:80,d:"Existen empalmes en los cables del limitador.",f:"MG",na:false},{n:81,d:"Cables con alambres rotos superior a 2 hilos en un metro en el mismo torón.",f:"G",na:false},{n:82,d:"Falta o no funciona dispositivo eléctrico de seguridad por rotura o aflojamiento excesivo del cable del limitador.",f:"G",na:false},{n:83,d:"Polea tensora del limitador roza con la pared y/o el suelo.",f:"G",na:false},{n:84,d:"Amarres del cable del limitador al sistema paracaídas desajustado, suelto o en mal estado.",f:"MG",na:false},{n:85,d:"El paracaídas no lleva cuñas.",f:"MG",na:false},{n:86,d:"No actúan las cuñas del paracaídas.",f:"MG",na:false},{n:87,d:"No existe o no funciona el contacto de acuñamiento (mecánico y eléctrico) entre las mordazas del seguro de cabina o contrapeso y sus guías.",f:"MG",na:false},{n:88,d:"En ascensores hidráulicos de acción directa, no actúa la válvula de paracaídas en vacío.",f:"MG",na:false},{n:89,d:"Para ascensores hidráulicos de acción indirecta, no se cuenta con paracaídas actuado por limitador de velocidad o ruptura de cable.",f:"MG",na:false},{n:90,d:"El desbloqueo del paracaídas no requiere la intervención de una persona competente de mantenimiento.",f:"G",na:false},{n:91,d:"Espacios accesibles bajo trayectoria de cabina o contrapeso con circulación de personas, sin muro sólido o paracaídas en contrapeso.",f:"G",na:false},{n:92,d:"No existe o no funciona el contacto eléctrico del limitador.",f:"MG",na:false},{n:93,d:"Limitador inaccesible para mantenimiento e inspección.",f:"G",na:false},{n:94,d:"Cuando el limitador está en el hueco no existe posibilidad de maniobrar (desaplicar) el dispositivo desde el exterior.",f:"G",na:false},{n:95,d:"Cable del limitador roza con elementos de la instalación del equipo y/o de la obra civil.",f:"G",na:false},{n:96,d:"Falla el trinquete del limitador al engancharse.",f:"MG",na:false},{n:97,d:"Limitador oxidado, sin lubricación, desplomado, desajustado, con brea en su ranura o no anclado firmemente en 2 puntos.",f:"MG",na:false},{n:98,d:"Ausencia de placa metálica de especificaciones del limitador de velocidad.",f:"L",na:false},{n:99,d:"El ascensor no cumple la verificación de prueba del limitador de velocidad (Anexo C, C.1).",f:"MG",na:false},{n:100,d:"El ascensor no cumple la verificación de prueba del paracaídas (Anexo C, C.2).",f:"MG",na:false},{n:101,d:"En pozo parcialmente cerrado o con distancia >850 mm entre borde exterior del techo de cabina y muro del pozo, no existe balaustrada sobre techo de cabina.",f:"L",na:false},{n:102,d:"En pozo parcialmente cerrado, la altura de la barandilla y del zócalo no cumplen con 1.10 m y 0.10 m respectivamente.",f:"G",na:false},{n:103,d:"Plataforma de cabina hecha de madera.",f:"G",na:false},{n:104,d:"No existen orificios de ventilación en la parte alta y/o baja de la cabina.",f:"G",na:false},{n:105,d:"Es posible atravesar las paredes de la cabina desde el interior a través de orificios de ventilación de fácil acceso.",f:"L",na:false},{n:106,d:"Paredes de la cabina no rígidas. Para cabinas en madera, zonas podridas, mal fijadas o con síntomas de defecto.",f:"G",na:false},{n:107,d:"No existe o no funciona el dispositivo de sobrecarga.",f:"L",na:false},{n:108,d:"No existe interruptor de parada encima de la cabina o se desactiva de forma involuntaria.",f:"G",na:false},{n:109,d:"Zapata y/o deslizadera de cabina y/o contrapeso en mal estado.",f:"G",na:false},{n:110,d:"Guardaescoba o zócalo en mal estado (oxidado, suelto, deteriorado, roto).",f:"L",na:false},{n:111,d:"Distancia entre pisadera de cabina y pisadera de piso excede 35 mm.",f:"G",na:false},{n:112,d:"En la cabina no existe faldón guardapiés o su altura es inferior a 750 mm o no es rígido.",f:"G",na:false},{n:113,d:"En ascensores sin puertas en cabina, el acceso no está provisto de sensor de proximidad con cobertura mínima de 1800 mm de altura.",f:"G",na:false},{n:114,d:"En ascensores sin puertas en cabina, el acceso no está provisto de señalización.",f:"G",na:false},{n:115,d:"En ascensores sin puerta de cabina, no existe o no funciona un interruptor biestable tipo hongo entre 900 mm y 1200 mm de altura.",f:"MG",na:false},{n:116,d:"Las puertas de la cabina no son rígidas y/o presentan deformación permanente que afecte el funcionamiento.",f:"G",na:false},{n:117,d:"En puertas de cabina de vidrio, no existe contraste, banda o marca.",f:"G",na:false},{n:118,d:"El contraste, la banda o marca no es fácilmente visible a una distancia de un metro.",f:"G",na:false},{n:119,d:"En puertas de cabina de vidrio, la banda o marca tiene menos de 20 mm de alto, o borde inferior >1000 mm, o borde superior <700 mm del piso.",f:"G",na:false},{n:120,d:"Puertas de cabina no retroceden frente a un obstáculo por contacto o proximidad.",f:"G",na:false},{n:121,d:"No existe o no funciona el pulsador de apertura de puertas automáticas en botonera de cabina.",f:"G",na:false},{n:122,d:"No existe o no funciona el conmutador Normal/inspección y/o no está plenamente identificado.",f:"G",na:false},{n:123,d:"Los pulsadores de marcha de la maniobra de inspección no dependen de presión constante para dar movimiento a la cabina.",f:"G",na:false},{n:124,d:"Cuando existe puerta de socorro entre cabinas adyacentes, la distancia horizontal entre ellas excede 750 mm.",f:"MG",na:true},{n:125,d:"No existe placa que identifique capacidad máxima de carga en cabina (kg y/o pasajeros).",f:"L",na:false},{n:126,d:"Al bastidor o chasis le faltan tuercas o pasadores que afecten su rigidez.",f:"MG",na:false},{n:127,d:"Para trampillas de socorro en techo de cabina y puertas de socorro, no existe medio de enclavamiento manual controlado eléctricamente.",f:"L",na:false},{n:128,d:"Trampilla de socorro en techo de cabina o puerta de socorro no se puede abrir sin llave desde el exterior de cabina.",f:"MG",na:false},{n:129,d:"Trampilla de socorro en techo de cabina se abre hacia el interior de la cabina.",f:"G",na:false},{n:130,d:"Puerta de socorro entre cabinas adyacentes se abre hacia el exterior de la cabina.",f:"G",na:false},{n:131,d:"Puerta de socorro entre cabinas adyacentes está en el recorrido de un contrapeso o obstáculo fijo que impide el paso.",f:"MG",na:false},{n:132,d:"La puerta de cabina presenta holguras superiores a 10 mm.",f:"G",na:false},{n:133,d:"El ascensor arranca con puertas de cabina abiertas, o al abrirlas no se detiene durante el funcionamiento normal.",f:"G",na:false},{n:134,d:"No existe o no funciona una fuente de alimentación eléctrica de emergencia para lampara auxiliar en cabina.",f:"G",na:false},{n:135,d:"Las puertas de cabina no son de alma llena.",f:"G",na:false},{n:136,d:"La cabina no se encuentra completamente cerrada por sus paredes o éstas no son de alma llena.",f:"G",na:false},{n:137,d:"No existe o no funciona la iluminación encima del techo de cabina de al menos 50 luxes medidos a 1 m del techo.",f:"G",na:false},{n:138,d:"Al soporte le faltan tuercas o pasadores, o están en mal estado.",f:"MG",na:false},{n:139,d:"El paracaídas de contrapeso no actúa (cuando le aplica).",f:"MG",na:false},{n:140,d:"Pesas rotas o fracturadas dentro del bastidor y/o sobresaliendo fuera del mismo con menos de 25 mm de distancia entre cabina y contrapeso.",f:"MG",na:false},{n:141,d:"Existe posibilidad de movimiento de las pesas por ausencia de mecanismo de acuñamiento.",f:"MG",na:false},{n:142,d:"Poleas sobre el contrapeso sin elementos necesarios para evitar la salida de cables.",f:"G",na:false},{n:143,d:"Para ascensores con contrapeso y cabina en el mismo pozo, el contrapeso está guiado mediante cables guía.",f:"MG",na:false},{n:144,d:"Alguno de los dispositivos de parada (Stop) presentes en diferentes ubicaciones del equipo se desactiva de forma involuntaria.",f:"MG",na:false},{n:145,d:"Cable viajero y/o cordón de maniobra en mal estado.",f:"G",na:false},{n:146,d:"No existe o no funcionan los dispositivos de final de recorrido en ambos extremos.",f:"MG",na:false},{n:147,d:"Al activar el final de recorrido, no se bloquea el equipo en ambas direcciones.",f:"G",na:false},{n:148,d:"Después del accionamiento del dispositivo de final de recorrido, la puesta en servicio del ascensor se produce de manera automática.",f:"G",na:false},{n:149,d:"El dispositivo eléctrico de final de recorrido no se activa antes de que la cabina/contrapeso hagan contacto con el amortiguador.",f:"G",na:false},{n:150,d:"El interruptor final de recorrido no recupera su estado de reposo al bajar o subir la cabina.",f:"MG",na:false},{n:151,d:"Al estar activado el interruptor de final de recorrido, éste se recupera al moverse lateralmente la cabina.",f:"G",na:false},{n:152,d:"No se puede actuar sobre los dispositivos eléctricos de seguridad de parada de emergencia y/o no son accesibles.",f:"G",na:false},{n:153,d:"No existe o no funciona el dispositivo de comunicación vocal bidireccional para petición de socorro.",f:"G",na:false},{n:154,d:"En ascensores con intercomunicador: el equipo de recepción no existe, no funciona o es inaudible.",f:"G",na:false},{n:155,d:"El dispositivo de comunicación vocal bidireccional y la alarma acústica no son autónomos (sin batería) o la batería no es de recarga automática.",f:"G",na:false},{n:156,d:"En ascensores con intercomunicador sin personal 24h, no existe o no funciona señal sonora de emergencia (alarma acústica).",f:"G",na:false},{n:157,d:"Ascensores con alarma acústica: no existe o no funciona el dispositivo que emite la señal sonora.",f:"G",na:false},{n:158,d:"En ascensores con intercomunicador, el equipo de recepción no está plenamente identificado con el ascensor al que corresponde.",f:"L",na:false},{n:159,d:"No existe dispositivo de intercomunicación en el cuarto de máquinas para ascensores con recorrido mayor a 30 m.",f:"G",na:false},{n:160,d:"En zonas accesibles alrededor de pozos parcialmente cerrados: no existen cerramientos, o tienen altura inferior a 2.5 m a menos de 50 cm de partes móviles.",f:"G",na:false},{n:161,d:"Para equipos con accesos a la intemperie, no existe protección que garantice que las partes eléctricas no se vean afectadas por situaciones atmosféricas.",f:"G",na:false},{n:162,d:"Cada interruptor eléctrico (Breaker) no se identifica con el circuito que protege.",f:"G",na:false},{n:163,d:"Amortiguadores oxidados, fisurados, sueltos.",f:"MG",na:false},{n:164,d:"No existen topes elásticos, de resorte o hidráulicos para la cabina y contrapeso.",f:"MG",na:false},{n:165,d:"En amortiguadores hidráulicos, el nivel de aceite está por fuera de la marca.",f:"G",na:false},{n:166,d:"No tiene o no actúa el dispositivo eléctrico de seguridad en amortiguadores hidráulicos.",f:"L",na:false},{n:167,d:"No se recupera el amortiguador hidráulico luego de comprimirse.",f:"MG",na:false},{n:168,d:"La cabina y sus elementos asociados se encuentran a menos de 25 mm de distancia del contrapeso y sus elementos asociados.",f:"G",na:false},{n:169,d:"Puerta de inspección o socorro con apertura hacia el interior.",f:"MG",na:false},{n:170,d:"Puerta de inspección o socorro no es metálica o de alma llena.",f:"L",na:false},{n:171,d:"Puerta de inspección o de socorro no está provista de cerradura con llave que permita el cierre y enclavamiento sin llave.",f:"G",na:false},{n:172,d:"Puerta de inspección o de socorro no se puede abrir sin llave desde el interior del pozo.",f:"G",na:false},{n:173,d:"Puerta de inspección o socorro sin contacto eléctrico de seguridad, o que no funcione.",f:"MG",na:false},{n:174,d:"Para casos con más de 11 m entre quicios consecutivos, no existe puerta de socorro intermedia, puerta de socorro entre cabinas, o sistema autónomo de socorro.",f:"L",na:true},{n:175,d:"El cerramiento del pozo presenta aberturas con dimensión mayor a 4 mm sin satisfacer la distancia de seguridad de la Tabla 1.",f:"G",na:true},{n:176,d:"En ascensores con pozo compartido, no existe separación entre partes móviles de los distintos ascensores.",f:"G",na:false},{n:177,d:"En ascensores con pozo compartido: distancia horizontal entre borde del techo de cabina y parte móvil adyacente es menor de 0.5 m sin separación.",f:"G",na:false},{n:178,d:"Agua en el foso con instalación eléctrica en contacto con ella.",f:"MG",na:false},{n:179,d:"Agua en el foso sin instalaciones eléctricas en contacto con ella.",f:"G",na:false},{n:180,d:"Instalación de bombas en foso no cuenta con tapa que evite caída o no permite manipulación desde el exterior del foso.",f:"G",na:true},{n:181,d:"Foso con profundidad superior a 0.50 m sin escalera.",f:"L",na:false},{n:182,d:"Falta o no funciona un dispositivo de parada eléctrico de seguridad biestable accesible desde la(s) puerta(s) de acceso al foso y desde el fondo del foso.",f:"G",na:false},{n:183,d:"Para fosos de profundidad superior a 1.60 m, no existe o no funciona un segundo dispositivo de parada accesible desde el fondo.",f:"G",na:false},{n:184,d:"Las guías de la cabina presentan mal estado de fijación, deformaciones, desalineación y/o falta de paralelismo.",f:"L",na:false},{n:185,d:"Instalaciones o elementos en pozo o sala de máquinas no destinadas exclusivamente al servicio del ascensor.",f:"G",na:false},{n:186,d:"No existencia de puertas en las aberturas accesibles por las personas al hueco.",f:"G",na:false},{n:187,d:"No hay rigidez de la fijación de los marcos de las entradas piso a los muros.",f:"G",na:false},{n:188,d:"El hueco se utiliza para ventilación de otras áreas ajenas al ascensor.",f:"L",na:false},{n:189,d:"Existencia de humedades o goteras en techo y paredes del pozo.",f:"L",na:false},{n:190,d:"En ascensores sin cuarto de máquinas, no es posible realizar apertura del freno de forma remota para maniobra de rescate.",f:"G",na:false},{n:191,d:"En ascensores sin cuarto de máquinas con apertura del freno por batería: la batería no está conectada o su carga es inferior a la indicada en su placa.",f:"MG",na:false},{n:192,d:"En ascensores sin cuarto de máquinas con llave de seguridad especial para rescate, no existe o no funciona.",f:"G",na:false},{n:193,d:"En ascensores sin cuarto de máquinas con apertura del freno por medios mecánicos, no es posible accionar dichos mecanismos.",f:"G",na:false},{n:194,d:"Distancia entre embrague mecánico de puerta de cabina y la pisadera de pasillo es menor a 6 mm.",f:"G",na:false},{n:195,d:"Para puertas de enclavamiento manual, la distancia horizontal entre la superficie interior de la pared frontal del pozo y la pisadera de cabina excede 150 mm.",f:"L",na:false},{n:196,d:"No existe o no funciona la iluminación del foso de al menos 50 luxes medidos a 1 m del fondo.",f:"G",na:false},{n:197,d:"Para puertas de trampa, no existe cartel visible donde indique permanentemente 'Peligro de caída - cerrar la trampilla'.",f:"L",na:false},{n:198,d:"Se encuentran uno o más cables de tracción hundidos completamente en la canal respectiva.",f:"L",na:false},{n:199,d:"En ascensores con sala de máquinas, el desgaste de canales de la polea ocasiona deslizamiento excesivo de los cables.",f:"MG",na:false},{n:200,d:"Falta un dispositivo en las poleas que evite la salida de los cables/cadenas de sus gargantas en caso de aflojamiento.",f:"L",na:false},{n:201,d:"Para ascensores sin variador de velocidad en el motor principal, falta detector de inversión o ausencia de fase.",f:"L",na:true},{n:202,d:"Puerta del cuarto de máquinas sin cerradura, o la puerta no puede abrirse desde el interior sin necesidad de llave.",f:"G",na:false},{n:203,d:"Puerta del cuarto de poleas sin cerradura, o la puerta no puede abrirse desde el interior sin necesidad de llave.",f:"G",na:true},{n:204,d:"No existe inscripción de acceso prohibido.",f:"L",na:false},{n:205,d:"El alumbrado no existe, no funciona o es inferior a 200 luxes en las principales áreas de trabajo o menor de 100 luxes en el cuarto de poleas.",f:"G",na:false},{n:206,d:"No existe dispositivo de parada eléctrico de seguridad biestable en la máquina o no existe interruptor principal accesible dentro de 1 m de radio.",f:"G",na:false},{n:207,d:"Cuadro de maniobra con elementos sueltos o sin fijación.",f:"G",na:false},{n:208,d:"Cuadro de maniobra con empalmes sin aislamiento, fusibles puenteados, contactos suplementados.",f:"MG",na:false},{n:209,d:"No existe interruptor automático general tripolar de corte de la alimentación.",f:"MG",na:false},{n:210,d:"El circuito de alimentación del alumbrado de cabina, pozo y espacios de maquinaria no es independiente del circuito de la máquina.",f:"L",na:false},{n:211,d:"Cables con aislamiento deteriorado y/o conductores expuestos.",f:"G",na:false},{n:212,d:"No se tiene acceso al cuarto de máquinas y/o el acceso incumple la reglamentación vigente de trabajo en alturas.",f:"G",na:false},{n:213,d:"El cuarto de máquinas es utilizado como bodega o para fines diferentes al funcionamiento del ascensor.",f:"G",na:false},{n:214,d:"Existen goteras o humedades en el cuarto de máquinas o poleas.",f:"G",na:false},{n:215,d:"Las partes móviles del cuarto de máquina no están identificadas o con marcas distintivas (pintadas de amarillo).",f:"G",na:false},{n:216,d:"En ascensores hidráulicos, no existe o no funciona un dispositivo contra el sobrecalentamiento del fluido hidráulico.",f:"G",na:false},{n:217,d:"Oxidación en cable del limitador de velocidad con coloración característica del óxido sin pérdida de material.",f:"L",na:false},{n:218,d:"Oxidación en cable del limitador de velocidad con desprendimiento de material o destrucción paulatina de hilos.",f:"G",na:false},{n:219,d:"Acceso al cuarto de máquina por escalera no estructural con condiciones inseguras (fijación, línea de vida, agarradero, puntos de apoyo).",f:"G",na:false},{n:220,d:"Cuarto de máquinas con varios niveles de piso (diferencia >1.5 m) sin peldaños o escalones y guarda cuerpos.",f:"G",na:false},{n:221,d:"No está cubierto espacio hendido con profundidad >0.5 m y ancho <0.5 m en el suelo del cuarto de máquinas.",f:"G",na:false},{n:222,d:"No existe empresa encargada del mantenimiento ni conservación del aparato (contrato, bitácora, reporte técnico, etc.).",f:"G",na:false}],
  escram:[{n:1,d:"Los elementos de la escalera o andén móvil movidos mecánicamente no están completamente encerrados por paredes o paneles perforados.",f:"MG",na:false},{n:2,d:"Presencia de grietas en los puntos de apoyo de la estructura de la escalera o andén móvil.",f:"G",na:false},{n:3,d:"No hay señalización sobre el uso adecuado de la escalera (véase anexo B).",f:"MG",na:false},{n:4,d:"Las tapas de los embarques están perforadas.",f:"MG",na:false},{n:5,d:"Existe separación mayor a 3 mm (horizontalmente) entre el embarque de la escalera o andén móvil y el piso terminado de la edificación.",f:"G",na:false},{n:6,d:"Existe diferencia de altura mayor a 5 mm entre el nivel del embarque y el nivel de piso terminado de la edificación.",f:"G",na:false},{n:7,d:"Hay acumulación de materiales en los embarques (grasa, aceite, polvo, papel) que representa un riesgo de caída.",f:"G",na:false},{n:8,d:"No es posible acceder y/o ingresar a los embarques.",f:"G",na:false},{n:9,d:"Los espacios de maquinaria no están bloqueados y son accesibles a personal no autorizado.",f:"MG",na:false},{n:10,d:"La superficie pisable del escalón no está horizontal (la gota del nivel está fuera de la línea de tolerancia).",f:"MG",na:false},{n:11,d:"La escalera mecánica supera el ángulo de inclinación de 30°.",f:"MG",na:false},{n:12,d:"El ángulo de inclinación de los andenes móviles sobrepasa los 12°.",f:"MG",na:true},{n:13,d:"La superficie pisable para andenes tiene una tolerancia máxima de 3° respecto del ángulo de la rampa a la entrada o salida.",f:"G",na:true},{n:14,d:"Existe una diferencia de nivel vertical entre dos escalones consecutivos en la zona de transporte de usuario superior a 4mm.",f:"G",na:false},{n:15,d:"El desplazamiento lateral de los escalones o placas fuera de su sistema de guiado supera 4 mm en cada lado y 7mm para la suma.",f:"MG",na:false},{n:16,d:"En andenes móviles de banda continua, los soportes para la zona pisable no están colocados a intervalos superiores a 2 m.",f:"G",na:true},{n:17,d:"La distancia entre dos escalones consecutivos o placas medida en la superficie pisable es mayor de 6 mm.",f:"G",na:false},{n:18,d:"No existen demarcaciones para remarcar en los rellanos el borde trasero de los escalones.",f:"L",na:false},{n:19,d:"La velocidad de funcionamiento supera un 20% la de la velocidad nominal.",f:"MG",na:false},{n:20,d:"La velocidad nominal en vacío de la escalera mecánica es superior a 0.75 m/s (para α ≤30°) o 0.50 m/s (para α entre 30° y 35°).",f:"G",na:false},{n:21,d:"La velocidad de los pasamanos tiene una desviación de velocidad superior o igual al ±15% relativa a la velocidad de los escalones.",f:"MG",na:false},{n:22,d:"Andén con desplazamiento horizontal en rellano inferior a 1.60 m: la velocidad nominal supera los 0.75 m/s.",f:"G",na:true},{n:23,d:"Andén con desplazamiento horizontal superior a 1.60 m y ancho de placa inferior a 1.10 m: la velocidad nominal supera los 0.90 m/s.",f:"G",na:true},{n:24,d:"El movimiento de las placas en el área utilizable no es paralelo.",f:"G",na:true},{n:25,d:"Falta una o las dos balaustradas a cada lado de la escalera mecánica o andén móvil.",f:"MG",na:false},{n:26,d:"Las balaustradas existentes representan un riesgo para los usuarios (caídas, cortes, obstáculos).",f:"G",na:false},{n:27,d:"Las balaustradas tienen partes sobre las que una persona pueda estar de pie normalmente.",f:"MG",na:false},{n:28,d:"En el exterior de las balaustradas es posible que una persona se desplace.",f:"MG",na:false},{n:29,d:"Cada balaustrada no está provista de un pasamano que se desplace en la misma dirección que los escalones.",f:"MG",na:false},{n:30,d:"La parte de la balaustrada frente a los escalones, placas o bandas no son lisas.",f:"G",na:false},{n:31,d:"Las uniones entre las partes que conforman la balaustrada superan los 4 mm de anchura.",f:"G",na:false},{n:32,d:"Los tapajuntas o listones situados en la dirección de marcha sobresalen más de 3 mm, no son suficientemente rígidos y no tienen bordes redondeados.",f:"G",na:false},{n:33,d:"Las faldillas no son verticales, planas ni unidas a tope.",f:"G",na:false},{n:34,d:"La distancia perpendicular h2 entre el borde superior de las faldillas y la línea de la nariz de los escalones es inferior a 25 mm.",f:"G",na:false},{n:35,d:"En escaleras mecánicas, no se reduce la posibilidad de quedar enganchado entre las faldillas y los escalones.",f:"G",na:false},{n:36,d:"Cuando las faldillas de andenes móviles terminan por encima de las placas o banda, la holgura es mayor de 4 mm verticalmente.",f:"MG",na:true},{n:37,d:"Los perfiles de los pasamanos y sus guías tienen posibilidad de que dedos o manos queden pinzados o enganchados.",f:"MG",na:false},{n:38,d:"La distancia entre el perfil del pasamanos y los perfiles de guiado o revestimiento son superiores a 8mm de anchura.",f:"MG",na:false},{n:39,d:"En el punto de entrada de los pasamanos en la cabeza de la balaustrada, no existe una defensa que evite atrapamiento de dedos y manos.",f:"MG",na:false},{n:40,d:"Los pasamanos no están guiados ni tensados de forma que salen de sus guías durante su uso normal.",f:"MG",na:false},{n:41,d:"No se cumple con el área libre mínima definida alrededor de la escalera mecánica o andén móvil.",f:"G",na:false},{n:42,d:"En intersecciones con pisos y escaleras entrecruzadas, no existe sobre el nivel del pasamanos un deflector vertical de altura inferior a 0.30 m.",f:"MG",na:false},{n:43,d:"En entradas y salidas de escaleras mecánicas y andenes móviles, no hay espacio libre suficiente para acomodar a los pasajeros.",f:"G",na:false},{n:44,d:"Donde la salida de una escalera mecánica esté bloqueada por elementos estructurales, no existe pulsador de parada adicional a nivel del pasamanos.",f:"G",na:false},{n:45,d:"En la parte inclinada, la altura vertical h1 desde la nariz del escalón hasta la zona superior del pasamanos es inferior a 0.90 m o superior a 1.10 m.",f:"G",na:false},{n:46,d:"La altura libre por encima de los escalones de la escalera mecánica o las placas o banda, en todos los puntos, es menor a 2.30 m.",f:"L",na:false},{n:47,d:"En los rellanos, los escalones de la escalera eléctrica no están o salen guiados.",f:"G",na:false},{n:48,d:"En el área de los peines, no existe un correcto encaje de los dientes del peine con las ranuras de la superficie pisable.",f:"G",na:false},{n:49,d:"La banda (suelo de algunos andenes móviles) no está sustentada en el área de peines de manera adecuada.",f:"G",na:true},{n:50,d:"No existen barreras permanentes que eviten situaciones de caída sobre la balaustrada.",f:"MG",na:false},{n:51,d:"No existe y/o no funciona el dispositivo de seguridad que detiene la escalera o andén móvil cuando cuerpos extraños son atrapados en las entradas de los pasamanos.",f:"MG",na:false},{n:52,d:"No existe un interruptor de parada en las estaciones de accionamiento y retorno.",f:"MG",na:false},{n:53,d:"Este interruptor de emergencia en escalera mecánica o andén móvil bloqueada por elementos estructurales, no es accesible desde adentro.",f:"G",na:false},{n:54,d:"El funcionamiento de los interruptores de arranque y parada no provoca el corte de alimentación de la máquina de tracción y/o no permite que el freno sea efectivo.",f:"MG",na:false},{n:55,d:"Una vez activado el interruptor de parada, no hay impedimento para que la escalera mecánica o el andén móvil puedan ponerse en marcha.",f:"MG",na:false},{n:56,d:"Las posiciones del interruptor de arranque y parada no están marcadas claramente y de manera permanente.",f:"G",na:false},{n:57,d:"La dirección de marcha no es claramente reconocible y/o no está identificada por la indicación del interruptor.",f:"G",na:false},{n:58,d:"Existe filtración de agua en los embarques de escaleras de uso interior.",f:"G",na:false},{n:59,d:"Los espacios de maquinaria dentro del bastidor son accesibles sin herramientas a personal no autorizado.",f:"MG",na:false},{n:60,d:"Recintos para la máquina y estaciones se utilizan para colocar equipo no necesario para el funcionamiento del equipo.",f:"MG",na:false},{n:61,d:"En los casos en que el armario de maniobra se tenga que mover para mantenimiento, este no tiene las sujeciones adecuadas para su elevación.",f:"L",na:false},{n:62,d:"Teniendo rejillas de ventilación, es posible introducir una varilla rígida mayor a 10 mm de diámetro a través del cerramiento.",f:"MG",na:false},{n:63,d:"La interrupción de la alimentación eléctrica no es efectuada por al menos dos circuitos eléctricos independientes.",f:"MG",na:false},{n:64,d:"Es posible volver arrancar la escalera o el andén móvil luego de accionar uno de los circuitos independientes.",f:"MG",na:false},{n:65,d:"La apertura del freno electromecánico no se efectúa por acción permanente de una corriente eléctrica en condiciones normales.",f:"MG",na:false},{n:66,d:"El funcionamiento del freno no actúa inmediatamente después de abrirse el circuito de freno eléctrico.",f:"MG",na:false},{n:67,d:"La fuerza del freno no se genera por muelle(s) guiado(s) de compresión.",f:"MG",na:false},{n:68,d:"La escalera o andén móvil cuenta con un sistema de acople entre el freno de servicio y el accionamiento por elementos de fricción.",f:"MG",na:false},{n:69,d:"En caso de contar con freno auxiliar, este no es de tipo mecánico (fricción).",f:"MG",na:false},{n:70,d:"El freno auxiliar no actúa antes de que la velocidad supere 1.4 veces la nominal o cuando los escalones cambien su dirección de movimiento.",f:"MG",na:false},{n:71,d:"En caso de disponer de dispositivo de maniobra manual, esta no se encuentra accesible y su uso presenta riesgos.",f:"G",na:false},{n:72,d:"Las escaleras mecánicas o los andenes móviles no están equipados con maniobras de inspección portátiles.",f:"G",na:false},{n:73,d:"Los dispositivos de maniobra no están protegidos contra accionamiento accidental.",f:"MG",na:false},{n:74,d:"El dispositivo de maniobra no tiene interruptor de parada de emergencia (STOP).",f:"MG",na:false},{n:75,d:"El interruptor de parada de emergencia en la unidad de maniobra de inspección no es activable manualmente, no es de rearme manual, o no interrumpe la alimentación.",f:"MG",na:false},{n:76,d:"Conectados más de un dispositivo de maniobra, el equipo funciona.",f:"MG",na:false},{n:77,d:"En escaleras mecánicas o andenes móviles interiores la iluminación es inferior a 50 lux en la línea de intersección del peine a nivel del suelo.",f:"G",na:false},{n:78,d:"Los espacios de maquinaria no cuentan con iluminación eléctrica permanente: mínimo 200 lux en áreas de trabajo y 50 lux en rutas de acceso.",f:"G",na:false},{n:79,d:"Los escalones de las escaleras mecánicas son accionados por una sola cadena.",f:"G",na:false},{n:80,d:"Las cadenas no están tensionadas.",f:"G",na:false},{n:81,d:"Los elementos de tensión de banda no quedan sujetos de forma segura si se rompe su suspensión.",f:"G",na:false},{n:82,d:"No existe y/o no funciona ningún dispositivo para detectar ruptura o elongación excesiva de componentes de accionamiento de los escalones.",f:"G",na:false},{n:83,d:"Una vez activado el dispositivo que detecta rotura o elongación excesiva de componentes, el funcionamiento de la escalera o andén es permitido.",f:"MG",na:false},{n:84,d:"Los peines no están montados en ambos rellanos para facilitar la transición de los pasajeros. Los peines no son reemplazables.",f:"MG",na:false},{n:85,d:"Los extremos de los peines no están redondeados (tienen cantos vivos) y/o están conformados de manera que existe riesgo de enganche.",f:"G",na:false},{n:86,d:"La forma e inclinación de los dientes del peine obstaculizan o atrapan los pies de los pasajeros.",f:"MG",na:false},{n:87,d:"La profundidad de encaje h8 de los peines en las ranuras de la superficie pisable es inferior a 3.8 mm. La holgura h6 es mayor a 4mm.",f:"G",na:false},{n:88,d:"Algún peine tiene dos o más dientes consecutivos partidos.",f:"MG",na:false},{n:89,d:"Ausencia o daño de más del 10% del número total de dientes de los peines en un embarque.",f:"MG",na:false},{n:90,d:"Los dispositivos de seguridad existentes no funcionan o no se encuentran asegurados, permitiendo la extensión o reducción de la distancia entre el dispositivo y su actuador.",f:"MG",na:false},{n:91,d:"Las distancias de parada de escaleras mecánicas sin carga y bajando con carga no están comprendidas entre los valores de la tabla.",f:"MG",na:false},{n:92,d:"Las distancias de frenado para andenes móviles sin carga o cargados no están comprendidas entre los valores de la tabla.",f:"MG",na:true},{n:93,d:"La velocidad nominal en vacío se desvía más de un ±5% a la frecuencia y voltaje nominales.",f:"L",na:false}],
  puertas:[{n:1,d:"No se cumplen las holguras, las distancias de seguridad ni las medidas de protección establecidos en las figuras 1 al 11.",f:"G",na:false},{n:2,d:"Existen elementos cortantes (vidrios sin pulir, aristas vivas, entre otros) en las hojas de la puerta.",f:"MG",na:false},{n:3,d:"Las partes expuestas de los bordes y las barras sensibles a la presión tienen aristas agudas o ángulos susceptibles de herir a personas.",f:"MG",na:false},{n:4,d:"Es posible acceder al mecanismo sin una llave o herramienta.",f:"G",na:false},{n:5,d:"Se evidencia oxidación o corrosión en más de 20% del área de las hojas o el marco de la puerta.",f:"L",na:false},{n:6,d:"Las hojas de la puerta, las bisagras o los marcos están deformadas y afectan el funcionamiento normal.",f:"MG",na:false},{n:7,d:"Las poleas están desalineadas con respecto al cable.",f:"L",na:true},{n:8,d:"Las poleas están sin engrasar.",f:"G",na:true},{n:9,d:"Los muelles o los resortes de freno deformados, fisurados, partidos u oxidados.",f:"G",na:true},{n:10,d:"Las bisagras están sueltas.",f:"G",na:true},{n:11,d:"Los cojinetes fisurados o partidos.",f:"G",na:false},{n:12,d:"Se evidencia deformación de las guías y los topes.",f:"G",na:false},{n:13,d:"Las guías de deslizamiento de la hoja móvil presentan corte o interrupción.",f:"G",na:true},{n:14,d:"Se evidencia oxidación en el cable con desprendimiento de material o destrucción paulatina de hilos.",f:"G",na:true},{n:15,d:"Los cables de alambre de acero no son accesibles para inspección y mantenimiento a lo largo de toda su longitud.",f:"G",na:true},{n:16,d:"Existen empalmes en los cables.",f:"G",na:true},{n:17,d:"Se evidencia falla en la sujeción del sujeta cables.",f:"G",na:true},{n:18,d:"Existen puntos de soldadura sueltos.",f:"G",na:false},{n:19,d:"Existen remaches sueltos.",f:"G",na:false},{n:20,d:"Se evidencia falta de elasticidad en cauchos protectores o presencia de rotura.",f:"G",na:false},{n:21,d:"La puerta presenta pérdida de estabilidad, caída de piezas, caída de la hoja.",f:"MG",na:false},{n:22,d:"Existe riesgo de arrastre, enganche o corte provocados por la forma de la hoja móvil.",f:"G",na:false},{n:23,d:"En sistemas de suspensión con correas, éstas no son accesibles para inspección o sustitución.",f:"G",na:true},{n:24,d:"No existen medios para prevenir que las correas se desenganchen accidentalmente.",f:"G",na:true},{n:25,d:"En puertas hidráulicas, no existe medios para proteger los equipos de la sobrepresiones ni medios para medir la conexión de un dispositivo de medición.",f:"G",na:false},{n:26,d:"No existen dispositivos como manivelas, manijas o tiradores de cuerdas sobre la parte interna y/o externa de la puerta que faciliten su movimiento manual.",f:"G",na:false},{n:27,d:"Los dispositivos como manivelas, manijas o tiradores presentan riesgo de que las personas y/o sus vestidos queden sujetos cuando pasan por la puerta abierta.",f:"G",na:false},{n:28,d:"Las guías o los recorridos no están cubiertos por guarniciones apropiadas hasta una altura de 2.5 m sobre el nivel del suelo.",f:"G",na:true},{n:29,d:"La entrada de los contrapesos no es segura dentro de sus cubiertas.",f:"G",na:true},{n:30,d:"Existe movimiento involuntario y peligroso de la hoja de puerta si falla un elemento de suspensión del contrapeso.",f:"G",na:true},{n:31,d:"Existe peligro para el edificio o personas en sus proximidades como consecuencia de la caída del contrapeso.",f:"G",na:true},{n:32,d:"No hay fijación segura en los medios de suspensión.",f:"G",na:true},{n:33,d:"Es posible el desplazamiento accidental del contrapeso.",f:"G",na:true},{n:34,d:"Las cadenas que llevan los sistemas de suspensión no son accesibles para la inspección y el mantenimiento.",f:"G",na:true},{n:35,d:"No existen medios para prevenir que la cadena se desenganche accidentalmente de los piñones.",f:"G",na:true},{n:36,d:"No está previsto una protección de los piñones de la cadena o de sus puntos de enganche a menos de 2.5 m sobre el nivel del suelo.",f:"G",na:true},{n:37,d:"La hoja de puerta no permanece en los rieles o elementos de guía y estos muestran deformación permanente que afecta su función.",f:"G",na:false},{n:38,d:"Falta o falla el interruptor de la alimentación.",f:"G",na:false},{n:39,d:"No hay coherencia de los mandos.",f:"G",na:false},{n:40,d:"Se presenta visualización de falla cuando algún equipo electrónico de la puerta tiene pantalla o display.",f:"L",na:false},{n:41,d:"Se evidencia falla en la electro cerradura.",f:"G",na:false},{n:42,d:"Las baterías están descargadas (en caso de funcionar con baterías).",f:"G",na:false},{n:43,d:"La puerta no se detiene automáticamente cuando alcanza sus posiciones límite del final de recorrido.",f:"MG",na:false},{n:44,d:"El movimiento de la puerta no se interrumpe y/o la motorización no se pone fuera de funcionamiento cuando se le dé la orden de parada.",f:"G",na:false},{n:45,d:"En puertas de rejas persiana enrollables, no se detiene la hoja ni la motorización, y/o se presenta falla en el sistema de suspensión.",f:"MG",na:true},{n:46,d:"Existe la posibilidad de que queden personas atrapadas en las zonas en las que una puerta motorizada sea la única salida posible.",f:"MG",na:false},{n:47,d:"Se presenta falla en los anclajes del motor.",f:"MG",na:false},{n:48,d:"Falta la coraza en los cableados.",f:"G",na:false},{n:49,d:"Hay presencia de aceite derramado.",f:"MG",na:false},{n:50,d:"Las puertas motorizadas no están protegidas contra los contactos eléctricos directos e indirectos.",f:"G",na:false},{n:51,d:"Se evidencia falla en el control de acceso para activar sistema de apertura o cierre de la puerta.",f:"MG",na:false},{n:52,d:"La motorización o fuente de energía evidencia recalentamiento (aislante derretidos, decoloración, entre otros).",f:"L",na:false},{n:53,d:"La motorización o fuente de energía presenta riesgo de choque eléctrico (cables sin aislamiento o dañados).",f:"MG",na:false},{n:54,d:"En caso de falla de la motorización o la alimentación, y si la puerta es el único medio de salida, la persona atrapada no tiene posibilidad de desplazar manualmente la hoja.",f:"G",na:false},{n:55,d:"Se evidencia presencia de grietas en la estructura donde están ubicados los puntos de apoyo de la puerta eléctrica.",f:"G",na:false},{n:56,d:"Hay acumulación de materiales que obstaculizan la entrada o salida de la puerta (grasa, aceite, tierra).",f:"G",na:false},{n:57,d:"En puertas transparentes, no existe una banda opaca a lo ancho de la vidriera o mediante adorno u otro tratamiento decorativo.",f:"G",na:true},{n:58,d:"Cuando se coloca una banda opaca en puerta transparente, esta tiene menos de 20 mm de alto o no está localizada correctamente respecto al nivel del piso.",f:"G",na:true},{n:59,d:"La banda colocada en una puerta transparente no es fácilmente visible.",f:"G",na:true},{n:60,d:"Las puertas auxiliares no se pueden abrir cuando la puerta principal está en posición cerrada.",f:"MG",na:false},{n:61,d:"Cerraduras de puertas auxiliares se encuentran inoperantes.",f:"MG",na:false},{n:62,d:"Existe peligro de que la puerta funcione en la modalidad de hombre presente (cuando este sistema exista).",f:"MG",na:false},{n:63,d:"Las puertas que abren a zonas de tráfico no disponen de un medio para la observación.",f:"MG",na:false},{n:64,d:"Se presentan movimientos involuntarios o incontrolados de la hoja de puerta debido a influencias externas (viento, agua).",f:"L",na:false},{n:65,d:"Se presenta movimiento de la hoja de puerta (apertura o cierre) que hacen que las personas o los objetos queden atrapados.",f:"G",na:false},{n:66,d:"Existe riesgo de arrastre, enganche y/o corte a los usuarios provocados por la forma de la hoja móvil.",f:"G",na:false},{n:67,d:"Falta instrucciones apropiadas dirigidas a las personas responsables para la operación y uso.",f:"G",na:false},{n:68,d:"Hay peligro de tropiezo en caso de alfombras y suelos sensibles a la presión. La distancia entre las juntas y el suelo circundante es superior a 3 mm.",f:"G",na:false},{n:69,d:"Existe separación mayor a 3 mm (horizontalmente) entre el terminado de la puerta (marco o riel) y el piso terminado de la edificación.",f:"G",na:false},{n:70,d:"En caso de existencia de dispositivos de advertencia (sonoro-luminoso) estos no funcionan.",f:"G",na:false},{n:71,d:"No existe o no funciona el equipo de detección de presencia.",f:"G",na:false},{n:72,d:"En puertas verticales, no existe dispositivo anticaída.",f:"MG",na:true},{n:73,d:"En puertas verticales, al aplicar el dispositivo anticaída, la hoja de la puerta no se detiene automáticamente dentro de los 300 mm.",f:"G",na:true},{n:74,d:"Es posible que las personas queden atrapadas en las zonas comprendidas entre dos puertas motorizadas o en habitaciones con una sola salida motorizada.",f:"MG",na:false},{n:75,d:"No existe una empresa encargada del mantenimiento ni conservación del aparato (contrato, bitácora, reporte técnico, etc.).",f:"G",na:false},{n:76,d:"Las fuerzas que ejerce una hoja de puerta superan 150 N estática y 400 N dinámica (véase NTC 6009 EN12445).",f:"MG",na:false},{n:77,d:"No existe evidencia del ensayo establecido en el numeral 7 de la NTC 6009 (EN12445) con equipo de detección de presencia.",f:"G",na:false},{n:78,d:"No existe evidencia del ensayo del Anexo C normativo de la presente norma mediante equipos electro-sensitivos y/o equipo de protección sensible a la presión.",f:"G",na:false},{n:79,d:"La puerta puede levantar a un adulto o un niño de forma peligrosa (levanta masa de 20 kg desde posición cerrada).",f:"MG",na:true},{n:80,d:"En puertas que no funcionan bajo control de presión mantenida, se presenta riesgo para las personas por el impacto de la hoja en movimiento.",f:"G",na:false},{n:81,d:"En puertas que no funcionan bajo control de presión mantenida, no existe iluminación de al menos 50 luxes en la zona donde está instalada.",f:"L",na:false},{n:82,d:"En puertas que no funcionan bajo control de presión mantenida, no existe señalización para informar a los usuarios del funcionamiento automático.",f:"L",na:false},{n:83,d:"En puertas que no funcionan bajo control de presión mantenida, no hay sirenas instaladas o señales luminosas para regular el tráfico de vehículos.",f:"G",na:false},{n:84,d:"En puertas que no funcionan bajo control de presión mantenida, no están instalados los dispositivos suplementarios que aseguren detección anticipada de vehículos.",f:"G",na:false},{n:85,d:"Al abrir y cerrar completamente 10 veces la puerta con la velocidad de maniobra definida, se presenta alteración en las dimensiones o forma.",f:"G",na:false},{n:86,d:"Al detener la hoja de puerta 10 veces en diferentes posiciones durante 5 maniobras de apertura y cierre, la hoja de puerta no permanece en reposo.",f:"G",na:false}]
};

// ─── COLORES Y UTILIDADES ────────────────────────────────────────────────────
const DEFE_STYLES = {
  MG:{ bg:"#FCEBEB", color:"#791F1F", border:"#F7C1C1", label:"Muy grave" },
  G: { bg:"#FAEEDA", color:"#633806", border:"#FAC775", label:"Grave" },
  L: { bg:"#EAF3DE", color:"#27500A", border:"#C0DD97", label:"Leve" },
};
const TIPO_LABELS = {
  asc2012:"Ascensores NTC 5926-1:2012 v9",
  asc2021:"Ascensores NTC 5926-1:2021 v3",
  escram:"Escaleras mecánicas y rampas NTC 5926-2",
  puertas:"Puertas eléctricas NTC 5926-3"
};

// ─── COMPONENTES ────────────────────────────────────────────────────────────
const Tag = ({ label, color="blue" }) => {
  const c = {
    blue:  { bg:"#E6F1FB", fg:"#0C447C" },
    green: { bg:"#EAF3DE", fg:"#27500A" },
    amber: { bg:"#FAEEDA", fg:"#633806" },
    red:   { bg:"#FCEBEB", fg:"#791F1F" },
    gray:  { bg:"var(--color-background-secondary)", fg:"var(--color-text-secondary)" },
  }[color] || { bg:"#E6F1FB", fg:"#0C447C" };
  return (
    <span style={{ display:"inline-flex",alignItems:"center",gap:4,borderRadius:99,fontSize:11,padding:"3px 10px",background:c.bg,color:c.fg,fontWeight:500 }}>
      {label}
    </span>
  );
};

const TopBar = ({ title, sub, onBack, bg="#1a3a5c" }) => (
  <div style={{ background:bg, padding:"14px 16px", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
    {onBack && (
      <button onClick={onBack} style={{ background:"none",border:"none",color:"white",fontSize:20,cursor:"pointer",padding:0,display:"flex",alignItems:"center" }}>
        ←
      </button>
    )}
    <span style={{ fontSize:14,fontWeight:500,color:"white",flex:1 }}>{title}</span>
    {sub && <span style={{ fontSize:11,color:"rgba(255,255,255,0.6)" }}>{sub}</span>}
  </div>
);

const Card = ({ children, style={} }) => (
  <div style={{ background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:14,...style }}>
    {children}
  </div>
);

const SecLabel = ({ children }) => (
  <div style={{ fontSize:11,color:"var(--color-text-secondary)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10,fontWeight:500 }}>
    {children}
  </div>
);

const BtnPrimary = ({ children, onClick, style={} }) => (
  <button onClick={onClick} style={{ background:"#1a3a5c",color:"white",border:"none",borderRadius:8,padding:12,fontSize:14,fontWeight:500,cursor:"pointer",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:6,...style }}>
    {children}
  </button>
);

const BtnSecondary = ({ children, onClick, style={} }) => (
  <button onClick={onClick} style={{ background:"var(--color-background-secondary)",color:"var(--color-text-primary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,padding:10,fontSize:13,cursor:"pointer",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:6,...style }}>
    {children}
  </button>
);

const Field = ({ label, children }) => (
  <div style={{ display:"flex",flexDirection:"column",gap:4 }}>
    <label style={{ fontSize:12,color:"var(--color-text-secondary)" }}>{label}</label>
    {children}
  </div>
);

const Grid2 = ({ children }) => (
  <div style={{ display:"grid",gridTemplateColumns:"repeat(2, minmax(0,1fr))",gap:8 }}>
    {children}
  </div>
);

const inputStyle = { fontSize:13,borderRadius:8,border:"0.5px solid var(--color-border-secondary)",padding:"8px 10px",background:"var(--color-background-primary)",color:"var(--color-text-primary)",width:"100%" };

// ─── PANTALLA: HOME ──────────────────────────────────────────────────────────
const HomeScreen = ({ onNew, onRegistro, onHistorial }) => (
  <div style={{ display:"flex",flexDirection:"column",flex:1 }}>
    <div style={{ background:"#1a3a5c",padding:"20px 16px 16px",display:"flex",flexDirection:"column",gap:3 }}>
      <div style={{ fontSize:11,color:"rgba(255,255,255,0.55)" }}>INCOL S.A.S — Inspección</div>
      <div style={{ fontSize:17,fontWeight:500,color:"white" }}>App de Inspección</div>
      <div style={{ fontSize:12,color:"rgba(255,255,255,0.65)" }}>NTC 5926-1 · NTC 5926-2 · NTC 5926-3</div>
    </div>
    <div style={{ flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12 }}>
      <Card style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px" }}>
        <div><div style={{ fontSize:12,color:"var(--color-text-secondary)" }}>Módulos disponibles</div><div style={{ fontSize:22,fontWeight:500 }}>4</div></div>
        <div style={{ textAlign:"right" }}><div style={{ fontSize:12,color:"var(--color-text-secondary)" }}>Total ítems cargados</div><div style={{ fontSize:22,fontWeight:500,color:"#185FA5" }}>569</div></div>
      </Card>
      <SecLabel>Módulos</SecLabel>
      {[
        { icon:"📋", title:"Nuevo informe", sub:"Asc. 2012 · Asc. 2021 · Escaleras/Rampas · Puertas", fn:onNew },
        { icon:"📸", title:"Registros de visita", sub:"Sube la foto del registro físico cuando quieras", fn:onRegistro },
        { icon:"📁", title:"Historial", sub:"Informes anteriores y exportar a OneDrive", fn:onHistorial },
      ].map(m => (
        <div key={m.title} onClick={m.fn} style={{ border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:14,cursor:"pointer",display:"flex",alignItems:"center",gap:12,background:"var(--color-background-primary)" }}>
          <div style={{ width:40,height:40,borderRadius:8,background:"#E6F1FB",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:20 }}>{m.icon}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14,fontWeight:500,color:"var(--color-text-primary)" }}>{m.title}</div>
            <div style={{ fontSize:12,color:"var(--color-text-secondary)" }}>{m.sub}</div>
          </div>
          <span style={{ color:"var(--color-text-secondary)" }}>›</span>
        </div>
      ))}
    </div>
  </div>
);

// ─── PANTALLA: SELECCIÓN TIPO ────────────────────────────────────────────────
const TipoScreen = ({ onBack, onNext }) => {
  const [tipo, setTipo] = useState("asc2012");
  const [inspector, setInspector] = useState(Object.keys(INSPECTORES)[0]);
  const [atestador, setAtestador] = useState(ATESTADORES[0]);
  const [fecha, setFecha] = useState("");

  const tipos = [
    { k:"asc2012", icon:"🛗", label:"Ascensores NTC 2012" },
    { k:"asc2021", icon:"🛗", label:"Ascensores NTC 2021" },
    { k:"escram",  icon:"🪜", label:"Escaleras y rampas" },
    { k:"puertas", icon:"🚪", label:"Puertas eléctricas" },
  ];

  return (
    <div style={{ display:"flex",flexDirection:"column",flex:1 }}>
      <TopBar title="Tipo de informe" sub="1/5" onBack={onBack} />
      <div style={{ flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12 }}>
        <Card>
          <SecLabel>Inspector y fecha</SecLabel>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            <Field label="Inspector 1ra visita">
              <select style={inputStyle} value={inspector} onChange={e=>setInspector(e.target.value)}>
                {Object.keys(INSPECTORES).map(i=><option key={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Atestador">
              <select style={inputStyle} value={atestador} onChange={e=>setAtestador(e.target.value)}>
                {ATESTADORES.map(a=><option key={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="Fecha 1ra visita">
              <input style={inputStyle} type="date" value={fecha} onChange={e=>setFecha(e.target.value)} />
            </Field>
          </div>
        </Card>
        <SecLabel>Tipo de informe</SecLabel>
        <Grid2>
          {tipos.map(t=>(
            <div key={t.k} onClick={()=>setTipo(t.k)} style={{ border:tipo===t.k?"2px solid #1a3a5c":"0.5px solid var(--color-border-secondary)",borderRadius:12,padding:"14px 10px",textAlign:"center",cursor:"pointer",background:tipo===t.k?"#E6F1FB":"var(--color-background-primary)" }}>
              <div style={{ fontSize:22,marginBottom:6 }}>{t.icon}</div>
              <div style={{ fontSize:12,fontWeight:500,color:"var(--color-text-primary)" }}>{t.label}</div>
            </div>
          ))}
        </Grid2>
        <BtnPrimary onClick={()=>onNext({ tipo, inspector, atestador, fecha })}>Continuar →</BtnPrimary>
      </div>
    </div>
  );
};

// ─── PANTALLA: DATOS CLIENTE ─────────────────────────────────────────────────
const ClienteScreen = ({ onBack, onNext, tipo }) => {
  const [d, setD] = useState({ cot:"", consec:"", nombre:"", dir:"", nit:"", torre:"", serial:"", empresa:"", tecnico:"", ultMant:"", puestaMarcha:"" });
  const upd = (k,v) => setD(p=>({...p,[k]:v}));
  return (
    <div style={{ display:"flex",flexDirection:"column",flex:1 }}>
      <TopBar title="Datos del cliente" sub="2/5" onBack={onBack} />
      <div style={{ flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12 }}>
        <Tag label={TIPO_LABELS[tipo]} color="blue" />
        <Card>
          <SecLabel>Datos del cliente</SecLabel>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            <Grid2>
              <Field label="N° cotización"><input style={inputStyle} value={d.cot} onChange={e=>upd("cot",e.target.value)} placeholder="A12400" /></Field>
              <Field label="Consecutivo único"><input style={inputStyle} value={d.consec} onChange={e=>upd("consec",e.target.value)} placeholder="14500" /></Field>
            </Grid2>
            <Field label="Razón social / nombre"><input style={inputStyle} value={d.nombre} onChange={e=>upd("nombre",e.target.value)} placeholder="Nombre del cliente" /></Field>
            <Field label="Dirección y ciudad"><input style={inputStyle} value={d.dir} onChange={e=>upd("dir",e.target.value)} placeholder="Dirección" /></Field>
            <Grid2>
              <Field label="NIT / C.C."><input style={inputStyle} value={d.nit} onChange={e=>upd("nit",e.target.value)} /></Field>
              <Field label="Torre / N° equipo"><input style={inputStyle} value={d.torre} onChange={e=>upd("torre",e.target.value)} /></Field>
            </Grid2>
            <Field label="Serial del equipo"><input style={inputStyle} value={d.serial} onChange={e=>upd("serial",e.target.value)} /></Field>
          </div>
        </Card>
        <Card>
          <SecLabel>Empresa de mantenimiento</SecLabel>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            <Field label="Nombre empresa"><input style={inputStyle} value={d.empresa} onChange={e=>upd("empresa",e.target.value)} /></Field>
            <Field label="Técnico responsable"><input style={inputStyle} value={d.tecnico} onChange={e=>upd("tecnico",e.target.value)} /></Field>
            <Grid2>
              <Field label="Último mantenimiento"><input style={inputStyle} type="date" value={d.ultMant} onChange={e=>upd("ultMant",e.target.value)} /></Field>
              <Field label="Puesta en marcha"><input style={inputStyle} value={d.puestaMarcha} onChange={e=>upd("puestaMarcha",e.target.value)} placeholder="NI" /></Field>
            </Grid2>
          </div>
        </Card>
        <BtnPrimary onClick={()=>onNext(d)}>Características técnicas →</BtnPrimary>
      </div>
    </div>
  );
};

// ─── PANTALLA: CARACTERÍSTICAS TÉCNICAS (solo para ascensores) ────────────────
const TecnicaScreen = ({ onBack, onNext, tipo }) => {
  const [d, setD] = useState({ accionamiento:"ELECTRICO", maquina:"GEARLESS", traccion:"CABLE", enhebrado:"2:1", capacKg:"", capacPers:"", paradas:"", foso:"", cuarto:"CON CUARTO", buffer:"RESORTE O CAUCHO", limCabina:"SI", limContrapeso:"NO", escotilla:"NO", batiente:"NO", mirilla:"NO", poleas:"NO" });
  const upd = (k,v) => setD(p=>({...p,[k]:v}));
  const isAsc = tipo==="asc2012"||tipo==="asc2021";
  if(!isAsc) return (
    <div style={{ display:"flex",flexDirection:"column",flex:1 }}>
      <TopBar title="Características técnicas" sub="3/5" onBack={onBack} />
      <div style={{ flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12 }}>
        <Tag label={TIPO_LABELS[tipo]} color="blue" />
        <Card>
          <SecLabel>Tipo de equipo</SecLabel>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            <Field label="Tipo de equipo">
              <select style={inputStyle} value={d.maquina} onChange={e=>upd("maquina",e.target.value)}>
                {tipo==="escram"?<><option>ESCALERA MECÁNICA</option><option>RAMPA MÓVIL / ANDÉN</option></>:<><option>PUERTA CORREDERA</option><option>PUERTA BATIENTE MOTORIZADA</option><option>PUERTA VERTICAL</option><option>PUERTA HIDRÁULICA</option><option>PUERTA SECCIONAL</option></>}
              </select>
            </Field>
          </div>
        </Card>
        <BtnPrimary onClick={()=>onNext(d)}>Ir a lista de verificación →</BtnPrimary>
      </div>
    </div>
  );
  return (
    <div style={{ display:"flex",flexDirection:"column",flex:1 }}>
      <TopBar title="Características técnicas" sub="3/5" onBack={onBack} />
      <div style={{ flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12 }}>
        <Tag label={TIPO_LABELS[tipo]} color="blue" />
        <Card>
          <SecLabel>Accionamiento</SecLabel>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            <Grid2>
              <Field label="Accionamiento">
                <select style={inputStyle} value={d.accionamiento} onChange={e=>upd("accionamiento",e.target.value)}>
                  <option>ELECTRICO</option><option>HIDRAULICO</option>
                </select>
              </Field>
              <Field label="Tipo de máquina">
                <select style={inputStyle} value={d.maquina} onChange={e=>upd("maquina",e.target.value)}>
                  <option>GEARLESS</option><option>GEAR</option><option>HIDRAULICO DIRECTO</option><option>HIDRAULICO INDIRECTO</option>
                </select>
              </Field>
              <Field label="Tracción por">
                <select style={inputStyle} value={d.traccion} onChange={e=>upd("traccion",e.target.value)}>
                  <option>CABLE</option><option>CINTA</option><option>CADENA</option>
                </select>
              </Field>
              <Field label="Enhebrado">
                <select style={inputStyle} value={d.enhebrado} onChange={e=>upd("enhebrado",e.target.value)}>
                  <option>2:1</option><option>1:1</option>
                </select>
              </Field>
            </Grid2>
          </div>
        </Card>
        <Card>
          <SecLabel>Capacidad y paradas</SecLabel>
          <Grid2>
            <Field label="Capacidad Kg"><input style={inputStyle} type="number" value={d.capacKg} onChange={e=>upd("capacKg",e.target.value)} /></Field>
            <Field label="Capacidad pers."><input style={inputStyle} type="number" value={d.capacPers} onChange={e=>upd("capacPers",e.target.value)} /></Field>
            <Field label="# Paradas"><input style={inputStyle} type="number" value={d.paradas} onChange={e=>upd("paradas",e.target.value)} /></Field>
            <Field label="Foso (mm)"><input style={inputStyle} type="number" value={d.foso} onChange={e=>upd("foso",e.target.value)} /></Field>
          </Grid2>
        </Card>
        <Card>
          <SecLabel>Configuración</SecLabel>
          <Grid2>
            <Field label="Cuarto de máquinas">
              <select style={inputStyle} value={d.cuarto} onChange={e=>upd("cuarto",e.target.value)}>
                <option>CON CUARTO</option><option>SIN CUARTO</option>
              </select>
            </Field>
            <Field label="Tipo de buffer">
              <select style={inputStyle} value={d.buffer} onChange={e=>upd("buffer",e.target.value)}>
                <option>RESORTE O CAUCHO</option><option>HIDRAULICO</option>
              </select>
            </Field>
            <Field label="Limitador cabina">
              <select style={inputStyle} value={d.limCabina} onChange={e=>upd("limCabina",e.target.value)}>
                <option>SI</option><option>NO</option>
              </select>
            </Field>
            <Field label="Limitador contrapeso">
              <select style={inputStyle} value={d.limContrapeso} onChange={e=>upd("limContrapeso",e.target.value)}>
                <option>NO</option><option>SI</option>
              </select>
            </Field>
            <Field label="Puerta escotilla">
              <select style={inputStyle} value={d.escotilla} onChange={e=>upd("escotilla",e.target.value)}>
                <option>NO</option><option>SI</option>
              </select>
            </Field>
            <Field label="Puerta batiente">
              <select style={inputStyle} value={d.batiente} onChange={e=>upd("batiente",e.target.value)}>
                <option>NO</option><option>SI</option>
              </select>
            </Field>
            <Field label="Mirilla de puertas">
              <select style={inputStyle} value={d.mirilla} onChange={e=>upd("mirilla",e.target.value)}>
                <option>NO</option><option>SI</option>
              </select>
            </Field>
            <Field label="Cuarto de poleas">
              <select style={inputStyle} value={d.poleas} onChange={e=>upd("poleas",e.target.value)}>
                <option>NO</option><option>SI</option>
              </select>
            </Field>
          </Grid2>
        </Card>
        <BtnPrimary onClick={()=>onNext(d)}>Ir a lista de verificación →</BtnPrimary>
      </div>
    </div>
  );
};

// ─── PANTALLA: ITEMS ─────────────────────────────────────────────────────────
// Flujo optimizado: inspector solo marca NC y NA adicionales.
// Al presionar "Finalizar", los ítems sin marcar (que no son NA por defecto) pasan a C automáticamente.
const ItemsScreen = ({ onBack, onNext, tipo, tecnica }) => {
  const [estados, setEstados] = useState({});
  const [obs, setObs] = useState({});
  const [fotos, setFotos] = useState({});
  const [filtro, setFiltro] = useState("nc_na"); // Vista por defecto: solo NC y NA

  const items = useMemo(() => {
    const base = RAW[tipo] || [];
    return base.map(item => {
      let naFinal = item.na;
      if (tipo === "asc2012" || tipo === "asc2021") {
        if (tecnica) {
          const sinCuarto = tecnica.cuarto === "SIN CUARTO";
          const conPoleas = tecnica.poleas === "SI";
          const hidraulico = tecnica.accionamiento === "HIDRAULICO";
          if ([43,44,45,46,47].includes(item.n) && tecnica.escotilla === "NO") naFinal = true;
          if ([48,49].includes(item.n) && !conPoleas) naFinal = true;
          if (item.n === 50 && tecnica.maquina !== "GEAR") naFinal = true;
          if (item.n === 59 && !sinCuarto) naFinal = true;
          if (item.n === 60 && !sinCuarto) naFinal = true;
          if ([163,165,166].includes(item.n) && !hidraulico) naFinal = true;
          if ([18,19,20].includes(item.n) && !hidraulico) naFinal = true;
          if (item.n === 58 && tecnica.traccion !== "CINTA") naFinal = true;
        }
      }
      return { ...item, naFinal };
    });
  }, [tipo, tecnica]);

  // Estado efectivo de cada ítem
  const getE = (item) => {
    if (estados[item.n]) return estados[item.n];
    if (item.naFinal) return "NA";
    return ""; // pendiente = cumple al finalizar
  };

  const ncCount = items.filter(i => getE(i) === "NC").length;
  const naCount = items.filter(i => getE(i) === "NA").length;
  const naAdicional = items.filter(i => !i.naFinal && estados[i.n] === "NA").length;
  const total = items.length;

  const setE = (n, e, item) => {
    // Si el ítem ya era NA por defecto y se quiere desmarcar, lo dejamos sin estado
    setEstados(p => ({ ...p, [n]: e }));
  };

  // Filtros
  const showItems = useMemo(() => {
    if (filtro === "todos") return items;
    if (filtro === "nc") return items.filter(i => getE(i) === "NC");
    if (filtro === "nc_na") return items.filter(i => !i.naFinal); // solo los que aplican
    return items;
  }, [filtro, items, estados]);

  // Al finalizar: los sin marcar que no son NA pasan a C
  const handleFinalizar = () => {
    const estadosFinal = { ...estados };
    items.forEach(item => {
      if (!estadosFinal[item.n]) {
        estadosFinal[item.n] = item.naFinal ? "NA" : "C";
      }
    });
    onNext({ estados: estadosFinal, obs, fotos, items });
  };

  return (
    <div style={{ display:"flex",flexDirection:"column",flex:1 }}>
      <TopBar title="Lista de verificación" sub="4/5" onBack={onBack} />
      <div style={{ padding:"10px 16px",borderBottom:"0.5px solid var(--color-border-tertiary)",flexShrink:0 }}>
        {/* Resumen rápido */}
        <div style={{ display:"flex",gap:8,marginBottom:8,flexWrap:"wrap" }}>
          <span style={{ fontSize:12,fontWeight:500,color:"#A32D2D",background:"#FCEBEB",padding:"3px 10px",borderRadius:99 }}>✗ {ncCount} No cumplen</span>
          <span style={{ fontSize:12,fontWeight:500,color:"var(--color-text-secondary)",background:"var(--color-background-secondary)",padding:"3px 10px",borderRadius:99 }}>— {naCount} No aplica</span>
          {naAdicional > 0 && <span style={{ fontSize:11,color:"#185FA5" }}>({naAdicional} NA adicionales)</span>}
        </div>
        <div style={{ display:"flex",gap:6 }}>
          {[["nc_na","Ítems que aplican"],["nc","Solo hallazgos"],["todos","Ver todos"]].map(([k,l])=>(
            <button key={k} onClick={()=>setFiltro(k)} style={{ flex:1,padding:"5px 2px",fontSize:10,borderRadius:8,border:filtro===k?"0.5px solid #185FA5":"0.5px solid var(--color-border-secondary)",cursor:"pointer",background:filtro===k?"#E6F1FB":"var(--color-background-secondary)",color:filtro===k?"#0C447C":"var(--color-text-secondary)",fontWeight:filtro===k?500:400 }}>{l}</button>
          ))}
        </div>
        <div style={{ marginTop:8,fontSize:11,color:"var(--color-text-secondary)",background:"#E6F1FB",borderRadius:8,padding:"6px 10px" }}>
          💡 Marca solo los ítems que <strong>No cumplen</strong> o <strong>No aplican</strong> adicionalmente. Al finalizar, los demás quedan como Cumple automáticamente.
        </div>
      </div>
      <div style={{ flex:1,overflowY:"auto",padding:"0 16px 16px" }}>
        {showItems.map(item => {
          const e = getE(item);
          const ds = DEFE_STYLES[item.f] || DEFE_STYLES.G;
          const esNAdefecto = item.naFinal && !estados[item.n];
          return (
            <div key={item.n} style={{ padding:"12px 0",borderBottom:"0.5px solid var(--color-border-tertiary)",opacity: esNAdefecto ? 0.5 : 1 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                <span style={{ fontSize:11,color:"var(--color-text-secondary)" }}>Ítem {item.n} {esNAdefecto?"· N/A por defecto":""}</span>
                <span style={{ fontSize:10,fontWeight:500,padding:"2px 7px",borderRadius:99,background:ds.bg,color:ds.color }}>{ds.label}</span>
              </div>
              <div style={{ fontSize:12,color:"var(--color-text-primary)",lineHeight:1.45,margin:"4px 0" }}>{item.d}</div>
              <div style={{ display:"flex",gap:6,marginTop:6 }}>
                <button onClick={()=>setE(item.n,"NC",item)} style={{ flex:2,padding:"8px 4px",fontSize:12,borderRadius:8,border:e==="NC"?"1.5px solid #E24B4A":"0.5px solid var(--color-border-secondary)",cursor:"pointer",background:e==="NC"?"#FCEBEB":"var(--color-background-secondary)",color:e==="NC"?"#791F1F":"var(--color-text-secondary)",fontWeight:e==="NC"?600:400 }}>✗ No cumple</button>
                <button onClick={()=>setE(item.n, estados[item.n]==="NA" ? (item.naFinal?"NA":undefined) : "NA", item)} style={{ flex:1,padding:"8px 4px",fontSize:12,borderRadius:8,border:e==="NA"?"1.5px solid #1a3a5c":"0.5px solid var(--color-border-secondary)",cursor:"pointer",background:e==="NA"?"#E6F1FB":"var(--color-background-secondary)",color:e==="NA"?"#0C447C":"var(--color-text-secondary)",fontWeight:e==="NA"?600:400 }}>— N/A</button>
              </div>
              {e==="NC" && (
                <div style={{ background:"#FFF9F0",border:"0.5px solid #FAC775",borderRadius:8,padding:10,marginTop:8,display:"flex",flexDirection:"column",gap:6 }}>
                  <div style={{ fontSize:11,color:"#633806",fontWeight:500 }}>⚠ Hallazgo — observación y evidencia</div>
                  <textarea value={obs[item.n]||""} onChange={ev=>setObs(p=>({...p,[item.n]:ev.target.value}))} placeholder="Describe el hallazgo encontrado..." style={{ ...inputStyle,height:56,fontSize:12,resize:"none" }} />
                  <label style={{ display:"flex",alignItems:"center",gap:6,border:"0.5px dashed var(--color-border-secondary)",borderRadius:8,padding:"8px 10px",cursor:"pointer",background:"var(--color-background-secondary)",fontSize:12,color:"var(--color-text-secondary)",width:"100%" }}>
                    📷 {fotos[item.n]?`${fotos[item.n].length} foto(s) agregada(s)`:"Agregar foto del hallazgo"}
                    <input type="file" accept="image/*" capture="environment" multiple style={{ display:"none" }} onChange={ev=>{
                      const files = Array.from(ev.target.files);
                      setFotos(p=>({...p,[item.n]:[...(p[item.n]||[]),...files]}));
                    }} />
                  </label>
                </div>
              )}
            </div>
          );
        })}
        <div style={{ paddingTop:16,display:"flex",flexDirection:"column",gap:8 }}>
          <div style={{ fontSize:12,color:"var(--color-text-secondary)",textAlign:"center",padding:"8px 0" }}>
            Al continuar, los ítems sin marcar quedarán como <strong>Cumple</strong> automáticamente.
          </div>
          <BtnPrimary onClick={handleFinalizar}>✓ Finalizar y pasar a equipos de medición →</BtnPrimary>
        </div>
      </div>
    </div>
  );
};

// ─── PANTALLA: EQUIPOS DE MEDICIÓN ──────────────────────────────────────────
const EquiposScreen = ({ onBack, onNext, inspector, tipo }) => {
  const eq = INSPECTORES[inspector] || {};
  const [fotos, setFotos] = useState({});
  // Solo se muestran los equipos que aplican para este tipo de informe
  const equipos = EQUIPOS_POR_TIPO[tipo] || [];
  const total = equipos.length;
  const ok = equipos.filter(e=>fotos[e.k]).length;
  return (
    <div style={{ display:"flex",flexDirection:"column",flex:1 }}>
      <TopBar title="Equipos de medición" sub="4.5/5" onBack={onBack} />
      <div style={{ flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12 }}>
        <div style={{ fontSize:13,color:"var(--color-text-secondary)" }}>Equipos asignados automáticamente a <strong>{inspector}</strong>. Agrega la foto de evidencia de cada medición.</div>
        <Card>
          <SecLabel>Equipos de medición — {inspector}</SecLabel>
          {equipos.map((e,i) => (
            <div key={e.k} style={{ display:"flex",alignItems:"flex-start",gap:10,padding:"10px 0",borderBottom:i<equipos.length-1?"0.5px solid var(--color-border-tertiary)":"none" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13,fontWeight:500,color:"var(--color-text-primary)" }}>{e.nombre}</div>
                <div style={{ fontSize:11,color:"var(--color-text-secondary)",marginTop:1 }}>{eq[e.k] || "—"}</div>
                <div style={{ fontSize:11,color:"#185FA5",marginTop:2 }}>Ítems: {e.items}</div>
              </div>
              <label style={{ width:48,height:48,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer",border:fotos[e.k]?"0.5px solid #639922":"0.5px dashed var(--color-border-secondary)",background:fotos[e.k]?"#EAF3DE":"var(--color-background-secondary)",fontSize:fotos[e.k]?18:20,color:fotos[e.k]?"#27500A":"var(--color-text-secondary)" }}>
                {fotos[e.k]?"✓":"📷"}
                <input type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={()=>setFotos(p=>({...p,[e.k]:true}))} />
              </label>
            </div>
          ))}
        </Card>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",background:"var(--color-background-secondary)",borderRadius:8,padding:"10px 12px" }}>
          <span style={{ fontSize:13,color:"var(--color-text-secondary)" }}>Fotos agregadas</span>
          <span style={{ fontSize:14,fontWeight:500,color:ok===total?"#27500A":"var(--color-text-primary)" }}>{ok} / {total}</span>
        </div>
        <BtnPrimary onClick={()=>onNext(fotos)}>Ir a firmas →</BtnPrimary>
      </div>
    </div>
  );
};

// ─── PANTALLA: NOMBRE DEL ARCHIVO ────────────────────────────────────────────
const NombreScreen = ({ onBack, onNext, informe }) => {
  const [cot, setCot] = useState(informe.cliente?.cot||"");
  const [ciudad, setCiudad] = useState("PEREIRA");
  const [edificio, setEdificio] = useState(informe.cliente?.nombre||"");
  const [equipo, setEquipo] = useState(["asc2012","asc2021"].includes(informe.tipo)?"ASCENSORES":informe.tipo==="escram"?"ESCALERAS":"PUERTAS");
  const [ubicacion, setUbicacion] = useState(informe.cliente?.torre||"");
  const [resultado, setResultado] = useState("ATESTACION");
  const [visita, setVisita] = useState("1V");
  const [acrilico, setAcrilico] = useState("CON ACRÍLICO ICM");

  const nombre = [cot,ciudad,edificio,equipo,ubicacion,resultado,visita,acrilico].filter(Boolean).join(" ");

  return (
    <div style={{ display:"flex",flexDirection:"column",flex:1 }}>
      <TopBar title="Nombre del archivo" sub="Exportar" onBack={onBack} />
      <div style={{ flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12 }}>
        <div style={{ background:"#E6F1FB",border:"0.5px solid #B5D4F4",borderRadius:8,padding:"12px 14px" }}>
          <div style={{ fontSize:11,color:"#185FA5",marginBottom:6 }}>📄 Nombre del archivo en OneDrive</div>
          <div style={{ fontSize:13,fontWeight:500,color:"#0C447C",wordBreak:"break-word",lineHeight:1.5 }}>{nombre || "—"}</div>
        </div>
        <Card>
          <SecLabel>Campos del nombre</SecLabel>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            <Field label="Cotización / consecutivo"><input style={inputStyle} value={cot} onChange={e=>setCot(e.target.value)} /></Field>
            <Field label="Ciudad">
              <select style={inputStyle} value={ciudad} onChange={e=>setCiudad(e.target.value)}>
                {CIUDADES.map(c=><option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Nombre del edificio / cliente"><input style={inputStyle} value={edificio} onChange={e=>setEdificio(e.target.value)} /></Field>
            <Field label="Tipo de equipo">
              <select style={inputStyle} value={equipo} onChange={e=>setEquipo(e.target.value)}>
                <option>ASCENSORES</option><option>ESCALERAS</option><option>RAMPAS</option><option>PUERTAS</option>
              </select>
            </Field>
            <Field label="Ubicación (torre, local, piso…)"><input style={inputStyle} value={ubicacion} onChange={e=>setUbicacion(e.target.value)} placeholder="Ej: TORRE 1, ASC 2" /></Field>
            <Grid2>
              <Field label="Resultado">
                <select style={inputStyle} value={resultado} onChange={e=>setResultado(e.target.value)}>
                  <option>ATESTACION</option><option>NO PASA</option>
                </select>
              </Field>
              <Field label="Tipo de visita">
                <select style={inputStyle} value={visita} onChange={e=>setVisita(e.target.value)}>
                  <option>1V</option><option>2V</option><option>3V</option>
                </select>
              </Field>
            </Grid2>
            <Field label="Tipo de acrílico">
              <select style={inputStyle} value={acrilico} onChange={e=>setAcrilico(e.target.value)}>
                <option>CON ACRÍLICO ICM</option><option>CON ACRÍLICO INCOL</option><option>CON ACRÍLICO CERTINEX</option><option>CON ACRÍLICO OTRO</option><option>SIN ACRÍLICO</option>
              </select>
            </Field>
          </div>
        </Card>
        <div style={{ background:"#E1F5EE",border:"0.5px solid #9FE1CB",borderRadius:8,padding:"12px 14px" }}>
          <div style={{ fontSize:11,color:"#0F6E56",marginBottom:4 }}>📁 Ruta en OneDrive</div>
          <div style={{ fontSize:12,color:"#085041",wordBreak:"break-word" }}>INCOL / Informes 2026 / {ciudad} / <strong>{nombre}.xlsx</strong></div>
        </div>
        <BtnPrimary onClick={()=>onNext(nombre)}>✓ Confirmar y exportar a OneDrive ↗</BtnPrimary>
      </div>
    </div>
  );
};

// ─── PANTALLA: FIRMAS ────────────────────────────────────────────────────────
const FirmasScreen = ({ onBack, onNext, inspector, atestador }) => {
  const [firmados, setFirmados] = useState({});
  const partes = [
    { k:"inspector", nombre:inspector, rol:"Inspector" },
    { k:"tecnico", nombre:"Técnico mantenimiento", rol:"Empresa de mantenimiento" },
    { k:"edificio", nombre:"Representante del edificio", rol:"Cliente" },
    { k:"atestador", nombre:atestador, rol:"Atestador / Revisor" },
  ];
  const [notas, setNotas] = useState("");
  return (
    <div style={{ display:"flex",flexDirection:"column",flex:1 }}>
      <TopBar title="Firmas" sub="5/5" onBack={onBack} />
      <div style={{ flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12 }}>
        {[{ title:"Primera visita", keys:["inspector","tecnico","edificio"] },{ title:"Atestación",keys:["atestador"] }].map(grupo=>(
          <Card key={grupo.title}>
            <SecLabel>{grupo.title}</SecLabel>
            {grupo.keys.map((k,i)=>{
              const p = partes.find(x=>x.k===k);
              const initials = p.nombre.split(" ").map(w=>w[0]).join("").slice(0,2);
              return (
                <div key={k} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<grupo.keys.length-1?"0.5px solid var(--color-border-tertiary)":"none" }}>
                  <div style={{ width:32,height:32,borderRadius:"50%",background:"#E6F1FB",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:500,color:"#0C447C",flexShrink:0 }}>{initials}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13,fontWeight:500,color:"var(--color-text-primary)" }}>{p.nombre}</div>
                    <div style={{ fontSize:11,color:"var(--color-text-secondary)" }}>{p.rol}</div>
                  </div>
                  {firmados[k]
                    ? <span style={{ fontSize:11,padding:"3px 8px",borderRadius:99,background:"#EAF3DE",color:"#27500A" }}>✓ Firmado</span>
                    : <button onClick={()=>setFirmados(prev=>({...prev,[k]:true}))} style={{ display:"flex",alignItems:"center",gap:6,border:"0.5px dashed var(--color-border-secondary)",borderRadius:8,padding:"6px 10px",cursor:"pointer",background:"var(--color-background-secondary)",fontSize:12,color:"var(--color-text-secondary)" }}>✏ Firmar</button>
                  }
                </div>
              );
            })}
          </Card>
        ))}
        <Card>
          <SecLabel>Observaciones generales</SecLabel>
          <textarea value={notas} onChange={e=>setNotas(e.target.value)} placeholder="Sección de notas y observaciones del informe..." style={{ ...inputStyle,height:72,resize:"none" }} />
        </Card>
        <BtnPrimary onClick={()=>onNext({ firmados, notas })}>Generar resumen y nombre del archivo →</BtnPrimary>
      </div>
    </div>
  );
};

// ─── PANTALLA: RESUMEN ───────────────────────────────────────────────────────
const ResumenScreen = ({ onBack, onHome, informe, nombreArchivo }) => {
  const { estados, items } = informe.items || { estados:{}, items:[] };
  const L = items.filter(i=>estados[i.n]==="NC"&&i.f==="L").length;
  const G = items.filter(i=>estados[i.n]==="NC"&&i.f==="G").length;
  const MG = items.filter(i=>estados[i.n]==="NC"&&i.f==="MG").length;
  const NA = items.filter(i=>estados[i.n]==="NA"||(i.naFinal&&!estados[i.n])).length;
  const total = items.length;
  return (
    <div style={{ display:"flex",flexDirection:"column",flex:1 }}>
      <TopBar title="Resumen del informe" onBack={onBack} />
      <div style={{ flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12 }}>
        <Tag label={TIPO_LABELS[informe.tipo]} color="blue" />
        <Card>
          <SecLabel>Resumen de hallazgos</SecLabel>
          {[["Ítems leves (L)",L,"green"],["Ítems graves (G)",G,"amber"],["Ítems muy graves (MG)",MG,"red"]].map(([l,v,c])=>(
            <div key={l} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"0.5px solid var(--color-border-tertiary)" }}>
              <span style={{ fontSize:13,color:"var(--color-text-secondary)" }}>{l}</span>
              <Tag label={String(v)} color={v>0?c:"green"} />
            </div>
          ))}
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"0.5px solid var(--color-border-tertiary)" }}>
            <span style={{ fontSize:13,color:"var(--color-text-secondary)" }}>No aplica</span>
            <span style={{ fontSize:13,color:"var(--color-text-secondary)" }}>{NA}</span>
          </div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0" }}>
            <span style={{ fontSize:13,fontWeight:500,color:"var(--color-text-primary)" }}>Total ítems evaluados</span>
            <span style={{ fontSize:15,fontWeight:500 }}>{total}</span>
          </div>
        </Card>
        <Card>
          <SecLabel>Datos del informe</SecLabel>
          {[["Inspector",informe.inspector||"—"],["Atestador",informe.atestador||"—"],["Fecha visita",informe.fecha||"—"],["Norma",TIPO_LABELS[informe.tipo]]].map(([l,v])=>(
            <div key={l} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"0.5px solid var(--color-border-tertiary)" }}>
              <span style={{ fontSize:13,color:"var(--color-text-secondary)" }}>{l}</span>
              <span style={{ fontSize:13,color:"var(--color-text-primary)",textAlign:"right",maxWidth:"60%" }}>{v}</span>
            </div>
          ))}
        </Card>
        {nombreArchivo && (
          <div style={{ background:"#E1F5EE",border:"0.5px solid #9FE1CB",borderRadius:8,padding:"12px 14px" }}>
            <div style={{ fontSize:11,color:"#0F6E56",marginBottom:4 }}>📁 Guardando como</div>
            <div style={{ fontSize:12,color:"#085041",wordBreak:"break-word",fontWeight:500 }}>{nombreArchivo}.xlsx</div>
          </div>
        )}
        <BtnPrimary>📤 Exportar Excel a OneDrive ↗</BtnPrimary>
        <BtnSecondary onClick={onHome}>+ Nuevo informe</BtnSecondary>
      </div>
    </div>
  );
};

// ─── PANTALLA: REGISTROS DE VISITA ───────────────────────────────────────────
const RegistroScreen = ({ onBack }) => {
  const [consec, setConsec] = useState("");
  const [inspector, setInspector] = useState(Object.keys(INSPECTORES)[0]);
  const [fecha, setFecha] = useState("");
  const [subidos, setSubidos] = useState([
    { consec:"14500 · A12400", inspector:"Alejandro Franco", fecha:"28/02/2025", ok:true },
    { consec:"14480 · A12380", inspector:"Diego Suárez", fecha:"15/06/2026", ok:false },
  ]);
  return (
    <div style={{ display:"flex",flexDirection:"column",flex:1 }}>
      <TopBar title="Registros de visita" onBack={onBack} />
      <div style={{ flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12 }}>
        <div style={{ fontSize:13,color:"var(--color-text-secondary)" }}>Sube la foto del registro físico cuando quieras — no tiene que ser en el momento de la visita.</div>
        <Card>
          <SecLabel>Nuevo registro</SecLabel>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            <Field label="Consecutivo del informe"><input style={inputStyle} value={consec} onChange={e=>setConsec(e.target.value)} placeholder="Ej: 14500 · A12400" /></Field>
            <Field label="Inspector">
              <select style={inputStyle} value={inspector} onChange={e=>setInspector(e.target.value)}>
                {Object.keys(INSPECTORES).map(i=><option key={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Fecha de la visita"><input style={inputStyle} type="date" value={fecha} onChange={e=>setFecha(e.target.value)} /></Field>
            <button style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:6,border:"0.5px dashed var(--color-border-secondary)",borderRadius:8,padding:14,cursor:"pointer",background:"var(--color-background-secondary)",fontSize:12,color:"var(--color-text-secondary)",width:"100%" }}>
              📷 Tomar o seleccionar foto del registro
            </button>
          </div>
        </Card>
        <BtnPrimary>📤 Subir a OneDrive</BtnPrimary>
        <SecLabel>Registros recientes</SecLabel>
        {subidos.map((r,i)=>(
          <Card key={i} style={{ display:"flex",flexDirection:"column",gap:4 }}>
            <div style={{ display:"flex",justifyContent:"space-between" }}>
              <span style={{ fontSize:13,fontWeight:500,color:"var(--color-text-primary)" }}>{r.consec}</span>
              <Tag label={r.ok?"✓ Subido":"Pendiente"} color={r.ok?"green":"amber"} />
            </div>
            <div style={{ fontSize:11,color:"var(--color-text-secondary)" }}>{r.inspector} · {r.fecha}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── APP PRINCIPAL ───────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home");
  const [informe, setInforme] = useState({});

  const go = s => setScreen(s);

  const screens = {
    home: <HomeScreen onNew={()=>go("tipo")} onRegistro={()=>go("registro")} onHistorial={()=>go("historial")} />,
    tipo: <TipoScreen onBack={()=>go("home")} onNext={d=>{setInforme(p=>({...p,...d}));go("cliente")}} />,
    cliente: <ClienteScreen onBack={()=>go("tipo")} onNext={d=>{setInforme(p=>({...p,cliente:d}));go("tecnica")}} tipo={informe.tipo} />,
    tecnica: <TecnicaScreen onBack={()=>go("cliente")} onNext={d=>{setInforme(p=>({...p,tecnica:d}));go("items")}} tipo={informe.tipo} />,
    items: <ItemsScreen onBack={()=>go("tecnica")} onNext={d=>{setInforme(p=>({...p,items:d}));go("equipos")}} tipo={informe.tipo} tecnica={informe.tecnica} />,
    equipos: <EquiposScreen onBack={()=>go("items")} onNext={d=>{setInforme(p=>({...p,fotosEquipos:d}));go("firmas")}} inspector={informe.inspector||Object.keys(INSPECTORES)[0]} tipo={informe.tipo||"asc2012"} />,
    firmas: <FirmasScreen onBack={()=>go("equipos")} onNext={d=>{setInforme(p=>({...p,firmas:d}));go("nombre")}} inspector={informe.inspector||"ALEJANDRO FRANCO"} atestador={informe.atestador||"DIEGO SUAREZ"} />,
    nombre: <NombreScreen onBack={()=>go("firmas")} onNext={n=>{setInforme(p=>({...p,nombreArchivo:n}));go("resumen")}} informe={informe} />,
    resumen: <ResumenScreen onBack={()=>go("nombre")} onHome={()=>{setInforme({});go("home")}} informe={informe} nombreArchivo={informe.nombreArchivo} />,
    registro: <RegistroScreen onBack={()=>go("home")} />,
    historial: (
      <div style={{ display:"flex",flexDirection:"column",flex:1 }}>
        <TopBar title="Historial de informes" onBack={()=>go("home")} />
        <div style={{ flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:10 }}>
          <input style={inputStyle} placeholder="Buscar por cliente, inspector, consecutivo..." />
          {[{t:"Plaza de Mercado Jamundí",s:"ASC ÚNICO · 28/02/2025 · Asc. 2012",c:"amber",h:"4 G"},{t:"C.C. Unicentro Pereira",s:"ESC 01 · 15/06/2026 · Escalera",c:"red",h:"2 MG · 1 G"},{t:"Hospital Universitario",s:"Puerta P-01 · 10/06/2026 · Puertas",c:"green",h:"Cumple"}].map((r,i)=>(
            <Card key={i} style={{ cursor:"pointer",display:"flex",flexDirection:"column",gap:4 }}>
              <div style={{ display:"flex",justifyContent:"space-between" }}>
                <span style={{ fontSize:13,fontWeight:500,color:"var(--color-text-primary)" }}>{r.t}</span>
                <Tag label={r.h} color={r.c} />
              </div>
              <div style={{ fontSize:11,color:"var(--color-text-secondary)" }}>{r.s}</div>
            </Card>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div style={{ background:"var(--color-background-secondary)",minHeight:"100vh",display:"flex",justifyContent:"center",alignItems:"flex-start" }}>
      <div style={{ width:"100%",maxWidth:480,background:"var(--color-background-primary)",minHeight:"100vh",display:"flex",flexDirection:"column" }}>
        {screens[screen] || screens.home}
      </div>
    </div>
  );
}
