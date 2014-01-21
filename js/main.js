$(document).ready (function(){

    var
        vidContainer = document.getElementById("videoContainer"),
        vidPath = "video/bigbuckbunny/BigBuckBunny_320x180.mp4",
        vidPathObj, theVideo, totalTime, elapsedTime, totalDuration,
        runningTime = "", pbTimer = false,
        sliderTimer = false, isDragging = false,
        sliderValue = 0, useScrub = false,
        playbackState = "stopped", networkStatus, supportedFormat,
        amountLoaded = 0, sizeButtonArray, sizeButton, j,
        controls = document.getElementById("controlsContainer"),
        timeDisplay = document.getElementById("timeDisplay"),
        playbackDisplay = document.getElementById("playbackDisplay"),
        networkDisplay = document.getElementById("networkDisplay"),
        formatDisplay = document.getElementById("formatDisplay"),
        loadedDisplay = document.getElementById("loadedDisplay"),
        sizeDisplay = document.getElementById("sizeDisplay"),

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
        stepBackButton = document.getElementById("stepBackButton"),
        widthField = document.getElementById("widthField"),
        widthButton = document.getElementById("widthButton"),
        heightField = document.getElementById("heightField"),
        heightButton = document.getElementById("heightButton"),

        sizeButtonContainer = document.getElementById("sizeButtonContainer");

    //Object containing multiple formats of the same video
    vidPathObj = {
        "mp4" : "video/bigbuckbunny/BigBuckBunny_320x180.mp4",
        "ogv" : "video/bigbuckbunny/BigBuckBunny_320x180.ogv",
        "webm" : "video/bigbuckbunny/BigBuckBunny_320x180.webm"};

    theVideo = new SpektralVideo(vidContainer, "theVideo", {
        "debug" : true,
        "muted" : true,
        "class" : "videoClass",
        "poster" : "video/bigBuckBunny/BigBuckBunny.png"
    });

    //theVideo.setPoster("video/bigBuckBunny/BigBuckBunny.png");

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
    attachEventListener(widthButton, "click", onButtonClick);
    attachEventListener(heightButton, "click", onButtonClick);


    //To clear fields on focus
    attachEventListener(volField, "click", onFieldFocus);
    attachEventListener(seekField, "click", onFieldFocus);
    attachEventListener(speedField, "click", onFieldFocus);

    /////////////////
    ////SIZE BUTTONS
    /////////////////
    sizeButtonArray = getChildren(sizeButtonContainer);
    console.log("sizeButtonArray: " + sizeButtonArray);

    for (j = 0; j < sizeButtonArray.length; j += 1) {
        sizeButton = sizeButtonArray[j];
        attachEventListener(sizeButton, "click", onButtonClick);
    }

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
        } else if (name === "setWidth") {
            theVideo.setWidth(widthField.value);
        } else if (name === "setHeight") {
            theVideo.setHeight(heightField.value);
        } else if (name === "native") {
            theVideo.setSize("native");
            setVideoSize();
        } else if (name === "240p") {
            theVideo.setSize("240p");
            setVideoSize();
        } else if (name === "360p") {
            theVideo.setSize("360p");
            setVideoSize();
        } else if (name === "480p") {
            theVideo.setSize("480p");
            setVideoSize();
        } else if (name === "720p") {
            theVideo.setSize("720p");
            setVideoSize();
        } else if (name === "1080p") {
            theVideo.setSize("1080p");
            setVideoSize();
        } else if (name === "1440p") {
            theVideo.setSize("1440p");
            setVideoSize();
        } else if (name === "2160p") {
            theVideo.setSize("2160p");
            setVideoSize();
        } else if (name === "fill") {
            theVideo.setSize("fill");
            setVideoSize();
        } else if (name === "fullScreen") {
            theVideo.enterFullscreen();
        }
    }

    /////////////////
    ////ON FIELD FOCUS
    /////////////////
    function onFieldFocus(evt) {
        evt.target.value = "";
    }

    ////////////////////
    ////SET VIDEO SIZE
    /////////////////////
    function setVideoSize() {
        var
            vDimensions = theVideo.getDimensions(),
            dimString = "Width: " + vDimensions.width.toString() + " Height: " + vDimensions.height.toString();
        sizeDisplay.innerHTML = dimString;
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

        setVideoSize();
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

    //////////////////
    ////GET CHILDREN
    /////////////////
    function getChildren(parent) {
        var
            children = parent.childNodes,
            childArr = [], i, isEl;

        console.log("getChildren: children: " + children);

        for (i = 0; i < children.length; i += 1) {
            isEl = isElement(children[i]);
            if(isEl === true) {
                childArr.push(children[i]);
            }
        }
        return childArr;
    }

    //////////////////
    ////IS ELEMENT
    /////////////////
    function isElement(possibleElement) {
        var isAnElement = false, type = possibleElement.nodeType;
        if(type === 1) {
            isAnElement = true;
        }
        return isAnElement;
    }



}(window));
