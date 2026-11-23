/* ============================================================
   24 HOURS — UI layer
   ============================================================ */
"use strict";

const UI = {
  el: function(id){ return document.getElementById(id); },
  selTo:null, phoneTab:"contacts", phoneThread:null, journalTab:"clues",

  /* ---------------- navigation ---------------- */
  show(id){ document.querySelectorAll(".screen").forEach(s=>s.classList.add("hidden")); this.el(id).classList.remove("hidden"); },
  showMenu(){ this.show("screen-menu"); this.refreshMenu(); },
  showGame(){ this.show("screen-game"); },

  refreshMenu(){
    this.el("btn-continue").classList.toggle("hidden", !Engine.hasSave());
    this.el("btn-newdayplus").classList.toggle("hidden", !this.loadArchive().length);
    const arch=this.loadArchive();
    this.el("menu-clock").textContent = arch.length ? fmt(h(23,59)) : "08:00";
  },

  /* ---------------- toast ---------------- */
  toast(msg, bad){
    const zone=this.el("toast-zone");
    const d=document.createElement("div");
    d.className="toast"+(bad?" bad":"");
    d.textContent=msg;
    zone.appendChild(d);
    setTimeout(function(){ d.remove(); }, 3400);
  },

  /* ---------------- intro ---------------- */
  introOverlay(lines){
    const box=this.el("overlay-box");
    box.className="";
    box.innerHTML='<div class="ov-kicker">24 HOURS — VESPERA</div><div id="intro-lines"></div><button id="intro-go" class="btn ov-continue hidden">BEGIN THE DAY</button>';
    document.getElementById("overlay").classList.remove("hidden");
    const holder=box.querySelector("#intro-lines");
    let i=0;
    const next=function(){
      if(i>=lines.length){
        document.getElementById("intro-go").classList.remove("hidden");
        return;
      }
      const L=lines[i++];
      const div=document.createElement("div");
      div.className="intro-line "+(L[0]==="sys"||L[0]==="ACTION"?"sys":(L[0]==="speaker"?"speaker":""));
      div.textContent = L[0]==="speaker" ? "— "+L[1]+" —" : L[1];
      holder.appendChild(div);
      holder.scrollTop=holder.scrollHeight;
      setTimeout(next, L[0]==="ACTION"?1000:1500);
    };
    next();
    document.getElementById("intro-go").onclick=function(){
      document.getElementById("overlay").classList.add("hidden");
    };
  },

  /* ---------------- scene overlay (dialog system) ---------------- */
  showScene(node){
    const ov=document.getElementById("overlay");
    const box=this.el("overlay-box");
    box.className="";
    ov.classList.remove("hidden");

    let html="";
    if(node.kicker) html+='<div class="ov-kicker">'+node.kicker+'</div>';
    if(node.title) html+='<div class="ov-title">'+node.title+'</div>';
    if(node.text) html+='<div class="ov-text">'+node.text.replace(/\n/g,"<br>")+'</div>';

    if(node.codePad){
      html+='<div class="ov-opts"><div class="ov-padwrap" style="cursor:default; display:block;">'
          +  '<div style="display:flex; gap:.5rem; justify-content:center;">';
      for(let i=0;i<4;i++) html+='<input class="code-in" data-i="'+i+'" maxlength="1" inputmode="numeric" style="width:52px; font-size:1.6rem; text-align:center; font-family:monospace; background:#0a0d13; color:var(--accent); border:1px solid var(--line); border-radius:4px; padding:.4rem 0;">';
      html+='</div><div style="text-align:center; margin-top:.8rem;">'
          + '<button id="code-ok" class="btn">ENTER</button> '
          + '<button id="code-no" class="btn">STEP BACK</button></div>'
          + (node.options_note?'<div class="dim" style="font-size:.7rem; margin-top:.7rem; text-align:center;">'+node.options_note+'</div>':'')
          + '</div></div>';
    }

    if(node.opts && node.opts.length){
      html+='<div class="ov-opts">';
      node.opts.forEach(function(o,idx){
        if(o.if && !o.if(S)) return;
        html+='<div class="ov-opt" data-opt="'+idx+'">'
            + '<main>'+o.label+(o.sub?'<small>'+o.sub+'</small>':'')+'</main>'
            + (o.cost>0?'<span class="a-cost">− '+o.cost+' MIN</span>':'')
            + '</div>';
      });
      html+='</div>';
    }
    if(node.farewell && !node.codePad) html+='<div class="dim" style="font-size:.75rem; font-style:italic; margin-top:1rem;">'+node.farewell+'</div>';
    if(node.deadlineNote) html+='<div class="deadline-note">'+node.deadlineNote+'</div>';
    if((!node.opts || !node.opts.filter(function(o){return !o.if||o.if(S);}).length) && !node.codePad){
      html+='<button id="ov-close" class="btn ov-continue">'+(node.closeLabel||"CONTINUE")+'</button>';
    }
    box.innerHTML=html;

    const self=this;
    box.querySelectorAll(".ov-opt").forEach(function(el){
      el.addEventListener("click", function(){
        const idx=parseInt(el.getAttribute("data-opt"),10);
        const o=node.opts ? node.opts[idx] : undefined;
        if(!o){ console.warn("opt resolve miss", idx, node.title, !!(node.opts)); return; }
        if(o.cost>0 ){ if(!Engine.canAfford(o.cost)){ UI.toast("Not enough time left for that.",true); return; } Engine.advance(o.cost); }
        if(o.close){ self.closeScene(); return; }
        if(S.ending){ return; }
        let res=null;
        try{ res = o.pick ? o.pick() : null; }catch(err){ console.error(err); }
        if(res==null){ self.closeScene(); return; }
        if(typeof res==="string"){ self.showResult(res, node); return; }
        if(res.node){ self.showScene(res.node); return; }
        if(res.ending){ Engine.finishEnding(res.ending); return; }
        self.showScene(res);
      });
    });

    const okBtn=box.querySelector("#code-ok");
    if(okBtn){
      const ins=box.querySelectorAll(".code-in");
      ins.forEach(function(inp,k){
        inp.addEventListener("input", function(){ if(inp.value.length>1) inp.value=inp.value.slice(0,1); if(inp.value && k<3) ins[k+1].focus(); });
        inp.addEventListener("keydown", function(ev){ if(ev.key==="Enter") okBtn.click(); });
      });
      ins[0].focus();
      okBtn.onclick=function(){
        let code=""; ins.forEach(function(i){ code+=i.value; });
        if(code.length<4){ UI.toast("Four digits. The machine is strict.",true); return; }
        Engine.tryCode(code);
      };
      box.querySelector("#code-no").onclick=function(){ self.closeScene(); };
    }

    const closeBtn=box.querySelector("#ov-close");
    if(closeBtn){
      closeBtn.onclick=function(){
        if(node.ending){ Engine.finishEnding(node.ending); return; }
        if(node.endingSignal){ Engine.finishEnding(null); return; }
        self.closeScene();
      };
    }
  },

  showResult(text, fromNode){
    const box=this.el("overlay-box");
    const self=this;
    let tail="";
    const pendingEnd =
      S.flags.final_press || S.flags.final_bill_brandt || S.flags.final_alex_flees ||
      S.flags.met_alex;
    box.innerHTML='<div class="ov-result">'+text.replace(/\n/g,"<br>")+'</div>'
      + '<button id="ov-cont" class="btn ov-continue">'+(pendingEnd?"MIDNIGHT APPROACHES":"CONTINUE")+'</button>';
    box.querySelector("#ov-cont").onclick=function(){
      if(pendingEnd){ Engine.finishEnding(null); return; }
      self.closeScene();
    };
  },

  closeScene(){
    document.getElementById("overlay").classList.add("hidden");
    if(Engine.hasSave() && S) Engine.save();
    UI.render();
  },

  /* ---------------- main render ---------------- */
  initMap(){
    const COMPS={
      office:"<rect x=\"-46\" y=\"-30\" width=\"92\" height=\"60\" rx=\"4\"/>",
      home:"<rect x=\"-40\" y=\"-34\" width=\"80\" height=\"68\" rx=\"6\"/>",
      plaza:"<circle r=\"44\"/>"
    };
    const NS="http://www.w3.org/2000/svg";
    const river=document.getElementById("map-river");
    river.innerHTML='<path d="M -10 250 C 90 230, 150 280, 230 262 S 380 240, 430 258 L 430 292 C 340 280, 290 300, 210 296 S 60 262, -10 286 Z" fill="#16283d" opacity="0.85"></path>'
      +'<path d="M 60 262 C 130 250, 200 282, 300 268" stroke="#31536f" stroke-width="2" fill="none" opacity=".6"></path>';
    let roads="";
    Object.keys(DATA.MATRIX).forEach(function(a){
      Object.keys(DATA.MATRIX[a]).forEach(function(b){
        if(a<b) return;
        const A=UI.THRONE[a], B=UI.THRONE[b];
        roads+='<line x1="'+A[0]+'" y1="'+A[1]+'" x2="'+B[0]+'" y2="'+B[1]+'" stroke="#242a36" stroke-width="5"/>';
        roads+='<line x1="'+A[0]+'" y1="'+A[1]+'" x2="'+B[0]+'" y2="'+B[1]+'" stroke="#39414f" stroke-width="1.4" stroke-dasharray="7 6"/>';
      });
    });
    document.getElementById("map-roads").innerHTML=roads;

    let dist="";
    Object.keys(DATA.LOCATIONS).forEach(function(id){
      const P=UI.THRONE[id];
      dist+='<g class="mnode" data-loc="'+id+'" transform="translate('+P[0]+','+P[1]+')" style="cursor:pointer;">'
        + '<rect class="mnode-bg" x="-52" y="-40" width="104" height="80" rx="8" fill="#10131c" stroke="#2a2e3a" stroke-width="2"/>'
        + '<circle class="mnode-dot" cx="0" cy="0" r="7" fill="#2a2e3a"/>'
        + '<text x="0" y="-22" text-anchor="middle" class="mnode-hours" fill="#9a948a" font-size="8" font-family="monospace"></text>'
        + '</g>';
    });
    document.getElementById("map-districts").innerHTML=dist;

    let labs="";
    Object.keys(DATA.LOCATIONS).forEach(function(id){
      const P=UI.THRONE[id];
      labs+='<text x="'+P[0]+'" y="'+(P[1]+56)+'" text-anchor="middle" fill="#e8e4da" font-size="11.5" letter-spacing="2" data-label="'+id+'">'+UI.shortName(DATA.LOCATIONS[id].name)+'</text>';
    });
    document.getElementById("map-labels").innerHTML=labs;

    document.querySelectorAll(".mnode").forEach(function(g){
      g.addEventListener("click", function(){ UI.selectLoc(g.getAttribute("data-loc")); });
    });
  },

  THRONE:{
    apartment:[72,384], station:[66,210], oldtown:[150,84], business:[318,56], riverside:[344,190], industrial:[300,376]
  },
  shortName(n){ return n.replace("The ","").toUpperCase(); },

  selectLoc(id){
    this.selTo=id;
    document.querySelectorAll(".mnode").forEach(g=>g.classList.remove("sel"));
    const g=document.querySelector('.mnode[data-loc="'+id+'"]');
    if(g) g.classList.add("sel");
    const L=DATA.LOCATIONS[id];
    const chars=Object.keys(DATA.CHARS).filter(function(c){ return charAt(c,id) && (S.rel[c]!==undefined); });
    let info='<b>'+L.name+'</b> — '+L.area+'<br><span class="dim">'+L.hoursLabel+'</span>';
    info+='<br><span style="font-size:.7rem;">';
    if(id===S.loc){ info+='You are here.'; }
    else {
      const t=Engine.travelTime(S.loc,id);
      info+='Travel: ~'+t+' min by foot/tram.';
    }
    if(chars.length) info+='<br>Present: '+chars.map(function(c){return DATA.CHARS[c].name;}).join(", ");
    info+='</span>';
    this.el("map-side-info").innerHTML=info;
    const go=this.el("btn-go");
    if(id!==S.loc && Engine.travelTime(S.loc,id)!=null){
      go.classList.remove("hidden");
      go.textContent="TRAVEL — "+Engine.travelTime(S.loc,id)+" MIN";
    } else go.classList.add("hidden");
  },

  render(){
    if(!S||S.ending) return;
    document.body.setAttribute("data-phase", phaseName(S.time));
    const rem = 1440-S.time;
    this.el("hud-clock").textContent=fmt(S.time);
    this.el("hud-date").textContent="THURSDAY · 12 OCTOBER" + (S.plus?" · DAY+":"");
    this.el("hud-phase").textContent=phaseName(S.time).toUpperCase();
    this.el("hud-elapsed").textContent="DAY "+Math.floor(S.time/1440*1)+" · "+fmt(S.time);
    this.el("hud-remaining").textContent=Math.floor(rem/60)+"H "+String(rem%60).padStart(2,"0")+"M LEFT";
    this.el("hud-bar-fill").style.width=(S.time/1440*100)+"%";
    this.el("hud-bar-fill").style.background="linear-gradient(90deg,"+this.remColor(rem)+",transparent)";
    this.el("hud-location").textContent=DATA.LOCATIONS[S.loc].name.toUpperCase();
    const hz=this.el("hud-hazards");
    let marks="";
    const critical=[ [h(22,0),"lockers close"], [h(20,0),"Mara closes"], [h(21,0),"Herald prints"] ];
    critical.forEach(function(c){
      if(S.time<c[0] && c[0]-S.time<=180){
        const p=c[0]/1440*100;
        marks+='<div class="hz" title="'+c[1]+" at "+fmt(c[0])+'" style="left:'+p+'%"></div>';
      }
    });
    hz.innerHTML=marks;

    const L=DATA.LOCATIONS[S.loc];
    this.el("scene-loc-name").textContent=L.name;
    this.el("scene-loc-hours").textContent=L.hoursLabel;
    this.el("scene-desc").textContent=L.desc[phaseName(S.time)];

    const people=Object.keys(DATA.CHARS).filter(function(c){ return charWhere(c).loc===S.loc && charWhere(c).talkable; });
    this.el("scene-people").innerHTML = people.length
      ? people.map(function(c){ var w=charWhere(c); return '<span class="person-chip">'+DATA.CHARS[c].name+' <span class="dim">· '+w.note+'</span></span>'; }).join("")
      : '<span class="dim" style="font-size:.7rem;">No one here to talk to.</span>';

    this.renderActions(people);
    this.renderMapState();
    this.renderObjectives();
    this.renderFeed();
    if(this.selTo) this.selectLoc(this.selTo);
  },

  remColor(rem){ if(rem>300) return "var(--accent)"; if(rem>120) return "#e0a050"; return "#e0705e"; },

  renderActions(people){
    const box=this.el("scene-actions");
    const self=this;
    box.innerHTML="";
    const locActions=STORY.ACTIONS[S.loc]||[];
    locActions.forEach(function(a){
      if(a.cond && !a.cond()) return;
      if(a.once && has(a.once)) return;
      let hoursOK=true;
      if(a.lockersOnly){
        const Lr=DATA.LOCATIONS[S.loc].lockers;
        if(Lr && (S.time<Lr[0]||S.time>=Lr[1])) hoursOK=false;
      } else if(a.hours){ hoursOK = S.time>=a.hours[0] && S.time<=a.hours[1]; }
      if(!hoursOK) return;
      const d=document.createElement("div");
      d.className="action";
      d.innerHTML='<span class="a-label">'+a.label+(a.sub?'<span class="a-sub">'+a.sub+'</span>':'')+'</span><span class="a-cost">− '+a.cost+' MIN</span>';
      d.onclick=function(){ Engine.runAction(a, S.loc); };
      box.appendChild(d);
    });

    people.forEach(function(id){
      if(id==="alex") return;
      const w=charWhere(id);
      const d=document.createElement("div");
      d.className="action person";
      d.innerHTML='<span class="a-label">Talk to '+DATA.CHARS[id].name+'<span class="a-sub">'+ (w.note||"") +'</span>'+(S.rel[id]!==undefined?'<span class="rel">TRUST '+ ("★".repeat(Math.max(1,Math.min(5,Math.round(S.rel[id]||1)))) +"</span>"):'')+'</span><span class="a-cost">− 10 MIN</span>';
      d.onclick=function(){
        if(!Engine.canAfford(10)){ UI.toast("No time left for even a conversation.",true); return; }
        Engine.advance(10);
        if(S.ending) return;
        Engine.save();
        UI.showScene(Engine.openDialog(id));
      };
      box.appendChild(d);
    });

    if(Engine.meetingAvailable()){
      const d=document.createElement("div");
      d.className="action special";
      const hall = has("brandt_told") && has("knows_station_meet");
      d.innerHTML='<span class="a-label">'+(hall?"Wait under the departures board — station hall":"Wait for Alex at the swans' bench")+'<span class="a-sub">It is late. It is time. −8 min to 23:07.</span></span><span class="a-cost">★★★</span>';
      d.onclick=function(){ Engine.runMeeting(hall?"hall":"bench"); UI.render(); };
      box.appendChild(d);
    }

    const remBool = 1440 - S.time;
    if(remBool<=60){
      const d=document.createElement("div");
      d.className="action special";
      d.innerHTML='<span class="a-label">Wait until midnight<span class="a-sub">There is nothing left that fits. Let the day end on your terms.</span></span><span class="a-cost">− '+remBool+' MIN</span>';
      d.onclick=function(){ Engine.wait(1440-S.time); };
      box.appendChild(d);
    }

    [10,30,60].forEach(function(m){
      const d=document.createElement("div");
      d.className="action";
      d.innerHTML='<span class="a-label">Wait '+m+' minutes<span class="a-sub">Let the city move without you.</span></span><span class="a-cost">− '+m+' MIN</span>';
      d.onclick=function(){
        if(!Engine.canAfford(m)){ UI.toast("That would run past midnight. The day is over whether you like it or not.",true); return; }
        Engine.wait(m);
      };
      box.appendChild(d);
    });
  },

  renderMapState(){
    const NS="http://www.w3.org/2000/svg";
    document.querySelectorAll(".mnode").forEach(function(g){
      const id=g.getAttribute("data-loc");
      const cur = S.loc===id;
      g.querySelector(".mnode-bg").setAttribute("stroke", cur?"var(--accent)":"#2a2e3a");
      g.querySelector(".mnode-bg").setAttribute("stroke-width", cur?"2.4":"2");
      g.querySelector(".mnode-bg").setAttribute("opacity", cur?"1":"0.82");
      const dot=g.querySelector(".mnode-dot");
      const chars=Object.keys(DATA.CHARS).filter(function(c){ return charWhere(c).loc===id && charWhere(c).talkable && S.rel[c]!==undefined; });
      if(chars.length){ dot.setAttribute("fill","#7ec8a0"); dot.setAttribute("r","8"); }
      else if(has("fraud_link")&&id==="industrial"){ dot.setAttribute("fill","#b06a5a"); dot.setAttribute("r","8"); }
      else { dot.setAttribute("fill","#2a2e3a"); dot.setAttribute("r","7"); }
      const L=DATA.LOCATIONS[id];
      g.querySelector(".mnode-hours").textContent = L.hoursLabel.split("·")[0].trim();
    });
    document.querySelectorAll("#map-labels text").forEach(function(t){
      const id=t.getAttribute("data-label");
      t.setAttribute("fill", S.loc===id ? "var(--accent)" : "#e8e4da");
      t.setAttribute("font-weight", S.loc===id ? "700":"400");
    });
  },

  renderObjectives(){
    const o=STORY.OBJECTIVES();
    this.el("objectives").innerHTML=o.map(function(x){
      return '<div class="obj '+(x.done?"done":"")+'"><span class="dot">'+(x.done?"✓":"▸")+'</span><span>'+x.t+'</span></div>';
    }).join("");
  },

  renderFeed(){
    const f=this.el("feed");
    const items=S.feed.slice(-40);
    f.innerHTML=items.map(function(x){
      return '<div class="feed-item '+x.kind+'"><span class="ft">'+fmt(x.t)+'</span>'+x.text+'</div>';
    }).join("");
    f.scrollTop=f.scrollHeight;
  },

  /* ---------------- phone ---------------- */
  openPhone(){
    this.phoneTab = this.phoneTab||"contacts";
    if(this.phoneTab==="thread" && !this.phoneThread) this.phoneTab="contacts";
    this.renderPhone();
    document.getElementById("overlay").classList.remove("hidden");
  },

  renderPhone(){
    const box=this.el("overlay-box");
    const self=this;
    let body="";
    if(this.phoneTab==="contacts"){
      const rows=DATA.CONTACTS.filter(function(c){
        if(c==="UNKNOWN") return !!(S.msgs.UNKNOWN && S.msgs.UNKNOWN.length);
        return c!=="alex" || true;
      });
      body='<div>';
      rows.forEach(function(c){
        const name = c==="UNKNOWN"?"UNKNOWN NUMBER":DATA.CHARS[c].name;
        const role = c==="UNKNOWN"?"withheld":DATA.CHARS[c].role;
        const last=(S.msgs[c]||[]);
        const sub = last.length ? "last: "+last[last.length-1].text.slice(0,42)+"…" : "no messages";
        const w = c==="UNKNOWN"?null:charWhere(c);
        body+='<div class="contact-row" data-c="'+c+'">'
            + '<span style="display:flex;align-items:center;"><span class="c-avatar">'+name.slice(0,2).toUpperCase()+'</span>'
            + '<span><span class="c-name">'+name+'</span><br><span class="c-sub">'+sub+'</span></span></span>'
            + '<span class="c-sub">'+(w?(w.talkable?"●":"○")+(charWhere(c).loc==="?"?"":" "+(DATA.LOCATIONS[w.loc]?UI.shortName(DATA.LOCATIONS[w.loc].name):"")):"")+'</span>'
            + '</div>';
      });
      body+='</div>';
    } else if(this.phoneTab==="thread"){
      const c=this.phoneThread;
      const name=c==="UNKNOWN"?"UNKNOWN NUMBER":DATA.CHARS[c].name;
      body='<div class="dim" style="font-size:.7rem; letter-spacing:.15em; margin-bottom:.5rem;">◄ THREAD: '+name+'</div>';
      body+='<div class="thread-msgs">';
      (S.msgs[c]||[]).forEach(function(m){
        body+='<div class="msg-b '+m.who+'"><span class="mt">'+fmt(m.t)+(m.who==="me"?" — YOU":"")+'</span>'+m.text.replace(/\n/g,"<br>")+'</div>';
      });
      if(!(S.msgs[c]||[]).length) body+='<div class="dim" style="padding:1rem 0;">No messages yet. Say something. It costs a minute; everything does.</div>';
      body+='</div>';
      body+='<div class="c-actions"><input id="msg-in" placeholder="Write a message…" style="flex:1; background:#0c1017; border:1px solid var(--line); color:var(--ink); padding:.5rem; border-radius:6px; font:inherit;"><button id="msg-send" class="btn">SEND −1</button><button id="msg-call" class="btn btn-gold">CALL −5</button></div>';
    } else if(this.phoneTab==="log"){
      body='<div>';
      if(!S.callLog.length) body+='<div class="dim" style="padding:1rem 0;">No calls today. Modern.</div>';
      S.callLog.slice().reverse().forEach(function(l){
        const name=l.id==="UNKNOWN"?"withheld":DATA.CHARS[l.id].name;
        body+='<div class="callrow"><span>'+ (l.who==="out"?"↗ to ":"↙ from ") + name +'</span><span class="mt">'+fmt(l.t)+' · 0:0'+(1+ (l.t%2))+'</span></div>';
      });
      body+='</div>';
    }
    const initials = '<div class="phone"><div class="phone-screen">'
      + '<div class="phone-topbar"><span>VESPERA-MOB</span><span>'+fmt(S.time)+'</span></div>'
      + '<div class="phone-tabs">'
      + '<div class="phone-tab '+(this.phoneTab==="contacts"?"on":"")+'" data-t="contacts">CONTACTS</div>'
      + '<div class="phone-tab '+(this.phoneTab==="log"?"on":"")+'" data-t="log">CALL LOG</div>'
      + '</div><div class="phone-body">'+body+'</div>'
      + '<div style="text-align:center; margin-top:.8rem;"><button id="phone-x" class="btn">CLOSE PHONE</button></div>'
      + '</div></div>';
    box.className="phone-holder";
    box.innerHTML=initials;

    box.querySelectorAll(".phone-tab").forEach(function(t){
      t.onclick=function(){ UI.phoneTab=t.getAttribute("data-t"); UI.phoneThread=null; UI.renderPhone(); };
    });
    box.querySelectorAll(".contact-row").forEach(function(r){
      r.onclick=function(){ UI.phoneThread=r.getAttribute("data-c"); UI.phoneTab="thread"; UI.renderPhone(); };
    });
    const send=box.querySelector("#msg-send");
    if(send){
      send.onclick=function(){
        const inp=box.querySelector("#msg-in");
        const v=inp.value.trim();
        if(!v){ UI.toast("Write something first.",true); return; }
        Engine.sendMessage(UI.phoneThread, v);
        UI.renderPhone();
      };
      const call=box.querySelector("#msg-call");
      call.onclick=function(){ UI.closeOverlay(); Engine.callChar(UI.phoneThread); };
      box.querySelector("#msg-in").addEventListener("keydown", function(ev){ if(ev.key==="Enter") send.click(); });
    }
    const back=box.querySelector(".dim");
    if(this.phoneTab==="thread"){
      back.onclick=function(){ UI.phoneTab="contacts"; UI.phoneThread=null; UI.renderPhone(); };
      back.style.cursor="pointer";
    }
    box.querySelector("#phone-x").onclick=function(){ UI.closeOverlay(); };
  },

  closeOverlay(){
    document.getElementById("overlay").classList.add("hidden");
  },

  /* ---------------- journal ---------------- */
  openJournal(tab){
    this.journalTab=tab||this.journalTab||"clues";
    const box=this.el("overlay-box");
    box.className="";
    let body="";
    if(this.journalTab==="clues"){
      const cats=["People","Places","Events","Documents"];
      cats.forEach(function(cat){
        const list=Object.keys(DATA.CLUES).filter(function(c){ return S.clues[c] && DATA.CLUES[c].cat===cat; });
        if(!list.length) return;
        body+='<div class="ov-kicker" style="margin-top:.6rem;">'+cat.toUpperCase()+'</div>';
        list.forEach(function(c){
          const cl=DATA.CLUES[c];
          body+='<div class="journal-note"><b>'+cl.title+'</b>'+cl.text+'</div>';
        });
      });
      if(!body) body='<div class="dim">Nothing written down yet. The day is young — barely.</div>';
    } else if(this.journalTab==="people"){
      Object.keys(DATA.CHARS).forEach(function(id){
        if(id==="alex" && !has("alex_er") && !has("alex_chat")) return;
        const c=DATA.CHARS[id];
        const w=charWhere(id);
        body+='<div class="char-card"><h4>'+c.name+' <span class="dim" style="font-size:.65rem;">· '+c.role+'</span></h4>'
            + '<div class="cc-loc">'+(id==="alex"?"SCHEDULE: unknown":("NOW: "+(w.loc==="?"?"—":(DATA.LOCATIONS[w.loc]?DATA.LOCATIONS[w.loc].name:w.loc)+" — "+w.note)))+'</div>'
            + '<div class="cc-bio">'+c.bio+' <i>'+c.personality+'</i><br><span class="dim">'+c.relation+'</span></div></div>';
      });
    } else if(this.journalTab==="memory"){
      const m=S.memories||[];
      body = m.length
        ? '<div class="ov-kicker">FROM THE PREVIOUS DAY</div>'+m.map(function(x){ return '<div class="journal-note memory"><b>'+fmt(x.t)+'</b>'+x.text+'</div>'; }).join("")
        : '<div class="dim">No memories from another day. This is your first.</div>';
    }
    const hypo = [];
    if(has("fraud_link")||has("manifest_seen")) hypo.push("Kessler runs fraudulent manifests, res-published through Sera — the grey envelope is the heartbeat.");
    if(has("jonas_debt")||has("debt_note")) hypo.push("Jonas's debt is the road in: Sera's people supervise it, and Alex paid it once already.");
    if(has("alex_witness")||has("alex_chat")) hypo.push("Alex saw the drop at 23:40, photographed one page, and went to ground. He plans to show up at 23:00.");
    if(has("knows_locker")&&!has("opened_locker")) hypo.push("Locker 14, station hall, 2311. The proof is sitting twelve minutes from anywhere.");
    if(has("brandt_alerted")) hypo.push("Brandt knows the duplicate exists. The bench may be watched. Plan B matters.");
    const html='<div class="ov-kicker">JOURNAL — Thursday, 12 October</div><div class="phone-tabs">'
      + '<div class="phone-tab '+(this.journalTab==="clues"?"on":"")+'" data-j="clues">CLUES</div>'
      + '<div class="phone-tab '+(this.journalTab==="people"?"on":"")+'" data-j="people">PEOPLE</div>'
      + '<div class="phone-tab '+(this.journalTab==="memory"?"on":"")+'" data-j="memory">MEMORIES</div>'
      + '</div><div style="min-height:340px;">'+body+'</div>'
      + (hypo.length?'<div class="ov-kicker" style="margin-top:.8rem;">WORKING HYPOTHESES</div>'+hypo.map(function(x){return '<div class="hypo">'+x+'</div>';}).join(""):'')
      + '<button id="journal-x" class="btn ov-continue">CLOSE</button>';
    box.innerHTML=html;
    document.getElementById("overlay").classList.remove("hidden");
    const self=this;
    box.querySelectorAll(".phone-tab").forEach(function(t){
      t.onclick=function(){ UI.openJournal(t.getAttribute("data-j")); };
    });
    box.querySelector("#journal-x").onclick=function(){ UI.closeOverlay(); };
  },

  /* ---------------- pause menu ---------------- */
  pause(){
    const box=this.el("overlay-box");
    box.className="";
    box.innerHTML='<div class="ov-kicker">PAUSED — the city waits for no one, but you can</div>'
      + '<div class="ov-title">PAUSE</div>'
      + '<button id="p-resume" class="btn btn-lg">RESUME</button>'
      + '<button id="p-restart" class="btn btn-lg">RESTART THE DAY</button>'
      + '<button id="p-settings" class="btn btn-lg">SETTINGS</button>'
      + '<button id="p-menu" class="btn btn-lg">MAIN MENU</button>';
    document.getElementById("overlay").classList.remove("hidden");
    document.getElementById("p-resume").onclick=function(){ UI.closeOverlay(); };
    document.getElementById("p-menu").onclick=function(){ UI.closeOverlay(); UI.showMenu(); };
    document.getElementById("p-settings").onclick=function(){ UI.settingsScreen(); };
    document.getElementById("p-restart").onclick=function(){
      if(!confirm("Restart the day? Today's progress will be lost.")) return;
      UI.closeOverlay(); Engine.wipe(); Engine.newGame(false);
    };
  },

  /* ---------------- menu Screens ---------------- */
  archiveScreen(){
    const box=this.el("overlay-box");
    box.className="";
    const arch=this.loadArchive();
    let body;
    if(!arch.length) body='<div class="dim">No days archived yet. Midnight hasn\'t happened to you.</div>';
    else{
      body='<div style="max-height:50vh; overflow-y:auto;">';
      arch.slice().reverse().forEach(function(r){
        body+='<div class="char-card"><h4>'+r.endingNum+' — '+r.endingTitle+' <span class="dim" style="font-size:.6rem;">'+(r.when||"").slice(0,10)+'</span></h4>'
            + '<div class="cc-loc">CLUES: '+r.cluesFound+' / '+r.clueTotal+(r.metAlex?" · MET ALEX":" · ALONE AT MIDNIGHT")+'</div>'
            + (r.missed && r.missed.length ? '<div class="cc-bio dim" style="font-size:.7rem;">MISSED:<br>· '+r.missed.slice(0,5).join("<br>· ")+'</div>':'')
            + '</div>';
      });
      body+='</div>';
    }
    box.innerHTML='<div class="ov-kicker">DAY ARCHIVE</div><div class="ov-title">EVERY MIDNIGHT, ANOTHER VESPERA</div>'+body
      + '<button id="arch-x" class="btn ov-continue">BACK</button>';
    document.getElementById("overlay").classList.remove("hidden");
    document.getElementById("arch-x").onclick=function(){ UI.closeOverlay(); UI.showMenu(); };
  },

  settingsScreen(){
    const box=this.el("overlay-box");
    box.className="";
    box.innerHTML='<div class="ov-kicker">SETTINGS</div><div class="ov-title">CONFIGURE THE DAY</div>'
      + '<div class="set-row"><span>Discrete time simulation</span><span class="note">time only advances with actions (always on)</span></div>'
      + '<div class="set-row"><span>Autosave</span><span class="note">every action (always on)</span></div>'
      + '<div class="set-row"><span>New Day+ memories</span><span class="note">journal carried across runs (automatic)</span></div>'
      + '<button id="set-wipe" class="btn btn-lg" style="margin-top:1rem;">WIPE ALL DATA</button>'
      + '<button id="set-x" class="btn btn-lg">BACK</button>';
    document.getElementById("overlay").classList.remove("hidden");
    document.getElementById("set-wipe").onclick=function(){
      if(!confirm("Erase saves AND the day archive? This cannot be undone.")) return;
      try{ localStorage.removeItem("24h_save"); localStorage.removeItem("24h_archive"); }catch(e){}
      S=null; UI.refreshMenu(); UI.closeOverlay(); UI.showMenu();
    };
    document.getElementById("set-x").onclick=function(){ UI.closeOverlay(); UI.showMenu(); };
  },

  creditsScreen(){
    const box=this.el("overlay-box");
    box.className="";
    box.innerHTML='<div class="ov-kicker">CREDITS</div><div class="ov-title">24 HOURS</div>'
      + '<div class="ov-text">A game by Matteo Mussillon.\nDesign, writing, code and graphics: Matteo Mussillon.\n\nEngine: discrete-time scheduler, no external dependencies.\nCity: Vespera — entirely fictional; any resemblance to cities you failed to live in is intentional.\n\nPart of a three-game collection about different kinds of impossible:\nThe Impossible Room — spatial problems.\nFalse Memory — truth vs. perception.\n24 Hours — time, opportunity, consequence.</div>'
      + '<button id="cred-x" class="btn ov-continue">BACK</button>';
    document.getElementById("overlay").classList.remove("hidden");
    document.getElementById("cred-x").onclick=function(){ UI.closeOverlay(); UI.showMenu(); };
  },

  /* ---------------- ending screen ---------------- */
  endingScreen(id){
    const box=this.el("overlay-box");
    const E=STORY.ENDINGS[id];
    const ev=E.text();
    const fates=E.fates();
    const found=Object.keys(S.clues);
    const total=Object.keys(DATA.CLUES).length;
    const unDisc=Object.keys(DATA.CLUES).filter(function(c){ return !S.clues[c]; });
    box.className="ending";
    let html='<div class="ending-id">'+E.num+' — '+E.title+'</div>'
      + '<div class="ov-title" style="font-size:1.4rem;">MIDNIGHT, VESPERA</div>'
      + '<div class="ov-text" style="line-height:1.8;">'+ev.replace(/\n/g,"<br><br>")+'</div>'
      + '<div class="epi-chars" style="white-space:pre-wrap;">'+fates+'</div>'
      + '<div class="ending-stats">CLUES RECOVERED: <b>'+found.length+' / '+total+'</b>'+(has("told_anything")?"":"")+'<br>'
      + 'MET ALEX: <b>'+(S.flags.met_alex?"YES":"NO")+'</b> · EVIDENCE: <b>'+(S.flags.doc_sold?"SOLD":(S.flags.has_document||S.flags.opened_locker?"IN YOUR HANDS":(S.flags.brandt_told?"COMPROMISED":"UNFOUND")))+'</b>'
      + (S.memories&&S.memories.length?"<br>MEMORIES CARRIED: "+S.memories.length:"")+'</div>'
      + '<button id="end-arch" class="btn btn-lg">DAY ARCHIVE</button>'
      + '<button id="end-plus" class="btn btn-lg btn-gold">NEW DAY+ (KEEP THE JOURNAL)</button>'
      + '<button id="end-menu" class="btn btn-lg">MAIN MENU</button>'
      + '<div class="ov-kicker" style="margin-top:1.2rem;">WHAT YOU NEVER FOUND</div>'
      + '<ul class="missed-list">'+unDisc.map(function(c){ return '<li>'+DATA.CLUES[c].title+'</li>'; }).join("") + (S.missed.length?"<li>…and "+S.missed.length+" live moment"+(S.missed.length>1?"s":"")+" that passed without you: see the archive.</li>":"") +'</ul>';
    box.innerHTML=html;
    document.getElementById("overlay").classList.remove("hidden");
    document.getElementById("end-arch").onclick=function(){ UI.archiveScreen(); };
    document.getElementById("end-plus").onclick=function(){ UI.closeOverlay(); Engine.wipe(); Engine.newGame(true); };
    document.getElementById("end-menu").onclick=function(){ UI.closeOverlay(); UI.showMenu(); };
  },

  /* ---------------- archive storage ---------------- */
  loadArchive(){ try{ return JSON.parse(localStorage.getItem("24h_archive")||"[]"); }catch(e){ return []; } }
};
