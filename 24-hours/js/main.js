/* ============================================================
   24 HOURS — boot & menu wiring
   ============================================================ */
"use strict";

const Main = {
  boot(){
    document.getElementById("btn-new").onclick=function(){ Engine.newGame(false); };
    document.getElementById("btn-continue").onclick=function(){ if(!Engine.load()) UI.toast("No save found.", true); };
    document.getElementById("btn-newdayplus").onclick=function(){ Engine.newGame(true); };
    document.getElementById("btn-archive").onclick=function(){ UI.archiveScreen(); };
    document.getElementById("btn-settings").onclick=function(){ UI.settingsScreen(); };
    document.getElementById("btn-credits").onclick=function(){ UI.creditsScreen(); };

    document.getElementById("btn-phone").onclick=function(){ UI.openPhone(); };
    document.getElementById("btn-journal").onclick=function(){ UI.openJournal(); };
    document.getElementById("btn-pause").onclick=function(){ UI.pause(); };

    document.getElementById("btn-go").onclick=function(){
      if(!UI.selTo || UI.selTo===S.loc) return;
      Engine.travel(UI.selTo);
      UI.render();
    };

    document.addEventListener("keydown", function(ev){
      const overlayOpen = !document.getElementById("overlay").classList.contains("hidden");
      if(ev.key==="Escape"){
        if(overlayOpen){ UI.closeOverlay(); }
        return;
      }
      if(overlayOpen || !S || S.ending) return;
      if(ev.key==="p"||ev.key==="P") UI.openPhone();
      if(ev.key==="j"||ev.key==="J") UI.openJournal();
    });

    UI.showMenu();
    if(window.location.search.indexOf("test=1")>=0){
      setTimeout(function(){ TestRunner.run(); }, 300);
    }
  }
};

window.addEventListener("load", function(){ Main.boot(); });
