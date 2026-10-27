(function () {
  const template = document.createElement('template');
  template.innerHTML = `<style>
    :host{display:block;width:100%;height:100%;font-family:Arial,Helvetica,sans-serif;color:#171717;box-sizing:border-box}*{box-sizing:border-box}.wrap{padding:20px 24px;height:100%;overflow:auto;background:#fff}.heading{font-size:18px;font-weight:700;margin:0 0 4px}.sub{font-size:11px;color:#777;margin-bottom:20px}.legend{display:flex;gap:18px;font-size:11px;margin-bottom:22px;align-items:center}.legend span{display:inline-flex;gap:6px;align-items:center}.swatch{width:13px;height:10px;background:#202020;display:inline-block}.swatch.plan{background:white;border:1.5px solid #222}.row{display:grid;grid-template-columns:minmax(85px,1fr) minmax(150px,3fr) minmax(80px,1fr);gap:12px;align-items:center;margin:0 0 19px}.label{font-size:12px;font-weight:600;overflow-wrap:anywhere}.track{position:relative;height:31px;border-left:1px solid #bbb}.bar{position:absolute;left:0;height:12px;min-width:1px}.actual{top:2px;background:#222}.plan{top:17px;border:1.5px solid #222;background:white}.value{font-size:11px;text-align:right;white-space:nowrap}.delta{font-size:10px;color:#777;margin-top:3px}.delta.negative{color:#b52626}.delta.positive{color:#257446}.empty{font-size:12px;color:#777;padding:16px 0}.foot{border-top:1px solid #e8e8e8;margin-top:16px;padding-top:9px;font-size:10px;color:#999}
  </style><div class="wrap"><div class="heading"></div><div class="sub"></div><div class="legend"><span><i class="swatch"></i>Actual</span><span><i class="swatch plan"></i>Plan</span></div><div class="rows"></div><div class="foot">IBCS-inspired · Actual / Plan comparison</div></div>`;
  class IBCSBarChart extends HTMLElement {
    constructor(){super();this.attachShadow({mode:'open'});this.shadowRoot.appendChild(template.content.cloneNode(true));this._props={title:'Revenue by Region',subtitle:'Actual vs Plan · EUR',data:[]};}
    onCustomWidgetBeforeUpdate(changed){this._props={...this._props,...changed};}
    onCustomWidgetAfterUpdate(){this.render();}
    onCustomWidgetResize(){this.render();}
    onCustomWidgetDestroy(){}
    set data(v){this._props.data=v;this.render();}
    get data(){return this._props.data;}
    connectedCallback(){this.render();}
    _rows(){
      const binding=this._props.dataBinding;
      if(binding && binding.state==='success' && Array.isArray(binding.data)){
        const rows=binding.data;
        return rows.map(r=>{
          const dims=Object.entries(r).filter(([k,v])=>v && typeof v==='object' && ('label' in v || 'id' in v) && !('raw' in v));
          const measures=Object.entries(r).filter(([k,v])=>v && typeof v==='object' && ('raw' in v));
          return {label:String(dims[0]?.[1]?.label??dims[0]?.[1]?.id??r.label??''),actual:Number(measures[0]?.[1]?.raw??r.actual??0),plan:Number(measures[1]?.[1]?.raw??r.plan??0)};
        }).filter(r=>r.label && Number.isFinite(r.actual)&&Number.isFinite(r.plan));
      }
      let input=this._props.data;
      if(typeof input==='string'){try{input=JSON.parse(input)}catch(e){input=[]}}
      if(!Array.isArray(input)||!input.length) input=[{label:'North America',actual:820,plan:760},{label:'Europe',actual:680,plan:720},{label:'Asia Pacific',actual:590,plan:520},{label:'Latin America',actual:360,plan:410},{label:'Middle East',actual:240,plan:220}];
      return input.map(r=>({label:String(r.label??''),actual:Number(r.actual),plan:Number(r.plan)})).filter(r=>r.label&&Number.isFinite(r.actual)&&Number.isFinite(r.plan));
    }
    render(){
      if(!this.shadowRoot)return;
      const root=this.shadowRoot;
      root.querySelector('.heading').textContent=this._props.title||'Actual vs Plan';
      root.querySelector('.sub').textContent=this._props.subtitle||'';
      const rows=this._rows(),container=root.querySelector('.rows');container.replaceChildren();
      if(!rows.length){const e=document.createElement('div');e.className='empty';e.textContent='No data available';container.appendChild(e);return;}
      const max=Math.max(1,...rows.flatMap(r=>[Math.max(0,r.actual),Math.max(0,r.plan)]));
      const fmt=new Intl.NumberFormat('en-US',{maximumFractionDigits:1});
      rows.forEach(r=>{
        const row=document.createElement('div');row.className='row';
        const label=document.createElement('div');label.className='label';label.textContent=r.label;
        const track=document.createElement('div');track.className='track';
        for(const [cls,val] of [['actual',r.actual],['plan',r.plan]]){const b=document.createElement('div');b.className='bar '+cls;b.style.width=(Math.max(0,val)/max*100)+'%';b.title=cls+': '+fmt.format(val);track.appendChild(b)}
        const value=document.createElement('div');value.className='value';
        const num=document.createElement('div');num.textContent=fmt.format(r.actual)+' / '+fmt.format(r.plan);
        const delta=document.createElement('div');const diff=r.actual-r.plan;const pct=r.plan!==0?diff/Math.abs(r.plan)*100:null;delta.className='delta '+(diff<0?'negative':diff>0?'positive':'');delta.textContent=(diff>0?'+':'')+fmt.format(diff)+(pct===null?'':' ('+(pct>0?'+':'')+fmt.format(pct)+'%)');value.append(num,delta);row.append(label,track,value);container.appendChild(row);
      });
    }
  }
  if(!customElements.get('com-openai-ibcs-barchart'))customElements.define('com-openai-ibcs-barchart',IBCSBarChart);
})();
