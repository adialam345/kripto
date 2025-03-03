class FileEncryption {
    constructor() {
        // Generate RSA key pair
        const keyGen = new JSEncrypt({default_key_size: 2048});
        this.publicKey = keyGen.getPublicKey();
        this.privateKey = keyGen.getPrivateKey();
    }

    async encryptFile(file, masterKey) {
        try {
            // Generate AES key from master key
            const aesKey = CryptoJS.PBKDF2(masterKey, CryptoJS.lib.WordArray.random(128/8), {
                keySize: 256/32,
                iterations: 1000
            }).toString();

            // Read file as array buffer
            const fileBuffer = await this.readFileAsArrayBuffer(file);
            
            // Convert array buffer to word array
            const wordArray = CryptoJS.lib.WordArray.create(fileBuffer);

            // Encrypt file content with AES
            const encryptedContent = CryptoJS.AES.encrypt(wordArray, aesKey).toString();

            // Encrypt AES key with RSA
            const jsEncrypt = new JSEncrypt();
            jsEncrypt.setPublicKey(this.publicKey);
            const encryptedAesKey = jsEncrypt.encrypt(aesKey);

            // Encrypt filename with Caesar cipher
            const caesar = new CaesarCipher(masterKey);
            const encryptedFilename = caesar.encrypt(file.name);

            // Create encrypted file object
            const encryptedFile = {
                content: encryptedContent,
                key: encryptedAesKey,
                filename: encryptedFilename
            };

            // Create and download encrypted file
            const blob = new Blob([JSON.stringify(encryptedFile)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = encryptedFilename + '.encrypted';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Encryption error:', error);
            return false;
        }
    }

    async decryptFile(file, masterKey) {
        try {
            // Read encrypted file
            const fileContent = await this.readFileAsText(file);
            const encryptedFile = JSON.parse(fileContent);

            // Decrypt AES key with RSA
            const jsEncrypt = new JSEncrypt();
            jsEncrypt.setPrivateKey(this.privateKey);
            const aesKey = jsEncrypt.decrypt(encryptedFile.key);

            if (!aesKey) {
                throw new Error('Invalid master key or corrupted file');
            }

            // Decrypt file content with AES
            const decryptedContent = CryptoJS.AES.decrypt(encryptedFile.content, aesKey);
            
            // Convert to array buffer
            const wordArray = decryptedContent.toString(CryptoJS.enc.Utf8);
            const arrayBuffer = this.wordArrayToArrayBuffer(CryptoJS.enc.Base64.parse(wordArray));

            // Decrypt filename with Caesar cipher
            const caesar = new CaesarCipher(masterKey);
            const decryptedFilename = caesar.decrypt(encryptedFile.filename);

            // Create and download decrypted file
            const blob = new Blob([arrayBuffer]);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = decryptedFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Decryption error:', error);
            return false;
        }
    }

    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(file);
        });
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }

    wordArrayToArrayBuffer(wordArray) {
        const arrayBuffer = new ArrayBuffer(wordArray.sigBytes);
        const uint8View = new Uint8Array(arrayBuffer);
        
        for (let i = 0; i < wordArray.sigBytes; i++) {
            uint8View[i] = (wordArray.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        }
        
        return arrayBuffer;
    }
} 