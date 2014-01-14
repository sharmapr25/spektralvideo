(function(){

    var
        vidContainer = document.getElementById("videoContainer"),
        vidPath = "video/bigbuckbunny/BigBuckBunny_320x180.mp4",
        theVideo = new SpektralVideo(vidContainer, "theVideo", {"debug" : true}),
        playButton = document.getElementById("playButton"),
        pauseButton = document.getElementById("pauseButton");

    ////////////////
    ////EVENT LISTENERS
    ////////////////
    attachEventListener(playButton, "click", onPlay);
    attachEventListener(pauseButton, "click", onPause);

    function onPlay(evt) {
        theVideo.play();
    }

    function onPause(evt) {
        theVideo.pause();
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
