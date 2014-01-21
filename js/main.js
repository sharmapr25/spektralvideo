$(document).ready (function(){

    var
        vidContainer = document.getElementById("videoContainer"),
        vidPath = "video/bigbuckbunny/BigBuckBunny_320x180.mp4",
        vidPathObj, theVideo, totalTime, elapsedTime, totalDuration,
        runningTime = "", pbTimer = false,
        sliderTimer = false, isDragging = false,
        sliderValue = 0, useScrub = false,
        playbackState = "stopped", networkStatus, supportedFormat,
        amountLoaded = 0,
        controls = document.getElementById("controlsContainer"),
        timeDisplay = document.getElementById("timeDisplay"),
        playbackDisplay = document.getElementById("playbackDisplay"),
        networkDisplay = document.getElementById("networkDisplay"),
        formatDisplay = document.getElementById("formatDisplay"),
        loadedDisplay = document.getElementById("loadedDisplay"),
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
        resetPBButton = document.getElementById("resetPBButton"),
        ffButton = document.getElementById("ffButton"),
        rewindButton = document.getElementById("rewindButton"),
        loopButton = document.getElementById("loopButton"),
        scrubButton = document.getElementById("scrubButton"),
        seekSlider = $("#seekSlider"),
        stepForwardButton = document.getElementById("stepForwardButton"),
        stepBackButton = document.getElementById("stepBackButton");

    //Object containing multiple formats of the same video
    vidPathObj = {
        "mp4" : "video/bigbuckbunny/BigBuckBunny_320x180.mp4",
        "ogv" : "video/bigbuckbunny/BigBuckBunny_320x180.ogv",
        "webm" : "video/bigbuckbunny/BigBuckBunny_320x180.webm"};

    theVideo = new SpektralVideo(vidContainer, "theVideo", {
        "debug" : true,
        "muted" : true,
        "class" : "videoClass"
    });

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
    attachEventListener(resetPBButton, "click", onButtonClick);
    attachEventListener(ffButton, "click", onButtonClick);
    attachEventListener(rewindButton, "click", onButtonClick);
    attachEventListener(loopButton, "click", onButtonClick);
    attachEventListener(scrubButton, "click", onButtonClick);
    attachEventListener(stepForwardButton, "click", onButtonClick);
    attachEventListener(stepBackButton, "click", onButtonClick);

    //To clear fields on focus
    attachEventListener(volField, "click", onFieldFocus);
    attachEventListener(seekField, "click", onFieldFocus);
    attachEventListener(speedField, "click", onFieldFocus);

    /////////////////
    ////ON BUTTON CLICK
    /////////////////
    function onButtonClick(evt) {
        var
            name = evt.target.name,
            volLevel, seekTime, pbSpeed;

        if(name === "play") {
            theVideo.play({"regularSpeed" : true});
            setSliderValue();
            startPBTimer();
            getPlayState();
        } else if (name === "pause") {
            theVideo.pause();
            getPlayState();
        } else if (name === "togglePause") {
            theVideo.togglePause();
            getPlayState();
        } else if (name === "stop") {
            theVideo.stop();
            stopSliderTimer();
            stopPBTimer();
            timeDisplay.innerHTML = "0:00 / 0:00";
            getPlayState();
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
            getPlayState();
        } else if (name === "playbackSpeed") {
            pbSpeed = speedField.value;
            theVideo.playbackSpeed(pbSpeed);
        } else if (name === "resetPB") {
            speedField.value = 1;
            theVideo.playbackSpeed(1);
        } else if (name === "fastForward") {
            theVideo.fastForward();
            getPlayState();
        } else if (name === "rewind") {
            theVideo.rewind(true);
            getPlayState();
        } else if (name === "loop") {
            theVideo.loop();
        } else if (name === "scrub") {
            if (useScrub === false) {
                useScrub = true;
            } else {
                useScrub = false;
            }
        } else if (name === "stepForward") {
            theVideo.stepForward();
        } else if (name === "stepBack") {
            theVideo.stepBack();
        }
    }

    /////////////////
    ////ON FIELD FOCUS
    /////////////////
    function onFieldFocus(evt) {
        evt.target.value = "";
    }


    /////////////////
    ////LOAD THE VIDEO FILES
    /////////////////

    //Load just the mp4
    //theVideo.loadFile(vidPath, false);

    //Load multiple formats
    theVideo.loadFile(vidPathObj);

    theVideo.onVideoComplete(onPlaybackComplete);

    //Make sure the video element appears
    //before the controlsContainer
    //This was when video was put into
    //mainContent vs. videoContainer
    //theVideo.insertBefore(controls);

    //////////////////
    ////INITIALIZE SEEK SLIDER
    /////////////////
    seekSlider.slider({
        range: "max",
        min: 0,
        max: 10,
        value: 0
    });

    //Attach start/stop events for slider
    seekSlider.on("slidestart", function(event, ui) { startSlide(event, ui)} );
    seekSlider.on("slide", function(event, ui) { onSlide(event, ui)});
    seekSlider.on("slidestop", function(event, ui) { stopSlide(event, ui)} );

    function setSliderValue() {
        totalTime = theVideo.getTotalTime();
        seekSlider.slider("option", "max", totalTime);
        var sliderMax = seekSlider.slider("option", "max");

        //If sliderTimer hasn't bee started
        if (sliderTimer === false) {
            sliderTimer = setInterval(updateSlider, 250);
        }
    }

    function stopSliderTimer() {
        clearInterval(sliderTimer);
        sliderTimer = false;
    }

    function updateSlider() {
        if (isDragging === false) {
            seekSlider.slider( "value", theVideo.getCurrentTime());
            sliderValue = seekSlider.slider("option", "value");
        }
    }

    function startSlide(evt, ui) {
        isDragging = true;
    }

    function onSlide() {
        if (useScrub === true) {
            sliderValue = seekSlider.slider("option", "value");
            theVideo.seek(sliderValue);
        }
    }

    function stopSlide(evt, ui) {
        sliderValue = seekSlider.slider("option", "value");
        theVideo.seek(sliderValue);
        isDragging = false;
        console.log("stopSlide");
    }

    ////////////////////
    ////PLAY BACK TIMER
    /////////////////////
    function startPBTimer() {
        if (pbTimer === false) {
            pbTimer = setInterval(onPlayback, 250);
        }
    }

    function stopPBTimer() {
        clearInterval(pbTimer);
        pbTimer = false;
    }

    function onPlayback() {
        runningTime = theVideo.getFormattedTime();
        timeDisplay.innerHTML = runningTime.currentAndTotal;

        networkStatus = theVideo.getNetworkState();
        networkDisplay.innerHTML = networkStatus;

        amountLoaded = theVideo.getAmountLoaded();
        loadedDisplay.innerHTML = amountLoaded.toString() + "%";
    }

    ////////////////////
    ////GET PLAY STATE
    /////////////////////
    function getPlayState() {
        playbackState = theVideo.getPlaybackState();
        playbackDisplay.innerHTML = playbackState;

        supportedFormat = theVideo.getCurrentType();
        formatDisplay.innerHTML = supportedFormat;
    }

    ////////////////////
    ////ON PLAYBACK COMPLETE
    /////////////////////
    function onPlaybackComplete(evt) {
        console.log("PLAYBACK COMPLETE!!!: " + evt.target);
    }

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
