(function(){

    var
        vidContainer = document.getElementById("mainContent"),
        vidPath = "video/bigbuckbunny/BigBuckBunny_320x180.mp4",
        theVideo = new SpektralVideo(vidContainer, "theVideo", {"debug" : true}),
        playButton = document.getElementById("playButton"),
        pauseButton = document.getElementById("pauseButton"),
        togglePauseButton = document.getElementById("togglePauseButton"),
        muteButton = document.getElementById("muteButton"),
        unmuteButton = document.getElementById("unmuteButton"),
        toggleMute = document.getElementById("toggleMuteButton");

    ////////////////
    ////EVENT LISTENERS
    ////////////////
    attachEventListener(playButton, "click", onButtonClick);
    attachEventListener(pauseButton, "click", onButtonClick);
    attachEventListener(togglePauseButton, "click", onButtonClick);
    attachEventListener(muteButton, "click", onButtonClick);
    attachEventListener(unmuteButton, "click", onButtonClick);
    attachEventListener(toggleMuteButton, "click", onButtonClick);

    function onButtonClick(evt) {
        var name = evt.target.name;

        if(name === "play") {
            theVideo.play();
        } else if (name === "pause") {
            theVideo.pause();
        } else if (name === "togglePause") {
            theVideo.togglePause();
        } else if (name === "mute") {
            theVideo.mute();
        } else if (name === "unmute") {
            theVideo.unmute();
        } else if (name === "toggleMute") {
            theVideo.toggleMute();
        }
    }

    theVideo.loadFile(vidPath);
    //theVideo.play();

    //HELPERS
    //////////////////
    ////ATTACH EVENT LISTENER
    /////////////////
    function attachEventListener(eventTarget, eventType, eventHandler) {
        if (eventTarget.addEventListener) {
            eventTarget.addEventListener(eventType, eventHandler, false);
        } else if (eventTarget.attachEvent) {
            eventType = "on" + eventType;
            eventTarget.attachEvent(eventType, eventHandler);
        } else {
            eventTarget["on" + eventType] = eventHandler;
        }
    }

    //////////////////
    ////DETACH EVENT LISTENER
    /////////////////
    function detachEventListener(eventTarget, eventType, eventHandler) {
        if (eventTarget.removeEventListener) {
            eventTarget.removeEventListener(eventType, eventHandler, false);
        } else if (eventTarget.detachEvent) {
            eventType = "on" + eventType;
            eventTarget.detachEvent(eventType, eventHandler);
        } else {
            eventTarget["on" + eventType] = null;
        }
    }

}(window));
