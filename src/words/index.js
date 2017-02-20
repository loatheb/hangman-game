const fs = require('fs');
const wordListPath = require('word-list');

const wordArray = fs.readFileSync(wordListPath, 'utf8').split('\n');

exports.getWordsByLength = len => wordArray.filter(word => word.length === len);

exports.filterWordsByPosition = (position, words = wordArray) => {
    const hasWords = Object.values(position);

    return words.filter(word => word.split('').every((letter, index) => {
        const mapLetter = position[index];
        if (mapLetter && mapLetter === letter) {
            return true;
        } else if (!mapLetter && hasWords.indexOf(letter) === -1) {
            return true;
        }
        return false;
    }));
};

exports.findFrequenceWords = (words = wordArray) => {
    const map = new Map();

    words.forEach((word) => {
        word.split('').forEach((letter) => {
            if (map.has(letter)) {
                const value = map.get(letter);
                map.set(letter, value + 1);
            } else {
                map.set(letter, 1);
            }
        });
    });

    return [...map]
            .sort((memo, current) => current[1] - memo[1]) // [key, value]
            .map(item => item[0]);
};

exports.filterWordsByWord = (targetLetter, words = wordArray) => words.filter(word => word.split('').every(letter => letter !== targetLetter));
