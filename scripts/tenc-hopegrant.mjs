function giveHope(name){
    let actor=game.actors.getName(name);
    actor.update({
        'system.hope.value':1
    });
   ChatMessage.create({
content: '<em>'+actor.name+' has found hope.</em>' ,
    })

}



function renderHopeGrant(){
    let actors = game.actors;
    let buttons={};
    let i=0;

    actors.forEach(ac => {
        let name = ac.name;
        buttons['actor'+i] = {
            label: name,
            callback: ()=>{
                giveHope(name);
            }
        }
        i++;
    })

    new Dialog({
        title: '10 Candles - Grant Hope',
        buttons
     }).render(true);
}

Hooks.on('init',()=>{
    Hooks.on("getSceneControlButtons", (data) => {
        data[0].tools.push({
          name: "module-hope",
          title: "Hope Grant",
          icon: "fas fa-angel",
          button: true,
          onClick: () => renderHopeGrant(),
          visible: game.user.isGM
        })
    });
})
