//////////////////////
////SPEKTRAL VIDEO
//////////////////////
function SpektralVideo(container, instanceID, params) {

    //Private Vars
    var 
        sv = this,
        container, path, width, height, useDefaultControls, isMuted,
        debug = false, strictError = false, videoElement, currentPlaybackSpeed = 1,
 		playbackState = "stopped", muteState = "unmuted",
        rewindTimer, rewindTimerStarted = false,  rewindRate = 0;
    ///////////////////////
    ////LOAD FILE
    //////////////////////
    sv.loadFile = function (newPath, autoplay, preload) {

        autoplay = autoplay || false;
        preload = 25;

        var 
            pathType = getType(newPath),
            videoType, autoplayTimer, key;

        if (pathType === "string") {
            //single path
            videoType = getExtension(newPath);
            createSourceElement(newPath, videoType);
        } else {
            //object, multiple formats
            for (key in newPath) {
            	videoType = getExtension(newPath[key]);
            	createSourceElement(newPath[key], videoType);
            }
        }

        if (autoplay === true) {
        	videoElement.autoplay = true;
        	videoElement.load();
        	if (sv.getReadyState() === "noInfo") {
        		autoplayTimer = createTimer(0.25, waitForData);
        	}
        	sv.log("AUTOPLAY: READY STATE: " + sv.getReadyState());
        }

        function waitForData() {
        	if (sv.getReadyState() === "haveEnough") {
        		clearTimer(autoplayTimer);
        		sv.play();
        	}
    	}

        sv.log("loadFile: path: " + pathType);

        //Loads video and determines if it needs to autoplay 
        //or preload a percentage of the video 
        //Path can be either a string or an object
        //If an object it will look something like this:
        //{"mp4" : "video.mp4", "ogg" : "video.ogg", "webm" : "video.webm"}
    }

    ///////////////////////
    ////PLAY
    //////////////////////
    sv.play = function (playParams) {

    	//regularSpeed determines if when play
    	//is invoked, whether the playBackSpeed
    	//should be restored to 1
    	var regularSpeed = playParams.regularSpeed,
        time = playParams.time || 0, playTimer;

        if (regularSpeed === undefined) {
        	regularSpeed = true;
        }

        sv.log("play: regularSpeed: " + regularSpeed + " time: " + time);

        if(muteState === "muted") {
        	sv.mute();
        } else {
        	sv.unmute();
        }

        if (playbackState === "fastForwarding" || playbackState === "rewinding" || regularSpeed === true) {
        	sv.log("playbackState: " + playbackState);
        	sv.log("regularSpeed: " + regularSpeed);
        	sv.playbackSpeed(1);
        }

        if(playbackState === "rewinding") {
        	clearTimer(rewindTimer);
        	rewindTimerStarted = false;
        	sv.log("play: clearTimer")
        }

        if (time === 0) {
            videoElement.play();
        } else {
            sv.seek(time);
            videoElement.play();
        }

        if (sv.getReadyState() === "noInfo") {
        	playTimer = createTimer(0.25, canPlay);
        }

        function canPlay() {
        	if (sv.getReadyState() === "haveEnough") {
        		clearTimer(playTimer);
        		sv.play();
        		sv.log("CAN PLAY: Video wasn't ready.")
        	}
        }

        playbackState = "playing";

        //Plays the video, will use the seek() method 
        //if start time isn't 0
        //time can be in seconds || minutes:seconds || hours:minutes:seconds
    }

    ///////////////////////
    ////PAUSE
    //////////////////////
    sv.pause = function () {

    	if (playbackState === "rewinding") {
    		clearTimer(rewindTimer);
    		rewindTimerStarted = false;
    	}

        videoElement.pause();
        playbackState = "paused";
    	
    }

    ///////////////////////
    ////TOGGLE PAUSE
    //////////////////////
    sv.togglePause = function () {
        if (videoElement.paused === false) {
            sv.pause();
        } else {
            sv.play();
        }
    }

    ///////////////////////
    ////STOP
    //////////////////////
    sv.stop = function (stopDownload) {

        //Stops video playback
        //if stopDownload is set to
        //true, unloads video
        stopDownload = stopDownload || false;

        if (stopDownload === false) {
            sv.pause();
            sv.seek(0);
        } else {
            sv.unloadVideo();
        }
        playbackState = "stopped";
    }

    ///////////////////////
    ////UNLOAD VIDEO
    //////////////////////
    sv.unloadVideo = function () {
        sv.pause();
        videoElement.src = "";
    }

    ///////////////////////
    ////SEEK
    //////////////////////
    sv.seek = function (time, scrub) {

        scrub = scrub || false;

        //time can be 

        //Seeks to a time in the video
        //Scrub determines if the video
        //will be allowed to play as you 
        //scrub the seek bar
        //At this moment, I'm not sure
        //if possible

        if (time > sv.getTotalTime) {
            videoElement.currentTime = sv.getTotalTime;
        } else if (time <= 0)
        	videoElement.currentTime = 0;
        else {
            videoElement.currentTime = time;
        }
        playbackState = "seeking";
        //sv.log("seek time: " + videoElement.currentTime);
    }

    ///////////////////////
    ////REWIND
    //////////////////////
    sv.rewind = function (muteSound, speed) {

    	muteSound = muteSound || false;
        speed = speed;

        if(muteSound === true) {
        	videoElement.muted = true;
        }

        if(speed !== undefined) {
        	rewindRate = speed;
        }

        sv.playbackSpeed(1);

        var newCurrentTime;

        if(rewindTimerStarted === false) {
        	rewindTimerStarted = true;
        	rewindTimer = createTimer(0.025, stepBack);
        	sv.log("rewind timer created!!!")
        }

        rewindRate = rewindRate += 0.05;

        function stepBack(evt) {
        	newCurrentTime = (sv.getCurrentTime() - rewindRate);
        	if (newCurrentTime <= 0) {
        		clearTimer(rewindTimer);
        		newCurrentTime = 0;
        		rewindTimerStarted = false;
        	}
        	if (newCurrentTime <= 0)
	        	videoElement.currentTime = 0;
	        else {
	            videoElement.currentTime = newCurrentTime;
	        }
	    }
	    playbackState = "rewinding";
    }

    ///////////////////////
    ////FAST FORWARD
    //////////////////////
    sv.fastForward = function () {

        if(playbackState === "rewinding") {
        	clearTimer(rewindTimer);
        	rewindTimerStarted = false;
        }

        var newSpeed = 0;
        //Determine what the next speed will be
        if (currentPlaybackSpeed < 2) {
            newSpeed = 2;
            //sv.log("currentPlaybackSpeed < 2");
        } else if (currentPlaybackSpeed >= 2 && currentPlaybackSpeed < 4) {
            newSpeed = 4;
            //sv.log("currentPlaybackSpeed >= 2 && currentPlaybackSpeed < 4");
        } else if (currentPlaybackSpeed >= 4 && currentPlaybackSpeed < 8) {
            newSpeed = 8;
            //sv.log("currentPlaybackSpeed >= 4 && currentPlaybackSpeed < 8");
        } else if (currentPlaybackSpeed >= 8 && currentPlaybackSpeed < 16) {
            newSpeed = 16;
            //sv.log("currentPlaybackSpeed >= 8 && currentPlaybackSpeed < 16");
        } else if (currentPlaybackSpeed >= 16 && currentPlaybackSpeed < 32) {
            newSpeed = 32;
            //sv.log("currentPlaybackSpeed >= 16 && currentPlaybackSpeed < 32");
        } else if (currentPlaybackSpeed >= 32 && currentPlaybackSpeed < 64) {
            newSpeed = 64;
            //sv.log("currentPlaybackSpeed >= 32 && currentPlaybackSpeed < 64");
        } else if (currentPlaybackSpeed >= 64 && currentPlaybackSpeed < 128) {
            newSpeed = 128;
            //sv.log("currentPlaybackSpeed >= 64 && currentPlaybackSpeed < 128");
        } else if (currentPlaybackSpeed >= 128 && currentPlaybackSpeed < 256) {
            newSpeed = 256;
            //sv.log("currentPlaybackSpeed >= 128 && currentPlaybackSpeed < 256")
        } else {
            newSpeed = currentPlaybackSpeed;
        }
        currentPlaybackSpeed = newSpeed;
        videoElement.playbackRate = currentPlaybackSpeed;

        playbackState = "fastForwarding";
    } 

    ///////////////////////
    ////PLAYBACK SPEED
    //////////////////////
    sv.playbackSpeed = function (speed) {

        speed = speed || 1;
        currentPlaybackSpeed = speed;
        videoElement.playbackRate = currentPlaybackSpeed;
    }

    ///////////////////////
    ////SET VOLUME
    //////////////////////
    sv.setVolume = function (level) {
        level = level || 100;
        videoElement.volume = level / 100;
    }

    ///////////////////////
    ////MUTE
    //////////////////////
    sv.mute = function () {
        videoElement.muted = true;
        muteState = "muted";
    }

    ///////////////////////
    ////UNMUTE
    //////////////////////
    sv.unmute = function () {
        videoElement.muted = false;
        muteState = "unmuted";
    }

    ///////////////////////
    ////TOGGLE MUTE
    //////////////////////
    sv.toggleMute = function () {
        //Toggles the mute on and off
        if (videoElement.muted === true) {
            sv.unmute();
        } else {
            sv.mute();
        }
    }

    ///////////////////////
    ////SET SIZE
    //////////////////////
    sv.setSize =  function (sizeParams) {

        //sizeParams can either be an object or string
        //If an object it should look like this: 
        //{"width" : "640", "height" : "320"}

        //sizeParams can be a string with a video standard
        //Ex. "1080" = 1920x1080, "svga" = 800x600

        //320 - 640 x 320
        //480 - 854 x 480
        //720 - 1280 x 720
        //1080 - 1920 x 1080

        //https://support.google.com/youtube/answer/1722171?hl=en
    }

    ///////////////////////
    ////SET WIDTH
    //////////////////////
    sv.setWidth = function () {
        //Sets the width of the video
    }

    ///////////////////////
    ////SET HEIGHT
    //////////////////////
    sv.setHeight = function () {
        //Sets the height of the video
    }

    ///////////////////////
    ////SET FRAME RATE
    //////////////////////
    sv.setFrameRate = function (rate) {
        //Not sure if this is doable
        //Will look into
    }

    ///////////////////////
    ////GET CURRENT TIME
    //////////////////////
    sv.getCurrentTime = function () {
        //Returns time in seconds
        return videoElement.currentTime;
    }

    //////////////////////
    ////GET TOTAL TIME
    //////////////////////
    sv.getTotalTime = function () {
        //Returns time in seconds
        return videoElement.duration;
    }

    //////////////////////
    ////FORMAT TIME
    //////////////////////
    sv.formatTime = function () {
        //Possible formats
        //minutes/seconds
        //hours/minutes/seconds
        //milliseconds if possible
    }

    //////////////////////
    ////GET READY STATE
    //////////////////////
    sv.getReadyState = function () {
    	var state = videoElement.readyState, stateMessage;
    	if (state === 0) {
    		//No information whether or not the audio/video is ready
    		stateMessage = "noInfo";
    	} else if (state === 1) {	
    		//Metadata for the audio/video is ready
    		stateMessage = "haveMeta";
    	} else if (state === 2) {
    		//Data for the current playback position is available, 
    		//but not enough data to play next frame/millisecond 
    		stateMessage = "haveCurrent";
    	} else if (state === 3) {
    		//Data for the current and at least the next frame is available
    		stateMessage = "haveFuture";
    	} else if (state === 4) {	
    		//Enough data available to start playing
    		stateMessage = "haveEnough";
    	} else {
    		//Couldn't retrieve the readyState
    		//videoElement might not be defined
    		//or readyState is not available
    		stateMessage = "noState";
    	}
    	return stateMessage;
    }

    //////////////////////
    ////GET NETWORK STATE
    //////////////////////
    sv.getNetworkState = function () {
    	var netState = videoElement.networkState, stateMessage;

    	if (newState === 0) {
    		//Video has not yet been initialized
    		stateMessage = "empty";
    	} else if (netState === 1) {
    		//Video is active and has selected a resource, but is not using the network
    		stateMessage = "idle";
    	} else if (netState === 2) {
    		//Browser is downloading data
    		stateMessage = "loading";
    	} else if (netState === 3) {
    		//Video source found
    		stateMessage = "noSource";
    	}
    	return stateMessage;
    }

    //////////////////////
    ////GET CURRENT SOURCE
    //////////////////////
    sv.getCurrentSource = function () {
    	return videoElement.currentSrc;
    }

    //////////////////////
    ////GET CURRENT TYPE
    //////////////////////
    sv.getCurrentType = function () {
    	return getExtension(videoElement.currentSrc);
    }

    //////////////////////
    ////GET PLAYBACK STATE
    //////////////////////
   	sv.getPlaybackState = function () {
   		sv.log("playbackState: " + playbackState);
   		return playbackState;
   	}

    //////////////////
    ////INSERT AFTER
    //////////////////
    sv.insertAfter = function (targetElement) {
        var parent = videoElement.parentNode;
        parent.insertBefore(videoElement, targetElement.nextSibling);
    }

    //////////////////
    ////INSERT BEFORE
    //////////////////
    sv.insertBefore = function (targetElement) {
        var parent = videoElement.parentNode;
        parent.insertBefore(videoElement, targetElement);
    }

    //////////////////////
    ////LOG
    //////////////////////
    sv.log = function (message, method, obj) {

        method = method || "log";
        var err, ID = "SpektralVideo: " + instanceID + ": ";

        if (debug) {
            if(method === "dir") {
                console.log(ID + message);
                console.dir(obj);
            } else if (method === "warn") {
                if(strictError === false) {
                    console.warn(ID + message);
                } else {
                    err = new Error(ID + message);
                }
            } else {
                console.log(ID + message);
            }
        }
    }

    //////////////////////////////////
    /////PARAMS
    //////////////////////////////////
    //Container
    //If no container is defined, use body
    //Also if container is an existing video 
    //element, don't generate a video element,
    //use the existing one
    // if (container === null || container === undefined) {
    //     sv.log("container is not set.", "warn");
    // }

    //Other possible params
    //isMuted, speed, startTime

    if(params === undefined) {
        //No param set, set defaults
        path = "none";
        width = 640;
        height = 320;
        useDefaultControls = false;
        isMuted = false;
    } else {
        debug = params.debug || false;
        path = params.path || "none";
        width = params.width;
        height = params.height;
        useDefaultControls = params.useDefaultControls || false;
        isMuted = params.muted || false;
    }

    sv.log("params: debug: " + debug + 
            " path: " + path + 
            " width: " + width + 
            " height: " + height + 
            " useDefaultControls: " + useDefaultControls + 
            "isMuted: " + isMuted);

    //Path
    //If no path is defined, then wait for loadVideo()
    //Path can be a string or and object
    //If an object it will look something like this:
    //{"mp4" : "video.mp4", "ogg" : "video.ogg", "webm" : "video.webm"}
    //path = params.path || "none";

    //width - default: 640
    //width = params.width || 640;

    //height - default: 320
    //height = params.height || 320;

    //useDefaultControls = params.useDefaultControls || false;

    ///////////////////////
    ////CREATE VIDEO ELEMENT
    //////////////////////
    function createVideoElement(elID) {

        videoElement = document.createElement("video");
        createSetAttribute(videoElement, "id", elID);
        attachEventListener(videoElement, "loadedmetadata", onLoadedMetaData);
        //Add video element to container
        container.appendChild(videoElement);
    }

    ///////////////////////
    ////CREATE SOURCE ELEMENT
    //////////////////////
    function createSourceElement(source, type) {

        var sourceElem = document.createElement("source");
        createSetAttribute(sourceElem, "src", source);
        createSetAttribute(sourceElem, "type", "video/" + type);
        videoElement.appendChild(sourceElem);
    }

    ///////////////////////
    ////ON LOADED META DATA
    //////////////////////
    function onLoadedMetaData(evt) {
        sv.log("Meta Data Loaded");

        if (width === undefined) {
            width = videoElement.videoWidth;
            createSetAttribute(videoElement, "width", width);
        } else {
            //Set predefined width
            createSetAttribute(videoElement, "width", width);
        }

        if (height === undefined) {
            height = videoElement.videoHeight;
            createSetAttribute(videoElement, "height", height);
        } else {
            //Set predefined height
            createSetAttribute(videoElement, "height", height);
        }
    }

    ///////////////////////
    ////CREATE SET ATTRIBUTE
    //////////////////////
    function createSetAttribute(element, attribute, value) {
        element.setAttribute(attribute, value);
    }

    ///////////////////////
    ////SET BROWSER WARNING
    //////////////////////
    function setBrowserWarning(message) {

        message = message || "Your browser does not support HTML5 video. Please upgrade your browser."
        videoElement.innerHTML = message;
    }

    //UTILS

    ///////////////////////
    ////GET INFO
    //////////////////////
    function getInfo(obj) {
        return JSON.stringify(obj);
    }

    ///////////////////////
    ////GET TYPE
    //////////////////////
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
    }

    ///////////////////////
    ////GET EXTENSION
    //////////////////////
    function getExtension(file) {
        return file.split(".").pop();
    }

    ///////////////////////
    ////GET INNER TEXT
    //////////////////////
    function getInnerText(element) {
        var content = element.textContent;
        if (content === undefined) {
            content = element.innerText;
        }
        return content;
    }

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
    ////CREATE EVENT
    /////////////////
    function createEvent(eventName, detail, bub, can) {

        detail = detail || null;
        bub = bub || true;
        can = can || true;

        var evt;
        evt = new CustomEvent(eventName, { detail: detail, bubbles: bub, cancelable: can });
        if(evt === undefined) {
            evt = new Event(eventName);
        }
        return evt;
    };

    //////////////////
    ////TRIGGER EVENT
    /////////////////
    function triggerEvent(obj, evt) {
        obj.dispatchEvent(evt);
    }

    ////////////////////
    ////CREATE TIMER
    ////////////////////
    function createTimer(time, handler) {

        var convertedTime = time * 1000;
        return setInterval(handler, convertedTime);
    };

    ////////////////////
    ////CLEAR TIMER
    ////////////////////
    function clearTimer(timer) {
        clearInterval(timer);
    };

    ////////////////////
    ////CREATE TIME OUT
    ////////////////////
    function createTimeout(time, handler) {

        var convertedTime = time * 1000;
        setTimeout(handler, convertedTime);
    };

    ////////////////////
    ////STOP TIME OUT
    ////////////////////
    function stopTimeout (timeout) {
        clearTimeout(timeout);
    };

    //INITIALIZE THE VIDEO**************************************************************
    initVideo();

    ///////////////////////
    ////INIT VIDEO
    //////////////////////
    function initVideo() {
        createVideoElement(instanceID);

        //Controls
        //currently is being set larger than it should be
        if (useDefaultControls === true) {
            createSetAttribute(videoElement, "controls");
        }

        if (isMuted === true) {
        	sv.mute();
        } 
    }
    //console.log("SpektralVideo: " + JSON.stringify(this));
};