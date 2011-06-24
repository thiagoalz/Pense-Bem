Dummy = {
	reset: function() {},
	oneLoopIteration: function() {},
	buttonPress: function() {},
	buttonRelease: function() {},
};
AdvinheONumero = Dummy;
SigaMe = Dummy;
NumeroDoMeio = Dummy;
Operacao = Dummy;

Som = {
    encodeBase64: function(str) {
        var out, i, len;
        var c1, c2, c3;
        const base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

        len = str.length;
        i = 0;
        out = "";
        while(i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            if(i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt((c1 & 0x3) << 4);
                out += "==";
                break;
            }
            c2 = str.charCodeAt(i++);
            if(i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
                out += base64EncodeChars.charAt((c2 & 0xF) << 2);
                out += "=";
                break;
            }
            c3 = str.charCodeAt(i++);
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >>6));
            out += base64EncodeChars.charAt(c3 & 0x3F);
        }
        return out;
    },
    SampleRate: 44100,
    encode8BitAudio: function(data) {
		var n = data.length;
		var integer = 0, i;

		// 8-bit mono WAVE header template
		var header = "RIFF<##>WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00<##><##>\x01\x00\x08\x00data<##>";

		// Helper to insert a 32-bit little endian int.
		function insertLong(value) {
			var bytes = "";
			for (i = 0; i < 4; ++i) {
				bytes += String.fromCharCode(value % 256);
				value = Math.floor(value / 256);
			}
			header = header.replace('<##>', bytes);
		}

		insertLong(36 + n); // chunk size
		insertLong(Som.SampleRate); // sample rate
		insertLong(Som.SampleRate); // byte rate
		insertLong(n); // subchunk2 size

		// Output sound data
		for (var i = 0; i < n; ++i) {
			header += String.fromCharCode(data[i] * 255);
		}

		return 'data:audio/wav;base64,' + Som.encodeBase64(header);
    },
    newTone: function (n) {
        var audio = new Audio();
        var samples = [];
        const sampleRateBy8 = Som.SampleRate / 7;
        const nBy50 = n * 50;
        const nBy25 = n * 25;
        for (var i = 0; i < sampleRateBy8; i++){
            samples.push(i % nBy50 <= nBy25);
        }

        audio.setAttribute("src", Som.encode8BitAudio(samples));

        audio.load();
        audio.autoplay = false;
        return function() {audio.play();};
    },
    playNote: function (n) {
        const noteToToneTable = {
            "c": Som.newTone(1),
            "d": Som.newTone(2),
            "e": Som.newTone(3),
            "f": Som.newTone(4),
            "g": Som.newTone(5),
            "a": Som.newTone(6),
            "b": Som.newTone(7),
            "C": Som.newTone(8),
            "D": Som.newTone(9)
        };
        var tone = noteToToneTable[n];
        if (tone === undefined) {
            return;
        }
        tone();
    }
};

MemoriaSons = {
    reset: function() {
        PB.setDisplay("");
        MemoriaSons.playQueue = [];
    },
    oneLoopIteration: function() {},
    playAndClearQueue: function() {
        for (var noteIndex in MemoriaSons.playQueue) {
            MemoriaSons.playNote(MemoriaSons.playQueue[noteIndex]);
        }
        MemoriaSons.reset();
    },
    playNote: function(n) {
        Som.playNote(n);
        PB.setDisplay(n);
    },
    buttonPress: function(b) {
        if (b == 'ENTER') {
            MemoriaSons.playAndClearQueue();
            return;
        }
        const buttonToNoteTable = {
            "0": "p", "1": "c", "2": "d", "3": "e",
            "4": "f", "5": "g", "6": "a", "7": "b",
            "8": "C", "9": "D"
        };
        var note = buttonToNoteTable[b];
        if (note === undefined) {
            PB.beep();
            return;
        }
        MemoriaSons.playQueue.push(note);
        MemoriaSons.playNote(note);
    },
    buttonRelease: function(b) {}
};

Aritmetica = {
	reset: function() {
		Aritmetica.possibleOperations = "+-/*";
		Aritmetica.points = 0;
		Aritmetica.advanceQuestion();
	},
	oneLoopIteration: function() {
		var answer = parseInt(prompt("Answer:"));
		if (answer != Aritmetica.answer) {
			Aritmetica.tries++;
			if (Aritmetica.tries >= 3) {
				Aritmetica.showCorrectAnswer();
				Aritmetica.advanceQuestion();
			}
		} else {
			Aritmetica.points += PB.pointsByNumberOfTries(Aritmetica.tries);
			Aritmetica.advanceQuestion();
		}
	},
	showCorrectAnswer: function() {
		PB.setDisplay(Aritmetica.answer);
	},
	buttonPress: function(b) {},
	buttonRelease: function(b) {},
	advanceQuestion: function() {
		Aritmetica.tries = 0;
		Aritmetica.operation = Aritmetica.possibleOperations[Math.round(Math.random() * (Aritmetica.possibleOperations.length - 1))];
		Aritmetica.firstDigit = Math.round(Math.random() * 99);
		Aritmetica.secondDigit = Math.round(Math.random() * 99);
		if ((Aritmetica.operation == "/" || Aritmetica.operation == "-") && Aritmetica.secondDigit > Aritmetica.firstDigit) {
			var temp = Aritmetica.firstDigit;
			Aritmetica.firstDigit = Aritmetica.secondDigit;
			Aritmetica.secondDigit = temp;
			if (Aritmetica.secondDigit == 0) {
				Aritmetica.secondDigit = 1;
			}
		}
		const operatorFunctionTable = {
			"+": function(a, b) { return a + b; },
			"-": function(a, b) { return a - b; },
			"/": function(a, b) { return a / b; },
			"*": function(a, b) { return a * b; }
		};
		Aritmetica.answer = operatorFunctionTable[Aritmetica.operation](Aritmetica.firstDigit, Aritmetica.secondDigit);
		PB.setDisplay(Aritmetica.firstDigit + " " + Aritmetica.operation + " " + Aritmetica.secondDigit);
	}
};

Adicao = {
	reset: function() {
		Aritmetica.possibleOperations = "+";
		Aritmetica.advanceQuestion();
	},
	oneLoopIteration: Aritmetica.oneLoopIteration,
	buttonPress: Aritmetica.buttonPress,
	buttonRelease: Aritmetica.buttonRelease
};

Subtracao = {
	reset: function() {
		Aritmetica.possibleOperations = "-";
		Aritmetica.advanceQuestion();
	},
	oneLoopIteration: Aritmetica.oneLoopIteration,
	buttonPress: Aritmetica.buttonPress,
	buttonRelease: Aritmetica.buttonRelease
};

Multiplicacao = {
	reset: function() {
		Aritmetica.possibleOperations = "*";
		Aritmetica.advanceQuestion();
	},
	oneLoopIteration: Aritmetica.oneLoopIteration,
	buttonPress: Aritmetica.buttonPress,
	buttonRelease: Aritmetica.buttonRelease
};

Divisao = {
	reset: function() {
		Aritmetica.possibleOperations = "/";
		Aritmetica.advanceQuestion();
	},
	oneLoopIteration: Aritmetica.oneLoopIteration,
	buttonPress: Aritmetica.buttonPress,
	buttonRelease: Aritmetica.buttonRelease
};

Livro = {
	StateChoosingBook: 0,
	StateQuestioning: 1,
	reset: function() {
		Livro.state = Livro.StateChoosingBook;
	},
	oneLoopIteration: function() {
		switch (Livro.state) {
		case Livro.StateChoosingBook:
			var book = prompt("Book number?", "_");
			book = parseInt(book.substring(0, 2));
			PB.setDisplay("Selected book: " + book);
			if (book > 0 && book < 999) {
				Livro.book = book;
				Livro.question = 0;
				Livro.tries = 0;
				Livro.points = 0;
				Livro.state = Livro.StateQuestioning;

				Livro.advanceQuestion();
			}
			break;
		case Livro.StateQuestioning:
		}
	},
	showCorrectAnswer: function() {
		PB.setDisplay("The correct answer was: " + Livro.getCorrectAnswer());
	},
	advanceQuestion: function() {
		if (Livro.question >= 0) {
			Livro.points += PB.pointsByNumberOfTries(Livro.tries);
		}
		Livro.tries = 0;
		Livro.question++;
		PB.setDisplay("Question: " + Livro.question);
	},
	getCorrectAnswer: function() {
		const answerPattern = "CDDBAADCBDAADCBB";
		return answerPattern[(Livro.book + Livro.question) & 15];
	},
	buttonPress: function(b) {
		switch (Livro.state) {
		case Livro.StateChoosingBook:
			break;
		case Livro.StateQuestioning:
			switch (b) {
			case "A":
			case "B":
			case "C":
			case "D":
				if (Livro.getCorrectAnswer(b) == b) {
					Livro.advanceQuestion();
					return;
				}
				Livro.tries++;
				if (Livro.tries >= 3) {
					Livro.showCorrectAnswer();
					Livro.advanceQuestion();
				} else {
					PB.setDisplay((3 - Livro.tries) + " more tries");
				}
				break;
			default:
				PB.beep();
			}
			break;
		}
	},
	buttonRelease: function(b) {		
	}
}

Welcome = {
	reset: function() {
		PB.setDisplay("*");
	},
	oneLoopIteration: function() {},
	buttonPress: function(b) {
		const buttonToTable = {
			"ADVINHE-O-NÚMERO": AdvinheONumero,
			"ADIÇÃO": Adicao,
			"MULTIPLICAÇÃO": Multiplicacao,
			"DIVISÃO": Divisao,
			"ARITMÉTICA": Aritmetica,
			"OPERAÇÃO": Operacao,
			"SIGA-ME": SigaMe,
			"MEMÓRIA-SONS": MemoriaSons,
			"NÚMERO-DO-MEIO": NumeroDoMeio,
			"SUBTRAÇÃO": Subtracao,
			"LIVRO": Livro,
		};
		var newMode = buttonToTable[b];
		if (newMode === undefined) {
			PB.beep();
			return;
		}
		PB.setMode(newMode);
	},
	buttonRelease: function(b) {}
};

Standby = {
	reset: function() {
		PB.setDisplay("");
	},
	oneLoopIteration: function() {},
	buttonPress: function(b) {},
	buttonRelease: function(b) {}
};

PB = {
	mode: null,
	init: function() {
		PB.setMode(Standby);
		PB.reset();
		setInterval('PB.oneLoopIteration()', 100);
	},
	reset: function() {
		if (PB.mode) {
			PB.mode.reset();
		}
	},
	oneLoopIteration: function() {
		if (PB.mode) {
			PB.mode.oneLoopIteration();
		}
	},
	setMode: function(m) {
		PB.mode = m;
		PB.reset();
	},
	buttonPress: function(b) {
		switch (b) {
		case 'LIGA': PB.setMode(Welcome); return;
		case 'DESL': PB.setMode(Standby); return;
		default:
			if (PB.mode) {
				PB.mode.buttonPress(b);
			}
		}
	},
	buttonRelease: function(b) {
		if (b == 'LIGA' || b == 'DESL') {
			return;
		}
		if (PB.mode) {
			PB.mode.buttonRelease(b);
		}
	},
	beep: function() {
		PB.setDisplay("Ação inválida");
	},
	setDisplay: function(c) {
		document.getElementById("debug").textContent = c;
	},
	pointsByNumberOfTries: function(t) {
		switch (t) {
		case 0: return 10;
		case 1: return 6;
		case 2: return 4;
		}
		return 0;
	}
};