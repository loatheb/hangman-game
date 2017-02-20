/* eslint no-console: "off" */
/* eslint class-methods-use-this: "off"*/
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
    next(action, resolver) {
        action
            .then(handleResponse)
            .then(resolver);
    }
    start() {
        startGame()
            .then((res) => {
                const { sessionId, data } = res;
                const { numberOfGuessAllowedForEachWord, numberOfWordsToGuess } = data;
                this.sessionId = sessionId;
                this.numberOfGuessAllowedForEachWord = numberOfGuessAllowedForEachWord;
                this.numberOfWordsToGuess = numberOfWordsToGuess;

                return this.next(this.nextWord(), this.nextWordResolver.bind(this));
            });
    }
    nextWord() {
        const sessionId = this.sessionId;
        return nextWord({
            sessionId,
        });
    }
    nextWordResolver(data) {
        // nextWord response data here
        const { word } = data;
        this.word = word;
        this.words = getWordsByLength(word.length);
        this.incorrectGuessCount = 0;
        return this.next(this.guessWord(), this.guessWordResolver.bind(this));
    }
    guessWord(correct = true) {
        if (correct) {
            log(success('Correct'));
            const position = this.generateCurrentPosition(this.word);
            this.words = filterWordsByPosition(position, this.words);
        } else {
            log(error('Non Correct'));
            this.words = filterWordsByWord(this.currentGuessLetter, this.words);
        }
        this.guessList = findFrequenceWords(this.words);
        this.currentGuessLetter = this.findNextGuessLetter();

        if (!this.currentGuessLetter) {
            log(error('Cannot find this Word in Dictionary! Jump It!'));
            return this.next(this.nextWord(), this.nextWordResolver.bind(this));
        }

        log(`Incorrect Guess Count: ${this.incorrectGuessCount}`);
        log(`Guess Word: ${this.currentGuessLetter}`);

        return guessWord({
            sessionId: this.sessionId,
            guess: this.currentGuessLetter.toUpperCase(),
        });
    }
    guessWordResolver(data) {
        // guessWord response here
        const { word, totalWordCount, wrongGuessCountOfCurrentWord } = data;

        log('\n\n');
        log(info(`Current Word is ${word}`));
        log(info(`TotalWordCount: ${totalWordCount}`));
        log(info(`WrongGuessCountOfCurrentWord: ${wrongGuessCountOfCurrentWord}`));
        log('\n\n');

        const hasTargetLetter = /[\\*]/;
        const correct = (word !== this.word);

        if (!correct) {
            this.incorrectGuessCount += 1;
        }

        const hasToGuess = hasTargetLetter.test(word)
                           && this.incorrectGuessCount < this.numberOfGuessAllowedForEachWord
                           && totalWordCount < this.numberOfWordsToGuess;
        if (hasToGuess) {
            this.word = word;
            return this.next(this.guessWord(correct), this.guessWordResolver.bind(this));
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
        return this.guessList.shift();
    }
    getResult() {
        const sessionId = this.sessionId;
        log(`SessionId: ${sessionId}`);
        return getResult({
            sessionId: this.sessionId,
        });
    }
    getResultResolver(data) {
        const { totalWrongGuessCount, totalWordCount, correctWordCount, score } = data;
        log(`Result: ${correctWordCount}/${totalWordCount}`);
        log(`WrongGuess: ${totalWrongGuessCount}`);
        log(success(`Score: ${score}`));
    }
}

module.exports = Gamer;
