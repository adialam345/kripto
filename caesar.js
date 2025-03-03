class CaesarCipher {
    constructor(key) {
        // Generate shift value from key
        this.shift = Array.from(key).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 26;
    }

    encrypt(text) {
        return text.split('.').map((part, index) => {
            if (index === text.split('.').length - 1) {
                // Keep file extension unchanged
                return part;
            }
            return part.split('').map(char => {
                if (char.match(/[a-zA-Z]/)) {
                    const code = char.charCodeAt(0);
                    const isUpperCase = code >= 65 && code <= 90;
                    const base = isUpperCase ? 65 : 97;
                    return String.fromCharCode(
                        (code - base + this.shift) % 26 + base
                    );
                }
                return char;
            }).join('');
        }).join('.');
    }

    decrypt(text) {
        return text.split('.').map((part, index) => {
            if (index === text.split('.').length - 1) {
                // Keep file extension unchanged
                return part;
            }
            return part.split('').map(char => {
                if (char.match(/[a-zA-Z]/)) {
                    const code = char.charCodeAt(0);
                    const isUpperCase = code >= 65 && code <= 90;
                    const base = isUpperCase ? 65 : 97;
                    return String.fromCharCode(
                        (code - base - this.shift + 26) % 26 + base
                    );
                }
                return char;
            }).join('');
        }).join('.');
    }
} 