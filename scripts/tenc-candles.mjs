
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
    canvas.drawings.updateAll({text: count}, (drawing => drawing.id === candleCountId));
}

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

    canvas.lighting.updateAll({hidden: true}, (light => lightIds.includes(light.id)));

    
}

function lightCandle(index){
    let [inner,outer] = getCandle(index);
    let lightIds = [inner.id,outer.id];

    canvas.lighting.updateAll({hidden: false}, (light => lightIds.includes(light.id)));
}

const lightAllCandles = () => { for(let i=0;i<candles.length;i++) lightCandle(i); setCount(10); }
const dimAllCandles = () => { for(let i=0;i<candles.length;i++) outCandle(i); setCount(0);}

const candleOutGen = function* () {
    outCandle(0);
    outCandle(1);
    outCandle(2);
    setCount(7);
    yield 2;
    outCandle(3);
    outCandle(4);
    outCandle(5);
    setCount(4);
    yield 1;
    outCandle(6);
    outCandle(7);
    outCandle(8);
    outCandle(9);
    setCount(0);
    yield 'allout';
}

const candleLightGen = function* () {
    while(true){
        lightCandle(0);
        lightCandle(1);
        lightCandle(2);
        setCount(3);
        yield 2;
        lightCandle(3);
        lightCandle(4);
        lightCandle(5);
        setCount(6);
        yield 1;
        lightCandle(6);
        lightCandle(7);
        lightCandle(8);
        lightCandle(9);
        setCount(10);
        yield 'allin';
    }
}


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

let socket=null;

const callCandleOut = function(id){
    if(socket===null) socket=socketlib.registerSystem('tencandles');
    socket.executeForAllGMs('outcandle',(id));
}

let gen;
    
function renderCandleMenu(){

    let buttons = {
        candleButton01: {
            label: '01',
            callback: () => { if(!game.user.isGM) callCandleOut(0); else toggleLight(candles[0]);  menu.render(true); }
        },
        candleButton02: {
            label: '02',
            callback: () => { if(!game.user.isGM) callCandleOut(1); else toggleLight(candles[1]); menu.render(true); }
        },
        candleButton03: {
            label: '03',
            callback: () => { if(!game.user.isGM) callCandleOut(2); else toggleLight(candles[2]); menu.render(true); }
        },
        candleButton04: {
            label: '04',
            callback: () => { if(!game.user.isGM) callCandleOut(3); else toggleLight(candles[3]); menu.render(true); }
        },
        candleButton05: {
            label: '05',
            callback: () => { if(!game.user.isGM) callCandleOut(4); else toggleLight(candles[4]); menu.render(true); }
        },
        candleButton06: {
            label: '06',
            callback: () => { if(!game.user.isGM) callCandleOut(5); else toggleLight(candles[5]); menu.render(true); }
        },
        candleButton07: {
            label: '07',
            callback: () => { if(!game.user.isGM) callCandleOut(6); else toggleLight(candles[6]); menu.render(true); }
        },
        candleButton08: {
            label: '08',
            callback: () => { if(!game.user.isGM) callCandleOut(7); else toggleLight(candles[7]); menu.render(true); }
        },
        candleButton09: {
            label: '09',
            callback: () => { if(!game.user.isGM) callCandleOut(8); else toggleLight(candles[8]); menu.render(true); }
        },
        candleButton10: {
            label: '10',
            callback: () => { if(!game.user.isGM) callCandleOut(9); else toggleLight(candles[9]); menu.render(true); }
        },
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
        initCandles:{
            label: "Step Light",
            callback:() => { 
                if(!gen) gen = candleLightGen();
                let candleCount = parseInt(canvas.drawings.placeables[canvas.drawings.placeables.findIndex(drawing => drawing.id === candleCountId)].document.text);
                if(candleCount<10) gen.next();
                // let val=gen.next().value; 
                // if(val=='allout') gen=candleLightGen(); 
                // else if (val=='allin') gen=candleOutGen(); 
                menu.render(true);
            }
        },
    }

    if(game.user.isGM) buttons={...buttons, ...gmbuttons}

   let menu = new Dialog({
        title:'Candle Controls',
        buttons
    }).render(true);
}


Hooks.on('init',()=>{
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

    game.socket.on('tencandles.triggerburn',()=>{
        console.log('burn recieved');

        if(game.user.isGM) triggerBowl();
    })

})

Hooks.on('outCandle',(id)=>{
    outCandle(id);
})

