class AudioMixer {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.voicesBuffer = null;
        this.instBuffer = null;

        this.mainGainNode = this.audioContext.createGain();
        this.voiceGainNode = this.audioContext.createGain();
        this.instGainNode = this.audioContext.createGain();

        this.mainGainNode.connect(this.audioContext.destination);

        this.voiceGainNode.connect(this.mainGainNode);
        this.instGainNode.connect(this.mainGainNode);

        this.pausedAt = 0;
        this.startedAt = 0;
    }

    async setInstrumental(arrayBuffer) {
        this.instBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    }

    async setVoices(arrayBuffer) {
        this.voicesBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    }

    clear() {
        this.voicesBuffer = null;
        this.instBuffer = null;
        this._voicesTrack = null;
        this._instTrack = null;
    }

    setChart(chart) {
        this.chart = chart;
        this.pausedAt = this.chart.getPosition() / 1000;
    }

    play(options) {
        this._voicesTrack = this.audioContext.createBufferSource();
        this._instTrack = this.audioContext.createBufferSource();

        this._voicesTrack.buffer = this.voicesBuffer;
        this._instTrack.buffer = this.instBuffer;

        this._voicesTrack.connect(this.voiceGainNode);
        this._instTrack.connect(this.instGainNode);

        // if options.loop, start, end, etc...

        this._voicesTrack.start(0, this.pausedAt);
        this._instTrack.start(0, this.pausedAt);

        this.startedAt = this.audioContext.currentTime - this.pausedAt;
        this.pausedAt = 0;

        this.playing = true;
    }

    stop() {
        if (this._voicesTrack) {
            this._voicesTrack.disconnect();
            this._voicesTrack.stop(0);
            this._voicesTrack = null;
        }

        if (this._instTrack) {
            this._instTrack.disconnect();
            this._instTrack.stop(0);
            this._instTrack = null;
        }

        this.pausedAt = 0;
        this.startedAt = 0;
        this.playing = false;
    }

    seek(seconds) {
        if (this.playing) {
            this.stop();
            this.pausedAt = seconds;
            this.play();
            return;
        }

        this.pausedAt = seconds;
    }

    setMainVolume(value) {
        this.mainGainNode.gain.value = value;
    }

    setInstrumentalVolume(value) {
        this.instGainNode.gain.value = value;
    }

    setVoiceVolume(value) {
        this.voiceGainNode.gain.value = value;
    }

    getCurrentTime() {
        if (this.pausedAt) {
            return this.pausedAt;
        }
        if (this.startedAt) {
            return this.audioContext.currentTime - this.startedAt;
        }
        return 0;
    }

    pause() {
        let elapsed = this.audioContext.currentTime - this.startedAt;
        this.stop();
        this.pausedAt = elapsed;
    }
}

export { AudioMixer };
