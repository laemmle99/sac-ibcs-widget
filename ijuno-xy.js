(()=>{'use strict';
const TAG='com-ijuno-xy-binding';
class IJUNOXY extends HTMLElement{
 constructor(){super();this.attachShadow({mode:'open'});this.options={dotColor:'#d41478',pointRadius:2.3,flipY:false};this._dataBinding=null;}
 connectedCallback(){this.shadowRoot.innerHTML=`<style>:host{display:block;width:100%;height:100%;min-height:220px;font:13px Arial,sans-serif}.wrap{height:100%;box-sizing:border-box;padding:14px;display:flex;flex-direction:column;background:#fff}.heading{font-size:17px;font-weight:700;margin-bottom:6px}.chart{flex:1;min-height:140px;position:relative}canvas{width:100%;height:100%;display:block}.status{font-size:11px;color:#666;margin-top:5px}</style><div class="wrap"><div class="heading">IJUNO · XY Data Points</div><div class="chart"><canvas></canvas></div><div class="status" role="status"></div></div>`;this.ro=new ResizeObserver(()=>this.render());this.ro.observe(this);this.render();}
 disconnectedCallback(){this.ro?.disconnect();}
 onCustomWidgetBeforeUpdate(changed){Object.assign(this.options,changed);}
 onCustomWidgetAfterUpdate(){this.render();}
 onCustomWidgetResize(){this.render();}
 set dataBinding(value){this._dataBinding=value;this.render();}
 get dataBinding(){return this._dataBinding;}
 getBinding(){return this._dataBinding||this.dataBindings?.dataBinding||null;}
 numeric(cell){
  if(cell==null)return NaN;
  if(typeof cell==='number')return cell;
  if(typeof cell==='string'){const s=cell.trim().replace(/\s/g,'');if(!s)return NaN;let n=Number(s);if(Number.isFinite(n))return n;const european=s.replace(/\./g,'').replace(',','.');return Number(european);}
  if(typeof cell==='object')for(const k of ['raw','rawValue','value','formatted','formattedValue']){if(cell[k]!=null){const n=this.numeric(cell[k]);if(Number.isFinite(n))return n;}}
  return NaN;
 }
 getBinding(){return this._dataBinding||this.dataBindings?.getDataBinding?.('dataBinding')||this.dataBindings?.dataBinding||null;}
 readPoints(binding){
  const data=binding?.data||binding?.getData?.()?.data||[];
  this._diagnostic={rows:Array.isArray(data)?data.length:0,keys:Array.isArray(data)&&data.length?Object.keys(data[0]):[],feeds:binding?.metadata?.feeds||null};
  if(!Array.isArray(data))return [];
  const feeds=binding?.metadata?.feeds||{};
  const lookup=(id)=>{
   const feed=Array.isArray(feeds)?feeds.find(f=>f.id===id):feeds[id];
   const values=Array.isArray(feed)?feed:(feed?[feed]:[]);
   return values.flatMap(f=>[f?.id,f?.key,f?.name,f?.description,f?.label,f?.memberId,f?.member].filter(v=>typeof v==='string'));
  };
  const xkeys=[...lookup('x'),'X','x'];const ykeys=[...lookup('y'),'Y','y'];
  const extract=(row,keys)=>{for(const key of keys){if(Object.hasOwn(row,key)){const n=this.numeric(row[key]);if(Number.isFinite(n))return n;}}return NaN;};
  return data.map(row=>{
   let x=extract(row,xkeys),y=extract(row,ykeys);
   // SAC may provide opaque measure keys. Read measure metadata attached to each cell.
   for(const [key,cell] of Object.entries(row)){
    if(cell==null||typeof cell!=='object')continue;
    const labels=[key,cell.id,cell.key,cell.label,cell.description,cell.memberId].filter(Boolean).join(' ').toUpperCase();
    if(!Number.isFinite(x)&&/(^|[^A-Z])X([^A-Z]|$)/.test(labels))x=this.numeric(cell);
    if(!Number.isFinite(y)&&/(^|[^A-Z])Y([^A-Z]|$)/.test(labels))y=this.numeric(cell);
   }
   // If exactly two numeric measure cells exist, use the feed/row order as last resort.
   if(!Number.isFinite(x)||!Number.isFinite(y)){
    const numericCells=Object.entries(row).filter(([key,cell])=>key!=='POINT_ID'&&key!=='point'&&Number.isFinite(this.numeric(cell)));
    if(numericCells.length===2){if(!Number.isFinite(x))x=this.numeric(numericCells[0][1]);if(!Number.isFinite(y))y=this.numeric(numericCells[1][1]);}
   }
   return {x,y};
  }).filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y));
 }
 render(){if(!this.isConnected||!this.shadowRoot.querySelector('canvas'))return;const binding=this.getBinding();const status=this.shadowRoot.querySelector('.status');const points=this.readPoints(binding);const canvas=this.shadowRoot.querySelector('canvas');const rect=canvas.getBoundingClientRect();if(rect.width<1||rect.height<1)return;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);ctx.clearRect(0,0,rect.width,rect.height);
 if(!points.length){status.textContent=binding?.state?`Keine XY-Punkte (Binding: ${binding.state}; Zeilen: ${this._diagnostic?.rows||0}; Spalten: ${(this._diagnostic?.keys||[]).join(', ')||'keine'}).`:'Bitte SAC-Modell verbinden: Dimension POINT_ID, Kennzahlen X und Y.';console.log('[IJUNO XY] Diagnose',this._diagnostic,'Beispielzeile',binding?.data?.[0]);return;}
 const xs=points.map(p=>p.x),ys=points.map(p=>p.y);let minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);const dx=Math.max(maxX-minX,1),dy=Math.max(maxY-minY,1);const padding=16;const scale=Math.min((rect.width-2*padding)/dx,(rect.height-2*padding)/dy);const ox=(rect.width-dx*scale)/2,oy=(rect.height-dy*scale)/2;ctx.fillStyle=this.options.dotColor||'#d41478';const r=Math.max(0.5,Number(this.options.pointRadius)||2.3);for(const p of points){const px=ox+(p.x-minX)*scale;const py=oy+(this.options.flipY?(maxY-p.y):(p.y-minY))*scale;ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);ctx.fill();}status.textContent=`${points.length.toLocaleString('de-DE')} Datenpunkte aus dem SAC Data Binding · X ${minX}–${maxX} · Y ${minY}–${maxY}`;
 }
}
if(!customElements.get(TAG))customElements.define(TAG,IJUNOXY);
})();
