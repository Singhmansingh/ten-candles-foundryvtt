const templatePath="systems/tencandles/templates/applications/player-hud.hbs";

class PlayerApplication extends Application {
    constructor() {
      super();
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
          classes: ['dialog--player-hud'],
          popOut: true,
          width:600,
          height: 200,
          resizable: true,
          template: templatePath,
          id: 'playerhud-application',
          title: 'Survivors',
          closeOnSubmit:false
        });
    }

    getData() {
      // Active actors only
      //const activeActors = game.actors.filter(a=>a.value.hasPlayerOwner);

      //debug
      const activeActors = game.actors.map(ac=>{
        let topCardSlug=ac.system.stack[0];
        ac['onBrink']=false;
        ac['overBrink']=false;
        if(!topCardSlug) {
          topCardSlug='brink';
          if(ac.system.brink.value!=0) ac['onBrink']=true;
          else ac['overBrink']=true;
        }
        let topCard=ac.system[topCardSlug];
        ac['topCard']=topCard;

        return ac;
      });

      return {
            //isGM:game.user.isGM,
            actors: activeActors.filter(e=> e!==null),
        };

    }

    activateListeners(html) {
      super.activateListeners(html);
    }
}

window.PlayerApplication = PlayerApplication;

let PlayersApp=null;

Hooks.on('updateActor',(actor,data)=> {
  console.log('change data',data,actor);
  let id = actor.id;

  if(actor.system.locked){
    if(actor.system.brink.value){
      $('#survivor_'+id).find('.card-data').fadeOut(2000,function(){
        if(PlayersApp) PlayersApp.render(true);
      });
    } else {
      $('#survivor_'+id).fadeOut(2000,function(){
        if(PlayersApp) PlayersApp.render(true);
      });
    }
    
  } else {
    if(PlayersApp) PlayersApp.render(true);

  }

})

Hooks.on('renderSidebarTab',(app, html, data)=>{
    let btn = $('<button id="survivor-hud-toggle">Survivor HUD</button>');
    btn.on('click',()=> {
      let $app=$('#playerhud-application');
      if($app.length < 1){
        PlayersApp = new PlayerApplication();
        PlayersApp.render(true);
        
      } else {
        $app.remove();
      }
    });
  
    if($('#survivor-hud-toggle').length<1) $('#actors footer.action-buttons').append(btn);
 })