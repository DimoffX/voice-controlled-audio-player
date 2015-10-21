
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
            this.data = data.songs;
            data.songs.forEach(function (val,i) {

                $("#playlist").append("<li class='list-group-item'>" + val.singer + " - " + val.songName);

            })
        },

        changeCurrentSongEffect: function(options) {
            if (options.play) {
                $("#playlist .list-group-item").removeClass("list-group-item-success").find("span").remove();
                $("#playlist .list-group-item").eq(this.audioData.currentSong)
                    .addClass("list-group-item-success")
                    .removeClass("list-group-item-danger")
                    .append(" <span class='glyphicon glyphicon-headphones'>");
            }
            if (options.end) {
                $("#playlist .list-group-item").eq(this.audioData.currentSong)
                    .removeClass("list-group-item-success glyphicon-headphones").addClass("list-group-item-danger");
            }

        },
        playSong: function (audio) {
        this.changeCurrentSongEffect({play:1});
        audio.onended = function () {
            audioPlayer.changeCurrentSongEffect({end: 1});
            audioPlayer.changeStatusCode("Finished listening to", true);
        }
        this.changeStatusCode("Playing", true, audio);
        },
        pauseSong:  function (audio,stopPlayback) {
            if (audio.paused) {
                return;
            }
            audio.pause();
            if (stopPlayback) {
                this.changeStatusCode("Stopped", true);
                audio.currentTime = 0;
                return;
            }
            this.changeStatusCode("Paused", true);

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
            message.rate = 1;
            window.speechSynthesis.speak(message);
            if (scope) {
                message.onend = function () {
                    scope.play();
                }
            }
        },
        play: function () {
            var currentSong = this.audioData.currentSong;
            if (currentSong === -1) {
                this.audioData.currentSong = ++currentSong;
                this.audioData.songs[this.audioData.currentSong] = new Audio(
                    this.data[0].fileName);
                this.playSong(this.audioData.songs[currentSong]);

            } else {
                this.playSong(this.audioData.songs[currentSong]);
            }
        },

        stop: function (stopPlayback) {
            this.pauseSong(this.audioData.songs[this.audioData.currentSong],stopPlayback || false);
            if (stopPlayback) {
                this.audioData.songs[this.audioData.currentSong].currentTime = 0;
            }
        },
        prev: function () {
            var currentSong = this.audioData.currentSong;
            if (typeof this.audioData.songs[currentSong - 1] !== 'undefined') {
                this.pauseSong(this.audioData.songs[currentSong]);
                this.audioData.currentSong = --currentSong;
                this.playSong(this.audioData.songs[currentSong]);


            }
            else if (currentSong > 0) {
                this.pauseSong(this.audioData.songs[currentSong]);
                this.audioData.currentSong = currentSong = --currentSong;
                this.audioData.songs[this.audioData.currentSong] = new Audio(
                    this.data[currentSong].fileName);
                this.playSong(this.audioData.songs[currentSong]);
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
            var currentSong = this.audioData.currentSong;
            if (currentSong > -1) {
                this.pauseSong(this.audioData.songs[currentSong]);
            }
            if (typeof this.data[currentSong + 1] !== 'undefined') {
                currentSong = ++this.audioData.currentSong;
                this.audioData.songs[this.audioData.currentSong] = new Audio(
                    this.data[currentSong].fileName);
                this.playSong(this.audioData.songs[currentSong]);
            }
            else {
                //no next song
                this.changeStatusCode("You have reached the final song.");
            }
        },
        searchSpecificSong: function(keyword) {
            try {
                this.data.forEach(function(val,i) {
                    if (val.songName.trim().toLowerCase().indexOf(keyword) !== -1 ||
                        val.singer.trim().toLowerCase().indexOf(keyword) !== -1) {
                        if (typeof this.audioData.songs[i] !== 'undefined') {
                            //if the song is already cached
                            if (this.audioData.currentSong > -1) {
                                this.pauseSong(this.audioData.songs[this.audioData.currentSong]);
                            }
                            this.audioData.currentSong = i;
                            audioPlayer.playSong(audioPlayer.audioData.songs[i]);
                            throw LoopBreakException;
                        } else {
                            //add the song and play it
                            if (this.audioData.currentSong > -1) {
                                this.pauseSong(this.audioData.songs[this.audioData.currentSong]);
                            }
                            this.audioData.currentSong = i;
                            this.audioData.songs[i] = new Audio(
                                this.data[i].fileName);
                            this.playSong(this.audioData.songs[i]);
                            throw LoopBreakException;
                        }

                    }
                }, audioPlayer);
            }
                catch (e){
                      return e;
                }
        },

        processCommands: function (cmd) {
            this.changeLastCommand(cmd);
            var playSpecific = cmd.match(/play\s*(.+)$/);
            if (playSpecific) {
                this.searchSpecificSong(playSpecific[1]);

                return;
            }
                switch (cmd) {
                    case "play" :
                        this.play();
                        break;
                    case 'pause' :
                        this.stop();
                        break;
                    case "stop" :
                        this.stop(true);
                        break;
                    case "next" :
                        this.next();
                        break;
                    case "previous" :
                        this.prev();
                        break;
                    default :
                        this.speak("Your command was invalid!", false);


                }
        },
        toggleSpinner: function (show) {
            (show || false) ? $("#spinner").fadeIn(900) : $("#spinner").fadeOut(1200);
        }
    }
    $(function() {
        audioPlayer.load();
        if (window['webkitSpeechRecognition']) {
            var speechRecognizer = new webkitSpeechRecognition();
            //recognition will not end when user stops speaking if set to true
            speechRecognizer.continuous = true;
            //process the request while the user is speaking
            // and his commands are final. Set to false by default
            speechRecognizer.interimResults = true;
            var currentCommands = ['play', 'stop', 'pause', 'next', 'previous'],
                results = [],
                timeoutSet = false;

            speechRecognizer.onresult = function (evt) {
                audioPlayer.toggleSpinner(true);
                 results.push(evt.results);
                    if (!timeoutSet) {
                        setTimeout(function() {
                            timeoutSet = false;
                            results.reverse();
                            try {
                                results.forEach(function (val, i) {
                                    var el = val[0][0].transcript.toLowerCase();
                                    if (currentCommands.indexOf(el.split(" ")[0]) !== -1) {
                                        speechRecognizer.abort();
                                        audioPlayer.processCommands(el);
                                        audioPlayer.toggleSpinner();
                                        results = [];
                                        throw new BreakLoopException;

                                    }

                                    if (i === 0) {
                                        audioPlayer.processCommands(el);
                                        speechRecognizer.abort();
                                        audioPlayer.toggleSpinner();
                                        results = [];
                                    }

                                });
                            }
                            catch(e) {return e;}


                        }, 3000)
                    }

                        timeoutSet = true;

                }

            speechRecognizer.onend = function () {

                speechRecognizer.start();

            }
            speechRecognizer.lang = "en-US";
            speechRecognizer.start();
        }
        else {
            //notify that web speech is not supported
            alert("Your browser does not support the Web Speech API");
        }
    });