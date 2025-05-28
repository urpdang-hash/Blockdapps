
from flask import Flask, render_template, request, jsonify
import json
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit-wallet-data', methods=['POST'])
def submit_wallet_data():
    """
    Backend endpoint to log wallet submission data
    This serves as a backup/logging mechanism alongside EmailJS
    """
    try:
        data = request.get_json()
        
        # Add server timestamp
        data['server_timestamp'] = datetime.now().isoformat()
        data['client_ip'] = request.remote_addr
        
        # Log the submission (you can also save to database if needed)
        print("=== WALLET SUBMISSION RECEIVED ===")
        print(f"Timestamp: {data['server_timestamp']}")
        print(f"Wallet: {data.get('wallet_name', 'Unknown')}")
        print(f"Email: {data.get('user_email', 'Unknown')}")
        print(f"Issue: {data.get('issue_description', 'No description')}")
        print("===================================")
        
        return jsonify({
            'status': 'success',
            'message': 'Data received successfully',
            'timestamp': data['server_timestamp']
        }), 200
        
    except Exception as e:
        print(f"Error processing submission: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to process submission'
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
