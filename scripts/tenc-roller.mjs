import { socketToGM } from "./socket.mjs";

let playerDiceCountId = 'KSonnDd7CnBOuF2I';
let gmDiceCountId = 'CUo0X0jXWTR5Je7E';
let template = 'systems/tencandles/templates/applications/die-tray.hbs'

Hooks.on("newHope",(aid)=>{
    if(!game.user.isGM&&game.user.character._id==aid) {
        game.user.character.system.hope.value=1;
        ChatMessage.create({
            content: `<em>Has found hope</em>`,
        })
    }
})

Hooks.on('renderSidebarTab',(app, html, data)=> {

    let options = {
        isGM: game.user.isGM,
    }

    let burncardroller=renderBurnDieButton(html); //debug

    if(!game.user.isGM) {
        options['hasHope']=game.user.character.system.hope.value;

        let topcard=game.user.character.system[game.user.character.system.stack[0]];
        if(topcard) $('#burnCardName').html(topcard.label+' ('+topcard.text+')'??'Card');
        else noBurnButton('.burnbutton');

    }
    

    renderTemplate(template,options).then(c => {
        let $tray=$(c);
        let $chatform = html.find('#chat-form');
        $chatform.after($tray);

        let playerdieroller= $tray.find('#player-dice-roll');
        let gmdieroller=$tray.find('#gm-dice-roll');
        let hopedieroller=$tray.find('#hope-dice-roll');
        let onesdieroller=$tray.find('#ones-dice-roll');

        hopedieroller.on('click',async event => {
            let hasHope=game.user.character.system.hope.value;

            if(hasHope==0) return ChatMessage.create({ 
                content: '<em>You have yet to find hope.</em>' ,
                whisper: [game.user.id]
            });

            let roll=await new Roll('1d6').evaluate(); 

            roll.dice[0].options.appearance = {
                colorset: "custom",
                foreground: "#000000",
                background: "#FFFFFF",
                outline: "#000000",
                edge: "#000000",
                material: "metal",
            };

            let [fails,successes,hope]=parse16H(roll.terms,true); // success on 5 or 6

            let msg;
            if(successes) msg='Your hope pushes you forward. You <strong>succeed</strong>.';
            else msg='You hope fails to inspire. You <strong>fail</strong>.';

            roll.toMessage({ flavor: '<em>'+msg+'</em>' });

            
        })

        playerdieroller.on('click', async event => {
            event.preventDefault();
    
            let playerDiceCountDrawing = canvas.drawings.placeables[canvas.drawings.placeables.findIndex(drawing => drawing.id === playerDiceCountId)];
            let playerDiceCount = parseInt(playerDiceCountDrawing.data.text);

            let dice=`${playerDiceCount}d6`;

            let roll=await new Roll(dice).evaluate();

            roll.dice[0].options.appearance = {
                colorset: "black",
                system:"dot"
            };
            
            let [fails,successes,hope] = parse16H(roll.terms);

            let remainingDice=playerDiceCount-ones;

            //output message

            let candleResultLine='';
            let remainingDiceLine='';


            if(successes>0) { // a success was rolled
                
                candleResultLine=`You succeed with <strong>${successes} successes</strong>, `;
                if(fails>0) candleResultLine+=`but they encroach.`; // but fails were also rolled
                else candleResultLine+='and keep them at bay.';

            }

            else {
                candleResultLine=`You have <strong>failed</strong>. Darkness draws closer.`;
            }

            if(fails>0){
                remainingDiceLine+=` <strong>${fails} dice</strong> are lost.`;
                onesdieroller.data('dice',fails); // update the reroller
                
            } else remainingDiceLine+=' No dice are lost.';
            
            remainingDiceLine+=`<br><strong>${remainingDice}</strong> dice remain. They now have <strong>${10-remainingDice}</strong>.`;
            
            await roll.toMessage({ flavor: 
                candleResultLine+
                '<br>'+
                remainingDiceLine
            });

        });

        gmdieroller.on('click', async event => {
            event.preventDefault();

            let gmDiceCountDrawing = canvas.drawings.placeables[canvas.drawings.placeables.findIndex(drawing => drawing.id === gmDiceCountId)];
            let gmDiceCount = parseInt(gmDiceCountDrawing.data.text);
    
            let roll = await new Roll(`${gmDiceCount}d6`).evaluate();
            let [ones,sixes,hope]=parse16H(roll.terms);
            let message;

            onesdieroller.data('diceGM',ones);
            
            message=`They roll <strong>${sixes} successes</strong>.`;
            roll.toMessage({ flavor: message });
        });

        burncardroller.on('click', async event => {
            console.log(game.user.character);

            let burntCard = game.user.character?.system?.stack[0]??'card';

            let d = await Dialog.confirm({
                title: 'Burn your card',
                content: `<p>Are you ready to burn your ${burntCard}?</p>`,
            });

            if(!d) return;

            if(game.user.isGM){
                ChatMessage.create({
                    content: `<em>They embrace their brink.</em>`,
                });

                socketToGM('triggerburn');
                return;
            }

            game.user.character.system.stack.shift();

            let stack =game.user.character.system.stack;
            let charId=game.user.character.id;
            let actor = game.actors.get(charId);

            actor.update({ 'system.stack':stack })

            ChatMessage.create({
                content: `<em>Burns their ${burntCard}</em>`,
            })

            
            socketToGM('triggerburn');

            
            if(game.user.character.system.stack.length>0){ // if there is ccards left to burn, display it on the burn button
                let topcard=game.user.character.system[game.user.character.system.stack[0]];
                $('#burnCardName').html(topcard.label+' ('+topcard.text+')'??'card');
            }
            else {
                noBurnButton('.burnbutton');
            }
            return;
        })

        onesdieroller.on('click',async ()=>{
            let dice;
            
            if(game.user.isGM) dice = onesdieroller.data('diceGM');
            else dice = onesdieroller.data('dice');

            if(!dice||dice==0) return console.log('no dice to reroll');
            let roll=await new Roll(dice+'d6').evaluate();
            
            roll.dice[0].options.appearance = {
                colorset: "black",
                system:"dot"
            };

            let [fails,successes,$_] = parse16H(roll.terms);
           
            onesdieroller.data('dice',fails);

            if(game.user.isGM){
                roll.toMessage({
                    flavor: `They are pushed to their brink. They reroll with <strong>${successes} successes</strong>, and <strong>${fails} fails</strong>.`
                })
                return;

            }
            roll.toMessage({
                flavor: `You lose more of yourself. You reroll <strong>${successes} successes</strong>, and <strong>${fails} fails</strong>.`
            })
            
        })
        
    })

    
})

const noBurnButton = (target) => $(target).css('background-color','#ddddd1AF').attr('disabled',true).html('<i class="fas fa-fire" style="font-size:0.9em;"></i>&nbsp;Nothing left to burn');

function renderBurnDieButton(html){
    const $chatcontrols=html.find('#chat-controls');
    $chatcontrols.css('margin-bottom','5px');
    const $rolltypeselect=$chatcontrols.find('select');
    $rolltypeselect.hide();
    const btn=$('<button class="burnbutton" style="padding:0;margin:0 5px;"><i class="fas fa-fire" style="font-size:0.9em;"></i>&nbsp;Burn your <span id="burnCardName">card</span></button>')
    $rolltypeselect.before(btn);

    return btn;
}



function parse16H(terms,isHope=false){
    let ones=0;
    let sixes=0;
    let hope=0;
    terms.forEach((term,tid)=> {
        console.log(terms);
        if(term instanceof Die){
            if(tid==0||isHope){
                term.results.forEach(die=>{
                    if(die.active){
                        switch(die.result){
                            case 1: ones++; break;
                            case 6: sixes++; break;
                            case 5: if(isHope) sixes++; break;
                        }
                    }
                })
            }
            else{
                let hopedie = term.results[0].active&&term.results[0].result;
                if(hopedie==6) hope++;
                else if(hopedie==1)hope--;
            }

            
        }
        
    })
    

    return [ones,sixes,hope];
}