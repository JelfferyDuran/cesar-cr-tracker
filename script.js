
// ==================== THREE.JS KINGDOM BACKGROUND ====================
(function() {
  const canvas = document.getElementById('three-bg');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 30;
  const particleCount = 200;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  for (let i=0;i<particleCount*3;i+=3) {
    positions[i]=(Math.random()-0.5)*60;
    positions[i+1]=(Math.random()-0.5)*60;
    positions[i+2]=(Math.random()-0.5)*30-10;
    velocities[i]=(Math.random()-0.5)*0.01;
    velocities[i+1]=Math.random()*0.02+0.005;
    velocities[i+2]=0;
  }
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const material = new THREE.PointsMaterial({ color:0xd4a853, size:0.08, transparent:true, opacity:0.6, blending:THREE.AdditiveBlending });
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);
  const crownGeo = new THREE.TorusGeometry(3,0.3,8,6);
  const crownMat = new THREE.MeshBasicMaterial({ color:0xd4a853, wireframe:true, transparent:true, opacity:0.06 });
  const crown = new THREE.Mesh(crownGeo, crownMat);
  crown.position.set(15,8,-15);
  scene.add(crown);
  for (let i=0;i<5;i++) {
    const orbGeo=new THREE.SphereGeometry(0.5+Math.random()*0.5,16,16);
    const orbMat=new THREE.MeshBasicMaterial({ color:0xd4a853, wireframe:true, transparent:true, opacity:0.04 });
    const orb=new THREE.Mesh(orbGeo,orbMat);
    orb.position.set((Math.random()-0.5)*40,(Math.random()-0.5)*40,-20+Math.random()*10);
    orb.userData={speed:0.002+Math.random()*0.005,offset:Math.random()*Math.PI*2};
    scene.add(orb);
  }
  let mouseX=0,mouseY=0;
  document.addEventListener('mousemove',e=>{mouseX=(e.clientX/window.innerWidth-0.5)*2;mouseY=(e.clientY/window.innerHeight-0.5)*2;});
  function animate() {
    requestAnimationFrame(animate);
    const pos=geometry.attributes.position.array;
    for(let i=0;i<particleCount*3;i+=3){pos[i]+=velocities[i];pos[i+1]+=velocities[i+1];if(pos[i+1]>30){pos[i+1]=-30;pos[i]=(Math.random()-0.5)*60;}}
    geometry.attributes.position.needsUpdate=true;
    crown.rotation.y+=0.003;crown.rotation.x+=0.001;
    camera.position.x+=(mouseX*2-camera.position.x)*0.02;camera.position.y+=(-mouseY*2-camera.position.y)*0.02;
    camera.lookAt(scene.position);
    renderer.render(scene,camera);
  }
  animate();
  window.addEventListener('resize',()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);});
})();

// ==================== DATABASE ====================
const DB = {
  save(key,val){try{localStorage.setItem('kfs_'+key,JSON.stringify(val));}catch(e){console.warn('Storage full');}},
  load(key,def){try{const v=localStorage.getItem('kfs_'+key);return v?JSON.parse(v):def;}catch(e){return def;}},
  del(key){localStorage.removeItem('kfs_'+key);}
};

// ==================== CLIENT DATA ====================
const TEMPLATE_PHASES = [
  {
    id:"prep", title:"Preparaci\u00f3n y Recolecci\u00f3n de Documentos", subtitle:"Ten todo listo antes de enviar por correo", checklist:[
      {id:"prep-1",label:"Copias de tu identificaci\u00f3n con foto (licencia o pasaporte)"},
      {id:"prep-2",label:"Copia de recibo de servicios o estado de cuenta bancario (prueba de domicilio, menos de 30 d\u00edas)"},
      {id:"prep-3",label:"Imprimir cada carta de disputa PDF (ya generadas)"},
      {id:"prep-4",label:"FIRMAR cada carta personalmente"},
      {id:"prep-5",label:"Adjuntar con CADA carta: copia de ID + prueba de domicilio"},
      {id:"prep-6",label:"Revisar que cada carta sea precisa antes de enviar"}
    ]
  },
  {
    id:"send", title:"Enviar Cartas de Disputa por Correo Certificado", subtitle:"Certified Mail con acuse de recibo", checklist:[
      {id:"send-1",label:"Enviar cada carta por correo certificado (Certified Mail con Return Receipt)"},
      {id:"send-2",label:"Usar LetterStream letterstream.com ~$12/carta o ir al correo directamente"},
      {id:"send-3",label:"Guardar TODOS los n\u00fameros de seguimiento / tracking"},
      {id:"send-4",label:"Anotar tracking en la tabla de seguimiento abajo"},
      {id:"send-5",label:"Poner recordatorio en el calendario: 35 d\u00edas desde el env\u00edo (esperar respuesta)"}
    ]
  },
  {
    id:"track", title:"Seguimiento y Respuesta de las Agencias", subtitle:"Monitorear entrega + esperar 30 d\u00edas de investigaci\u00f3n", checklist:[
      {id:"track-1",label:"Confirmar que todas las cartas fueron entregadas (USPS tracking)"},
      {id:"track-2",label:"Esperar 30 d\u00edas desde la entrega confirmada para recibir respuesta"},
      {id:"track-3",label:"Abrir cada respuesta de las agencias cuando llegue"},
      {id:"track-4",label:"Anotar resultado: Eliminado / Verificado / Sin Respuesta"},
      {id:"track-5",label:"SI eliminaron: Pedir reporte nuevo para confirmar"},
      {id:"track-6",label:"SI verificaron: Ir a Fase 4 (M\u00e9todo de Verificaci\u00f3n - MOV)"},
      {id:"track-7",label:"SI no respondieron: Enviar carta de 'Falta de Investigaci\u00f3n'"}
    ]
  },
  {
    id:"mov", title:"M\u00e9todo de Verificaci\u00f3n (MOV)", subtitle:"Obligar a las agencias a explicar C\u00d3MO verificaron", checklist:[
      {id:"mov-1",label:"Redactar carta MOV para cada cuenta verificada (no eliminada)"},
      {id:"mov-2",label:"Preguntar: QU\u00c9 procedimiento usaron, QUI\u00c9N contactaron, QU\u00c9 documentos revisaron"},
      {id:"mov-3",label:"Enviar cartas MOV por correo certificado"},
      {id:"mov-4",label:"SI responden vago ('e-OSCAR'): Escalar a Fase 5"},
      {id:"mov-5",label:"SI dan detalles: Revisar por errores, enviar 2da disputa dirigida"}
    ]
  },
  {
    id:"escalate", title:"Escalaci\u00f3n Directa + CFPB", subtitle:"Atacar desde el otro lado + presi\u00f3n regulatoria", checklist:[
      {id:"esc-1",label:"Llamar al cobrador directamente - exigir correcci\u00f3n/eliminaci\u00f3n"},
      {id:"esc-2",label:"Exigir validaci\u00f3n de deuda bajo FDCPA Secci\u00f3n 809 (solo cobranzas)"},
      {id:"esc-3",label:"Presentar queja CFPB en consumerfinance.gov/complaint"},
      {id:"esc-4",label:"Enviar carta de disputa directa al 'furnisher' (FCRA 1681s-2) por correo certificado"},
      {id:"esc-5",label:"Negociar pago-por-eliminaci\u00f3n si es necesario (30-50% del balance)"},
      {id:"esc-6",label:"Si no se resuelve en 90 d\u00edas: consultar abogado FCRA"}
    ]
  },
  {
    id:"maintain", title:"Mantenimiento y Construcci\u00f3n de Puntaje", subtitle:"Mantener lo positivo, monitorear re-reportes", checklist:[
      {id:"maint-1",label:"Poner pagos autom\u00e1ticos en TODAS las cuentas positivas"},
      {id:"maint-2",label:"Revisar TransUnion v\u00eda Credit Karma mensualmente (gratis)"},
      {id:"maint-3",label:"Revisar LOS 3 bur\u00f3s en AnnualCreditReport.com cada 4 meses"},
      {id:"maint-4",label:"Vigilar reaparici\u00f3n de cuentas eliminadas (enviar carta de reinserci\u00f3n)"},
      {id:"maint-5",label:"Considerar tarjeta asegurada (secured card) que reporte como bankcard"}
    ]
  }
];

const DATA = {
  name:"C\u00c9SAR LARANCUENT",
  address:"340 CHESTNUT ST APT 2, KEARNY, NJ 07032",
  reportDate:"2026-06-02",
  scores:{tu:535,ex:534,efx:571},
  targetScore:680,
  negatives:[
    {id:"lvnv1",creditor:"LVNV Funding / Credit One Bank",account:"$1,088",type:"Cobranza / Charge-Off",rating:"9",bureaus:["TransUnion","Experian","Equifax"],lates:"N/A",strategy:"\u00daltima actividad var\u00eda 4 a\u00f1os entre bur\u00f3s (re-aging). Status 'Open' en EFX vs 'Charge Off' en TU/EX. 100% pagos a tiempo en EX pero est\u00e1 en cobranza. Exigir MOV + FCRA 1681c(c).",impact:"+30 a +50 pts",letters:["02_Furnisher_LVNV_Funding.pdf","01_Bureau_TransUnion_MOV_Demand.pdf","01_Bureau_Experian_MOV_Demand.pdf","01_Bureau_Equifax_MOV_Demand.pdf"],result:{tu:"pending",ex:"pending",efx:"pending"}},
    {id:"lvnv2",creditor:"LVNV Funding / Capital One Platinum",account:"$645",type:"Cobranza",rating:"9",bureaus:["TransUnion","Experian","Equifax"],lates:"N/A",strategy:"Fecha actividad EFX (May 2022) PRECEDE a apertura de cuenta (Dec 2022). Status variable entre bur\u00f3s. Misma cuenta reportada diferente = prueba de reporte poco confiable. FDCPA 809 + FCRA 623.",impact:"+20 a +35 pts",letters:["02_Furnisher_LVNV_Funding.pdf","01_Bureau_TransUnion_MOV_Demand.pdf","01_Bureau_Experian_MOV_Demand.pdf","01_Bureau_Equifax_MOV_Demand.pdf"],result:{tu:"pending",ex:"pending",efx:"pending"}},
    {id:"midland1",creditor:"Midland Credit / Comenity Bank",account:"$888",type:"Cobranza",rating:"9",bureaus:["TransUnion","Experian","Equifax"],lates:"N/A",strategy:"\u00daltima actividad EFX (Apr 2022) PRECEDE apertura (Dec 2022). Status 'Open' EFX vs 'Charge Off' TU/EX. Falta acreedor original en EFX. Contradicciones factuales = eliminaci\u00f3n.",impact:"+15 a +30 pts",letters:["03_Furnisher_Midland_Credit.pdf","01_Bureau_Equifax_MOV_Demand.pdf"],result:{tu:"pending",ex:"pending",efx:"pending"}},
    {id:"midland2",creditor:"Midland Credit / Comenity Capital",account:"$433",type:"Cobranza",rating:"9",bureaus:["TransUnion","Experian","Equifax"],lates:"N/A",strategy:"Fecha actividad EFX (Sep 2022) PRECEDE apertura (Mar 2023). Status variable entre bur\u00f3s. Mismo patr\u00f3n de contradicciones. F\u00e1cil de eliminar si se\u00f1alamos las inconsistencias.",impact:"+10 a +20 pts",letters:["03_Furnisher_Midland_Credit.pdf","01_Bureau_Equifax_MOV_Demand.pdf"],result:{tu:"pending",ex:"pending",efx:"pending"}},
    {id:"swcredit",creditor:"SW Credit Systems / Comcast",account:"$866",type:"Cobranza",rating:"9",bureaus:["TransUnion","Experian","Equifax"],lates:"N/A",strategy:"EFX no muestra nombre de agencia ni acreedor original. Deuda no crediticia (Comcast) = documentaci\u00f3n m\u00e1s d\u00e9bil. Validaci\u00f3n FDCPA 809 + reporte inexacto. De las m\u00e1s f\u00e1ciles de eliminar.",impact:"+15 a +25 pts",letters:["04_Furnisher_Southwest_Credit.pdf","01_Bureau_Equifax_MOV_Demand.pdf"],result:{tu:"pending",ex:"pending",efx:"pending"}},
    {id:"springoaks",creditor:"Spring Oaks Capital / Celtic Bank",account:"$634",type:"Cobranza",rating:"9",bureaus:["TransUnion","Experian","Equifax"],lates:"N/A",strategy:"\u00daltima actividad EFX (Mar 2020) PRECEDE apertura por 16 MESES (Jul 2021). Esto es imposible - evidencia m\u00e1s fuerte del reporte. FCRA 1681e(b) + 1681i. Debe ser eliminado.",impact:"+15 a +25 pts",letters:["05_Furnisher_Spring_Oaks.pdf","01_Bureau_Equifax_MOV_Demand.pdf","01_Bureau_TransUnion_MOV_Demand.pdf"],result:{tu:"pending",ex:"pending",efx:"pending"}},
    {id:"caine",creditor:"Caine & Weiner / Progressive",account:"$398",type:"Cobranza",rating:"9",bureaus:["Experian","Equifax"],lates:"N/A",strategy:"$398 reportado como Charge Off en EX, 'Open' en EFX. Solo 2 bur\u00f3s. Deuda de seguro = no crediticia. M\u00ednima documentaci\u00f3n. La m\u00e1s f\u00e1cil del paquete.",impact:"+10 a +15 pts",letters:["06_Furnisher_Caine_Weiner.pdf","01_Bureau_Equifax_MOV_Demand.pdf"],result:{ex:"pending",efx:"pending"}},
    {id:"bofa",creditor:"Bank of America",account:"$538 ($500 l\u00edmite)",type:"Charge-Off",rating:"9",bureaus:["TransUnion","Experian","Equifax"],lates:"TU: 0/0/0 vs EFX: 1/1/47",strategy:"MISMA cuenta: TU dice 0/0/0 atrasos, EFX dice 1/1/47 atrasos. 108% utilizaci\u00f3n en cuenta cerrada. Contradicci\u00f3n m\u00e1s absurda del reporte. Si sobrevive: pago-por-eliminaci\u00f3n.",impact:"+20 a +40 pts",letters:["07_Furnisher_Bank_of_America.pdf","01_Bureau_TransUnion_MOV_Demand.pdf","01_Bureau_Equifax_MOV_Demand.pdf"],result:{tu:"pending",ex:"pending",efx:"pending"}}
  ],
  letterStreamJobs:[
    {num:1,target:"Equifax MOV - 9 items",status:"draft"},
    {num:2,target:"Experian MOV - 10 items",status:"draft"},
    {num:3,target:"TransUnion MOV - 8 items",status:"draft"},
    {num:4,target:"LVNV Funding ($1,088 + $645)",status:"draft"},
    {num:5,target:"Midland Credit ($888 + $433)",status:"draft"},
    {num:6,target:"Southwest Credit / Comcast ($866)",status:"draft"},
    {num:7,target:"Spring Oaks Capital ($634)",status:"draft"},
    {num:8,target:"Caine & Weiner ($398)",status:"draft"},
    {num:9,target:"Bank of America ($538)",status:"draft"}
  ],
  tracking:[
    {letter:"01",desc:"Equifax MOV"},
    {letter:"02",desc:"Experian MOV"},
    {letter:"03",desc:"TransUnion MOV"},
    {letter:"04",desc:"LVNV Funding"},
    {letter:"05",desc:"Midland Credit"},
    {letter:"06",desc:"SW Credit / Comcast"},
    {letter:"07",desc:"Spring Oaks"},
    {letter:"08",desc:"Caine & Weiner"},
    {letter:"09",desc:"Bank of America"}
  ]
};

// ==================== RENDER ====================
function render() {
  const c = DATA;
  const phases = c.phases || TEMPLATE_PHASES;
  const totalChecks = phases.reduce((a,p)=>a+p.checklist.length,0);
  const doneChecks = phases.reduce((a,p)=>a+p.checklist.filter(i=>DB.load(i.id,false)).length,0);
  const pct = totalChecks ? Math.round((doneChecks/totalChecks)*100) : 0;
  const activeIdx = phases.findIndex(p=>p.checklist.some(i=>!DB.load(i.id,false)));

  document.getElementById('app').innerHTML = `
    <div class="hero">
      <img src="logo.png" class="hero-logo" alt="Kingdom Financial Services" onerror="this.style.display='none'">
      <h1><span>REINO</span> CR\u00c9DITO</h1>
      <p class="tagline">Centro de Control &mdash; ${c.name} &mdash; Reporte: ${c.reportDate}</p>
      <p style="color:var(--text-muted);font-size:0.82rem;margin-top:0.3rem">340 Chestnut St Apt 2, Kearny, NJ 07032</p>
    </div>

    <div class="score-row">
      <div class="score-card tu"><div class="bureau">TransUnion</div><div class="value">${c.scores.tu}</div><div class="label">VantageScore 3.0</div></div>
      <div class="score-card ex"><div class="bureau">Experian</div><div class="value">${c.scores.ex}</div><div class="label">VantageScore 3.0</div></div>
      <div class="score-card efx"><div class="bureau">Equifax</div><div class="value">${c.scores.efx}</div><div class="label">VantageScore 3.0</div></div>
      <div class="score-card target"><div class="bureau">Meta</div><div class="value">${c.targetScore}</div><div class="label">Puntaje Objetivo</div></div>
    </div>

    <div class="progress-container">
      <div class="progress-header">
        <span class="progress-title">Progreso de la Campa\u00f1a</span>
        <span class="progress-pct">${pct}%</span>
      </div>
      <div class="progress-bar-outer"><div class="progress-bar-inner" style="width:${pct}%"></div></div>
      <div class="progress-stats">
        <span class="progress-stat"><strong>${doneChecks}</strong> de ${totalChecks} pasos completados</span>
        <span class="progress-stat"><strong>${c.negatives.length}</strong> items negativos atacados</span>
        <span class="progress-stat"><strong>${pct>=100?'Completado':'Fase '+(activeIdx+1>0?activeIdx+1:1)+' activa'}</strong></span>
      </div>
    </div>

    <div class="tab-bar">
      <button class="tab active" onclick="switchTab('phases',this)">&#9881; Fases</button>
      <button class="tab" onclick="switchTab('negatives',this)">&#9888; Negativos</button>
      <button class="tab" onclick="switchTab('letterstream',this)">&#9993; Cartas</button>
      <button class="tab" onclick="switchTab('tracking',this)">&#128228; Tracking</button>
      <button class="tab" onclick="switchTab('decisions',this)">&#10068; Decisiones</button>
      <button class="tab" onclick="switchTab('analysis',this)">&#128200; An\u00e1lisis</button>
    </div>

    <div class="tab-content active" id="tab-phases">
      <h2><span class="icon">&#9881;</span> Plan de Acci\u00f3n</h2>
      <div class="phase-list">
        ${phases.map((phase,pi)=>{
          const phaseDone = phase.checklist.filter(i=>DB.load(i.id,false)).length;
          const isComplete = phaseDone===phase.checklist.length;
          const isActive = pi===activeIdx;
          const status = isComplete?'completed':(isActive?'active':'pending');
          return `<div class="phase-card ${status} ${DB.load('expand-'+phase.id,false)?'expanded':''}" id="phase-${phase.id}">
            <div class="phase-header" onclick="togglePhase('${phase.id}')">
              <div class="phase-indicator ${status}">${isComplete?'&#10003;':pi+1}</div>
              <div class="phase-info"><div class="phase-title">${phase.title}</div><div class="phase-subtitle">${phase.subtitle} &mdash; ${phaseDone}/${phase.checklist.length}</div></div>
              <span class="phase-chevron">&#9662;</span>
            </div>
            <div class="phase-body"><ul class="checklist">${phase.checklist.map(item=>`
              <li class="checklist-item ${DB.load(item.id,false)?'checked':''}" onclick="toggleCheck('${item.id}')">
                <div class="check-box"></div><span class="check-label">${item.label}</span>
              </li>`).join('')}</ul>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <div class="tab-content" id="tab-negatives">
      <h2><span class="icon">&#9888;</span> Items Negativos Atacados</h2>
      <p class="section-subtitle">8 cuentas negativas en total &mdash; cada una con evidencia s\u00f3lida de inexactitudes</p>
      <div class="tradeline-grid">
        ${c.negatives.map(n=>`<div class="tradeline-card negative">
          <div class="tl-top"><span class="tl-name">${n.creditor}</span><span class="tl-badge badge-red">${n.amount}</span></div>
          <div class="tl-details">
            <strong>Tipo:</strong> ${n.type}<br>
            <strong>Bur\u00f3s:</strong> ${n.bureaus.join(', ')}<br>
            <strong>Atrasos:</strong> ${n.lates}<br>
            <strong>Estrategia:</strong> ${n.strategy}<br>
            <strong>Impacto estimado:</strong> ${n.impact}<br>
            <strong>Cartas:</strong> ${n.letters.join(', ')}
          </div>
        </div>`).join('')}
      </div>
    </div>

    <div class="tab-content" id="tab-letterstream">
      <h2><span class="icon">&#9993;</span> Paquete de Cartas - Ronda 2</h2>
      <p class="section-subtitle">9 cartas generadas (EN + ES). Imprimir, firmar, adjuntar ID + prueba de domicilio, y enviar por correo certificado.</p>
      <div class="lsw-steps">
        <div class="lsw-step"><div class="lsw-step-num">1</div><div class="lsw-step-label">Imprimir</div></div>
        <div class="lsw-step"><div class="lsw-step-num">2</div><div class="lsw-step-label">Firmar</div></div>
        <div class="lsw-step"><div class="lsw-step-num">3</div><div class="lsw-step-label">Adjuntar ID + Direcci\u00f3n</div></div>
        <div class="lsw-step"><div class="lsw-step-num">4</div><div class="lsw-step-label">Correo Certificado</div></div>
        <div class="lsw-step"><div class="lsw-step-num">5</div><div class="lsw-step-label">Rastrear &amp; Esperar 30 d\u00edas</div></div>
      </div>
      <h3 style="margin-top:2rem">Estado de las Cartas</h3>
      ${c.letterStreamJobs.map(j=>`<div class="lsw-card" style="padding:1rem 1.25rem"><div style="display:flex;justify-content:space-between;align-items:center"><div style="display:flex;align-items:center;gap:0.75rem"><span style="background:var(--bg-surface);padding:0.3rem 0.7rem;border-radius:6px;font-weight:800;font-size:0.82rem;color:var(--gold)">#${j.num}</span><span style="font-weight:600">${j.target}</span></div><div style="display:flex;align-items:center;gap:0.5rem"><span class="lsw-status ${DB.load('lsw-'+j.num,'draft')}">${DB.load('lsw-'+j.num,'draft').toUpperCase()}</span><select onchange="updateLSW(${j.num},this.value)" style="background:var(--bg-surface);border:1px solid var(--border);color:var(--text-primary);border-radius:5px;padding:0.2rem 0.4rem;font-size:0.75rem"><option value="draft"${DB.load('lsw-'+j.num,'draft')==='draft'?' selected':''}>Borrador</option><option value="sending"${DB.load('lsw-'+j.num,'draft')==='sending'?' selected':''}>Enviando</option><option value="sent"${DB.load('lsw-'+j.num,'draft')==='sent'?' selected':''}>Enviado</option></select></div></div></div>`).join('')}
    </div>

    <div class="tab-content" id="tab-tracking">
      <h2><span class="icon">&#128228;</span> Seguimiento de Correo Certificado</h2>
      <table class="data-table"><thead><tr><th>#</th><th>Carta</th><th>Tracking #</th><th>Enviado</th><th>Recibido</th><th>Resultado</th></tr></thead><tbody>
        ${c.tracking.map(t=>`<tr>
          <td>${t.letter}</td><td>${t.desc}</td>
          <td><input value="${DB.load('trk-'+t.letter+'-cert','')}" onchange="updateTrk('${t.letter}','cert',this.value)" placeholder="N\u00famero de rastreo"></td>
          <td><input value="${DB.load('trk-'+t.letter+'-sent','')}" onchange="updateTrk('${t.letter}','sent',this.value)" placeholder="M/D"></td>
          <td><input value="${DB.load('trk-'+t.letter+'-recv','')}" onchange="updateTrk('${t.letter}','recv',this.value)" placeholder="M/D"></td>
          <td><select onchange="updateTrk('${t.letter}','result',this.value)"><option value="">--</option><option value="Eliminado"${DB.load('trk-'+t.letter+'-result','')==='Eliminado'?' selected':''}>Eliminado</option><option value="Actualizado"${DB.load('trk-'+t.letter+'-result','')==='Actualizado'?' selected':''}>Actualizado</option><option value="Verificado"${DB.load('trk-'+t.letter+'-result','')==='Verificado'?' selected':''}>Verificado</option><option value="Sin Respuesta"${DB.load('trk-'+t.letter+'-result','')==='Sin Respuesta'?' selected':''}>Sin Respuesta</option></select></td>
        </tr>`).join('')}
      </tbody></table>
    </div>

    <div class="tab-content" id="tab-decisions">
      <h2><span class="icon">&#10068;</span> "\u00bfQu\u00e9 Hago Si...?" &Aacute;rbol de Decisiones</h2>
      <p class="section-subtitle">Haz clic en cualquier escenario para ver tu pr\u00f3ximo paso.</p>
      <div class="decision-tree-container" id="decisionTree"></div>
    </div>

    <div class="tab-content" id="tab-analysis">
      <h2><span class="icon">&#128200;</span> An\u00e1lisis de Impacto</h2>
      <table class="data-table"><thead><tr><th>Acci\u00f3n</th><th>Ganancia Est.</th><th>Bur\u00f3s</th><th>Dificultad</th></tr></thead><tbody>
        <tr><td>Eliminar LVNV Funding ($1,088 + $645)</td><td>+35 a +60</td><td>3</td><td style="color:var(--accent-orange)">Media</td></tr>
        <tr><td>Eliminar Midland Credit ($888 + $433)</td><td>+20 a +40</td><td>3</td><td style="color:var(--accent-orange)">Media</td></tr>
        <tr><td>Eliminar SW Credit / Comcast ($866)</td><td>+15 a +25</td><td>3</td><td style="color:var(--accent-green)">F\u00e1cil</td></tr>
        <tr><td>Eliminar Spring Oaks ($634 - fecha imposible)</td><td>+15 a +25</td><td>3</td><td style="color:var(--accent-green)">F\u00e1cil</td></tr>
        <tr><td>Eliminar Caine &amp; Weiner ($398)</td><td>+10 a +15</td><td>2</td><td style="color:var(--accent-green)">F\u00e1cil</td></tr>
        <tr><td>Eliminar BofA charge-off ($538)</td><td>+20 a +40</td><td>3</td><td style="color:var(--accent-orange)">Media</td></tr>
        <tr><td style="font-weight:700">Total potencial</td><td style="font-weight:700;color:var(--accent-green)">+115 a +205</td><td></td><td></td></tr>
      </tbody></table>
      <div class="branch info"><div class="branch-label">Factores Clave de Puntaje Siendo Atacados</div>
        <p style="line-height:2">
        &bull; "Demasiadas cuentas negativas" &rarr; <strong>SE SOLUCIONA eliminando 7 cobranzas + 1 charge-off</strong><br>
        &bull; "Balances negativos muy altos" &rarr; <strong>SE SOLUCIONA: ~$5,000 eliminado</strong><br>
        &bull; "Sin cuentas de cr\u00e9dito abiertas" &rarr; Considerar tarjeta asegurada (secured card)<br>
        &bull; "Demasiadas cuentas revolving en estado negativo" &rarr; Se soluciona al eliminar charge-offs<br>
        &bull; "Primera cuenta muy reciente" &rarr; Mejora con el tiempo naturalmente
        </p>
      </div>
      <div class="branch success"><div class="branch-label">Evidencia M\u00e1s Fuerte del Reporte</div>
        <p style="line-height:2">
        &bull; <strong>Fechas imposibles:</strong> \u00daltima actividad en EFX PRECEDE la apertura de cuenta en 4 cuentas (Spring Oaks por 16 meses)<br>
        &bull; <strong>Re-aging:</strong> TU muestra actividad en Mayo 2026 en deudas que no han tenido actividad desde 2021-22<br>
        &bull; <strong>Status dividido:</strong> Las 7 cobranzas aparecen "Open" en EFX pero "Charge Off" en TU/EX<br>
        &bull; <strong>BofA absurdo:</strong> 0/0/0 atrasos en TU vs 1/1/47 en EFX para la MISMA cuenta<br>
        &bull; <strong>EX contradictorio:</strong> "100% pagado a tiempo" en cuentas en cobranza; 0 cuentas abiertas pero 3 en mora
        </p>
      </div>
    </div>
  `;
  renderDecisionTree();
}

// ==================== DECISIONS ====================
function renderDecisionTree() {
  const decisions = [
    {q:"La agencia ELIMINA el item",a:[{t:"good",x:"Pide un reporte nuevo en 2 semanas para confirmar. Guarda la carta de eliminaci\u00f3n como registro permanente."},{t:"warn",x:"Revisa en 6 meses - a veces los items eliminados reaparecen."}]},
    {q:"La agencia dice 'VERIFICADO' (no eliminado)",a:[{t:"warn",x:"Env\u00eda carta de M\u00e9todo de Verificaci\u00f3n (MOV) dentro de 5 d\u00edas h\u00e1biles."},{t:"warn",x:"Exige: QU\u00c9 procedimiento usaron, QUI\u00c9N contactaron, QU\u00c9 documentos revisaron."},{t:"bad",x:"No aceptes 'e-OSCAR' como respuesta adecuada - no es un procedimiento razonable bajo FCRA."}]},
    {q:"La agencia PIERDE el plazo de 30 d\u00edas",a:[{t:"good",x:"DEBEN eliminar el item bajo FCRA 1681i(a)(1)."},{t:"warn",x:"Env\u00eda carta de 'Falta de Investigaci\u00f3n' inmediatamente."},{t:"warn",x:"Si no lo eliminan en 15 d\u00edas m\u00e1s, presenta queja CFPB."}]},
    {q:"Respuesta MOV dice 'e-OSCAR' o es vaga",a:[{t:"bad",x:"No es adecuado bajo 1681i(a)(7)."},{t:"warn",x:"Env\u00eda carta de escalaci\u00f3n + amenaza de queja CFPB si no eliminan en 15 d\u00edas."}]},
    {q:"El item REAPARECE despu\u00e9s de eliminado",a:[{t:"bad",x:"Violaci\u00f3n de FCRA 1681i(a)(5)(B). Debieron notificarte ANTES de reinsertarlo."},{t:"warn",x:"Env\u00eda carta de 'Reinserci\u00f3n Sin Aviso' + queja CFPB."}]},
    {q:"LVNV/Midland no eliminan",a:[{t:"warn",x:"Negocia pago-por-eliminaci\u00f3n: ofrece 30-50% (~$500-$800)."},{t:"warn",x:"Obt\u00e9n acuerdo POR ESCRITO antes de pagar."},{t:"bad",x:"Si todo falla: consulta abogado FCRA (trabajan a contingencia)."}]},
    {q:"Caine & Weiner / SW Credit no validan deuda",a:[{t:"good",x:"No pueden reportar lo que no pueden validar (FDCPA 809)."},{t:"warn",x:"Usa el hecho de que los 3 bur\u00f3s lo reportan diferente."},{t:"warn",x:"Env\u00eda carta de cese de comunicaci\u00f3n FDCPA si el acoso contin\u00faa."}]},
    {q:"Spring Oaks no elimina a pesar de fecha imposible",a:[{t:"good",x:"La evidencia es irrefutable - fecha de actividad PRECEDE apertura por 16 meses."},{t:"warn",x:"Si no eliminan, CFPB + NJ Division of Consumer Affairs de inmediato."}]},
    {q:"Nada funciona despu\u00e9s de 90+ d\u00edas",a:[{t:"bad",x:"Consulta abogado FCRA (muchos trabajan a contingencia)."},{t:"warn",x:"Documenta TODO: cartas, recibos, respuestas, llamadas."},{t:"warn",x:"Violaciones FCRA: $100-$1,000 por violaci\u00f3n + honorarios de abogado."}]}
  ];
  const el = document.getElementById('decisionTree');
  if (!el) return;
  el.innerHTML = decisions.map((d,i)=>`<div class="decision-question" onclick="toggleDecision(${i})" id="dq-${i}"><strong>SI</strong> ${d.q}</div><div id="da-${i}" style="display:none">${d.a.map(a=>`<div class="decision-answer ${a.t} show">${a.x}</div>`).join('')}</div>`).join('');
}

function toggleDecision(i) {
  const el = document.getElementById('da-'+i);
  const qEl = document.getElementById('dq-'+i);
  document.querySelectorAll('[id^="da-"]').forEach(e=>e.style.display='none');
  document.querySelectorAll('[id^="dq-"]').forEach(e=>e.classList.remove('selected'));
  if (el.style.display==='none'){el.style.display='block';qEl.classList.add('selected');}
}

// ==================== INTERACTIONS ====================
function switchTab(id,el){
  document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('tab-'+id).classList.add('active');
  if(el)el.classList.add('active');
}
function toggleCheck(id){DB.save(id,!DB.load(id,false));render();}
function togglePhase(id){DB.save('expand-'+id,!DB.load('expand-'+id,false));render();}
function updateLSW(n,v){DB.save('lsw-'+n,v);}
function updateTrk(l,f,v){DB.save('trk-'+l+'-'+f,v);}
function exportData(){
  const data={};
  for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('kfs_'))data[k]=localStorage.getItem(k);}
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='kfs-cesar-'+new Date().toISOString().slice(0,10)+'.json';a.click();
}
function importData(){document.getElementById('importFile').click();}
function handleImport(e){
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=function(ev){
    try{const data=JSON.parse(ev.target.result);Object.entries(data).forEach(([k,v])=>localStorage.setItem(k,v));alert('Datos importados exitosamente!');render();}catch(e){alert('Formato inv\u00e1lido');}
  };
  reader.readAsText(file);
}

// ==================== INIT ====================
render();

