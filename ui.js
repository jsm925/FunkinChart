import { formatTime } from "./util.js";
class UI {
    constructor(predefinedSongs) {
        /* Loader UI initialization */

        const container = document.getElementById("main-ui");
        this.loader = document.getElementById("loader-ui");

        this.selector = document.getElementById("fnf-select");
        this.selectButton = document.getElementById("fnf-ok");
        this.backButton = document.getElementById("change-chart");

        this.upload = {
            chart: null,
            voices: null,
            instrumental: null,
        };

        this.songs = predefinedSongs;

        this.songs.forEach((song) => {
            const { name } = song;

            const option = document.createElement("option");
            option.setAttribute("name", name);
            option.innerText = name;

            this.selector.appendChild(option);
        });

        this.selectButton.addEventListener("click", (e) => {
            this._onLoadSong(e);
        });

        this.backButton.addEventListener("click", (e) => {
            this._onBack(e);
        });

        this.overlay = document.getElementById("loading-overlay");
        this.overlayMessage = document.getElementById("overlay-message");

        /* Loader UI cont.: Upload file controls init */
        this.uploadConfirm = document.getElementById("upload-confirm");
        const chartFileInput = document.getElementById("chart-upload");
        const instFileInput = document.getElementById("inst-upload");
        const voiceFileInput = document.getElementById("voice-upload");

        chartFileInput.addEventListener("change", (e) => {
            this._onChartUpload(e);
        });

        voiceFileInput.addEventListener("change", (e) => {
            this._onVoicesUpload(e);
        });

        instFileInput.addEventListener("change", (e) => {
            this._onInstrumentalUpload(e);
        });

        this.uploaders = {
            chart: chartFileInput,
            instrumental: instFileInput,
            voices: voiceFileInput,
        };

        const chartErrorLabel = document.getElementById("chart-upload-error");
        const voiceErrorLabel = document.getElementById("voice-upload-error");
        const instErrorLabel = document.getElementById("inst-upload-error");

        this.errorLabels = {
            chart: chartErrorLabel,
            voices: voiceErrorLabel,
            instrumental: instErrorLabel,
        };

        const voiceTester = document.getElementById("voice-tester");
        const instrumentalTester = document.getElementById("inst-tester");

        this.audioTesters = {
            voices: voiceTester,
            instrumental: instrumentalTester,
        };

        voiceTester.addEventListener("canplay", (e) => {
            this._onVoicesValidation(true, e);
        });
        voiceTester.addEventListener("error", (e) => {
            this._onVoicesValidation(false, e);
        });

        instrumentalTester.addEventListener("canplay", (e) => {
            this._onInstrumentalValidation(true, e);
        });
        instrumentalTester.addEventListener("error", (e) => {
            this._onInstrumentalValidation(false, e);
        });

        this.uploadConfirm.addEventListener("click", (e) => {
            this.dispatch("upload", this.upload);
        });

        /* Chart UI initialization */

        const mainSlider = document.getElementById("main-slider");
        const instSlider = document.getElementById("instrumental-slider");
        const voiceSlider = document.getElementById("voices-slider");

        this.playing = false;

        this.sliders = {
            main: mainSlider,
            instrumental: instSlider,
            voices: voiceSlider,
        };

        this.sliders.main.addEventListener("input", (e) => {
            this._onVolumeChange(e);
        });

        this.sliders.instrumental.addEventListener("input", (e) => {
            this._onInstVolumeChange(e);
        });

        this.sliders.voices.addEventListener("input", (e) => {
            this._onVoiceVolumeChange(e);
        });

        const play = document.getElementById("play-button");
        const prev = document.getElementById("prev-button");
        const next = document.getElementById("next-button");
        const stop = document.getElementById("stop-button");

        this.buttons = {
            play,
            prev,
            next,
            stop,
        };

        this.buttons.play.addEventListener("click", (e) => {
            this._onPlay(e);
        });
        this.buttons.prev.addEventListener("click", (e) => {
            this._onPrev(e);
        });
        this.buttons.next.addEventListener("click", (e) => {
            this._onNext(e);
        });
        this.buttons.stop.addEventListener("click", (e) => {
            this._onStop(e);
        });

        const mainInput = document.getElementById("main-input");
        const instrumentalInput = document.getElementById("instrumental-input");
        const voicesInput = document.getElementById("voices-input");

        this.inputs = {
            main: mainInput,
            instrumental: instrumentalInput,
            voices: voicesInput,
        };

        this.inputs.main.addEventListener("input", (e) => {
            this._onVolumeChange(e);
        });

        this.inputs.instrumental.addEventListener("input", (e) => {
            this._onInstVolumeChange(e);
        });

        this.inputs.voices.addEventListener("input", (e) => {
            this._onVoiceVolumeChange(e);
        });

        const time = document.getElementById("time-text");
        const bpm = document.getElementById("bpm-text");
        const section = document.getElementById("section-text");

        this._disableUI(true);

        this.text = {
            time,
            bpm,
            section,
        };

        this.events = {};
        this.chart = null;
    }

    _onLoadSong(e) {
        const name = this.selector.value;
        const song = this.songs.find((i) => i.name == name);
        this.dispatch("loadsong", song);
    }

    _disableUI(disabled) {
        const disable = !!disabled;
        let uiControls = [this.inputs, this.buttons, this.sliders];

        uiControls.forEach((controls) => {
            for (let c in controls) {
                controls[c].disabled = disable;
            }
        });
    }

    _onPlay() {
        const icon = this.buttons.play.children[0];

        if (!this.playing) {
            icon.className = "bi bi-pause-fill";
            this.playing = true;
            this.dispatch("play");
        } else {
            icon.className = "bi bi-play-fill";
            this.playing = false;
            this.dispatch("pause");
        }
    }

    _onNext() {
        this.dispatch("next");
    }

    _onPrev() {
        this.dispatch("previous");
    }

    _onStop() {
        const icon = this.buttons.play.children[0];
        icon.className = "bi bi-play-fill";
        this.playing = false;
        this.dispatch("stop");
    }

    _onVolumeChange(e) {
        const { value } = e.target;

        const slider = this.sliders.main;
        const input = this.inputs.main;

        slider.value = value;
        input.value = value;

        this.dispatch("volumechange", { value });
    }

    _onInstVolumeChange(e) {
        const { value } = e.target;

        const slider = this.sliders.instrumental;
        const input = this.inputs.instrumental;

        slider.value = value;
        input.value = value;
        this.dispatch("instvolumechange", { value });
    }

    _onVoiceVolumeChange(e) {
        const { value } = e.target;

        const slider = this.sliders.voices;
        const input = this.inputs.voices;

        slider.value = value;
        input.value = value;
        this.dispatch("voicevolumechange", { value });
    }

    _onChartUpload(e) {
        const { files } = this.uploaders.chart;
        if (files.length > 0) {
            const file = files[0];

            new Response(file)
                .json()
                .then((chart) => {
                    this.errorLabels.chart.classList.add("d-none");
                    this.upload.chart = chart;
                    this._checkUpload();
                })
                .catch((reason) => {
                    this.errorLabels.chart.classList.remove("d-none");
                    console.error("Chart upload error.", reason);
                    this._checkUpload();
                });

            return;
        }

        this.upload.chart = null;
        this.errorLabels.chart.classList.add("d-none");
        this._checkUpload();
    }

    _onVoicesUpload(e) {
        const { files } = this.uploaders.voices;
        if (files.length > 0) {
            const file = files[0];

            new Response(file).blob().then((blob) => {
                this.audioTesters.voices.src = window.URL.createObjectURL(blob);
            });

            return;
        }
        this.upload.voices = null;
        this.errorLabels.voices.classList.add("d-none");
        this._checkUpload();
    }

    _onInstrumentalUpload(e) {
        const { files } = this.uploaders.instrumental;
        if (files.length > 0) {
            const file = files[0];

            new Response(file).blob().then((blob) => {
                this.audioTesters.instrumental.src = window.URL.createObjectURL(blob);
            });

            return;
        }

        this.upload.instrumental = null;
        this.errorLabels.instrumental.classList.add("d-none");
        this._checkUpload();
    }

    _onVoicesValidation(isValid, e) {
        if (isValid) {
            const file = this.uploaders.voices.files[0];
            new Response(file).arrayBuffer().then((arrayBuffer) => {
                this.upload.voices = arrayBuffer;
                this._checkUpload();
            });
            return;
        }

        this.upload.voices = null;
        console.error("Voices audio file upload error.", e);

        this.errorLabels.voices.classList.remove("d-none");
        this._checkUpload();
    }

    _onInstrumentalValidation(isValid, e) {
        if (isValid) {
            const file = this.uploaders.instrumental.files[0];
            new Response(file).arrayBuffer().then((arrayBuffer) => {
                this.upload.instrumental = arrayBuffer;
                this._checkUpload();
            });
            return;
        }

        this.upload.instrumental = null;
        console.error("Instrumental audio file upload error.", e);

        this.errorLabels.instrumental.classList.remove("d-none");
        this._checkUpload();
    }

    _checkUpload() {
        const hasChart = !!this.upload.chart;
        const hasMusic = !!(this.upload.voices || this.upload.instrumental);
        this.uploadConfirm.disabled = !(hasChart && hasMusic);
    }

    _onBack(e) {
        this.showLoader(true);
    }

    addListener(event, callback) {
        // Check if the callback is not a function
        if (typeof callback !== "function") {
            console.error(
                `The listener callback must be a function, the given type is ${typeof callback}`
            );
            return false;
        }
        // Check if the event is not a string
        if (typeof event !== "string") {
            console.error(`The event name must be a string, the given type is ${typeof event}`);
            return false;
        }

        // Create the event if not exists
        if (this.events[event] === undefined) {
            this.events[event] = {
                listeners: [],
            };
        }

        this.events[event].listeners.push(callback);
    }

    removeListener(event, callback) {
        if (this.events[event] === undefined) {
            return false;
        }

        this.events[event].listeners = this.events[event].listeners.filter((listener) => {
            return listener.toString() !== callback.toString();
        });
    }

    dispatch(event, details) {
        if (this.events[event] === undefined) {
            return false;
        }
        this.events[event].listeners.forEach((listener) => {
            listener(details);
        });
    }

    setChart(chart) {
        this.chart = chart;
        this._updateUI();
        this._disableUI(false);
    }

    setPlaying(playing, audioMixer) {
        this.playing = playing;
        this.audioMixer = audioMixer;
    }

    setLoading(loading, message) {
        this.backButton.disabled = !!loading;
        if (loading) {
            this.overlay.classList.remove("d-none");
            this.overlay.classList.add("d-flex");
            this.overlayMessage.innerText = message || "";
            return;
        }
        this.overlay.classList.remove("d-flex");
        this.overlay.classList.add("d-none");
    }

    setError(message) {
        this.backButton.disabled = true;

        this.overlay.classList.remove("d-none");
        this.overlay.classList.remove("text-light");
        this.overlay.classList.add("text-danger");
        this.overlay.classList.add("d-flex");
        this.overlayMessage.innerText = message || "";
        return;
    }

    showLoader(show) {
        if (show) {
            this.loader.classList.remove("d-none");
            this.backButton.classList.add("d-none");
            return;
        }
        this.loader.classList.add("d-none");
        this.backButton.classList.remove("d-none");
    }

    update(event) {
        if (event.songEnded) {
            this.dispatch("stop");
            return;
        }

        this.text.time.innerText = formatTime(event.currentTime);
        const sections = this.chart.chartData.song.notes.length;
        let currentSection;

        if (event.changedSection || event.paused) {
            currentSection = event.currentSection;
            this.text.section.innerText = `${currentSection + 1} / ${sections}`;
        }

        if (event.paused) {
            const icon = this.buttons.play.children[0];
            icon.className = "bi bi-play-fill";
            this.playing = false;
        }

        if (event.changedBPM) {
            this.text.bpm.innerText = event.bpm;
        }
    }

    _updateUI() {
        const { currentSection } = this.chart;
        const sections = this.chart.chartData.song.notes.length;
        const currentTime = this.chart.getPosition() / 1000;
        const bpm = this.chart.getBPM();

        this.text.section.innerText = `${currentSection + 1} / ${sections}`;
        this.text.time.innerText = formatTime(currentTime);
        this.text.bpm.innerText = bpm;
    }
}

export { UI };
