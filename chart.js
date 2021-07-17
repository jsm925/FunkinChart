class Chart {
    constructor(chartData) {
        this.chartData = chartData;

        this.currentSection = 0;
        this.timings = [];

        const totalSections = this.chartData.song.notes.length;

        this.defaultDuration = this.constructor.getSectionDuration(this.chartData.song.bpm);

        this.dynamicBPM = this.chartData.song.notes.some((n) => n.changeBPM);
        if (this.dynamicBPM) {
            this.maxBPM = Math.max(
                ...this.chartData.song.notes.filter((n) => n.changeBPM).map((i) => i.bpm)
            );

            const durations = [];
            const bpm = [];

            let currentBPM = this.chartData.song.bpm;

            // not using map or reduce functions here to mantain clarity
            for (let i = 0; i < totalSections; i++) {
                const section = this.chartData.song.notes[i];
                if (section.changeBPM) {
                    currentBPM = section.bpm;
                }
                bpm.push(currentBPM);

                const duration = this.constructor.getSectionDuration(currentBPM);
                durations.push(duration);
            }

            const positions = [0];
            for (let i = 1; i < totalSections; i++) {
                positions.push(positions[i - 1] + durations[i - 1]);
            }

            this.timings = durations.map((duration, i) => {
                const position = positions[i];
                return { start: position, end: positions[i] + duration, duration, bpm: bpm[i] };
            });

            const lastSection = this.chartData.song.notes.length - 1;
            this._songDuration = this.timings[lastSection].end;
        } else {
            this._songDuration = this.defaultDuration * totalSections;
        }

        this.overlaps = new Map();
        this._findOverlaps();
    }

    getPosition(section = this.currentSection) {
        if (this.dynamicBPM) {
            return this.timings[section].start;
        }

        const { bpm } = this.chartData.song;

        return this.constructor.getSectionDuration(bpm) * section;
    }

    getSectionFromPos(milliseconds) {
        if (this.dynamicBPM) {
            return this.timings.findIndex((i) => milliseconds >= i.start && milliseconds < i.end);
        }

        const newSection = Math.floor(milliseconds / this.getDuration());
        if (newSection >= this.chartData.song.length || newSection < 0) {
            return false;
        }
        return newSection;
    }

    getRawSection(section = this.currentSection) {
        return this.chartData.song.notes[section];
    }

    getRawSectionNotes(section = this.currentSection) {
        return this.chartData.song.notes[section].sectionNotes;
    }

    getSectionNotes(section = this.currentSection, relative = false) {
        const rawNotes = this.chartData.song.notes[section].sectionNotes;
        const bothPlayers = rawNotes.some((n) => n[1] > 3);
        const mustHitSection = this.getMustHitSection(section);

        let player = []; // BF
        let opponent = [];

        if (bothPlayers) {
            opponent = this._filterNotesFirstHalf(rawNotes);
            player = this._filterNotesSecondHalf(rawNotes);

            if (mustHitSection) {
                const swap = player;
                player = opponent;
                opponent = swap;
            }
        } else if (mustHitSection) {
            player = this._filterNotesFirstHalf(rawNotes);
        } else {
            opponent = this._filterNotesFirstHalf(rawNotes);
        }

        return { player, opponent };
    }

    _filterNotesFirstHalf(notes) {
        return notes
            .filter((n) => n[1] < 4)
            .map((n) => ({ position: n[0], key: n[1], sustain: n[2] }));
    }

    _filterNotesSecondHalf(notes) {
        return notes
            .filter((n) => n[1] >= 4)
            .map((n) => ({ position: n[0], key: n[1] - 4, sustain: n[2] }));
    }

    getMustHitSection(section = this.currentSection) {
        return this.chartData.song.notes[section].mustHitSection;
    }

    // TODO: confusing naming, needs refactoring...
    // this is for a single section
    getDuration(section = this.currentSection) {
        if (this.dynamicBPM) {
            return this.timings[section].duration;
        }
        return this.defaultDuration;
    }

    getSongDuration() {
        return this._songDuration;
    }

    getBPM(section = this.currentSection) {
        if (this.dynamicBPM) {
            return this.timings[section].bpm;
        }
        return this.chartData.song.bpm;
    }

    // dumb, inefficient way to find sustain notes that overlap over sections
    _findOverlaps() {
        const sections = this.chartData.song.notes.map((section) => section.sectionNotes);
        sections.forEach((section, i) => {
            const position = this.getPosition(i);
            const duration = this.getDuration(i);
            const noteDuration = duration / 16;
            const end = position + duration;

            section.forEach((note) => {
                if (!(note[2] > 0)) {
                    return;
                }
                const notePosition = note[0];
                const sustainDuration = note[2];
                const fullNoteDuration = notePosition + noteDuration + sustainDuration;

                if (end > fullNoteDuration) {
                    return;
                }

                const overlapsUntil = this.getSectionFromPos(fullNoteDuration);
                for (let k = i + 1; k <= overlapsUntil; k++) {
                    if (this.overlaps.has(k)) {
                        this.overlaps.get(k).add(i);
                    } else {
                        const overlapSections = new Set();
                        overlapSections.add(i);
                        this.overlaps.set(k, overlapSections);
                    }
                }
            });
        });
    }

    static getSectionDuration(bpm) {
        return 4 * ((1000 * 60) / bpm);
    }
}

export { Chart };
