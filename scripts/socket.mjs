let socket=null;

function socketinit(){
    if(socket === null) socket=socketlib.registerSystem('tencandles');
}

export function socketToGM(endpoint,payload=null){
    socketinit();
    socket.executeForAllGMs(endpoint,payload);
}

export function socketToOthers(endpoint,payload=null){
    socketinit();
    socket.socketToOthers(endpoint,payload);
}

export function socketListener(endpoint,callback=()=>{}){
    socketinit();
    socket.register(endpoint,callback);
}
