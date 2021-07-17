import { UI } from "./ui.js";
import { Draw } from "./draw.js";
import * as util from "./util.js";
import { Chart } from "./chart.js";
import { AudioMixer } from "./audio.js";

let mainCanvas = null;
let canvasHandler = null;
let uiHandler = null;
let audioMixer = null;
let chartData = null;
let chart = null;

const audioContext = new AudioContext();

const predefinedSongs = [
    {
        name: "Bopeebo",
        chartData: "charts/bopeebo-hard.json",
        instrumental: "music/bopeebo/Inst.mp3",
        voices: "music/bopeebo/Voices.mp3",
    },
    {
        name: "Fresh",
        chartData: "charts/fresh-hard.json",
        instrumental: "music/fresh/Inst.mp3",
        voices: "music/fresh/Voices.mp3",
    },
    {
        name: "Dad Battle",
        chartData: "charts/dadbattle-hard.json",
        instrumental: "music/dadbattle/Inst.mp3",
        voices: "music/dadbattle/Voices.mp3",
    },
    {
        name: "Spookeez",
        chartData: "charts/spookeez-hard.json",
        instrumental: "music/spookeez/Inst.mp3",
        voices: "music/spookeez/Voices.mp3",
    },
    {
        name: "South",
        chartData: "charts/south-hard.json",
        instrumental: "music/south/Inst.mp3",
        voices: "music/south/Voices.mp3",
    },
    {
        name: "Monster",
        chartData: "charts/monster-hard.json",
        instrumental: "music/monster/Inst.mp3",
        voices: "music/monster/Voices.mp3",
    },
    {
        name: "Pico",
        chartData: "charts/pico-hard.json",
        instrumental: "music/pico/Inst.mp3",
        voices: "music/pico/Voices.mp3",
    },
    {
        name: "Philly Nice",
        chartData: "charts/philly-hard.json",
        instrumental: "music/philly/Inst.mp3",
        voices: "music/philly/Voices.mp3",
    },
    {
        name: "Blammed",
        chartData: "charts/blammed-hard.json",
        instrumental: "music/blammed/Inst.mp3",
        voices: "music/blammed/Voices.mp3",
    },
    {
        name: "Satin Panties",
        chartData: "charts/satin-panties-hard.json",
        instrumental: "music/satin-panties/Inst.mp3",
        voices: "music/satin-panties/Voices.mp3",
    },
    {
        name: "High",
        chartData: "charts/high-hard.json",
        instrumental: "music/high/Inst.mp3",
        voices: "music/high/Voices.mp3",
    },
    {
        name: "M.I.L.F",
        chartData: "charts/milf-hard.json",
        instrumental: "music/milf/Inst.mp3",
        voices: "music/milf/Voices.mp3",
    },
    {
        name: "Cocoa",
        chartData: "charts/cocoa-hard.json",
        instrumental: "music/cocoa/Inst.mp3",
        voices: "music/cocoa/Voices.mp3",
    },
    {
        name: "Eggnog",
        chartData: "charts/eggnog-hard.json",
        instrumental: "music/eggnog/Inst.mp3",
        voices: "music/eggnog/Voices.mp3",
    },
    {
        name: "Winter Horrorland",
        chartData: "charts/winter-horrorland-hard.json",
        instrumental: "music/winter-horrorland/Inst.mp3",
        voices: "music/winter-horrorland/Voices.mp3",
    },
    {
        name: "Senpai",
        chartData: "charts/senpai-hard.json",
        instrumental: "music/senpai/Inst.mp3",
        voices: "music/senpai/Voices.mp3",
    },
    {
        name: "Roses",
        chartData: "charts/roses-hard.json",
        instrumental: "music/roses/Inst.mp3",
        voices: "music/roses/Voices.mp3",
    },
    {
        name: "Thorns",
        chartData: "charts/thorns-hard.json",
        instrumental: "music/thorns/Inst.mp3",
        voices: "music/thorns/Voices.mp3",
    },
    {
        name: "Ugh",
        chartData: "charts/ugh-hard.json",
        instrumental: "music/ugh/Inst.mp3",
        voices: "music/ugh/Voices.mp3",
    },
    {
        name: "Guns",
        chartData: "charts/guns-hard.json",
        instrumental: "music/guns/Inst.mp3",
        voices: "music/guns/Voices.mp3",
    },
    {
        name: "Stress",
        chartData: "charts/stress-hard.json",
        instrumental: "music/stress/Inst.mp3",
        voices: "music/stress/Voices.mp3",
    },
    {
        name: "Tutorial",
        chartData: "charts/tutorial-hard.json",
        instrumental: "music/tutorial/Inst.mp3",
    },
];

const resizeObserver = new ResizeObserver((entries) => {
    // console.log("Size changed");

    for (const entry of entries) {
        if (entry.contentBoxSize) {
            const contentBoxSize = Array.isArray(entry.contentBoxSize)
                ? entry.contentBoxSize[0]
                : entry.contentBoxSize;

            const dimensions = {
                width: contentBoxSize.inlineSize,
                height: contentBoxSize.blockSize,
            };

            updateCanvasSize(dimensions);
        }
    }
});

function updateCanvasSize(dimensions) {
    if (!dimensions) {
        dimensions = util.getElementDimensions(mainCanvas);
    }

    mainCanvas.width = dimensions.width * window.devicePixelRatio;
    mainCanvas.height = dimensions.height * window.devicePixelRatio;

    canvasHandler.update();
}

async function loadCustomSong(data) {
    if (audioMixer.playing) {
        audioMixer.stop();
        canvasHandler.stopPlaying();
    }

    if (chart) {
        uiHandler.update({ paused: true, currentSection: 0, currentTime: 0 });
    }

    audioMixer.clear();
    canvasHandler.clearWaveforms();

    try {
        uiHandler.showLoader(false);

        chartData = data.chart;
        chart = new Chart(chartData);

        chart.currentSection = 0;

        audioMixer.setChart(chart);

        // allowing user to keep the file in the UI
        const instrumental = data.instrumental ? util.copyArrayBuffer(data.instrumental) : null;
        const voices = data.voices ? util.copyArrayBuffer(data.voices) : null;

        uiHandler.setLoading(true, "Setting audio...");
        if (instrumental) await audioMixer.setInstrumental(util.copyArrayBuffer(data.instrumental));
        if (voices) await audioMixer.setVoices(util.copyArrayBuffer(data.voices));

        uiHandler.setLoading(true, "Loading waveforms...");

        canvasHandler.setChart(chart);

        if (voices) {
            const waveformVoice = await initWaveform(voices, audioMixer.voicesBuffer.sampleRate);
            canvasHandler.setVoice(waveformVoice);
        }

        if (instrumental) {
            const waveformInstrumental = await initWaveform(
                instrumental,
                audioMixer.instBuffer.sampleRate
            );
            canvasHandler.setInstrumental(waveformInstrumental);
        }

        canvasHandler.setAudioMixer(audioMixer);

        uiHandler.setChart(chart);
        uiHandler.setLoading(false);
    } catch (reason) {
        console.error(reason);
        // TODO: needs more details
        uiHandler.setError("ERROR WHILE LOADING");
    }
}

async function loadPredefinedSong(song) {
    if (audioMixer.playing) {
        audioMixer.stop();
        canvasHandler.stopPlaying();
    }

    if (chart) {
        uiHandler.update({ paused: true, currentSection: 0, currentTime: 0 });
    }

    audioMixer.clear();
    canvasHandler.clearWaveforms();

    try {
        uiHandler.setLoading(true, "Downloading chart and songs...");
        uiHandler.showLoader(false);

        const [data, instrumental] = await Promise.all([
            fetch(song.chartData).then((response) => response.json()),
            fetch(song.instrumental).then((response) => response.arrayBuffer()),
        ]);

        chartData = data;
        chart = new Chart(chartData);

        chart.currentSection = 0;

        audioMixer.setChart(chart);
        canvasHandler.setChart(chart);

        let voices = null;
        if (song.voices) {
            voices = await (await fetch(song.voices)).arrayBuffer(); // lmao what
            await audioMixer.setVoices(util.copyArrayBuffer(voices));
        }

        await audioMixer.setInstrumental(util.copyArrayBuffer(instrumental));

        uiHandler.setLoading(true, "Loading waveforms...");

        const waveformVoice = song.voices
            ? await initWaveform(voices, audioMixer.voicesBuffer.sampleRate)
            : null;
        const waveformInstrumental = await initWaveform(
            instrumental,
            audioMixer.instBuffer.sampleRate
        );

        canvasHandler.setInstrumental(waveformInstrumental);
        if (song.voices) canvasHandler.setVoice(waveformVoice);

        canvasHandler.setAudioMixer(audioMixer);

        uiHandler.setChart(chart);
        uiHandler.setLoading(false);
    } catch (error) {
        console.error("Error while loading predefined song", error);
        uiHandler.setError("ERROR WHILE LOADING");
    }
}

function play() {
    if (chart) {
        audioMixer.play();
        canvasHandler.startPlaying();
    }
}

function handleSectionChange(offset) {
    let newSection = 0;
    const { playing } = audioMixer;

    if (playing) {
        const currentTimeMs = audioMixer.getCurrentTime() * 1000;
        newSection = chart.getSectionFromPos(currentTimeMs) + offset;
    } else {
        newSection = chart.currentSection + offset;
    }

    const n = chart.chartData.song.notes.length;
    const currentSection = util.wrapIndex(newSection, n);

    chart.currentSection = currentSection;
    const currentTime = chart.getPosition() / 1000;

    if (!playing) canvasHandler.updateSection();
    audioMixer.seek(currentTime);

    const event = { changedSection: true, currentSection, currentTime };
    if (chart.dynamicBPM) {
        event.changedBPM = true;
        event.bpm = chart.getBPM();
    }
    uiHandler.update(event);
}

function nextSection() {
    if (chart) {
        handleSectionChange(1);
    }
}

function prevSection() {
    if (chart) {
        handleSectionChange(-1);
    }
}

function pause() {
    if (chart) {
        audioMixer.pause();
        const currentTime = audioMixer.getCurrentTime();
        const currentTimeMs = currentTime * 1000;

        canvasHandler.stopPlaying();

        const currentSection = chart.getSectionFromPos(currentTimeMs);
        chart.currentSection = currentSection;

        uiHandler.update({ paused: true, currentSection, currentTime });
    }
}

function stop() {
    if (chart) {
        audioMixer.stop();
        canvasHandler.stopPlaying();

        const currentTime = 0;
        const currentSection = 0;
        chart.currentSection = currentSection;

        uiHandler.update({ paused: true, currentSection, currentTime });
        canvasHandler.updateSection();
    }
}

function changeVolume(value) {
    audioMixer.setMainVolume(value / 100);
}

function changeInstVolume(value) {
    audioMixer.setInstrumentalVolume(value / 100);
}

function changeVoiceVolume(value) {
    audioMixer.setVoiceVolume(value / 100);
}

function initWaveform(arrayBuffer, sampleRate) {
    const options = {
        audio_context: audioContext,
        array_buffer: arrayBuffer,
        scale: 1, // NOTE: this is extremely dumb!
        disable_worker: true,
    };

    return new Promise((resolve, reject) => {
        WaveformData.createFromAudio(options, (err, waveform) => {
            if (err) {
                reject(err);
            } else {
                resolve(waveform);
            }
        });
    });
}

function main() {
    // console.log("script loaded");
    mainCanvas = document.getElementById("main-canvas");
    canvasHandler = new Draw(mainCanvas);

    resizeObserver.observe(mainCanvas);

    updateCanvasSize();

    audioMixer = new AudioMixer(audioContext);

    uiHandler = new UI(predefinedSongs);

    uiHandler.addListener("play", () => {
        play();
    });
    uiHandler.addListener("pause", () => {
        pause();
    });
    uiHandler.addListener("stop", () => {
        stop();
    });

    uiHandler.addListener("next", () => {
        nextSection();
    });
    uiHandler.addListener("previous", () => {
        prevSection();
    });

    uiHandler.addListener("volumechange", (e) => {
        changeVolume(e.value);
    });

    uiHandler.addListener("instvolumechange", (e) => {
        changeInstVolume(e.value);
    });

    uiHandler.addListener("voicevolumechange", (e) => {
        changeVoiceVolume(e.value);
    });

    canvasHandler.addListener("animationframe", (e) => {
        uiHandler.update(e);
    });

    uiHandler.addListener("loadsong", loadPredefinedSong);
    uiHandler.addListener("upload", loadCustomSong);
}

window.addEventListener("DOMContentLoaded", main);
