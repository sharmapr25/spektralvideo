(function(){

    var
        vidContainer = document.getElementById("videoContainer"),
        vidPath = "video/bigbuckbunny/BigBuckBunny_320x180.mp4",
        theVideo = new SpektralVideo(vidContainer, "theVideo", {"debug" : true});

    theVideo.loadFile(vidPath);
    theVideo.play();

}(window));
