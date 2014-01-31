$(document).ready (function(){

    var
        vidContainer = document.getElementById("videoContainer"),
        vidPathObj, theVideo, totalTime,
        runningTime = "", pbTimer = false,
        sliderTimer = false, isDragging = false,
        sliderValue = 0, useScrub = false,
        videoMuted,
        playbackState = "stopped", networkStatus, supportedFormat,
        amountLoaded = 0, sizeButtonArray, sizeButton, j, k,
        controlButtonArray, controlButton,
        controls = document.getElementById("controlsContainer"),
        snapShotContainer = document.getElementById("snapShotContainer"),
        timeDisplay = document.getElementById("timeDisplay"),
        playbackDisplay = document.getElementById("playbackDisplay"),
        networkDisplay = document.getElementById("networkDisplay"),
        formatDisplay = document.getElementById("formatDisplay"),
        loadedDisplay = document.getElementById("loadedDisplay"),
        sizeDisplay = document.getElementById("sizeDisplay"),
        loopDisplay = document.getElementById("loopDisplay"),
        muteDisplay = document.getElementById("muteDisplay"),
        volField = document.getElementById("volumeField"),
        volumeButton = document.getElementById("volumeButton"),
        seekField = document.getElementById("seekField"),
        seekButton = document.getElementById("seekButton"),
        speedField = document.getElementById("speedField"),
        speedButton = document.getElementById("speedButton"),
        seekSlider = $("#seekSlider"),
        widthField = document.getElementById("widthField"),
        widthButton = document.getElementById("widthButton"),
        heightField = document.getElementById("heightField"),
        heightButton = document.getElementById("heightButton"),
        startField = document.getElementById("startField"),
        endField = document.getElementById("endField"),
        playSectionButton = document.getElementById("playSectionButton"),
        loopSectionButton = document.getElementById("loopSectionButton"),
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
        "poster" : "video/bigbuckbunny/BigBuckBunny.png"
    });

    theVideo.preloadVideo();

    //Load just the mp4
    //theVideo.loadFile("video/bigbuckbunny/BigBuckBunny_320x180.mp4", false);

    //Load multiple formats
    theVideo.loadFile(vidPathObj);

    //Will work on later
//    theVideo.setSubtitles("video/bigbuckbunny/bigbuckbunny.vtt", "Closed Captioning", "En", true);
//
//    theVideo.getSubtitles();

    theVideo.attachVideoEvent("playing", onPlaybackStart);

    theVideo.onVideoComplete(onPlaybackComplete);

    //////////////////
    ////CONTROL BUTTONS
    //////////////////
    controlButtonArray = getChildren(controls, "input");

    for (k = 0; k < controlButtonArray.length; k += 1) {
        controlButton = controlButtonArray[k];
        attachEventListener(controlButton, "click", onButtonClick);
    }

    /////////////////
    ////SIZE BUTTONS
    /////////////////
    sizeButtonArray = getChildren(sizeButtonContainer);

    for (j = 0; j < sizeButtonArray.length; j += 1) {
        sizeButton = sizeButtonArray[j];
        attachEventListener(sizeButton, "click", onButtonClick);
    }

    ////////////////
    ////EVENT LISTENERS
    ////////////////
    attachEventListener(volumeButton, "click", onButtonClick);
    attachEventListener(seekButton, "click", onButtonClick);
    attachEventListener(speedButton, "click", onButtonClick);
    attachEventListener(widthButton, "click", onButtonClick);
    attachEventListener(heightButton, "click", onButtonClick);
    attachEventListener(playSectionButton, "click", onButtonClick);
    attachEventListener(loopSectionButton, "click", onButtonClick);

    //To clear fields on focus
    attachEventListener(volField, "click", onFieldFocus);
    attachEventListener(seekField, "click", onFieldFocus);
    attachEventListener(speedField, "click", onFieldFocus);
    attachEventListener(startField, "click", onFieldFocus);
    attachEventListener(endField, "click", onFieldFocus);

    /////////////////
    ////ON BUTTON CLICK
    /////////////////
    function onButtonClick(evt) {
        var
            name = evt.target.name,
            volLevel, seekTime, pbSpeed;

        if(name === "play") {
            theVideo.play({"regularSpeed" : true});
        } else if (name === "pause") {
            theVideo.pause();
        } else if (name === "togglePause") {
            theVideo.togglePause();
        } else if (name === "stop") {
            theVideo.stop();
            timeDisplay.innerHTML = "0:00 / 0:00";
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
        } else if (name === "resetPB") {
            speedField.value = 1;
            theVideo.playbackSpeed(1);
        } else if (name === "fastForward") {
            theVideo.fastForward();
        } else if (name === "rewind") {
            theVideo.rewind(true);
        } else if (name === "loop") {
            theVideo.loop();
        } else if (name === "unloop") {
            theVideo.unloop();
        } else if (name === "scrub") {
            if (useScrub === true) {
                useScrub = false;
            } else {
                useScrub = true;
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
        } else if (name === "240p") {
            theVideo.setSize("240p");
        } else if (name === "360p") {
            theVideo.setSize("360p");
        } else if (name === "480p") {
            theVideo.setSize("480p");
        } else if (name === "720p") {
            theVideo.setSize("720p");
        } else if (name === "1080p") {
            theVideo.setSize("1080p");
        } else if (name === "1440p") {
            theVideo.setSize("1440p");
        } else if (name === "2160p") {
            theVideo.setSize("2160p");
        } else if (name === "fill") {
            theVideo.setSize("fill");
        } else if (name === "fullScreen") {
            theVideo.enterFullscreen();
        } else if (name === "playSection") {
            theVideo.playSection(startField.value, endField.value);
        } else if (name === "loopSection") {
            theVideo.loopSection(startField.value, endField.value);
        } else if (name === "snapshot") {
            theVideo.takeSnapShot(snapShotContainer);
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

    ////////////////////
    ////SET SLIDER VALUE
    /////////////////////
    function setSliderValue() {
        totalTime = theVideo.getTotalTime();
        seekSlider.slider("option", "max", totalTime);

        //If sliderTimer hasn't bee started
        if (sliderTimer === false) {
            sliderTimer = setInterval(updateSlider, 250);
        }
    }

    ////////////////////
    ////STOP SLIDER TIMER
    /////////////////////
    function stopSliderTimer() {
        clearInterval(sliderTimer);
        sliderTimer = false;
    }

    ////////////////////
    ////UPDATE SLIDER
    /////////////////////
    function updateSlider() {
        if (isDragging === false) {
            seekSlider.slider( "value", theVideo.getCurrentTime());
            sliderValue = seekSlider.slider("option", "value");
        }
    }

    ////////////////////
    ////START SLIDER
    /////////////////////
    function startSlide(evt, ui) {
        isDragging = true;
    }

    ////////////////////
    ////ON SLIDE
    /////////////////////
    function onSlide() {
        if (useScrub === true) {
            sliderValue = seekSlider.slider("option", "value");
            theVideo.seek(sliderValue);
        }
    }

    ////////////////////
    ////STOP SLIDE
    /////////////////////
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

    ////////////////////
    ////ON PLAYBACK
    /////////////////////
    function onPlayback() {
        runningTime = theVideo.getFormattedTime();
        timeDisplay.innerHTML = runningTime.currentAndTotal;

        networkStatus = theVideo.getNetworkState();
        networkDisplay.innerHTML = networkStatus;

        amountLoaded = theVideo.getAmountLoaded();
        loadedDisplay.innerHTML = amountLoaded.toString() + "%";

        playbackState = theVideo.getPlaybackState();
        playbackDisplay.innerHTML = playbackState;

        supportedFormat = theVideo.getCurrentType();
        formatDisplay.innerHTML = supportedFormat;

        videoMuted = theVideo.isMuted();
        muteDisplay.innerHTML = videoMuted;

        loopDisplay.innerHTML = theVideo.isLooped();

        setVideoSize();
    }

    ////////////////////
    ////ON PLAYBACK START
    /////////////////////
    function onPlaybackStart(evt) {
        startPBTimer();
        setSliderValue();
        console.log("Playback Start");
    }

    ////////////////////
    ////ON PLAYBACK COMPLETE
    /////////////////////
    function onPlaybackComplete(evt) {
        console.log("Playback Complete: " + evt.target);
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
    function getChildren(parent, type) {
        type = type || "all"
        var
            children = parent.childNodes,
            childArr = [], i, isEl, nodeType;

        for (i = 0; i < children.length; i += 1) {
            isEl = isElement(children[i]);
            if(isEl === true) {
                nodeType = getType(children[i]);
                if (type === "all") {
                    childArr.push(children[i]);
                } else {
                    if (nodeType === type) {
                        childArr.push(children[i]);
                    }
                }
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

    ////////////////////
    ////GET TYPE
    ////////////////////
    function getType(obj) {
        var type;
        if(obj.nodeName !== undefined) {
            //element
            type = (obj.nodeName);
        } else {
            //everything else
            type = ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1]
        }
        type = type.toLowerCase();
        return type;
    };

}(window));
