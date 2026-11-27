(function(){
 const t=document.createElement('template');
 t.innerHTML=`<style>:host{display:block;width:100%;height:100%;font-family:Arial,sans-serif;color:#171717}*{box-sizing:border-box}.wrap{height:100%;overflow:auto;padding:20px 24px;background:white}.heading{font-size:18px;font-weight:700}.sub,.legend{font-size:11px;color:#666;margin:5px 0 18px}.legend{display:flex;gap:18px;flex-wrap:wrap}.legend span{display:inline-flex;gap:6px;align-items:center}.swatch{width:13px;height:10px;background:#222}.swatch.plan{background:white;border:1.5px solid #222}.row{display:grid;grid-template-columns:minmax(85px,1fr) minmax(90px,3fr) minmax(85px,1fr);gap:12px;align-items:center;margin-bottom:19px}.label{font-size:12px;font-weight:600;overflow-wrap:anywhere}.track{position:relative;height:31px}.zero{position:absolute;height:100%;border-left:1px solid #aaa}.bar{position:absolute;height:12px}.actual{top:2px;background:#222}.bar.plan{top:17px;border:1.5px solid #222;background:white}.value{font-size:11px;text-align:right}.delta{font-size:10px;margin-top:3px;color:#777}.negative{color:#b52626}.positive{color:#257446}.empty{font-size:12px;color:#777;padding:16px 0}.foot{border-top:1px solid #eee;padding-top:9px;font-size:10px;color:#888}</style><div class="wrap"><div class="heading"></div><div class="sub"></div><div class="legend"><span><i class="swatch"></i><b class="actualName"></b></span><span><i class="swatch plan"></i><b class="planName"></b></span></div><div class="rows"></div><div class="foot"></div></div>`;
 const sample=[{label:'North America',actual:820,plan:760},{label:'Europe',actual:680,plan:720},{label:'Asia Pacific',actual:590,plan:520},{label:'Latin America',actual:360,plan:410},{label:'Middle East',actual:240,plan:220}];
 class IBCSBarChart extends HTMLElement{
 constructor(){super();this.attachShadow({mode:'open'}).appendChild(t.content.cloneNode(true));this._props={title:'Actual vs Plan',subtitle:'',showSampleData:false};}
 onCustomWidgetBeforeUpdate(changed){Object.assign(this._props,changed);}
 onCustomWidgetAfterUpdate(){this.render();}
 onCustomWidgetResize(){this.render();}
 connectedCallback(){this.render();}
 get title(){return this._props.title;} set title(v){this._props.title=v;this.render();}
 get subtitle(){return this._props.subtitle;} set subtitle(v){this._props.subtitle=v;this.render();}
 get showSampleData(){return this._props.showSampleData;} set showSampleData(v){this._props.showSampleData=v;this.render();}
 _result(){
 if(this.showSampleData===true)return {rows:sample,actualName:'Actual',planName:'Plan',demo:true};
 const b=this.dataBinding??this._props.dataBinding;
 if(!b||b.state!=='success'||!Array.isArray(b.data))return {rows:[],message:'Select a data source, Actual and Plan measures, and dimensions in the Builder.'};
 const keys=id=>b.metadata?.feeds?.[id]?.values??Object.keys(b.data[0]??{}).filter(k=>k.startsWith(id+'_')).sort((a,c)=>Number(a.split('_').pop())-Number(c.split('_').pop()));
 const dims=keys('dimensions'),actual=keys('actual'),plan=keys('plan');
 if(actual.length!==1||plan.length!==1)return {rows:[],message:'Select exactly one Actual and one Plan measure.'};
 const ak=actual[0],pk=plan[0];
 const number=v=>v==null||v===''?NaN:Number(v);
 const rows=b.data.map(r=>({label:dims.map(k=>r[k]?.label??r[k]?.id??'').join(' / ')||'Total',actual:number(r[ak]?.raw),plan:number(r[pk]?.raw),actualText:r[ak]?.formatted,planText:r[pk]?.formatted,actualUnit:r[ak]?.unit,planUnit:r[pk]?.unit})).filter(r=>Number.isFinite(r.actual)&&Number.isFinite(r.plan));
 const name=(k,f)=>b.metadata?.mainStructureMembers?.[k]?.label??b.metadata?.mainStructureMembers?.[k]?.description??b.metadata?.measures?.[k]?.label??b.metadata?.measures?.[k]?.description??f;
 return {rows,actualName:name(ak,'Actual'),planName:name(pk,'Plan'),message:'No comparable data available.'};
 }
 render(){if(!this.shadowRoot)return;const q=s=>this.shadowRoot.querySelector(s),result=this._result(),rows=result.rows,container=q('.rows');container.replaceChildren();q('.heading').textContent=this._props.title||'Actual vs Plan';q('.sub').textContent=this._props.subtitle||'';q('.actualName').textContent=result.actualName||'Actual';q('.planName').textContent=result.planName||'Plan';q('.foot').textContent=result.demo?'Sample data · not connected to model':'IBCS-inspired · Actual / Plan comparison';
 const el=(cls,text)=>{const e=document.createElement('div');e.className=cls;if(text!==undefined)e.textContent=text;return e;};
 if(!rows.length){container.append(el('empty',result.message));return;}
 let min=0,max=0;for(const r of rows){min=Math.min(min,r.actual,r.plan);max=Math.max(max,r.actual,r.plan);}const span=max-min||1,pos=v=>(v-min)/span*100,zero=pos(0);const fmt=new Intl.NumberFormat('en-US',{maximumFractionDigits:1});
 for(const r of rows){const row=el('row'),track=el('track'),axis=el('zero');axis.style.left=zero+'%';track.append(axis);for(const [cls,val] of [['actual',r.actual],['plan',r.plan]]){const bar=el('bar '+cls);bar.style.left=Math.min(zero,pos(val))+'%';bar.style.width=Math.abs(pos(val)-zero)+'%';bar.title=cls+': '+fmt.format(val);track.append(bar);}const value=el('value'),diff=r.actual-r.plan,pct=r.plan!==0?diff/Math.abs(r.plan)*100:null;value.append(el('',(r.actualText??fmt.format(r.actual))+' / '+(r.planText??fmt.format(r.plan))));const comparable=!r.actualUnit||!r.planUnit||r.actualUnit===r.planUnit;value.append(el('delta '+(comparable?(diff<0?'negative':diff>0?'positive':''):''),comparable?((diff>0?'+':'')+fmt.format(diff)+(pct===null?'':' ('+(pct>0?'+':'')+fmt.format(pct)+'%)')):'Different units'));row.append(el('label',r.label),track,value);container.append(row);}
 }
 }
 if(!customElements.get('com-openai-ibcs-barchart'))customElements.define('com-openai-ibcs-barchart',IBCSBarChart);
})();
