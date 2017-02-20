/* eslint no-console: "off" */
const chalk = require('chalk');

const words = require('./words');
const request = require('./request');
const utils = require('./utils');

const log = console.log;
const error = chalk.bold.red;
const success = chalk.bold.green;
const info = chalk.underline;

const {
    getWordsByLength,
    findFrequenceWords,
    filterWordsByPosition,
    filterWordsByWord,
} = words;
const {
    startGame,
    nextWord,
    guessWord,
    getResult,
} = request;
const {
    handleResponse,
} = utils;

class Gamer {
    constructor() {
        this.sessionId = '';
        this.words = [];
        this.word = '';
    }
    start() {
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
            .then(resolver);
    }
    nextWord() {
        const sessionId = this.sessionId;
        log(`SessionId: ${sessionId}`);
        return nextWord({
            sessionId,
        });
    }
    nextWordResolver(data) {
        // nextWord response data here
        const {
            word,
        } = data;
        this.word = word;
        this.words = getWordsByLength(word.length);
        this.guessList = findFrequenceWords(this.words);
        this.incorrectGuessCount = 0;
        return this.next(this.guessWord(), this.guessWordResolver.bind(this));
    }
    guessWord(correct = true) {
        if (correct) {
            log(success('Correct'));
            const position = this.generateCurrentPosition(this.word);
            this.words = filterWordsByPosition(position, this.words);
            this.guessList = findFrequenceWords(this.words);
            this.currentGuessLetter = this.findNextGuessLetter();
        } else {
            log(error('Non Correct'));
            this.words = filterWordsByWord(this.currentGuessLetter, this.words);
            this.guessList = findFrequenceWords(this.words);
            this.currentGuessLetter = this.findNextGuessLetter();
        }
        log(`Incorrect Guess Count: ${this.incorrectGuessCount}`);
        log(`Guess Word: ${this.currentGuessLetter}`);

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
        const {
            word,
            totalWordCount,
            wrongGuessCountOfCurrentWord,
        } = data;
        log('------------------------');
        log(info(`Current Word is ${word}`));
        log(info(`TotalWordCount: ${totalWordCount}`));
        log(info(`WrongGuessCountOfCurrentWord: ${wrongGuessCountOfCurrentWord}`));
        log('------------------------');
        const hasTargetLetter = /[\\*]/;
        const status = !(word === this.word);
        if (!status) {
            this.incorrectGuessCount += 1;
        }
        const hasToGuess = hasTargetLetter.test(word) && this.incorrectGuessCount < this.numberOfGuessAllowedForEachWord;
        if (hasToGuess) {
            this.word = word;
            return this.next(this.guessWord(status), this.guessWordResolver.bind(this));
        }
        if (totalWordCount === this.numberOfWordsToGuess) {
            this.next(this.getResult(), this.getResultResolver.bind(this));
        }
        return this.next(this.nextWord(), this.nextWordResolver.bind(this));
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
        for (let i = 0; i < this.guessList.length; i += 1) {
            const currentLetter = this.guessList[i].toUpperCase();
            if (hashMap[currentLetter]) {
                this.guessList.splice(i, 1);
                i -= 1;
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
