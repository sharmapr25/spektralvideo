(function(){

    var
        vidContainer = document.getElementById("mainContent"),
        vidPath = "video/bigbuckbunny/BigBuckBunny_320x180.mp4",
        theVideo,
        controls = document.getElementById("controlsContainer"),
        playButton = document.getElementById("playButton"),
        pauseButton = document.getElementById("pauseButton"),
        togglePauseButton = document.getElementById("togglePauseButton"),
        stopButton = document.getElementById("stopButton"),
        muteButton = document.getElementById("muteButton"),
        unmuteButton = document.getElementById("unmuteButton"),
        toggleMute = document.getElementById("toggleMuteButton"),
        volField = document.getElementById("volumeField"),
        volumeButton = document.getElementById("volumeButton"),
        seekField = document.getElementById("seekField"),
        seekButton = document.getElementById("seekButton"),
        speedField = document.getElementById("speedField"),
        speedButton = document.getElementById("speedButton"),
        ffButton = document.getElementById("ffButton"),
        rewindButton = document.getElementById("rewindButton");

    theVideo = new SpektralVideo(vidContainer, "theVideo", {"debug" : true});

    ////////////////
    ////EVENT LISTENERS
    ////////////////
    attachEventListener(playButton, "click", onButtonClick);
    attachEventListener(pauseButton, "click", onButtonClick);
    attachEventListener(togglePauseButton, "click", onButtonClick);
    attachEventListener(stopButton, "click", onButtonClick);
    attachEventListener(muteButton, "click", onButtonClick);
    attachEventListener(unmuteButton, "click", onButtonClick);
    attachEventListener(toggleMuteButton, "click", onButtonClick);
    attachEventListener(volumeButton, "click", onButtonClick);
    attachEventListener(seekButton, "click", onButtonClick);
    attachEventListener(speedButton, "click", onButtonClick);
    attachEventListener(ffButton, "click", onButtonClick);
    attachEventListener(rewindButton, "click", onButtonClick);

    function onButtonClick(evt) {
        var
            name = evt.target.name,
            volLevel, seekTime, pbSpeed;

        if(name === "play") {
            theVideo.play();
        } else if (name === "pause") {
            theVideo.pause();
        } else if (name === "togglePause") {
            theVideo.togglePause();
        } else if (name === "stop") {
            theVideo.stop();
        } else if (name === "mute") {
            theVideo.mute();
        } else if (name === "unmute") {
            theVideo.unmute();
        } else if (name === "toggleMute") {
            theVideo.toggleMute();
        } else if (name === "setVolume") {
            volLevel = volField.value;
            if (volLevel !== "") {
                if (volLevel > 100) {
                    volLevel = 100;
                    volField.value = 100;
                }
                theVideo.setVolume(volLevel);
            }
        } else if (name === "seek") {
            seekTime = seekField.value;
            theVideo.seek(seekTime);
        } else if (name === "playbackSpeed") {
            pbSpeed = speedField.value;
            theVideo.playbackSpeed(pbSpeed);
        } else if (name === "fastForward") {
            theVideo.fastForward();
        } else if (name === "rewind") {
            theVideo.rewind(true);
        }
    }

    theVideo.loadFile(vidPath);

    theVideo.insertBefore(controls);

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
