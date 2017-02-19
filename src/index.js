const words = require('./words');
const request = require('./request');
const utils = require('./utils');

const {getWordsByLength, findFrequenceWords, getWordsStartBy, filterWordsByPosition, filterWordsByWord} = words;
const {startGame, nextWord, guessWord, getResult} = request;
const {handleResponse} = utils;

class Gamer {
    constructor() {
        this.sessionId = '';
        this.words = [];
        this.word = '';
        this.init();
    }
    init() {
        startGame()
            .then((res) => {
                this.sessionId = res.sessionId;
                this.numberOfGuessAllowedForEachWord = res.data.numberOfGuessAllowedForEachWord;
                this.numberOfWordsToGuess = res.data.numberOfWordsToGuess;
                return this.next(this.nextWord(), this.nextWordResolver.bind(this));
            });
    }
    next(action, resolver) {
        action
            .then(handleResponse)
            .then(resolver)
    }
    nextWord() {
        const sessionId = this.sessionId;
        return nextWord({
            sessionId,
        });
    }
    nextWordResolver(data) {
        // nextWord response data here
        const {word, totalWordCount, wrongGuessCountOfCurrentWord} = data;
        this.word = word;
        this.words = getWordsByLength(word.length);
        this.guessList = findFrequenceWords(this.words);
        this.incorrectGuessCount = 1;
        return this.next(this.guessWord(), this.guessWordResolver.bind(this));
    }
    guessWord(correct = true) {
        if (correct) {
            console.log(`Correct`);
            const position = this.generateCurrentPosition(this.word);
            this.words = filterWordsByPosition(position, this.words);
            this.guessList = findFrequenceWords(this.words);
            this.currentGuessLetter = this.findNextGuessLetter();
        } else {
            console.log(`Non Correct`);
            this.words = filterWordsByWord(this.currentGuessLetter, this.words);
            this.guessList = findFrequenceWords(this.words);
            this.currentGuessLetter = this.findNextGuessLetter();
        }
        console.log(`Guess Count: ${this.incorrectGuessCount}`);
        console.log(`Guess Word: ${this.currentGuessLetter}`);
        console.log('--------------------------------------');

        if (!this.currentGuessLetter) {
            return this.next(this.nextWord(), this.nextWordResolver.bind(this));
        }

        return guessWord({
            sessionId: this.sessionId,
            guess: this.currentGuessLetter.toUpperCase(),
        });
    }
    guessWordResolver(data) {
        // guessWord response here
        const {word, totalWordCount, wrongGuessCountOfCurrentWord} = data;
        console.log('------------------------');
        console.log(`Current Word is ${word}`);
        console.log(`totalWordCount: ${totalWordCount}`);
        console.log(`wrongGuessCountOfCurrentWord: ${wrongGuessCountOfCurrentWord}`);
        console.log('------------------------');
        const hasTargetLetter = /[\*]/;
        const hasToGuess = hasTargetLetter.test(word) && this.incorrectGuessCount < this.numberOfGuessAllowedForEachWord;
        if (hasToGuess) {
            const status = !(word === this.word);
            this.word = word;
            if (!status) {
                this.incorrectGuessCount++;
            }
            return this.next(this.guessWord(status), this.guessWordResolver.bind(this));
        } else {
            const {totalWordCount} = word;
            if (totalWordCount === this.numberOfWordsToGuess) {
                this.next(this.getResult(), this.getResultResolver.bind(this));
            }
            return this.next(this.nextWord(), this.nextWordResolver.bind(this));
        }

    }
    generateCurrentPosition() {
        const position = {};

        this.word.split('').forEach((letter, index) => {
            if (letter !== '*') {
                position[index] = letter.toLowerCase();
            }
        });
        return position;
    }
    findNextGuessLetter() {
        const hashMap = {};
        this.word.split('').forEach((letter) => {
            if (letter !== '*') {
                hashMap[letter] = true;
            }
        });
        for (let i = 0; i < this.guessList.length; i++) {
            const currentLetter = this.guessList[i].toUpperCase();
            if (hashMap[currentLetter]) {
                this.guessList.splice(i, 1);
                i--;
            }
        }
        const nextWord = this.guessList.shift();

        return nextWord;
    }
    getResult() {
        return getResult({
            sessionId: this.sessionId,
        });
    }
    getResultResolver(data) {
        console.log(data);
    }
}

module.exports = Gamer;
