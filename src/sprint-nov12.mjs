import {createHash}from 'node:crypto';
export function compareDocumentSections(before,after){
 const fail=()=>{throw new TypeError('Sections invalides / Invalid sections / Secciones inválidas');};
 const index=rows=>{if(!Array.isArray(rows)||rows.length>1000)fail();const m=new Map();for(const r of rows){if(typeof r.id!=='string'||!r.id||m.has(r.id)||typeof r.text!=='string'||r.text.length>1000000||typeof r.sourceUrl!=='string')fail();m.set(r.id,r);}return m;};
 const a=index(before),b=index(after),ids=[...new Set([...a.keys(),...b.keys()])];const digest=s=>createHash('sha256').update(s).digest('hex');
 return {sections:ids.map(id=>{const left=a.get(id),right=b.get(id);return {id,state:!left?'added':!right?'removed':left.text===right.text?'unchanged':left.text.replace(/\s+/g,' ').trim()===right.text.replace(/\s+/g,' ').trim()?'whitespace_only':'text_changed',beforeSha256:left?digest(left.text):null,afterSha256:right?digest(right.text):null,sourceChanged:!!left&&!!right&&left.sourceUrl!==right.sourceUrl};}),clinicalMeaningInferred:false,medicalAdviceProvided:false};
}
