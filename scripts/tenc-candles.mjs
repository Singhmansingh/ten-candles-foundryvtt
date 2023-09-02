import {socketToGM,socketListener} from './socket.mjs';

const candleCountId = '2ru6zPY7s96Nf1oI';
const bowl = ["TlN6Vd0IbZ4JUXUS","p8tV1sHQgpnKqYGX","0SU38BAtAayGA7ID"];
const candles = [
    ["6YE9S50sHciN2HHj","43U9wUydN9rf5y9v"],
    ["RnuJBSyPKfoxMV9u","0XAQ42ZGrYz2HuUT"],
    ["Gcl9vsbwXZT2Kayh","daF9FaAXm4nhfOzp"],
    ["PP6XWuSLiXw3jhOw","ADIgSBglENlsWljJ"],
    ["KMXOFV1GwHpC2rmg","XMxZRti0ZH7nM1T8"],
    ["WkIZ6io8z8XBiZE5","5qy3z9XGOqs1C8aN"],
    ["JOCACVmAPgi946PQ","MtLp5ZerEWBPkL2A"],
    ["9zJEqE3IfGpmfYPA","SzFybV75900CVteF"],
    ["4LtRBthYK3Yv0PoX","KKs6jupYdEWpdWEt"],
    ["XUPTh4rT6iM2IH6h","CbFMbnPk12K7ZPWU"],

]; // each candle has an inner glow and outer
const firemp3 = 'systems/tencandles/assets/fire-burning.mp3';

function setCount(count){
    if(count > candles.length || count < 0) return;
    canvas.drawings.updateAll({text: count}, (drawing => drawing.id === candleCountId));
}

const minusCount = () => setCount( parseInt(canvas.drawings.placeables[canvas.drawings.placeables.findIndex(drawing => drawing.id === candleCountId)].document.text) - 1);
const addCount = () => setCount( parseInt(canvas.drawings.placeables[canvas.drawings.placeables.findIndex(drawing => drawing.id === candleCountId)].document.text) + 1);


async function toggleLight(lightIds, lightStatus = 'toggle') {
    if (lightStatus === 'toggle') {
        lightStatus = canvas.lighting.placeables[canvas.lighting.placeables.findIndex(light => light.id === lightIds[0])].document.hidden;
    }

    let candleCount = parseInt(canvas.drawings.placeables[canvas.drawings.placeables.findIndex(drawing => drawing.id === candleCountId)].document.text);
    if (lightStatus) {
        candleCount = candleCount + 1;
    } else {
        candleCount = candleCount - 1;
    }
    canvas.lighting.updateAll({hidden: !lightStatus}, (light => lightIds.includes(light.id)));
    canvas.drawings.updateAll({text: candleCount}, (drawing => drawing.id === candleCountId));

    return !lightStatus;
}


function getCandle(index){
    let innerId=canvas.lighting.placeables.findIndex(light => light.id === candles[index][0]);
    let outerId=canvas.lighting.placeables.findIndex(light => light.id === candles[index][1]);

    let candle = [canvas.lighting.placeables[innerId], canvas.lighting.placeables[outerId]];
    
    return candle;
}

function outCandle(index){

    let [inner,outer]=getCandle(index);
    let lightIds = [inner.id,outer.id];

    if(!inner.document.hidden)  minusCount();

    canvas.lighting.updateAll({hidden: true}, (light => lightIds.includes(light.id)));
    
}

function lightCandle(index){
    let [inner,outer] = getCandle(index);
    let lightIds = [inner.id,outer.id];

    canvas.lighting.updateAll({hidden: false}, (light => lightIds.includes(light.id)));
    addCount();
}

const lightAllCandles = () => { for(let i=0;i<candles.length;i++) lightCandle(i); setCount(10); }
const dimAllCandles = () => { for(let i=0;i<candles.length;i++) outCandle(i); setCount(0);}

function triggerBowl(){
    let src = encodeURI(firemp3);

    toggleLight(bowl);

    AudioHelper.play({
        src,
        volume: 1,
        autoplay: true,
        loop: false
    }, true);

    setTimeout(()=>toggleLight(bowl),3500);
}

function renderCandleMenu(){
    
    let buttons = {};
    
    for(let i=0;i<candles.length;i++){
        let label = i+1 < 10 ? '0'+(i+1) : i+1;

        buttons['candleButton'+ label] = {
            label,
            callback: () => {
                if (game.user.isGM) toggleLight(candles[i]);
                else socketToGM('outcandle',i);;
                
                menu.render(true);
            }
        }
    }

    let gmbuttons = {
        allOn:{
            label: "Light All",
            callback:()=> {lightAllCandles(); menu.render(true);}
        },
        allOff:{
            label: "Out All",
            callback:()=> {dimAllCandles();menu.render(true);}
        },
        triggerBowl:{
            label: "Bowl",
            callback:()=> {triggerBowl(); menu.render(true);}
        },
    }

    if(game.user.isGM) buttons={...buttons, ...gmbuttons}

   let menu = new Dialog({
        title:'Candle Controls',
        buttons
    }).render(true);
}


Hooks.on('init',()=>{

    socketListener('triggerburn',() => Hooks.call('burnCard'));

    Hooks.on('burnCard',triggerBowl);
    
    Hooks.on("getSceneControlButtons", (data) => {
        data[0].tools.push({
          name: "module-candles",
          title: "Candles",
          icon: "fas fa-fire-flame-simple",
          button: true,
          onClick: () => renderCandleMenu(),
          visible: game.user.isGM || game.user.isPC
        })
    });

    Hooks.on('outCandle', outCandle);

    socketListener('outcandle', (candleid) => { Hooks.call('outCandle',candleid) });

})



