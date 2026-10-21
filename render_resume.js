// Render resume.html -> one-long-page PDF via Chrome DevTools Protocol (no Playwright needed).
// Usage: node render_cdp.js [input.html] [output.pdf] [chromePath]
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile, spawn } = require('child_process');

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
];
const IN  = process.argv[2] || 'resume.html';
const OUT = process.argv[3] || 'Aldo_Villamil_Resume_UIUX.pdf';
const PORT = 9333;

function findChrome() {
  for (const p of CHROME_CANDIDATES) if (fs.existsSync(p)) return p;
  throw new Error('No Chrome/Edge found');
}

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function cdp(ws, method, params={}) {
  const id = ++ws._id;
  return new Promise((resolve, reject) => {
    const onMsg = (raw) => {
      const m = JSON.parse(raw);
      if (m.id === id) { ws.off('message', onMsg); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result); }
    };
    ws.on('message', onMsg);
    ws.send(JSON.stringify({id, method, params}));
  });
}

(async () => {
  const chrome = findChrome();
  const proc = spawn(chrome, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=' + path.join(__dirname, '.cdp-profile'),
    'about:blank',
  ], { stdio: 'ignore' });

  // wait for devtools endpoint
  let targets = null;
  for (let i=0;i<40;i++){
    await sleep(250);
    try {
      targets = await new Promise((res,rej)=>{
        http.get(`http://127.0.0.1:${PORT}/json`, r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>res(JSON.parse(d)));}).on('error',rej);
      });
      if (targets && targets.length) break;
    } catch(e){}
  }
  if (!targets) { console.error('CDP endpoint never came up'); process.exit(1); }
  const page = targets.find(t=>t.type==='page');
  const WebSocket = (await import('ws')).default;
  const ws = new WebSocket(page.webSocketDebuggerUrl, {maxPayload: 256*1024*1024, perMessageDeflate: false});
  ws._id = 0;
  await new Promise(r=>ws.on('open', r));

  const fileUrl = 'file:///' + path.resolve(IN).replace(/\\/g,'/');
  await cdp(ws,'Page.enable');
  await cdp(ws,'Page.navigate',{url:fileUrl});
  await sleep(3500); // allow webfonts to load
  // force fonts ready + zero margins + clip overflow
  await cdp(ws,'Runtime.evaluate',{expression:`
    (async () => {
      await document.fonts.ready;
      const st=document.createElement('style');
      st.textContent='@page{margin:0 !important} html,body{margin:0;padding:0;background:#000}';
      document.head.appendChild(st);
      const poster=document.querySelector('.poster');
      poster.style.overflow='hidden';
      return JSON.stringify({w: poster.offsetWidth, h: poster.scrollHeight});
    })()`, awaitPromise:true, returnByValue:true}).then(r=>{
    const m = JSON.parse(r.result.value);
    console.log('Measured:', m.w + 'x' + m.h);
    global.__w = m.w; global.__h = m.h;
  });

  // Page must match the CONTENT box, not a hardcoded 1100px: a narrower layout
  // (e.g. A4 at 794px) otherwise renders a page far wider than the artwork and
  // leaves a band of empty background on the right of the PDF.
  const w = global.__w;
  const h = global.__h;
  const pdfResp = await cdp(ws,'Page.printToPDF',{
    printBackground:true,
    paperWidth: w/96,
    paperHeight: h/96,
    marginTop:0, marginBottom:0, marginLeft:0, marginRight:0,
    pageRanges:'1',
    transferMode:'ReturnAsStream'
  });
  const streamHandle = (pdfResp.stream !== undefined) ? pdfResp.stream : (pdfResp.data && pdfResp.data.streamHandle);
  let done=false, chunks=[];
  while(!done){
    const r = await cdp(ws,'IO.read',{handle:streamHandle, size: 1048576});
    if (r.data) chunks.push(Buffer.from(r.data,'base64'));
    done = r.eof;
  }
  try { await cdp(ws,'IO.close',{handle:streamHandle}); } catch(e){}
  fs.writeFileSync(OUT, Buffer.concat(chunks));
  console.log('WROTE', OUT, fs.statSync(OUT).size, 'bytes');
  ws.close(); proc.kill();
  process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
