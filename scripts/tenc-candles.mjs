
let candleCountId = '2ru6zPY7s96Nf1oI';
let candles = [
    ["6YE9S50sHciN2HHj","43U9wUydN9rf5y9v"],
    ["XUPTh4rT6iM2IH6h","CbFMbnPk12K7ZPWU"],
    ["4LtRBthYK3Yv0PoX","KKs6jupYdEWpdWEt"],
    ["9zJEqE3IfGpmfYPA","SzFybV75900CVteF"],
    ["RnuJBSyPKfoxMV9u","0XAQ42ZGrYz2HuUT"],
    ["Gcl9vsbwXZT2Kayh","daF9FaAXm4nhfOzp"],
    ["JOCACVmAPgi946PQ","MtLp5ZerEWBPkL2A"],
    ["WkIZ6io8z8XBiZE5","5qy3z9XGOqs1C8aN"],
    ["KMXOFV1GwHpC2rmg","XMxZRti0ZH7nM1T8"],
    ["PP6XWuSLiXw3jhOw","ADIgSBglENlsWljJ"]
]; // each candle has an inner glow and outer

function getCandle(index){
    let innerId=canvas.lighting.placeables.findIndex(light => light.id === candles[index][0]);
    let outerId=canvas.lighting.placeables.findIndex(light => light.id === candles[index][1]);

    let candle = [canvas.lighting.placeables[innerId], canvas.lighting.placeables[outerId]];
    
    return candle;
}

function outCandle(index){
    let lightIds= candles[index];
    let [inner,outer]=getCandle(index);

    if(inner.hidden&&outer.hidden) return true;

    canvas.lighting.updateAll({hidden: true}, (light => lightIds.includes(light.id)));
    
    let candleCount = parseInt(canvas.drawings.placeables[canvas.drawings.placeables.findIndex(drawing => drawing.id === candleCountId)].data.text) - 1;
    canvas.drawings.updateAll({text: candleCount}, (drawing => drawing.id === candleCountId));
}

function lightCandle(index){
    let [inner,outer] = getCandle(index);

    inner.hidden = false;
    outer.hidden = false;
}

Hooks.on("ready",()=>{



})