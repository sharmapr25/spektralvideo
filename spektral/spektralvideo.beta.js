//////////////////////
////SPEKTRAL VIDEO
//////////////////////
function SpektralVideo(container, instanceID, params) {

    //Private Vars
    var 
        sv = this,
        container, path, width, height, autoplay, useDefaultControls,
        debug = false, strictError = false, videoElement;

    ///////////////////////
    ////LOAD FILE
    //////////////////////
    sv.loadFile = function (newPath, autoplay, preload) {

        autoplay = autoplay || false;
        preload = 25;

        sv.log("loadFile: path: " + path);

        //Loads video and determines if it needs to autoplay 
        //or preload a percentage of the video 
        //Path can be either a string or an object
        //If an object it will look something like this:
        //{"mp4" : "video.mp4", "ogg" : "video.ogg", "webm" : "video.webm"}
    }

    ///////////////////////
    ////PLAY
    //////////////////////
    sv.play = function (time) {

        time = time || 0;

        //Plays the video, will use the seek() method 
        //if start time isn't 0
        //time can be in seconds || minutes:seconds || hours:minutes:seconds
    }

    ///////////////////////
    ////PAUSE
    //////////////////////
    sv.pause = function () {
        //Pauses the video,
        //If video is already paused - does nothing
        //pause();
    }

    ///////////////////////
    ////TOGGLE PAUSE
    //////////////////////
    sv.togglePause = function () {
        //Pauses and unpauses the video
        //depending on its current state
    }

    ///////////////////////
    ////STOP
    //////////////////////
    sv.stop = function () {
        //Stops video playback
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
    }

    ///////////////////////
    ////REWIND
    //////////////////////
    sv.rewind = function (speed) {

        speed = speed || 1;

        //Rewinds the video
        //speed indicates how many 
        //times faster to rewind
        //Not sure if possible
    }

    ///////////////////////
    ////FAST FORWARD
    //////////////////////
    sv.fastForward = function (speed) {

        speed = speed || 1;

        //Fast forwards the video
        //speed indicates how many 
        //times faster to fast forward
        //Not sure if possible
    } 

    ///////////////////////
    ////PLAYBACK SPEED
    //////////////////////
    sv.playbackSpeed = function (speed) {

        speed = speed || 1;

        //The speed you want to playback at
        //Not sure if possible
    }

    ///////////////////////
    ////SET VOLUME
    //////////////////////
    sv.setVolume = function (level) {

        level = level || 1;

        //Sets the volume of the video
        //if called without level set
        //resets volume
    }

    ///////////////////////
    ////MUTE
    //////////////////////
    sv.mute = function () {
        //Mutes the volume and 
        //remembers the current volume
    }

    ///////////////////////
    ////UNMUTE
    //////////////////////
    sv.unmute = function () {
        //Unmutes the volume
        //returns volume back to 
        //original level
    }

    ///////////////////////
    ////TOGGLE MUTE
    //////////////////////
    sv.toggleMute = function () {
        //Toggles the mute on and off
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
    }

    //////////////////////
    ////GET TOTAL TIME
    //////////////////////
    sv.getTotalTime = function () {
        //Returns time in seconds
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

    if(params === undefined) {
        //No param set, set defaults
        path = "none";
        width = 640;
        height = 320;
        autoplay = false;
        useDefaultControls = false;
    } else {
        debug = params.debug || false;
        path = params.path || "none";
        width = params.width || 640;//Going to see if I can get the videos native width, instead of 640
        height = params.height || 320;
        autoplay = params.autoplay || false;
        useDefaultControls = params.useDefaultControls || false;
    }

    sv.log("setParams: debug: " + debug + 
            " path: " + path + 
            " width: " + width + 
            " height: " + height + 
            " autoplay: " + autoplay + 
            " useDefaultControls: " + useDefaultControls);

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

    //autoplay = params.autoplay || false;

    //useDefaultControls = params.useDefaultControls || false;

    ///////////////////////
    ////CREATE VIDEO ELEMENT
    //////////////////////
    function createVideoElement(elID) {
        videoElement = document.createElement("video");
        createSetAttribute(videoElement, "width", width);
        createSetAttribute(videoElement, "height", height);
        

        //Add video element to container
        container.appendChild(videoElement);
        //sv.log("createVideoElement!! container: " + container + " videoElement: " + videoElement);
    }

    function createSetAttribute(element, attribute, value) {
        element.setAttribute(attribute, value);
    }

    //UTILS

    ///////////////////////
    ////GET INFO
    //////////////////////
    function getInfo(obj) {
        return JSON.stringify(obj);
    }


    //INITIALIZE THE VIDEO
    initVideo();

    ///////////////////////
    ////INIT VIDEO
    //////////////////////
    function initVideo() {
        //Will create the video upon the creation of a new video
        sv.log("INIT VIDEO");
        createVideoElement(instanceID);
    }

    //console.log("SpektralVideo: " + JSON.stringify(this));
};