//////////////////////
////SPEKTRAL VIDEO
//////////////////////
function SpektralVideo(container, instanceID, params) {

    //Private Vars
    var 
        sv = this,
        container, path, width, height, useDefaultControls, isMuted, videoClass,
        debug = false, strictError = false, videoElement, currentPlaybackSpeed = 1,
 		playbackState = "stopped", muteState = "unmuted",
        rewindTimer, rewindTimerStarted = false,  rewindRate = 0,
        playbackTimer, playbackComplete, possibleFormats;
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
        	//videoElement.load();
        	if (sv.getReadyState() === "noInfo") {
        		autoplayTimer = createTimer(0.25, waitForData);
        	}
        	//sv.log("AUTOPLAY: READY STATE: " + sv.getReadyState());
        }

        function waitForData() {
        	if (sv.getReadyState() === "haveEnough") {
        		clearTimer(autoplayTimer);
        		sv.play();
        	}
    	}

        //sv.log("loadFile: path: " + pathType);
    }

    ///////////////////////
    ////PLAY
    //////////////////////
    sv.play = function (playParams) {

    	//regularSpeed determines if when play
    	//is invoked, whether the playBackSpeed
    	//should be restored to 1
    	var 
    		rSpeed = getParameter(playParams, "regularSpeed", true);
    		time = getParameter(playParams, "time", 0), 
    		pTimer = false;

        //sv.log("play: regularSpeed: " + rSpeed + " time: " + time);

        //sv.log("playbackTimer: " + playbackTimer);

        if (playbackTimer === undefined || playbackTimer === false) {
        	//Start playbackTimer if it hasn't been started
        	playbackTimer = createTimer(0.25, playbackChecker);
        }

        if(muteState === "muted") {
        	sv.mute();
        } else {
        	sv.unmute();
        }

        if (playbackState === "fastForwarding" || playbackState === "rewinding" || rSpeed === true) {
        	//sv.log("playbackState: " + playbackState);
        	//sv.log("regularSpeed: " + rSpeed);
        	sv.playbackSpeed(1);
        }

        if(playbackState === "rewinding") {
        	clearTimer(rewindTimer);
        	rewindTimerStarted = false;
        	//sv.log("play: clearTimer")
        }

        if (time === 0) {
            videoElement.play();
        } else {
            sv.seek(time);
            videoElement.play();
        }

        if (sv.getReadyState() === "noInfo") {
        	pTimer = createTimer(0.25, canPlay);
        }

        function canPlay() {
        	if (sv.getReadyState() === "haveEnough") {
        		clearTimer(pTimer);
        		sv.play();
        		//sv.log("CAN PLAY: Video wasn't ready.")
        	}
        }

        attachEventListener(videoElement, "progress", onAmountLoaded);

        //sv.log("play: totalTime: " + sv.getTotalTime());

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
    sv.togglePause = function (playParams) {
        if (videoElement.paused === false) {
            sv.pause();
        } else {
            sv.play(playParams);
        }
    }

    ///////////////////////
    ////STOP
    //////////////////////
    sv.stop = function (stopDownload) {
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
        clearTimer(playbackTimer);
    }

    ///////////////////////
    ////SEEK
    //////////////////////
    sv.seek = function (time) {

    	var 
    		detectColon = matchPattern(time.toString(), ":"),
    		detected = detectColon.isMatch, 
    		matchArray, h, m, s,
    		detectedAmount = detectColon.amount, i;

    	//sv.log("detected: " + detected + " matchArray: " + matchArray + " detectedAmount: " + detectedAmount);

    	if (detected === true) {
    		matchArray = splitString(time, ":");
    		if (detectedAmount === 1) {
    			m = parseInt(matchArray[0]) * 60;
    			s = parseInt(matchArray[1]);
    			time = m + s;
    		} else {
    			h = (parseInt(matchArray[0]) * 60) * 60;
    			m = parseInt(matchArray[1]) * 60;
    			s = parseInt(matchArray[2]);
    			time = h + m + s;  
    		}
    	}	

    	//sv.log("seek: time: " + time);

        if (time > sv.getTotalTime) {
            videoElement.currentTime = sv.getTotalTime;
        } else if (time <= 0)
        	videoElement.currentTime = 0;
        else {
            videoElement.currentTime = time;
        }
        playbackState = "seeking";
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
        	//sv.log("rewind timer created!!!")
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
    ////LOOP
    //////////////////////
    sv.loop = function () {
    	//Toggles the video looping
    	if (videoElement.loop === false) {
    		videoElement.loop = true;
    	} else {
    		videoElement.loop = false;
    	}
    	//sv.log("loop: " + videoElement.loop);
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
    ////ATTACH EVENT
    //////////////////////
    sv.attachEvent = function (evt, handler) {
    	attachEventListener(videoElement, evt, handler);
    }

    //////////////////////
    ////ON VIDEO COMPLETE
    //////////////////////
    sv.onVideoComplete = function (handler) {
    	attachEventListener(videoElement, "PlaybackComplete", handler);
    }

    //////////////////////
    ////GET AMOUNT LOADED
    //////////////////////
    sv.getAmountLoaded = function () {
    	var 
    		rState = videoElement.readyState,
    		percentage;
 
    	if (rState >= 3) {
    		percentage = Math.round(videoElement.buffered.end(0) / videoElement.duration * 100);
    	} else { 
    		percentage = 0;
    	}

    	return percentage;
    }

    //////////////////////
    ////FORMAT TIME
    //////////////////////
    sv.formatTime = function (time) {
        var 
        	formattedTime = {}, 
	        hours = Math.floor(time / (60 * 60)), 
	        minDivisor = time % (60 * 60)
	        minutes = Math.floor(minDivisor / 60),
	        seconds = Math.ceil(minDivisor % 60),
	        secondsString = seconds.toString();

	    if (seconds < 10) {
	    	secondsString = "0" + secondsString;
	    }    

	    formattedTime["hours"] = hours.toString();
	    formattedTime["minutes"] = minutes.toString();
	    formattedTime["seconds"] = secondsString;

	    formattedTime["hoursNum"] = hours;
	    formattedTime["minutesNum"] = minutes;
	    formattedTime["secondsNum"] = seconds;

	    return formattedTime;    
    }

    //////////////////////
    ////GET FORMATTED TIME
    //////////////////////
    sv.getFormattedTime = function () {

    	var 
    		formatTimeObj = {},
    		currentTimeObj = sv.formatTime(sv.getCurrentTime()),
    		totalTimeObj = sv.formatTime(sv.getTotalTime()),
    		currentHours = currentTimeObj.hours, 
    		currentMinutes = currentTimeObj.minutes, 
    		currentSeconds = currentTimeObj.seconds,
    		totalHours = totalTimeObj.hours, 
    		totalMinutes = totalTimeObj.minutes, 
    		totalSeconds = totalTimeObj.seconds;

    	//Minutes/Seconds
    	formatTimeObj["current"] = currentMinutes + ":" + currentSeconds;
    	formatTimeObj["total"] = totalMinutes + ":" + totalSeconds;

    	//Hours/Minutes/Seconds
    	formatTimeObj["currentHMS"] = currentHours + ":" + currentMinutes + ":" + currentSeconds;
    	formatTimeObj["totalHMS"] = totalHours + ":" + totalMinutes + ":" + totalSeconds;

    	//Current + total minutes/Seconds
    	formatTimeObj["currentAndTotal"] = currentMinutes + ":" + currentSeconds + " / " + totalMinutes + ":" + totalSeconds;

    	//Current + total hours/minutes/seconds
    	formatTimeObj["currentAndTotalHMS"] = currentHours + ":" + currentMinutes + ":" + currentSeconds + " / " +
    	totalHours + ":" + totalMinutes + ":" + totalSeconds;

    	return formatTimeObj;
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

    	if (netState === 0) {
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
    	var source = videoElement.currentSrc;

    	if (source === undefined || source === "") {
    		sv.log("No supported formats available!", "warn");
    	}

    	return source;
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
   		//sv.log("playbackState: " + playbackState);
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

    //Other possible params for the future
    //speed, startTime
    if(params === undefined) {
        //No param set, set defaults
        path = "none";
        width = 640;
        height = 320;
        useDefaultControls = false;
        isMuted = false;
        videoClass = false;
    } else {
        debug = getParameter(params, "debug", false);
        path = getParameter(params, "path", "none");
        width = params.width;
        height = params.height;
        useDefaultControls = getParameter(params, "useDefaultControls", false);
        isMuted = getParameter(params, "muted", false);
        videoClass = getParameter(params, "class", false);
    }

    sv.log("params: debug: " + debug + 
            " path: " + path + 
            " width: " + width + 
            " height: " + height + 
            " useDefaultControls: " + useDefaultControls + 
            "isMuted: " + isMuted +
            "videoClass" + videoClass);

    ///////////////////////
    ////CREATE VIDEO ELEMENT
    //////////////////////
    function createVideoElement(elID) {

        videoElement = document.createElement("video");
        createSetAttribute(videoElement, "id", elID);
        createSetAttribute(videoElement, "style", "visibility:hidden");

        //sv.log("createVideoElement: videoClass: " + videoClass);
        if (videoClass !== false) {
        	createSetAttribute(videoElement, "class", videoClass);
        }

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

        createSetAttribute(videoElement, "style", "visibility:visible");
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

    ///////////////////////
    ////PLAYBACK CHECKER
    //////////////////////
    function playbackChecker() {
    	if (videoElement.ended === true && playbackState !== "stopped") {
    		triggerEvent(videoElement, playbackComplete);
    		playbackState = "stopped";
    	}
    }

    ///////////////////////
    ////ON PLAYBACK COMPLETE
    //////////////////////
    function onPlaybackComplete() {
    	sv.log("Playback is complete!!!!!!: Private");
    	sv.log("window is: " + window);
    	//sv.log("Looping: " + videoElement.loop);
    }

    ////////////////////
    ////ON AMOUNT LOADED
    ////////////////////
    function onAmountLoaded(evt) {
    	var 
    		rState = videoElement.readyState,
    		percentage;
 
    	if (rState >= 3) {
    		percentage = Math.round(videoElement.buffered.end(0) / videoElement.duration * 100);
    	} else { 
    		percentage = 0;
    	}

    	if (percentage === 100) {
    		sv.log("VIDEO LOADED");
    		detachEventListener(videoElement, "progress", onAmountLoaded);
    	}	
    	return percentage;
    }

    //////////////////////
    ////UTILS*************
    //////////////////////

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
    }

    ////////////////////
    ////CLEAR TIMER
    ////////////////////
    function clearTimer(timer) {
        clearInterval(timer);
        timer = false;
    }

    ////////////////////
    ////CREATE TIME OUT
    ////////////////////
    function createTimeout(time, handler) {

        var convertedTime = time * 1000;
        setTimeout(handler, convertedTime);
    }

    ////////////////////
    ////STOP TIME OUT
    ////////////////////
    function stopTimeout (timeout) {
        clearTimeout(timeout);
    }

    //////////////////
    ////MATCH PATTERN
    //////////////////
    function matchPattern(request, pattern) {

        var 
            regEx = new RegExp(pattern, "g"),
            matches = request.match(regEx),
            isMatch = false, matchAmount = 0,
            matchObj = {}, i;

        if (matches !== null && pattern !== undefined) {

            isMatch = true;
            matchAmount = matches.length;
        }

        matchObj["isMatch"] = isMatch;
        matchObj["amount"] = matchAmount;
        matchObj["matches"] = matches;

        return matchObj;
    }

    //////////////////
    ////SPLIT STRING
    //////////////////
    function splitString(request, character) {

        character = character || ",";

        var 
            splitArray = [], split, 
            i, detectCharacter = matchPattern(request, character).isMatch, 
            stripped;

        if(detectCharacter === false && character !== " ") {
            sv.log("splitString: Could not split string because character [" + character + "] was not in string.", "warn");
        } else {
            if(character !== " ") {
                split = request.split(character);
            } else {
                split = request.split(/[ ,]+/);
            }
        }

        for (i = 0; i < split.length; i += 1) {
            if(split[i] !== "") {
                stripped = stripWhiteSpace(split[i]);
                splitArray.push(stripped);
            }
        }
        return splitArray;
    }

    //////////////////
    ////STRIP WHITE SPACE
    //////////////////
    function stripWhiteSpace(request, removeAll) {
        removeAll = removeAll || false;
        var newString;
        if(removeAll !== false) {
            newString = request.replace(/\s+/g, '');
        } else {
            newString = request.replace(/(^\s+|\s+$)/g,'');
        }
        return newString;
    };

    ////////////////////
    ////GET PARAMETER
    ////////////////////
    function getParameter (obj, param, defaultParam) {
    	var retrievedParam;
    	if (obj !== undefined) {
	    	if (obj[param] === undefined) {
	    		retrievedParam = defaultParam;
	    		//sv.log("getParameter: " + param + " was not found, setting to default.")
	    	} else {
	    		retrievedParam = obj[param];
	    		//sv.log("getParameter: " + param + " found.")
	    	}
	    } else {
	    	retrievedParam = defaultParam;
	    	//sv.log("getParameter: object was not defined, setting " + param + " to default.")
	    }
    	return retrievedParam;
    }

    //INITIALIZE THE VIDEO**************************************************************
    initVideo();

    ///////////////////////
    ////INIT VIDEO
    //////////////////////
    function initVideo() {

    	possibleFormats = {
    		"ogg" : "theora, vorbis",
    		"mp4" : "avc1.4D401E, mp4a.40.2",
    		"webm" : "vp8.0, vorbis"
    	};

        createVideoElement(instanceID);
        playbackComplete = createEvent("PlaybackComplete");
        attachEventListener(videoElement, "PlaybackComplete", onPlaybackComplete);

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