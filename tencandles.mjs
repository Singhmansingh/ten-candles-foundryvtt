import TenCadlesActorSheet from "./scripts/tenc-actorsheet.mjs";
import './scripts/tenc-candles.mjs';



Hooks.once("init",function() {
    console.log("tencandles | Initializing 10 Candles System");

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("tencandles", TenCadlesActorSheet, { makeDefault: true });

})

Handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context);
});

Handlebars.registerHelper('if_eq', function(a, b, opts) {
    if(a == b) // Or === depending on your needs
        return opts.fn(this);
    else
        return opts.inverse(this);
});

Handlebars.registerHelper('unless_eq', function(a, b, opts) {
    if(a != b) // Or === depending on your needs
        return opts.fn(this);
    else
        return opts.inverse(this);
});

Handlebars.registerHelper('increment',a=> parseInt(a) + 1);