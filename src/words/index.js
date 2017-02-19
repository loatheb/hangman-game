const fs = require('fs');
const wordListPath = require('word-list');

const wordArray = fs.readFileSync(wordListPath, 'utf8').split('\n');

exports.getWordsByLength = (len) => {
    return wordArray.filter((word) => {
        return word.length === len;
    });
};

exports.getWordsStartBy = (str, words = wordArray) => {
    const reg = new RegExp(`^${str}`);
    return words.filter((word) => {
        return reg.test(word);
    });
};

exports.filterWordsByPosition = (position, words = wordArray) => {
    return words.filter((word) => {
        const array = word.split('');
        const positionList = Object.keys(position);
        if (positionList.length) {
            return positionList.every((pos) => {
                return array[pos] === position[pos];
            });
        } else {
            return words;
        }
    });
}

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
        })
    });

    return [...map].sort((memo, current) => {
                // [key, value]
                return current[1] - memo[1];
            })
            .map((item) => {
                return item[0];
            });
};

exports.filterWordsByWord = (letter, words = wordArray) => {
    return words.filter((word) => {
        return word.split('').every((l) => {
            return l !== letter;
        });
    });
}
