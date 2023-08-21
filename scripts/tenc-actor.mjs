let bowl = ["TlN6Vd0IbZ4JUXUS","p8tV1sHQgpnKqYGX","0SU38BAtAayGA7ID"];
let candleCountId = '2ru6zPY7s96Nf1oI';

export default class TenCadlesActorSheet extends ActorSheet {

    get template() {
        return `systems/tencandles/templates/sheets/${this.actor.data.type}-sheet.hbs`
    }


    getData() {
        const data = super.getData();

        let stack = data.actor.system.stack;

        let cards=[];
        stack.forEach(card => {
            cards.push(data.actor.system[card]);
        });
        
        data.cards = cards;

        console.log(data.cards);

        return data;


    }

    

    async _updateObject(event, formData){

        console.log(event.submitter);

        let el=$(event.submitter);

        if(el.hasClass('tc-shift')){
            let [slug, dir] = el.attr('id').split('_');

            let currstack=[];
            $('.stackable').each(function(){
                currstack.push($(this).data('slug'));
            });
    
            let delta=0;
            switch(dir){
                case 'up': delta=-1;break;
                case 'down': delta=1;break;
            }
    
            let index = currstack.indexOf(slug);
    
            let moveto = index+delta;
            let newstack=currstack;
    
            if(moveto<currstack.length&&moveto>=0){
                newstack=swapElements(currstack,moveto,index);
            }
    
    
            formData['system.stack']=newstack;
        }

        if(el.hasClass('tc-burnbutton')){

            async function toggleLight(lightIds, lightStatus = 'toggle') {
                if (lightStatus === 'toggle') {
                    lightStatus = canvas.lighting.placeables[canvas.lighting.placeables.findIndex(light => light.id === lightIds[0])].data.hidden;
                }
            
                let candleCount = parseInt(canvas.drawings.placeables[canvas.drawings.placeables.findIndex(drawing => drawing.id === candleCountId)].data.text);
                
                if (lightStatus) {
                    candleCount = candleCount + 1;
                } else {
                    candleCount = candleCount - 1;
                }
                canvas.lighting.updateAll({hidden: !lightStatus}, (light => lightIds.includes(light.id)));
                canvas.drawings.updateAll({text: candleCount}, (drawing => drawing.id === candleCountId));
            }
            

            let d = await Dialog.confirm({
                title: 'Burn your card',
                content: '<p>Are you ready to burn your card?</p>',
            });

            if(d){
                let currstack=[];
                $('.stackable').each(function(){
                    currstack.push($(this).data('slug'));
                });

                if(currstack.length!=0){
                    await $('.stackable').first().fadeOut('slow',function(){
                        toggleLight(bowl);
                        setTimeout(()=>toggleLight(bowl),3500);
                    });
    
                    currstack.shift();
                    formData['system.stack']=currstack;
                }
                else {
                    toggleLight(bowl);
                    setTimeout(()=>toggleLight(bowl),3500);

                    formData['system.brink.value']=0;
                }
                
            }
        }

        if(el.hasClass('tc-lock')){

            let d = await Dialog.confirm({
                title: 'Lock in Stack',
                content: '<p>Are you sure you want to lock in your stack? This cannot be undone.</p>',
            });

            if(d) formData['system.locked']=true;
        }
        
        super._updateObject(event, formData);
    }
}




const swapElements = (array, index1, index2) => {
    array[index1] = array.splice(index2, 1, array[index1])[0];
    return array;
};