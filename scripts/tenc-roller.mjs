let playerDiceCountId = 'KSonnDd7CnBOuF2I';

let gmDiceCountId = 'CUo0X0jXWTR5Je7E';

let template = 'systems/tencandles/templates/applications/die-tray.hbs'

const ROLLWITHHOPE=false;

Hooks.on("ready",()=>{
    
})

Hooks.on('renderSidebarTab',(app, html, data)=> {

    console.log(game);
    let options = {
        isGM: game.user.isGM,
    }

    if(!game.user.isGM) options['hasHope']=game.user.character.system.hope.value

    renderTemplate(template,options).then(c => {
        let $tray=$(c);
        let $chatform = html.find('#chat-form');
        $chatform.after($tray);

        let playerdieroller= $tray.find('#player-dice-roll');
        let gmdieroller=$tray.find('#gm-dice-roll');
        let hopedieroller=$tray.find('#hope-dice-roll');

        hopedieroller.on('click',async event => {
            let hasHope=game.user.character.system.hope.value;

            if(!hasHope) return ChatMessage.create({ 
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

            let [ones,sixes,hope]=parse16H(roll.terms,true);

            let msg;
            if(sixes) msg='Your hope pushes you forward. You <strong>succeed</strong>.';
            else msg='You hope fails to inspire. You <strong>fail</strong>.';

            roll.toMessage({ flavor: '<em>'+msg+'</em>' });

            
        })

        playerdieroller.on('click', async event => {
            event.preventDefault();
    
            let playerDiceCountDrawing = canvas.drawings.placeables[canvas.drawings.placeables.findIndex(drawing => drawing.id === playerDiceCountId)];
            let playerDiceCount = parseInt(playerDiceCountDrawing.data.text);

            let hasHope=false;

            if(ROLLWITHHOPE) hasHope=game.user.character.system.hope.value;



            let dice=`${playerDiceCount}d6`;

            if(hasHope) dice+='+1d6';

            let roll=await new Roll(dice).evaluate();

            roll.dice[0].options.appearance = {
                colorset: "black",
                system:"dot"
            };

            if(hasHope) roll.dice[1].options.appearance = {
                            colorset: "custom",
                            foreground: "#000000",
                            background: "#FFFFFF",
                            outline: "#000000",
                            edge: "#000000",
                            material: "metal",
                        };
            
            let [ones,sixes,hope] = parse16H(roll.terms);

            //let sixLine = `You rolled <strong>${sixes} sixes</strong>`;
            //let onesLine = `<br>You rolled <strong>${ones} ones</strong>`;

            let remainingDice=playerDiceCount-ones;


            let hopeLine='';

            if(hasHope) hopeLine='Your hope empowers you, ';

            let candleResultLine='';

            let remainingDiceLine='';

            let successes=sixes+hope;
            let fails=ones-hope;

            if(successes>0) {

                if(hasHope){
                    if(hope>0){
                        if(sixes > 0) hopeLine+="pushing you beyond your limits.";
                        else hopeLine+="where all else fails.";
                    }
                    else {
                        hopeLine+="in times of strife.";
                    }
                }
                
                candleResultLine=`You succeed with <strong>${successes} successes</strong>, `;

                if(ones>0) {
                    candleResultLine+=`but they encroach.`;
                }
                else {
                    candleResultLine+='and keep them at bay.';
                }

            }

            else {
                if(hasHope) hopeLine+='though it is not enough.';
                candleResultLine=`You have <strong>failed</strong>. Darkness draws closer.`;
                
            }

            if(fails>0){
                if(ones > 0) remainingDiceLine+=` <strong>${ones} dice</strong> are lost.`;
                if(hasHope&&hope<=-1) remainingDiceLine+=` You can reroll your <strong>Hope</strong> die.`;
                
            } else {
                remainingDiceLine+=' No dice are lost.';
            }
            
            remainingDiceLine+=`<br><strong>${remainingDice}</strong> dice remain. They now have <strong>${10-remainingDice}</strong>.`;
            

            if(hasHope) hopeLine+='<br>';
            
            let res=await roll.toMessage({ flavor: 
                //sixLine+
                //onesLine+
                '<em>'+
                hopeLine+
                '</em>'+
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
            
            message=`They roll <strong>${sixes} successes</strong>.`;
            roll.toMessage({ flavor: message });
        });
        
    })

    
})



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
                        }
                    }
                })
            }
            else{
                let hopedie = term.results[0].active&&term.results[0].result; //lmao
                if(hopedie==6) hope++;
                else if(hopedie==1)hope--;
            }

            
        }
        
    })
    

    return [ones,sixes,hope];
}