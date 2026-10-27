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
 numeric(cell){if(cell===null||cell===undefined)return NaN;if(typeof cell==='number')return cell;if(typeof cell==='string')return Number(cell.replace(/,/g,''));if(typeof cell==='object'){for(const key of ['rawValue','value','raw','formattedValue']){if(cell[key]!=null){const v=this.numeric(cell[key]);if(Number.isFinite(v))return v;}}}return NaN;}
 readPoints(binding){const data=binding?.data;if(!Array.isArray(data))return [];
 // SAC result rows contain dimensions plus measure cells indexed by technical feed/member IDs.
 const feedMeta=binding?.metadata?.feeds||{};
 const keysFor=(id)=>{const f=feedMeta[id];const arr=Array.isArray(f)?f:(f?[f]:[]);return arr.flatMap(x=>[x?.id,x?.name,x?.description,x?.label,x?.key].filter(Boolean));};
 const xkeys=[...keysFor('x'), 'X','x'];const ykeys=[...keysFor('y'),'Y','y'];
 const measureKeys=keysFor('measures');
 const find=(row,keys)=>{for(const k of keys){if(Object.prototype.hasOwnProperty.call(row,k)){const n=this.numeric(row[k]);if(Number.isFinite(n))return n;}}return NaN;};
 return data.map(row=>{let x=find(row,xkeys),y=find(row,ykeys);if(!Number.isFinite(x)||!Number.isFinite(y)){
  // Fallback for one multi-measure feed: identify members named X and Y.
  const entries=Object.entries(row).filter(([k,v])=>k!=='POINT_ID'&&typeof v==='object'&&v!==null);
  for(const [key,val] of entries){const label=[key,val?.description,val?.label,val?.id].join(' ').toUpperCase();if(!Number.isFinite(x)&&/(^|\W)X($|\W)/.test(label))x=this.numeric(val);if(!Number.isFinite(y)&&/(^|\W)Y($|\W)/.test(label))y=this.numeric(val);}
 }
 return {x,y};}).filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y));}
 render(){if(!this.isConnected||!this.shadowRoot.querySelector('canvas'))return;const binding=this.getBinding();const status=this.shadowRoot.querySelector('.status');const points=this.readPoints(binding);const canvas=this.shadowRoot.querySelector('canvas');const rect=canvas.getBoundingClientRect();if(rect.width<1||rect.height<1)return;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);ctx.clearRect(0,0,rect.width,rect.height);
 if(!points.length){status.textContent=binding?.state?`Keine XY-Punkte verfügbar (Binding: ${binding.state}). Prüfe Kennzahlen X und Y sowie POINT_ID.`:'Bitte SAC-Modell verbinden: Dimension POINT_ID, Kennzahlen X und Y.';return;}
 const xs=points.map(p=>p.x),ys=points.map(p=>p.y);let minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);const dx=Math.max(maxX-minX,1),dy=Math.max(maxY-minY,1);const padding=16;const scale=Math.min((rect.width-2*padding)/dx,(rect.height-2*padding)/dy);const ox=(rect.width-dx*scale)/2,oy=(rect.height-dy*scale)/2;ctx.fillStyle=this.options.dotColor||'#d41478';const r=Math.max(0.5,Number(this.options.pointRadius)||2.3);for(const p of points){const px=ox+(p.x-minX)*scale;const py=oy+(this.options.flipY?(maxY-p.y):(p.y-minY))*scale;ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);ctx.fill();}status.textContent=`${points.length.toLocaleString('de-DE')} Datenpunkte aus dem SAC Data Binding · X ${minX}–${maxX} · Y ${minY}–${maxY}`;
 }
}
if(!customElements.get(TAG))customElements.define(TAG,IJUNOXY);
})();
