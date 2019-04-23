(function () {
    "use strict";

    class CeicomMediaPlayer {
        constructor(musics) {
            this._musics = musics;
            this._fakePlayer = $('.cmp-player');
            this._$playBtn = this._fakePlayer.find('.play-btn');
            this._$progressBar = this._fakePlayer.find('.progress-bar');
            this._$time = this._fakePlayer.find('.time');
            this._$volumeWrapper = this._fakePlayer.find('.volume-wrapper');
            this._$volumeInput = this._fakePlayer.find('.volume-input');
            this._currentMusic = 0;
            this._currentVolume = 1;

            this.init();
        }

        _createPlayer() {
            const audio = document.createElement('audio');

            audio.src = this._musics[this._currentMusic].mp3;
            audio.preload = 'none';
            audio.volume = this._currentVolume;

            this._player = audio;
        }

        _musicEnded(error = false) {
            this._fakePlayer.removeClass('playing');
            this._resetProgressBar();
            this._currentMusic++;

            if (this._currentMusic >= this._musics.length) {
                this._currentMusic = 0;
            }

            $(document).trigger('cmp-media-end', [this._currentMusic, error]);

            this._makePlayer();
        }

        _initPlayerListeners() {

            $(this._player).on('timeupdate', () => {
                this._updateTime(this._player.currentTime, this._player.duration);
                this._updateProgressBar(this._player.currentTime, this._player.duration);
            });

            $(this._player).on('play pause', () =>
                this._isPlaying() ?
                    this._fakePlayer.addClass('playing') :
                    this._fakePlayer.removeClass('playing'));

            $(this._player).on('ended', () => this._musicEnded());

            $(this._player).on('loadstart', () => {
                const playPromise = this._player.play();
                if (playPromise !== null) playPromise.catch(() => this._makePlayer());
            });

            $(this._player).on('error', () => {
                if (!navigator.onLine) return;
                this._musicEnded(true);
            });
        }

        _makePlayer() {
            if (!this._musics.length) {
                $(this._fakePlayer).html('<span class="error-msg">Nenhuma música detectada na lista atual.</span>');
                return;
            }

            $(this._player).off('timeupdate');
            $(this._player).off('play pause');
            $(this._player).off('ended');
            $(this._player).off('canplaythrough');

            this._createPlayer();

            this._initPlayerListeners();
        }

        _initFakePlayerActions() {
            this._$playBtn.on('click', () => this._isPlaying() ? this._player.pause() : this._player.play());

            this._$volumeWrapper.on('click', e => {
                if (!$(e.target).hasClass('volume-wrapper')) return;
                this._$volumeWrapper.toggleClass('active');
            });

            this._$volumeInput.on('input', () => this.setVolume(this._$volumeInput.val() / 10));
        }

        _isPlaying() {
            return !this._player.paused;
        }

        _resetProgressBar() {
            this._$progressBar.css('transform', `scaleX(0)`);
        }

        _updateProgressBar(currentTime, musicDuration) {
            this._$progressBar.css('transform', `scaleX(${Math.floor(currentTime) / Math.floor(musicDuration)})`);
        }

        _updateTime(currentTime, musicDuration) {

            const extraZero = n => n < 10 ? '0' + n : n;

            const formatedTime = time => {
                const s = parseInt(time % 60);
                const m = parseInt((time / 60) % 60);

                return extraZero(m) + ':' + extraZero(s);
            }

            this._$time.text(formatedTime(currentTime) + ' / ' + formatedTime(musicDuration));
        }

        init() {

            $(window).on('offline', () => this._fakePlayer.addClass('offline'));

            $(window).on('online', () => {
                this._fakePlayer.removeClass('offline');

                const playPromise = this._player.play();
                if (playPromise !== null) playPromise.catch(() => this._makePlayer());
            });

            this._initFakePlayerActions();
            this._makePlayer();
        }

        getVolume() {
            return this._currentVolume;
        }

        setVolume(value) {
            this._currentVolume = value;
            this._player.volume = this._currentVolume;
            this._$volumeInput.val(value * 10);
        }
    }

    class CeicomVideoPlayer {
        constructor(videos, options = {}) {
            this._player = {};
            this._videos = videos;
            this.options = options;
            this._actualVideo = 0;
            this._isPlaying = false;
            this._fakePlayer = $('.cmp-player');
            this._$playBtn = this._fakePlayer.find('.play-btn');
            this._$progressBar = this._fakePlayer.find('.progress-bar');
            this._$time = this._fakePlayer.find('.time');
            this._$volumeWrapper = this._fakePlayer.find('.volume-wrapper');
            this._$volumeInput = this._fakePlayer.find('.volume-input');
            this._$expandBtn = this._fakePlayer.find('.expand-button');

            this.init();
        }

        init() {
            if (!this._videos.length) {
                $(this._fakePlayer).html('<span class="error-msg">Nenhuma música detectada na lista atual.</span>');
                return;
            }

            const tag = document.createElement('script');
            const firstScriptTag = document.getElementsByTagName('script')[0];

            tag.src = 'https://www.youtube.com/iframe_api';
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                // https://developers.google.com/youtube/player_parameters#Parameters
                const options = {
                    width: $('body').width(),
                    height: 600,
                    playerVars: {
                        autoplay: 0,
                        cc_load_policy: 0,
                        controls: 0,
                        disablekb: 1,
                        enablejsapi: 1,
                        iv_load_policy: 3,
                        modestbranding: 1,
                        rel: 0,
                        showinfo: 0
                    },
                    events: {
                        onReady: onPlayerReady,
                        onStateChange: onPlayerStateChange,
                        onError: onPlayerError
                    },
                    ...this.options
                };

                this._player = new YT.Player('cvp-player', options);
                this._initFakePlayerActions();
            }

            const onPlayerReady = () => {
                const videoIds = this._videos.map(item => this._validaYoutube(item.link));
                this._player.loadPlaylist(videoIds);
                this._player.setLoop(true);
                this._isPlaying = true;

                setInterval(() => {
                    this._updateTime(this._player.getCurrentTime(), this._player.getDuration());
                    this._updateProgressBar(this._player.getCurrentTime(), this._player.getDuration());
                }, 1000);
            }

            const onPlayerStateChange = event => {

                // Play/Pause Video
                this._isPlaying = true;
                this._fakePlayer.addClass('playing');
                if (event.data === 2) {
                    this._isPlaying = false;
                    this._fakePlayer.removeClass('playing');
                }

                // Verifica se foi alterado o video
                if (this._player.getPlaylistIndex() !== this._actualVideo) {
                    this._actualVideo = this._player.getPlaylistIndex();
                    this._videoChange();
                }
            }

            const onPlayerError = () => {
                this._videoChange(true);
                this._player.nextVideo();
            }
        }

        _initFakePlayerActions() {
            this._$playBtn.on('click', () => this._isPlaying ? this._player.pauseVideo() : this._player.playVideo());

            this._$volumeWrapper.on('click', e => {
                if (!$(e.target).hasClass('volume-wrapper')) return;
                this._$volumeWrapper.toggleClass('active');
            });

            this._$volumeInput.on('input', () => this.setVolume(this._$volumeInput.val() / 10));

            this._$expandBtn.on('click', () => {
                const ele = this._fakePlayer.parent()[0];
                if (document.fullscreen || document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
                    if (document.exitFullscreen)
                        document.exitFullscreen();
                    else if (document.msExitFullscreen)
                        document.msExitFullscreen();
                    else if (document.mozCancelFullScreen)
                        document.mozCancelFullScreen();
                    else if (ele.webkitExitFullscreen)
                        document.webkitExitFullscreen();
                    return;
                }

                if (ele.requestFullscreen)
                    ele.requestFullscreen();
                else if (ele.msRequestFullscreen)
                    ele.msRequestFullscreen();
                else if (ele.mozRequestFullScreen)
                    ele.mozRequestFullScreen();
                else if (ele.webkitRequestFullscreen)
                    ele.webkitRequestFullscreen();
            });
        }

        getVolume() {
            return this._player.getVolume();
        }

        setVolume(value) {
            this._player.setVolume(value * 100);
        }

        _validaYoutube(link) {
            const regex = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/g;
            const match = regex.exec(link);

            return match && match[1].length === 11 ? match[1] : false;
        };

        _videoChange(error) {
            $(document).trigger('cmp-media-end', [this._player.getPlaylistIndex(), error]);
        }

        _updateProgressBar(currentTime, musicDuration) {
            this._$progressBar.css('transform', `scaleX(${Math.ceil(currentTime) / Math.ceil(musicDuration)})`);
        }

        _updateTime(currentTime, musicDuration) {
            const extraZero = n => n < 10 ? '0' + n : n;

            const formatedTime = time => {
                const s = parseInt(Math.ceil(time) % 60);
                const m = parseInt((Math.ceil(time) / 60) % 60);

                return extraZero(m) + ':' + extraZero(s);
            }

            this._$time.text(formatedTime(currentTime) + ' / ' + formatedTime(musicDuration));
        }
    }

    class CeicomMediaList {
        constructor(mediaList, isVideo = false) {
            this._mediaList = mediaList;
            this.isVideo = isVideo;
            this._wrapper = $('.cml-music-list');

            this.init();
        }

        init() {
            if (!this._mediaList.length) return;

            const html = this._mediaList.map((item, index) => {
                if (item.typemedia === 'comercial' || item.typemedia === 'vinheta') return;
                return `<li class="music-item ${index === 0 ? 'active' : ''}" 
                            data-music="${index}">${this.isVideo ? item.title : item.track}</li>`;
            }).join('');

            $(document).on('cmp-media-end', (e, index, error) => {
                if (error) this._wrapper.find('.music-item.active').addClass('error');

                this._wrapper.find('.music-item').removeClass('active');
                this._wrapper.find(`.music-item[data-music=${index}]`).addClass('active');

                this._scrollToMusic();
            });

            this._wrapper.html(html);
        }

        _scrollToMusic() {
            const activeMusic = this._wrapper.find('.music-item.active');

            if (!activeMusic.length) return;

            const first = activeMusic.offset().top;
            const second = this._wrapper.offset().top;
            const distance = Number(first) - Number(second);

            this._wrapper.animate({ scrollTop: distance }, 'slow');
        }
    }

    /**********************************/

    // commonjs
    if (typeof exports !== "undefined") {
        exports.CeicomMediaPlayer = CeicomMediaPlayer;
        exports.CeicomVideoPlayer = CeicomVideoPlayer;
        exports.CeicomMediaList = CeicomMediaList;
    } else {
        window.CeicomMediaPlayer = CeicomMediaPlayer;
        window.CeicomVideoPlayer = CeicomVideoPlayer;
        window.CeicomMediaList = CeicomMediaList;
    }

}(typeof global !== "undefined" ? global : this));