import { socketToGM } from "./socket.mjs";

export default class TenCadlesActorSheet extends ActorSheet {


    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
          classes: ["dnd5e", "sheet", "actor","character"],
          template: `systems/tencandles/templates/sheets/us-sheet.hbs`,
          width: 640,
          height: 660,
        });
      }

    getData() {
        const data = super.getData();

        let stack = data.actor.system.stack;

        let cards=[];
        stack.forEach(card => {
            cards.push(data.actor.system[card]);
        });
        
        data.cards = cards;

        return data;
    }

    shiftCard(slug, dir){

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

        if(moveto<currstack.length-1&&moveto>=0){
            newstack=swapElements(currstack,moveto,index);
        }
        
        return newstack;
    }

    async burnCard(){


        const data = this.getData();
        let stack = data.actor.system.stack;
        const burntCard = data.actor.system[stack[0]]?.label;

        let d = await Dialog.confirm({
            title: 'Burn your card',
            content: `<p>Are you ready to burn your ${burntCard}?</p>`,
        });

        if(d){

            stack.shift();

            ChatMessage.create({
                content: `<em>Burns their ${burntCard}</em>`,
            })

            socketToGM('triggerburn');
        }

        return [burntCard, stack];
    }

    async _updateObject(event, formData){

        let el=$(event.submitter);

        if(el.hasClass('tc-shift')){
            let [slug, dir] = el.attr('id').split('_');
            formData['system.stack']=this.shiftCard(slug, dir);
        }

        else if(el.hasClass('tc-burnbutton')){
            let [burntCard, stack]=await this.burnCard(formData);
            formData['system.stack']=stack;
        }

        else if(el.hasClass('tc-lock')){

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