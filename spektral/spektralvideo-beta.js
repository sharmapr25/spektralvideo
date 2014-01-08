//////////////////////
////SPEKTRAL VIDEO
//////////////////////
function SpektralVideo(parent, path, params) {

    //Private Var
    //var objectID = id;

    //Public Var
    //this.id = id;

    //Private Method
    //function privateMethod() {
    //    console.log(this.id + "'s private method called via publicMethod");
    //}

    //Public Method
    //this.publicMethod = function () {
    //    console.log("You Called: " + this.id + " through a public method.");
    //    privateMethod();
    //}

    //console.log("MyObject: id: " + objectID + " info: " + JSON.stringify(this));

    //Optional parameters upon intialization

    //Private Vars
    var 
        SpektralVideo = this,
        parent, path, width, height, autoplay, useDefaultControls;

    //Parent
    //If no parent is defined, use body
    parent = params.parent || document.body;

    //Path
    //If no path is defined, then wait for loadVideo()
    //Path can be a string or and object
    //If an object it will look something like this:
    //{"mp4" : "video.mp4", "ogg" : "video.ogg", "webm" : "video.webm"}
    path = params.path || "none";

    //width - default: 640
    width = params.width || 640;

    //height - default: 320
    height = params.height || 320;

    autoplay = params.autoplay || false;

    useDefaultControls = params.useDefaultControls || false;

    initVideo();

    ///////////////////////
    ////INIT VIDEO
    //////////////////////
    function initVideo() {

        //Will create the video upon the creation of a new video
    }

    ///////////////////////
    ////LOAD FILE
    //////////////////////
    SpektralVideo.loadFile = function (path, autoplay, preload) {

        autoplay = autoplay || false;
        preload = 25;

        //Loads video and determines if it needs to autoplay 
        //or preload a percentage of the video 
        //Path can be either a string or an object
        //If an object it will look something like this:
        //{"mp4" : "video.mp4", "ogg" : "video.ogg", "webm" : "video.webm"}
    }

    ///////////////////////
    ////PLAY
    //////////////////////
    SpektralVideo.play = function (time) {

        time = time || 0;

        //Plays the video, will use the seek() method 
        //if start time isn't 0
        //time can be in seconds || minutes:seconds || hours:minutes:seconds
    }

    ///////////////////////
    ////PAUSE
    //////////////////////
    SpektralVideo.pause = function () {
        //Pauses the video,
        //If video is already paused - does nothing
    }

    ///////////////////////
    ////TOGGLE PAUSE
    //////////////////////
    SpektralVideo.togglePause = function () {
        //Pauses and unpauses the video
        //depending on its current state
    }

    ///////////////////////
    ////STOP
    //////////////////////
    SpektralVideo.stop = function () {
        //Stops video playback
    }

    ///////////////////////
    ////SEEK
    //////////////////////
    SpektralVideo.seek = function (time, scrub) {

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
    SpektralVideo.rewind = function (speed) {

        speed = speed || 1;

        //Rewinds the video
        //speed indicates how many 
        //times faster to rewind
        //Not sure if possible
    }

    ///////////////////////
    ////FAST FORWARD
    //////////////////////
    SpektralVideo.fastForward = function (speed) {

        speed = speed || 1;

        //Fast forwards the video
        //speed indicates how many 
        //times faster to fast forward
        //Not sure if possible
    } 

    ///////////////////////
    ////PLAYBACK SPEED
    //////////////////////
    SpektralVideo.playbackSpeed = function (speed) {

        speed = speed || 1;

        //The speed you want to playback at
        //Not sure if possible
    }

    ///////////////////////
    ////SET VOLUME
    //////////////////////
    SpektralVideo.setVolume = function (level) {

        level = level || 1;

        //Sets the volume of the video
        //if called without level set
        //resets volume
    }

    ///////////////////////
    ////MUTE
    //////////////////////
    SpektralVideo.mute = function () {
        //Mutes the volume and 
        //remembers the current volume
    }

    ///////////////////////
    ////UNMUTE
    //////////////////////
    SpektralVideo.unmute = function () {
        //Unmutes the volume
        //returns volume back to 
        //original level
    }

    ///////////////////////
    ////TOGGLE MUTE
    //////////////////////
    SpektralVideo.toggleMute = function () {
        //Toggles the mute on and off
    }

    ///////////////////////
    ////SET SIZE
    //////////////////////
    SpektralVideo.setSize =  function (sizeParams) {

        //sizeParams can either be an object or string
        //If an object it should look like this: 
        //{"width" : "640", "height" : "320"}

        //sizeParams can be a string with a video standard
        //Ex. "1080" = 1920x1080, "svga" = 800x600

        //320 - 640 x 320
        //480 - 854 x 480
        //720 - 1280 x 720
        //1080 - 1920 x 1080
    }

    ///////////////////////
    ////SET WIDTH
    //////////////////////
    SpektralVideo.setWidth = function () {
        //Sets the width of the video
    }

    ///////////////////////
    ////SET HEIGHT
    //////////////////////
    SpektralVideo.setHeight = function () {
        //Sets the height of the video
    }
};