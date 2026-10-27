(()=>{
const TAG='com-ijuno-dotword';
class IJUNODots extends HTMLElement{
 constructor(){super();this.attachShadow({mode:'open'});this.cfg={title:'IJUNO · Data Art',subtitle:'Jeder Punkt repräsentiert einen Datenwert',dotColor:'#d41478',background:'#ffffff',maxPoints:2200};this._binding=null;this._ro=null;}
 connectedCallback(){this.shadowRoot.innerHTML=`<style>:host{display:block;width:100%;height:100%;min-height:240px;font-family:Arial,sans-serif}.box{width:100%;height:100%;box-sizing:border-box;background:var(--bg);padding:22px;display:flex;flex-direction:column}.title{font-size:20px;font-weight:700;color:#242424}.sub{font-size:12px;color:#777;margin-top:5px}.chart{flex:1;min-height:140px;position:relative}canvas{width:100%;height:100%;display:block}.foot{font-size:11px;color:#888}</style><div class="box"><div class="title"></div><div class="sub"></div><div class="chart"><canvas></canvas></div><div class="foot"></div></div>`;this._ro=new ResizeObserver(()=>this.render());this._ro.observe(this);this.render();}
 disconnectedCallback(){this._ro?.disconnect()}
 onCustomWidgetBeforeUpdate(changes){Object.assign(this.cfg,changes)}
 onCustomWidgetAfterUpdate(){this.render()}
 onCustomWidgetResize(){this.render()}
 set dataBinding(value){this._binding=value;this.render()}
 get dataBinding(){return this._binding}
 _values(){const b=this._binding;if(!b||b.state!=='success'||!Array.isArray(b.data))return null;let out=[];for(const row of b.data){for(const [key,v] of Object.entries(row)){if(v&&typeof v==='object'&&('raw'in v||'value'in v)){let n=Number(v.raw??v.value);if(Number.isFinite(n)){out.push(n);break}}else if(typeof v==='number'&&Number.isFinite(v)){out.push(v);break}}}return out}
 render(){if(!this.isConnected)return;const sh=this.shadowRoot,box=sh.querySelector('.box');box.style.setProperty('--bg',this.cfg.background||'#fff');sh.querySelector('.title').textContent=this.cfg.title||'IJUNO · Data Art';sh.querySelector('.sub').textContent=this.cfg.subtitle||'';const values=this._values(),foot=sh.querySelector('.foot');foot.textContent=values===null?'Vorschau mit Demo-Punkten · SAC-Modell im Builder verbinden':`${values.length.toLocaleString('de-DE')} Datenwerte aus SAC · typografische Punktvisualisierung`;const canvas=sh.querySelector('canvas'),r=canvas.getBoundingClientRect();if(r.width<10||r.height<10)return;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);const w=r.width,h=r.height;
 // Offscreen text mask. All visible marks are circles, not text glyphs.
 const mask=document.createElement('canvas');mask.width=1200;mask.height=260;const m=mask.getContext('2d');m.fillStyle='#000';m.font='900 240px Arial,Helvetica,sans-serif';m.textAlign='center';m.textBaseline='middle';m.fillText('IJUNO',600,137,1170);const px=m.getImageData(0,0,1200,260).data;let coords=[];for(let y=3;y<260;y+=5)for(let x=3;x<1200;x+=5)if(px[(y*1200+x)*4+3]>110)coords.push([x,y]);
 // Stable permutation to distribute the selected number of real observations over letters.
 let seed=1943;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};for(let i=coords.length-1;i>0;i--){let j=Math.floor(rnd()*(i+1));[coords[i],coords[j]]=[coords[j],coords[i]]}const demo=values===null;const count=demo?Math.min(1800,coords.length):Math.min(coords.length,values.length,Math.max(1,Number(this.cfg.maxPoints)||2200));const scale=Math.min((w-16)/1200,(h-12)/260);const ox=(w-1200*scale)/2,oy=(h-260*scale)/2;ctx.fillStyle=this.cfg.dotColor||'#d41478';for(let i=0;i<count;i++){const [x,y]=coords[i];const magnitude=demo?1:Math.log1p(Math.abs(values[i]||0));const radius=Math.max(1.0,Math.min(3.2,(demo?2.35:1.5+Math.min(1.4,magnitude/12))*scale));ctx.beginPath();ctx.arc(ox+x*scale,oy+y*scale,radius,0,Math.PI*2);ctx.fill()}
 if(!demo&&count===0){ctx.fillStyle='#777';ctx.font='14px Arial';ctx.fillText('Keine numerischen Daten im Binding vorhanden',16,h/2)}
 }
}
if(!customElements.get(TAG))customElements.define(TAG,IJUNODots);
})();
