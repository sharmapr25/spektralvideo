//////////////////////
////SPEKTRAL VIDEO
//////////////////////
function SpektralVideo(container, instanceID, params) {

    //Private Vars
    var 
        sv = this,
        container, path, width, height, useDefaultControls, videoMuted, videoClass,
        debug = false, strictError = false, videoElement, currentPlaybackSpeed = 1,
 		playbackState = "stopped", muteState = "unmuted",
        rewindTimer, rewindTimerStarted = false,  rewindRate = 0,
        playbackTimer, playbackComplete, possibleFormats, poster;

    ///////////////////////
    ////GET VIDEO ELEMENT
    //////////////////////
    sv.getVideoElement = function () {
    	return videoElement;
    }    

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
        	readyToPlay(function() {
        		sv.play();
        	});
        }
        //sv.log("loadFile: path: " + pathType);
    }

    ///////////////////////
    ////PLAY
    //////////////////////
    sv.play = function (playParams) {

    	//Check to see if source is set
    	sv.getCurrentSource();

    	//regularSpeed determines if when play
    	//is invoked, whether the playBackSpeed
    	//should be restored to 1
    	var 
    		rSpeed = getParameter(playParams, "regularSpeed", true);
    		time = getParameter(playParams, "time", 0), 
    		pTimer = false;

		//If playback timer hasn't been started, start it	
        if (playbackTimer === undefined || playbackTimer === false) {
        	//Start playbackTimer if it hasn't been started
        	playbackTimer = createTimer(0.25, playbackChecker);
        }

        //If video was fastForwarding, rewinding, or rSpeed is true then restore playbackSpeed to normal
        if (playbackState === "fastForwarding" || playbackState === "rewinding" || rSpeed === true) {
        	sv.playbackSpeed(1);
        }

        //If rewinding, stop it
        if(playbackState === "rewinding") {
        	clearTimer(rewindTimer);
        	rewindTimerStarted = false;
        }

        //If time is 0, play. 
        //If time is more than 0, 
        //seek to that part and play.
        if (time === 0) {
        	readyToPlay(function() {
        		videoElement.play();
        	});
        } else {
        	readyToPlay(function() {
        		sv.seek(time);
            	videoElement.play();	
        	});
        }

        playbackState = "playing";
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
        sv.setPoster(poster);
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

    	//Check if time is formatted,
    	//either m:s or h:m:s
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
    ////SEEK AND PLAY
    //////////////////////
    sv.seekAndPlay = function (time) {	
    	readyToPlay(function() {
    		sv.play();
    		sv.seek(time);
    	});
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
    ////STEP FORWARD
    //////////////////////
    sv.stepForward = function (stepAmount) {
    	stepAmount = stepAmount || 0.5;
    	var 
    		newTime = sv.getCurrentTime() + stepAmount,
    		videoDuration = sv.getTotalTime();
    	sv.pause();
    	if (newTime >= videoDuration) {
    		videoElement.currentTime = videoDuration;
    	} else {
			videoElement.currentTime = newTime;
    	}
    }

    ///////////////////////
    ////STEP BACK
    //////////////////////
    sv.stepBack = function (stepAmount) {
    	stepAmount = stepAmount || 0.5;
    	var newTime = sv.getCurrentTime() - stepAmount;
    	sv.pause();
    	if (newTime <= 0) {
    		videoElement.currentTime = 0;
    	} else {
    		videoElement.currentTime = newTime;
    	}
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
    ////PLAY SECTION
    //////////////////////
    sv.playSection = function (start, end, loopVideo) {

    	sv.log("playSection: start: " + start + " end: " + end);
    	loopVideo = loopVideo || false;
    	var 
    		timeChecker,
    		endSeconds = sv.formatTime(end).secondsNum;

    	readyToPlay(function() {
    		sv.log("playSection: readyToPlay");
    		sv.seekAndPlay(start);
    		timeChecker = createTimer(0.25, onTimeCheck);
    		if (loopVideo === true) {
    			sv.loop();
    		}
    	});

    	function onTimeCheck() {
    		if (sv.getCurrentTime() >= endSeconds) {
    			//If at end of section
    			if (videoElement.loop === true) {
    				//If looping, restart 
    				//video at start point
    				sv.seekAndPlay(start);
    				sv.log("playSection: looping")
    			} else {
    				//If loop is false, 
    				//clearTimer and stop playback
    				sv.stop();
    				clearTimer(timeChecker);
    				sv.log("playSection: stop")
    			}
    		}
    		//sv.log("time checker");
    	}
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
    }

    ///////////////////////
    ////IS LOOPED
    //////////////////////
    sv.isLooped = function () {
    	return videoElement.loop;
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
    ////IS MUTED
    //////////////////////
    sv.isMuted = function () {
    	return videoElement.muted;
    }

    ///////////////////////
    ////SET POSTER
    //////////////////////
    sv.setPoster = function (imageURL) {
    	createSetAttribute(videoElement, "poster", imageURL);
    }

    ///////////////////////
    ////SET SIZE
    //////////////////////
    sv.setSize =  function (sizeParams) {

        //sizeParams can either be an object or string
        //If an object it should look like this: 
        //{"width" : "640", "height" : "320"}
        var width, height, checkType = getType(sizeParams), viewport;
        	
        if (checkType === "object") {
        	width = getParameter(sizeParams.width, false),
        	height = getParameter(sizeParams.height, false);
        	if (width !== false) {
        	sv.setWidth(width);
	        }
	        if (height !== false) {
	        	sv.setHeight(height);
	        }
        } else {

        	if (sizeParams === "native") {
        		sv.setWidth(videoElement.videoWidth);
        		sv.setHeight(videoElement.videoHeight);
        	} else if (sizeParams === "240p") {
        		sv.setWidth(426);
        		sv.setHeight(240)
        	} else if (sizeParams === "360p") {
        		sv.setWidth(640);
        		sv.setHeight(360);
        	} else if (sizeParams === "480p") {
        		sv.setWidth(854);
        		sv.setHeight(480);
        	} else if (sizeParams === "720p") {
        		sv.setWidth(1280);
        		sv.setHeight(720);
        	} else if (sizeParams === "1080p") {
        		sv.setWidth(1920);
        		sv.setHeight(1080);
        	} else if (sizeParams === "1440p") {
        		sv.setWidth(2560);
        		sv.setHeight(1440);
        	} else if (sizeParams === "2160p") {
        		sv.setWidth(3840);
        		sv.setHeight(2160);
        	} else if (sizeParams === "fill") {
        		viewport = getViewportSize();
        		sv.setWidth(viewport.width);
        		sv.setHeight(viewport.height);
        	}
        }

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
    sv.setWidth = function (vWidth) {
        //Sets the width of the video
        videoElement.width = vWidth;
    }

    ///////////////////////
    ////SET HEIGHT
    //////////////////////
    sv.setHeight = function (vHeight) {
        //Sets the height of the video
        videoElement.height = vHeight;
    }

    ///////////////////////
    ////GET DIMENSIONS
    //////////////////////
    sv.getDimensions = function () {
    	var dimensions = {};
    	dimensions["width"] = videoElement.width;
    	dimensions["height"] = videoElement.height;
    	//sv.log("getDimensions: width: " + videoElement.width + " height: " + videoElement.height);
    	return dimensions;
    }

    ///////////////////////
    ////ENTER FULLSCREEN
    //////////////////////
    sv.enterFullscreen = function () {
    	if (videoElement.requestFullscreen) {
		  videoElement.requestFullscreen();
		} else if (videoElement.msRequestFullscreen) {
		  videoElement.msRequestFullscreen();
		} else if (videoElement.mozRequestFullScreen) {
		  videoElement.mozRequestFullScreen();
		} else if (videoElement.webkitRequestFullscreen) {
		  videoElement.webkitRequestFullscreen();
		}
    }

    ///////////////////////
    ////EXIT FULLSCREEN
    //////////////////////
    sv.exitFullscreen = function () {
    	if (videoElement.exitFullscreen) {
    		videoElement.exitFullscreen();
    	} else if (videoElement.mozCancelFullScreen) {
    		videoElement.mozCancelFullScreen();
    	} else if (videoElement.webkitExitFullscreen) {
    		videoElement.webkitExitFullscreen();
    	} else if (videoElement.msExitFullscreen) {
    		videoElement.msExitFullscreen();
    	}
    }

    ///////////////////////
    ////IN FULL SCREEN
    //////////////////////
    sv.inFullScreen = function () {
    	//fullscreenElement
    	var 
    		fsElement = document.fullscreenElement || 
    		document.mozFullScreenElement || 
    		document.webkitFullscreenElement || 
    		document.msFullscreenElement,
    		inFS = false;

    	if (fsElement !== undefined) {
    		inFS = true;
    	}	
    	return inFS;
    }

    ///////////////////////
    ////FULL SCREEN ALLOWED
    //////////////////////
    sv.fullScreenAllowed = function () {
    	//fullscreenEnabled
    	//Not fully tested
    	var 
    		fsAllowed = document.fullscreenEnabled || 
    		document.mozFullScreenEnabled ||
    		document.webkitFullscreenEnabled || 
    		document.msFullscreenEnabled, isAllowed = false;

    	if (fsAllowed !== undefined) {
    		isAllowed = true;
    	}	

    	//sv.log("fsAllowed: " + fsAllowed);

    	return isAllowed;
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

    //VIDEO EVENTS START********************

    //////////////////////
    ////ON VIDEO COMPLETE
    //////////////////////
    sv.onVideoComplete = function (handler) {
    	attachEventListener(videoElement, "playbackcomplete", handler);
    }

    sv.attachVideoEvent = function (evt, handler) {
    	if (evt === "canplaythrough") {
    		//Fired when enough data is available that the browser 
    		//believes it can play the video completely without interruption
    		attachEventListener(videoElement, evt, handler);
    	} else if (evt === "ended") {
    		//Fired when the video has finished playing
    		attachEventListener(videoElement, evt, handler);
    	} else if (evt === "error") {
    		//Fired if an error occurs
    		attachEventListener(videoElement, evt, handler);
    	} else if (evt === "playing") {
    		//Fired when the video starts playing, for the first time, 
    		//after being paused or when restarting
    		attachEventListener(videoElement, evt, handler);
    	} else if (evt === "progress") {
    		//Fired periodically to indicate the progress of downloading the video
    		attachEventListener(videoElement, evt, handler);
    	} else if (evt === "waiting") {
    		//Fired when an action is delayed pending the completion of another action
    		attachEventListener(videoElement, evt, handler);
    	} else if (evt === "loadedmetadata") {
    		//Fired when the browser has finished loading the 
    		//metadata for the video and all attributes have been populated
    		attachEventListener(videoElement, evt, handler);
    	} else {
    		sv.log("attachVideoEvent: Event: " + evt + "not recognized.", "warn");
    	}
    }

    //VIDEO EVENTS END********************

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
    	var 
    		source = videoElement.currentSrc,
    		sourceString = "nosource";
    	if (source === undefined || source === "") {
    		sv.log("No current source detected, either loadFile has not been invoked, or no supported formats are available.", "warn");
    	} else {
    		sourceString = source;
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

    ////////////////////////////////////
    ////PRIVATE FUNCTIONS***************
    ////////////////////////////////////

    ///////////////////////
    ////CREATE VIDEO ELEMENT
    //////////////////////
    function createVideoElement(elID) {

        videoElement = document.createElement("video");
        createSetAttribute(videoElement, "id", elID);
        createSetAttribute(videoElement, "style", "visibility:hidden");

        if (videoClass !== false) {
        	createSetAttribute(videoElement, "class", videoClass);
        }

        if (poster !== false) {
        	sv.setPoster(poster);
        }  
        //Add video element to container
        container.appendChild(videoElement);
    }

    ///////////////////////
    ////CREATE SOURCE ELEMENT
    //////////////////////
    function createSourceElement(source, type) {

        var 
        	sourceElem = document.createElement("source"),
        	typeAndCodec = "";	
        	
    //     if (type === "mp4") {
 			// typeAndCodec = "video/" + type + "; codecs=\"avc1.42E01E, avc1.4D401E, mp4a.40.2\"";
    //     } else if (type === "webm") {
    //     	typeAndCodec = "video/" + type + "; codecs=\"vp8.0, vorbis\"";
    //     } else if (type === "ogg" || type === "ogv") {
    //     	typeAndCodec = "video/" + type + "; codecs=\"theora, vorbis\"";
    //     } else if (type === "3gp") {
    //     	typeAndCodec = "video/3gpp; codecs=\"mp4v.20.8, samr\"";
    //     }	 

        createSetAttribute(sourceElem, "src", source);
        createSetAttribute(sourceElem, "type", "video/" + type);
        videoElement.appendChild(sourceElem);
    }

    ///////////////////////
    ////ON LOADED META DATA
    //////////////////////
    function onLoadedMetaData(evt) {
        sv.log("Meta Data Loaded");

        if (width === false) {
            width = videoElement.videoWidth;
            createSetAttribute(videoElement, "width", width);
        } else {
            //Set predefined width
            createSetAttribute(videoElement, "width", width);
        }

        if (height === false) {
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
    ////READY TO PLAY
    //////////////////////
    function readyToPlay(handler) {
    	var readyCheck = createTimer(0.25, onReadyCheck);

    	function onReadyCheck(evt) {
    		if (sv.getReadyState() === "haveEnough") {
    			clearTimer(readyCheck);
    			handler();
    		}
    	}	
    }

    ///////////////////////
    ////ON PLAYBACK COMPLETE
    //////////////////////
    function onPlaybackComplete() {
    	sv.log("Playback is complete.")
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

    ////////////////////
    ////ON VIDEO ERROR
    ////////////////////
    function onVideoError(evt) {
    	sv.log(instanceID + ": an error occurred: " + evt, "warn");
    }





    //////////////////////
    ////UTILS****************************************************
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

    ///////////////////
    ////GET VIEWPORT SIZE
    ///////////////////
    function getViewportSize() {
        var w, h, vPort = {};
        //Width
        if (window.innerWidth) {
            w = window.innerWidth;
        } else if (document.body && document.body.offsetWidth) {
            w = document.body.offsetWidth;
        } else {
            w = null;
        }
        //Height
        if (window.innerHeight) {
            h = window.innerHeight;
        } else if (document.body && document.body.offsetHeight) {
            h = document.body.offsetHeight;
        } else {
            h = null;
        }

        vPort["width"] = w;
        vPort["height"] = h;

        return vPort;
    }

    function getHash() {
    	var 
    		hashTag = window.location.hash;
    	if (hashTag === "") {
    		hashTag = false;
    	}
    	return hashTag;
    }

    function getHashValue(value) {
    	var 
    		paramObj = getHashString(), 
    		key, returnValue = false;

    	for (key in paramObj) {
    		if (key === value) {
    			returnValue = paramObj[key];
    		}
    	}
    	return returnValue;
    }

    function detectCharacter(request, character) {
    	var 
    		detected = false, 
    		test = request.match(character);
        if(test !== null) {
            detected = true;
        }
        return detected;
    }

    ////////////////////
    ////GET HASH STRING
    ////////////////////
    function getHashString() {

        var 
            hashParams = {},
            hash = window.location.hash,
            hasMultiple,
            hashString, valArray, i, value;
        if(hash === "") {
            sv.log("getHashString: No hash tag was found.", "warn");
        } else {
            hashString = hash.split("#").pop();
            hasMultiple = detectCharacter(hashString, "&");
            if (hasMultiple === true) {
            	//multiple values
	        	valArray = splitString(hashString, "&");
		        for (i = 0; i < valArray.length; i += 1) {
		            value = splitString(valArray[i], "=");
		            hashParams[value[0]] = value[1];
		        }
            } else {
            	//single values
            	value = splitString(hashString, "=");
            	hashParams[value[0]] = value[1];
            }
        }
        return hashParams;    
    }

    ////////////////////
    ////GET QUERY STRING
    ////////////////////
    function getQueryString() {

        var 
            queryParams = {},
            query = window.location.search,
            queryString, valArray, i, value;
        if(query === "") {
            sv.log("getQueryString: No query string was found.", "warn");
        } else {
            queryString = query.split("?").pop();
            valArray = splitString(queryString, "&");
            for (i = 0; i < valArray.length; i += 1) {
                value = splitString(valArray[i], "=");
                queryParams[value[0]] = value[1];
            }
        }
        return queryParams;    
    }

    //////////////////
    ////HAS PATTERN
    //////////////////
    function hasPattern(request, pattern) {
        var 
            regEx = new RegExp(pattern, "g"),
            matches = request.match(regEx),
            hasMatch = false, matchAmount = 0,
            matchObj = {}, i;
        if (matches !== null) {
            hasMatch = true;
            matchAmount = matches.length;
        }
        matchObj["match"] = hasMatch;
        matchObj["amount"] = matchAmount;
        matchObj["matchArray"] = matches;
        //sv.log("matchObj: " + JSON.stringify(matchObj));
        return matchObj;
    }

    ////////////////////
    ////CHECK HASH FOR TIME
    ////////////////////
    function checkHashForTime() {
    	
    	var 
    		timeValue = getHashValue("t"), 
    		range, hasComma;
    
		if (timeValue !== false) {
			//time detected
			//check if range or single time
			hasComma = detectCharacter(timeValue, ",");
			if (hasComma === true) {
				//range
				range = splitString(timeValue, ",");
				//figure out loop
				sv.playSection(range[0], range[1]);
			} else {
				//single
				sv.seekAndPlay(timeValue);
			}
		}		
    }

    //INITIALIZE THE VIDEO**************************************************************

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
    debug = getParameter(params, "debug", false);
    path = getParameter(params, "path", "none");
    width = getParameter(params, "width", false);
    height = getParameter(params, "height", false);
    useDefaultControls = getParameter(params, "useDefaultControls", false);
    videoMuted = getParameter(params, "muted", false);
    videoClass = getParameter(params, "class", false);
    poster = getParameter(params, "poster", false);
    
    sv.log("params: debug: " + debug + 
            " path: " + path + 
            " width: " + width + 
            " height: " + height + 
            " useDefaultControls: " + useDefaultControls + 
            "videoMuted: " + videoMuted +
            "videoClass" + videoClass);

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

        //loadedmetadata
        sv.attachVideoEvent("loadedmetadata", onLoadedMetaData);

        //progress
        sv.attachVideoEvent("progress", onAmountLoaded);

        //error
        sv.attachVideoEvent("error", onVideoError);

        //PlaybackComplete
        playbackComplete = createEvent("playbackcomplete");
        attachEventListener(videoElement, "playbackcomplete", onPlaybackComplete);

        //Check for time in hash
        checkHashForTime();

        //Controls
        //currently is being set larger than it should be
        if (useDefaultControls === true) {
            createSetAttribute(videoElement, "controls");
        }

        if (videoMuted === true) {
        	sv.mute();
        } 
    }
    //console.log("SpektralVideo: " + JSON.stringify(this));
};