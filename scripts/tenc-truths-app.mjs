//const templatePath="systems/tencandles/templates/applications/truths.html";
const templatePath="systems/tencandles/templates/applications/truths.hbs";
const diceIconSelector = '#chat-controls .chat-control-icon .fa-dice-d20';

var socket;

Hooks.once("socketlib.ready", () => {
    console.log("socketlib - READY!");
	socket = socketlib.registerSystem("tencandles");
	socket.register("updatetruths", updateTruths);
});

Hooks.on('init',()=> {
    game.settings.register('tenc-module', 'truthSet', {
        scope: 'world',     // "world" = sync to db, "client" = local storage
        config: false,      // we will use the menu above to edit this setting
        type: Object,
        default: {
            msg:'example',
            truths:[]
        },        // can be used to set up the default structure
      });

})

 


class TruthsApplication extends FormApplication {

    constructor(exampleOption) {
      super();
      this.exampleOption = exampleOption;
      this.truths=[];
    }
  
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        classes: ['dialog--truths-container'],
        popOut: true,
        width:360,
        height: 500,
        template: templatePath,
        id: 'truths-application',
        title: 'Truths',
        closeOnSubmit:false
      });
    }
  
    getData() {
      // Send data to the template
      return {
            truths:game.settings.get('tenc-module', 'truthSet'),
            isGM:game.user.isGM,
            isPL:!game.user.isGM
        };

    }
  
    activateListeners(html) {
      super.activateListeners(html);
    }
  
    async _updateObject(event, formData) {

        console.log(event.submitter);

        let srcel=event.submitter;
        let idpart=`${srcel.id}`.split('_');

        this.truths=game.settings.get('tenc-module', 'truthSet');

        let refresh=false;
        switch(idpart[0]){
            case 'deltruth': refresh=this.deletetruth(idpart[1]); break;
            case 'addtruth': refresh=this.addtruth(formData.exampleInput); break;
        }

        await this.settruths(this.truths);

        if(refresh) socket.executeForOthers("updatetruths",null);
        
        this.render();
    }

    deletetruth(id){
        console.log(this.truths,id);
        this.truths = this.truths.filter((v,i)=> i!=id);

        return true;
    }

    addtruth(truth){
        if(!truth) return;

        this.truths.push(truth);
        
        return true;
    }

    async settruths(_truths){
        await game.settings.set('tenc-module', 'truthSet', _truths);
    }
}

window.TruthsApplication = TruthsApplication;

var TruthsApp = new TruthsApplication();

Hooks.on('ready',()=> {
    $(diceIconSelector).addClass('truths-toggle');

    $(document).on('click', diceIconSelector, ev => {
        console.log("click!");
        ev.preventDefault();

        let $dialog = $('.dialog--truths-container');

        if ($dialog.length < 1) {

            TruthsApp = new TruthsApplication();

            let templateData = {
                truths: ["The guards left a rifle in storage","We have 2 spare health kits","They travel in packs"]
            };
            
            renderTemplate(templatePath, templateData).then(dlg => {
                let $form=$('#truths-template');
                if($form.length < 1){
                    TruthsApp.render(true);
                }
                else {
                   
                }
                /*
                new Dialog({
                    title: "Truths table",
                    content: dlg,
                    buttons:{}
                }, dialogOptions).render(true);*/
            });
        } else {
            //$dialog.remove();
        }
    });
})


function updateTruths(){
    console.log('Ten Candles | truth recieved');
    TruthsApp.render(true);
}