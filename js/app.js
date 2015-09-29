$(function() {
    var data = {
        "songs": [
            {
                "fileName": "https://www.ruse-problem.org/songs/RunningWaters.mp3",
                "singer" : "Jason Shaw",
                "songName" : "Running Waters"

            },
            {
                "fileName": "https://www.ruse-problem.org/songs/Enthusiast.mp3",
                "singer" : "Tours",
                "songName": "Enthusiast"
            },
            {
                "fileName": "https://www.ruse-problem.org/songs/SkyRide.mp3",
                "singer" : "Itasca",
                "songName": "Sky Ride"
            },

            {
                "fileName": "https://www.ruse-problem.org/songs/Starling.mp3",
                "singer" : "Podington Bear",
                "songName": "Starling"

            },

            {
                "fileName": "https://www.ruse-problem.org/songs/HachikoTheFaithtfulDog.mp3",
                "singer" : "The Kyoto Connection",
                "songName": "Hachiko The Faithful Dog"
            },

            {

                "fileName": "https://www.ruse-problem.org/songs/FaterLee.mp3",
                "singer" : "Black Ant",
                "songName": "Father Lee"
            },
            {
                "fileName": "https://www.ruse-problem.org/songs/EpicSong.mp3",
                "singer" : "BoxCat Games",
                "songName": "Epic Song"
            }

        ]


    };

    var audioPlayer = {
        audioData: {
            currentSong: -1,
            songs: []
        },
        load: function () {
            //get all data about the songs
            var scope = this;
            scope.data = data.songs;
            $(data.songs).each(function (i, val) {

                $("#playlist").append("<li class='list-group-item'>" + val.singer + " - " + val.songName);

            })

            Audio.prototype.playSong = function () {
                $("#playlist .list-group-item").removeClass("list-group-item-success").find("span").remove();
                $("#playlist .list-group-item").eq(scope.audioData.currentSong)
                    .addClass("list-group-item-success")
                    .removeClass("list-group-item-danger")
                    .append(" <span class='glyphicon glyphicon-headphones'>");
                this.onended = function () {
                    $("#playlist .list-group-item").eq(scope.audioData.currentSong)
                        .removeClass("list-group-item-success glyphicon-headphones").addClass("list-group-item-danger");
                    scope.changeStatusCode("Finished listening to", true);
                }

                scope.changeStatusCode("Playing", true, this);
            }

            Audio.prototype.pauseSong = function (stopPlayback) {
                if (this.paused) {
                    return;
                }
                this.pause();
                if (stopPlayback) {
                    scope.changeStatusCode("Stopped", true);
                    this.currentTime = 0;
                    return;
                }
                scope.changeStatusCode("Paused", true);

            }


        },

        changeStatusCode: function (statusMessage,addSongName, scope) {
            if (addSongName) {
                statusMessage +=  " " +  $("#playlist .list-group-item").eq(this.audioData.currentSong).text();

            }
            this.speak(statusMessage, scope);


            $(".status")
                .fadeOut("slow")
                .html(statusMessage)
                .fadeIn("slow");
        },

        speak: function (text, scope) {
            var message = new SpeechSynthesisUtterance(text.replace("-", " "));
            window.speechSynthesis.speak(message);
            message.rate = 1;
            if (scope) {
                message.onend = function () {
                    scope.play();
                }
            }
        },
        play: function () {
            this.validCommand = true;
            var currentSong = this.audioData.currentSong;
            if (currentSong === -1) {
                this.audioData.currentSong = ++currentSong;
                this.audioData.songs[this.audioData.currentSong] = new Audio(
                    this.data[0].fileName);
                this.audioData.songs[currentSong].playSong();

            } else {
                this.audioData.songs[currentSong].playSong();
            }
        },

        stop: function (stopPlayback) {
            this.validCommand = true;
            this.audioData.songs[this.audioData.currentSong].pauseSong(stopPlayback || false);
            if (stopPlayback) {
                this.audioData.songs[this.audioData.currentSong].currentTime = 0;
            }
        },
        prev: function () {
            this.validCommand = true;
            var currentSong = this.audioData.currentSong;
            if (typeof this.audioData.songs[currentSong - 1] !== 'undefined') {
                this.audioData.songs[currentSong].pauseSong();
                this.audioData.currentSong = --currentSong;
                this.audioData.songs[currentSong].playSong();


            }
            else if (currentSong > 0) {
                this.audioData.songs[currentSong].pauseSong();
                this.audioData.currentSong = currentSong = --currentSong;
                this.audioData.songs[this.audioData.currentSong] = new Audio(
                    this.data[currentSong].fileName);
                this.audioData.songs[currentSong].playSong();
            }
            else {
                //no previous audio
                this.changeStatusCode("There are no previous songs.");
            }
        },

        changeLastCommand: function (cmd) {
            $(".l-command").fadeOut("slow")
                .text(cmd)
                .fadeIn("slow");
        },
        next: function () {
            this.validCommand = true;
            var currentSong = this.audioData.currentSong;
            if (currentSong > -1) {
                this.audioData.songs[currentSong].pauseSong() ;
            }
            if (typeof this.data[currentSong + 1] !== 'undefined') {
                currentSong = ++this.audioData.currentSong;
                this.audioData.songs[this.audioData.currentSong] = new Audio(
                    this.data[currentSong].fileName);
                this.audioData.songs[currentSong].playSong();
            }
            else {
                //no next song
                this.changeStatusCode("You have reached the final song.");
            }
        },

        processCommands: function (cmd) {
            this.validCommand = false;
            this.changeLastCommand(cmd);
            if (cmd.indexOf("play") !== -1) {
                if (cmd === "play") {
                    this.play();
                }

                var playSpecific = cmd.match(/play\s*(.+)$/);
                if (playSpecific) {
                    var keyword = playSpecific[1];

                    for (var i = 0; i < this.data.length; i++) {

                        if (this.data[i].songName.trim().toLowerCase().indexOf(keyword) !== -1 ||
                            this.data[i].singer.trim().toLowerCase().indexOf(keyword) !== -1) {


                            if (typeof this.audioData.songs[i] !== 'undefined') {
                                //if the song is already cached
                                if (this.audioData.currentSong > -1) {
                                    this.audioData.songs[this.audioData.currentSong].pauseSong();
                                }

                                this.audioData.currentSong = i;
                                this.validCommand = true;
                                this.audioData.songs[i].playSong();
                                break;
                            } else {
                                this.validCommand = true;
                                //add the song and play it
                                if (this.audioData.currentSong > -1) {
                                    this.audioData.songs[this.audioData.currentSong].pauseSong();
                                }
                                this.audioData.currentSong = i;
                                this.audioData.songs[i] = new Audio(
                                    this.data[i].fileName);
                                this.audioData.songs[i].playSong();
                                break;
                            }


                        }
                    }

                }
            }

            if (cmd === "pause") {
                this.stop();
            }

            if (cmd === "stop") {
                this.stop(true);
            }

            if (cmd === "next") {
                this.next();
            }
            if (cmd === "previous") {
                this.prev();
            }

            if (!this.validCommand) {
                this.speak("Your command was invalid", false);
            }
        },
        toggleSpinner: function (show) {
            (show || false) ? $("#spinner").fadeIn(900) : $("#spinner").fadeOut(1200);
        }
    }
    audioPlayer.load();
    if (window['webkitSpeechRecognition']) {

        var speechRecognizer = new webkitSpeechRecognition();
        //recognition will not end when user stops speaking if set to true
        speechRecognizer.continuous = true;
        //process the request while the user is speaking
        // and his commands are final. Set to false by default
        speechRecognizer.interimResults = true;
        var lastCommandProcessed = true,
            allResults = [],
            hasValidResult = false,
            currentCommands = ['play', 'stop', 'pause', 'next', 'previous'];
        speechRecognizer.onresult = function(evt) {
            audioPlayer.toggleSpinner(true);
            hasValidResult = false;

            allResults.push(evt.results);
            if (lastCommandProcessed) {
                lastCommandProcessed = false;

                var checkForCommand = setTimeout(function() {
                    for (var ri = allResults.length -1,rl = -1;ri > rl;ri--) {
                        var el = allResults[ri][0][0];

                        el = el.transcript.toLowerCase().trim();
                        speechRecognizer.abort();
                        audioPlayer.toggleSpinner();
                        lastCommandProcessed = true;
                        if (currentCommands.indexOf(el.split(" ")[0]) !== -1) {

                            hasValidResult = true;
                            audioPlayer.processCommands(el);
                            allResults = [];
                            break;
                        }


                    }
                    if (!hasValidResult) {
                        audioPlayer.processCommands(allResults[allResults.length - 1][0][0].transcript.toLowerCase().trim());
                    }

                    allResults = [];
                },3000)

            }


            //
        }

        speechRecognizer.onend = function() {

          speechRecognizer.start();

        }
        speechRecognizer.lang = "en-US";
        speechRecognizer.start();



    }
    else {
      //notify that web speech is not supported

  }

})