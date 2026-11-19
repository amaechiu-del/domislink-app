import { readFile, writeFile } from 'node:fs/promises';
const path = new URL('../frontend/src/onelink-registry.js', import.meta.url);
const { registry } = await import(path.href);
const report = [];
for (const [id, entry] of Object.entries(registry)) {
  const result = {id, url: entry.url, checkedAt: new Date().toISOString(), httpStatus: null, reachable: false, reason: ''};
  if (!entry.url) { result.reason='No configured destination'; report.push(result); continue; }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(entry.url, {method:'GET',redirect:'manual',signal:controller.signal,headers:{'User-Agent':'DomisLink-OneLink-Verification/1.0'}});
      result.httpStatus=response.status;
      result.reachable=response.status>=200&&response.status<400;
      result.reason=response.status>=300&&response.status<400 ? 'Redirect requires manual destination review' : result.reachable?'Reachable; identity and authentication still require review':'HTTP error';
    } finally {clearTimeout(timer);}
  } catch (e) {result.reason=e.name==='AbortError'?'Timed out':String(e.message).slice(0,180);}
  report.push(result);
}
await writeFile(new URL('../onelink-health-report.json',import.meta.url),JSON.stringify({generatedAt:new Date().toISOString(),note:'Reachability does not authorize live status or login integration.',apps:report},null,2)+'\n');
console.table(report.map(({id,httpStatus,reachable,reason})=>({id,httpStatus,reachable,reason})));
