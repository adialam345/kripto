document.addEventListener('DOMContentLoaded', () => {
    const fileEncryption = new FileEncryption();
    
    // Tab switching
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding content
            contents.forEach(content => {
                content.style.display = content.id === target ? 'block' : 'none';
            });
        });
    });

    // Status message handling
    function showStatus(message, isError = false) {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = 'status ' + (isError ? 'error' : 'success');
        status.style.display = 'block';
        
        // Hide status after 5 seconds
        setTimeout(() => {
            status.style.display = 'none';
        }, 5000);
    }

    // Encryption handling
    const encryptBtn = document.getElementById('encryptBtn');
    encryptBtn.addEventListener('click', async () => {
        const file = document.getElementById('encryptFile').files[0];
        const key = document.getElementById('encryptKey').value;

        if (!file) {
            showStatus('Please select a file to encrypt', true);
            return;
        }

        if (!key) {
            showStatus('Please enter a master key', true);
            return;
        }

        encryptBtn.disabled = true;
        encryptBtn.textContent = 'Encrypting...';

        try {
            const success = await fileEncryption.encryptFile(file, key);
            if (success) {
                showStatus('File encrypted successfully! Downloading encrypted file...');
            } else {
                showStatus('Failed to encrypt file', true);
            }
        } catch (error) {
            showStatus('Error during encryption: ' + error.message, true);
        } finally {
            encryptBtn.disabled = false;
            encryptBtn.textContent = 'Encrypt File';
        }
    });

    // Decryption handling
    const decryptBtn = document.getElementById('decryptBtn');
    decryptBtn.addEventListener('click', async () => {
        const file = document.getElementById('decryptFile').files[0];
        const key = document.getElementById('decryptKey').value;

        if (!file) {
            showStatus('Please select a file to decrypt', true);
            return;
        }

        if (!key) {
            showStatus('Please enter a master key', true);
            return;
        }

        decryptBtn.disabled = true;
        decryptBtn.textContent = 'Decrypting...';

        try {
            const success = await fileEncryption.decryptFile(file, key);
            if (success) {
                showStatus('File decrypted successfully! Downloading decrypted file...');
            } else {
                showStatus('Failed to decrypt file', true);
            }
        } catch (error) {
            showStatus('Error during decryption: ' + error.message, true);
        } finally {
            decryptBtn.disabled = false;
            decryptBtn.textContent = 'Decrypt File';
        }
    });
}); 