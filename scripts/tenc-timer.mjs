Hooks.on('init',()=>{
    Hooks.on('timer.timerExpired',(data) => {
        ui.notifications.info(data);
    })
})
