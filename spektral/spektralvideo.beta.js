//////////////////////
////SPEKTRAL VIDEO
//////////////////////
function SpektralVideo(container, instanceID, params) {

    //Private Vars
    var 
        sv = this,
        path, width, height, useDefaultControls, 
        videoMuted, videoClass, autoplayVideo, preload,
        debug = false, strictError = false, videoElement, currentPlaybackSpeed = 1,
        playbackState = "stopped", muteState = "unmuted", videoLooped = false,
        rewindTimer, rewindTimerStarted = false,  rewindRate = 0,
        playbackTimer, playbackComplete, poster, subTitlesLoaded = false;

    ///////////////////////
    ////GET VIDEO ELEMENT
    //////////////////////
    sv.getVideoElement = function () {
        return videoElement;
    }    

    ///////////////////////
    ////LOAD FILE
    //////////////////////
    sv.loadFile = function (newPath, autoplay) {
        autoplay = autoplay || false;
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
    }

    ///////////////////////
    ////PRELOAD VIDEO
    //////////////////////
    sv.preloadVideo = function (preloadValue) {
        //options - none, auto, metadata
        preloadValue = preloadValue || "auto";
        createSetAttribute(videoElement, "preload", preloadValue);
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
            time = sv.convertToSeconds(getParameter(playParams, "time", 0)), 
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
        videoLooped = false;
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

        var seekTime = sv.convertToSeconds(time);

        if (seekTime > sv.getTotalTime) {
            videoElement.currentTime = sv.getTotalTime;
        } else if (time <= 0)
            videoElement.currentTime = 0;
        else {
            videoElement.currentTime = seekTime;
        }
        playbackState = "seeking";
    }

    ///////////////////////
    ////SEEK AND PLAY
    //////////////////////
    sv.seekAndPlay = function (time) {  
        var seekTime = sv.convertToSeconds(time);
        readyToPlay(function() {
            sv.seek(seekTime);
            sv.play();
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
        } else if (currentPlaybackSpeed >= 2 && currentPlaybackSpeed < 4) {
            newSpeed = 4;
        } else if (currentPlaybackSpeed >= 4 && currentPlaybackSpeed < 8) {
            newSpeed = 8;
        } else if (currentPlaybackSpeed >= 8 && currentPlaybackSpeed < 16) {
            newSpeed = 16;
        } else if (currentPlaybackSpeed >= 16 && currentPlaybackSpeed < 32) {
            newSpeed = 32;
        } else if (currentPlaybackSpeed >= 32 && currentPlaybackSpeed < 64) {
            newSpeed = 64;
        } else if (currentPlaybackSpeed >= 64 && currentPlaybackSpeed < 128) {
            newSpeed = 128;
        } else if (currentPlaybackSpeed >= 128 && currentPlaybackSpeed < 256) {
            newSpeed = 256;
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
    sv.playSection = function (start, end) {
        var 
            timeChecker, startTime = sv.convertToSeconds(start),
            endTime = sv.convertToSeconds(end);

        if (endTime > startTime) {
            readyToPlay(function() {
                sv.seekAndPlay(startTime);
                timeChecker = createTimer(0.25, onTimeCheck);
            });
        } else {
            sv.log("playSection: end time must be greater than start time.", "warn");
        }   

        function onTimeCheck() {
            //If playbackState changes from playing
            //as a result of user interaction, clear timeChecker
            if(playbackState !== "playing") {
                clearTimer(timeChecker);
            } else {
                if (sv.getCurrentTime() >= endTime) {   
                    sv.stop();  
                }
            }
        }
    }

    ///////////////////////
    ////LOOP SECTION
    //////////////////////
    sv.loopSection = function (start, end) {
        var 
            timeChecker, startTime = sv.convertToSeconds(start),
            endTime = sv.convertToSeconds(end);

        if (endTime > startTime) {
            readyToPlay(function() {
                sv.seekAndPlay(startTime);
                timeChecker = createTimer(0.25, onTimeCheck);
            });
        } else {
            sv.log("loopSection: end time must be greater than start time.", "warn");
        }   

        function onTimeCheck() {
            //If playbackState changes from playing
            //as a result of user interaction, clear timeChecker
            if(playbackState !== "playing") {
                clearTimer(timeChecker);
            } else {
                if (sv.getCurrentTime() >= endTime) {   
                    clearTimer(timeChecker);
                    sv.loopSection(startTime, endTime);
                }
            }
        }
        videoLooped = true;
    }

    ///////////////////////
    ////TOGGLE LOOP
    //////////////////////
    sv.toggleLoop = function () {
        if (videoLooped === false) {
            sv.loop();
        } else {
            sv.unloop();
        }
    }

    ///////////////////////
    ////LOOP
    //////////////////////
    sv.loop = function () {
        videoElement.loop = true;
        videoLooped = true;
    }

    ///////////////////////
    ////UNLOOP
    //////////////////////
    sv.unloop = function() {
        videoElement.loop = false;
        videoLooped = false;
    }

    ///////////////////////
    ////IS LOOPED
    //////////////////////
    sv.isLooped = function () {
        return videoLooped;
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
    ////SET SUBTITLES
    //////////////////////
    sv.setSubtitles = function (subURL, label, isDefault, sourceLang, showing) {
        //Note: track element is not supported in FF.
        //https://developer.mozilla.org/en-US/docs/Web/HTML/Element/track
        //Will work on a polyfill for future release

        //label, source, sourceLang, isDefault
        showing = showing || false;
        isDefault = isDefault || true;
        sourceLang = sourceLang || "en";
        var 
            subUrlType = getType(subURL), subObj, key, i;

        if (subUrlType === "string") {
            //source, label, showing, isDefault, isDefault
            createTrackElement(0, subURL, label, showing, isDefault, sourceLang);
        } else {
            for (i = 0; i < subURL.length; i += 1) {
                subObj = subURL[i];
                createTrackElement(i, subObj.url, subObj.label, subObj.showing, subObj.defaultTrack, subObj.lang);
            }
        }
        sv.turnOffSubtitles();
    }

    ///////////////////////
    ////SHOW SUBTITLE
    //////////////////////
    sv.showSubtitle = function (index) {
        var trackList = getChildren(videoElement, "track"), trackName, trackIndex, i;
        for (i = 0; i < trackList.length; i += 1) {
            trackName = trackList[i].id;
            trackIndex = parseInt(trackName.substr(trackName.length - 1, trackName.length));
            if (trackIndex === index) {
                videoElement.textTracks[i].mode = "showing";
            } else {
                videoElement.textTracks[i].mode = "hidden";
            }
        }
    }

    ///////////////////////
    ////TURN ON SUBTITLES
    ///////////////////////
    sv.turnOnSubtitles = function (index) {
        index = index || 0;
        var trackList = getChildren(videoElement, "track"), i;
        for (i = 0; i < trackList.length; i += 1) {
            if (i === index) {
                videoElement.textTracks[i].mode = "showing";
            }
        }
    }

    ///////////////////////
    ////TURN OFF SUBTITLES
    //////////////////////
    sv.turnOffSubtitles = function () {
        var trackList = getChildren(videoElement, "track"), i;
        for (i = 0; i < trackList.length; i += 1) {
            videoElement.textTracks[i].mode = "hidden";
        }       
    }

    ///////////////////////
    ////GET ACTIVE SUBTITLE TRACK
    //////////////////////
    sv.getActiveSubTitleTrack = function () {
        var activeTrack = false, trackList = getChildren(videoElement, "track"), i;
        for (i = 0; i < trackList.length; i += 1) {
            if (videoElement.textTracks[i].mode === "showing") {
                activeTrack = i;
            }
        }
        return activeTrack;
    }

    ///////////////////////
    ////GET SUBTITLES
    //////////////////////
    sv.getSubtitles = function (handlers) {
        var 
            trackList = getChildren(videoElement, "track"), i, j, k, l, m,
            textTrack, isSubtitles, cue, activeTrack, trackName, trackIndex, isActive;
        
        for (i = 0; i < trackList.length; i += 1) {
            if (subTitlesLoaded === false) {
                attachEventListener(trackList[i], "load", onSubtitleLoaded);
            } else {
                attachCueEvents(trackList[i]);
            }
        }   

        function onSubtitleLoaded(evt) {
            attachCueEvents(this);
            subTitlesLoaded = true;
        }

        function attachCueEvents(subTrack) {
            trackName = subTrack.id;
            trackIndex = parseInt(trackName.substr(trackName.length - 1, trackName.length));
            activeTrack = getActiveTrack();
            textTrack = subTrack.track;
            isSubtitles = textTrack === "subtitles";//Not sure if I need this

            if (trackIndex === activeTrack) {
                subTrack.oncuechange = onChangeCue;
                for (j = 0; j < textTrack.cues.length; j += 1) {
                    cue = textTrack.cues[j];
                    attachEventListener(cue, "enter", onCueEnter);
                    attachEventListener(cue, "exit", onCueExit);
                }
            } else {
                subTrack.oncuechange = null;
                for (l = 0; l < textTrack.cues.length; l += 1) {
                    cue = textTrack.cues[l];
                    detachEventListener(cue, "enter", onCueEnter);
                    detachEventListener(cue, "exit", onCueExit);
                }
            }
        }

        function onCueEnter(evt) {
            handlers.enter(evt.target);
        }

        function onCueExit(evt) {
            handlers.exit(evt.target);
        }

        function onChangeCue(evt) {
            handlers.change(this);
        }

        function getActiveTrack() {
            var aTrack = false;
            for (k = 0; k < trackList.length; k += 1) {
                if (videoElement.textTracks[k].mode === "showing") {
                    aTrack = k;
                }
            }
            return aTrack;
        }
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
        return dimensions;
    }

    ///////////////////////
    ////TAKE SNAP SHOT
    //////////////////////
    sv.takeSnapShot = function (container, type) {
        type = type || "jpeg";
        //Maybe have this check if canvas exists, if not make it, etc.
        var 
            canvas = document.createElement("canvas"),
            videoDimensions = sv.getDimensions(), ctx,
            dataURI, screenShotImg;
        
        canvas.width = videoDimensions.width;
        canvas.height = videoDimensions.height;
        ctx = canvas.getContext("2d");
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        dataURI = canvas.toDataURL("image/" + type);

        if (container !== undefined) {
            screenShotImg = document.createElement("img");
            createSetAttribute(screenShotImg, "src", dataURI);
            container.appendChild(screenShotImg);
        }
        return dataURI;
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

        return isAllowed;
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
        if (rState >= 1) {
            percentage = Math.round(videoElement.buffered.end(0) / videoElement.duration * 100);
        } else { 
            percentage = 0;
        }
        return percentage;
    }

    //////////////////////
    ////CONVERT TO SECONDS
    //////////////////////
    sv.convertToSeconds = function (formattedTime) {
        var 
            fTimeType = getType(formattedTime), 
            convertedSeconds, colonCheck,
            minuteToSec, hourToSec, 
            hour, minute, second, mArray;

        if (fTimeType === "number") {
            convertedSeconds = formattedTime;
        } else {
            colonCheck = matchPattern(formattedTime, ":");
            if (colonCheck.isMatch === false) {
                convertedSeconds = parseInt(formattedTime);
            } else {
                mArray = colonCheck.matchArray;
                if (colonCheck.amount === 1) {
                    //M:S
                    minute = parseInt(mArray[0]);
                    second = parseInt(mArray[1]);

                    minuteToSec = minute * 60;
                    convertedSeconds = minuteToSec + second;
                } else {
                    //H:M:S
                    hour = parseInt(mArray[0]);
                    minute = parseInt(mArray[1]);
                    second = parseInt(mArray[2]);

                    hourToSec = (hour * 60) * 60;
                    minuteToSec = minute * 60;
                    convertedSeconds = hourToSec + minuteToSec + second;
                }
            }
        }   
        return convertedSeconds;
    }

    //////////////////////
    ////FORMAT TIME
    //////////////////////
    sv.formatTime = function (time, id) {
        var 
            formattedTime = {}, 
            hours = Math.floor(time / (60 * 60)), 
            minDivisor = time % (60 * 60)
            minutes = Math.floor(minDivisor / 60),
            seconds = Math.floor(minDivisor % 60),
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
        return playbackState;
    }

    ////////////////////
    ////USE MEDIA SOURCE - have to do further research, will implement at a later date
    ////////////////////
    // sv.useMediaSource = function (file, chunkAmount) {
    //  //WARNING - this feature is experimental 
    //  //and should be used with caution
    //  chunkAmount = chunkAmount || 5;

    //  window.MediaSource = window.MediaSource || window.WebKitMediaSource;

    //  var 
    //      mediaSource = new MediaSource(), sourceBuffer,
    //      initSegment = GetInitializationSegment();

    //  if (window.MediaSource === undefined) {
    //      sv.log("useMediaSource: MediaSource API is not available in this browser.", "warn");
    //  } else {
    //      videoElement.src = window.URL.createObjectURL(mediaSource);
    //      attachEventListener(mediaSource, "sourceopen", onSourceOpen);

    //      if (initSegment == null) {
                // // Error fetching the initialization segment. Signal end of stream with an error.
                // mediaSource.endOfStream("network");
                // return;
          //   }

    //      function onSourceOpen(evt) {
    //          sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vorbis,vp8"');
    //      }
    //  }

    //  sv.log("window.MediaSource: " + window.MediaSource);
    // }

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

        createSetAttribute(sourceElem, "src", source);
        createSetAttribute(sourceElem, "type", "video/" + type);
        videoElement.appendChild(sourceElem);
    }

    ///////////////////////
    ////CREATE TRACK ELEMENT
    //////////////////////
    function createTrackElement(trackNum, source, label, showing, isDefault, sourceLang) {  
        var trackElem = document.createElement("track"), tracks;

        createSetAttribute(trackElem, "id", instanceID + "Track_" + trackNum);
        createSetAttribute(trackElem, "src", source);
        createSetAttribute(trackElem, "kind", "subtitle");
        createSetAttribute(trackElem, "srclang", sourceLang);
        createSetAttribute(trackElem, "label", label);

        if (isDefault === true) {
            createSetAttribute(trackElem, "default", "");
        }

        videoElement.appendChild(trackElem);

        // if (showing === false ) {
        //  //showing/hidden/disabled
        //  videoElement.textTracks[trackNum].mode = "disabled";
        // }
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
    ////SET BROWSER WARNING
    //////////////////////
    function setBrowserWarning(message) {
        message = message || "<p>Your browser does not support the video element. Please <a href=\"http://browsehappy.com/\">upgrade your browser</a> or <a href=\"http://www.google.com/chromeframe/?redirect=true\">activate Google Chrome Frame</a> to improve your experience.</p>"
        videoElement.innerHTML = message;
        var 
            messageNode = getChildren(videoElement, "p")[0],
            anchorNodes = getChildren(messageNode, "a"), i,
            novideoStyle = "padding:10px; background-color:#ff0000; color:#fff; font-weight:bold; test-align:center;";
            
            createSetAttribute(messageNode, "style", novideoStyle);

            for (i = 0; i < anchorNodes.length; i += 1) {
                createSetAttribute(anchorNodes[i], "style", "color:white");
            }
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

    ///////////////////////
    ////CREATE SET ATTRIBUTE
    //////////////////////
    function createSetAttribute(element, attribute, value) {
        element.setAttribute(attribute, value);
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
            } else {
                retrievedParam = obj[param];
            }
        } else {
            retrievedParam = defaultParam;
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
            //sv.log("getHashString: No hash tag was found.", "warn");
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
    ////MATCH PATTERN
    //////////////////
    function matchPattern(request, pattern) {
        var 
            regEx = new RegExp(pattern, "g"),
            matches = request.match(regEx),
            matchArray = request.split(pattern),
            isMatch = false, matchAmount = 0,
            matchObj = {}, i;

        if (matches !== null && pattern !== undefined) {

            isMatch = true;
            matchAmount = matches.length;
        }

        matchObj["isMatch"] = isMatch;
        matchObj["amount"] = matchAmount;
        matchObj["matchArray"] = matchArray;

        return matchObj;
    }

    ////////////////////
    ////CHECK HASH FOR TIME
    ////////////////////
    function checkHashForTime() {  
        var 
            timeValue = getHashValue("t"), 
            loopValue = getHashValue("loop"),
            range, hasComma;
        if (timeValue !== false) {
            //time detected
            //check if range or single time
            hasComma = detectCharacter(timeValue, ",");
            if (hasComma === true) {
                //range
                range = splitString(timeValue, ",");
                if (loopValue === "true") {
                    sv.loopSection(range[0], range[1]);
                } else {
                    sv.playSection(range[0], range[1]);
                }
            
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
    autoplayVideo = getParameter(params, "autoplay", false);
    preload = getParameter(params, "preload", "none");
    
    // sv.log("params: debug: " + debug + 
    //         " path: " + path + 
    //         " width: " + width + 
    //         " height: " + height + 
    //         " useDefaultControls: " + useDefaultControls + 
    //         " videoMuted: " + videoMuted +
    //         " videoClass: " + videoClass +
    //         " poster: " + poster +
    //         " autoplayVideo: " + autoplayVideo +
    //         " preload: " + preload);

    ///////////////////////
    ////INIT VIDEO
    //////////////////////
    function initVideo() {
        createVideoElement(instanceID);

        setBrowserWarning();

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
        //Path
        if (path !== "none") {
            sv.loadFile(path);
        }
        //Controls
        //currently is being set larger than it should be
        if (useDefaultControls === true) {
            createSetAttribute(videoElement, "controls");
        }
        //Autoplay
        if (autoplayVideo === true) {
            createSetAttribute(videoElement, "autoplay");
        }
        //Mute
        if (videoMuted === true) {
            sv.mute();
        } 
        //Preload
        if (preload !== "none") {
            sv.preloadVideo(preload);
        }
    }

    initVideo();

    //console.log("SpektralVideo: " + JSON.stringify(this));
};