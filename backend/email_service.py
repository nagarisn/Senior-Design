import logging
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger("email_service")
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
ch.setFormatter(logging.Formatter('%(message)s'))
logger.addHandler(ch)

SMTP_HOST = os.environ.get("SMTP_HOST", "")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")


class EmailService:
    @staticmethod
    def _send_smtp(to_email: str, subject: str, html_body: str) -> bool:
        """Send real email via SMTP. Returns True on success."""
        if not SMTP_HOST or not SMTP_USER or not SMTP_PASSWORD:
            return False
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = SMTP_USER
            msg["To"] = to_email
            msg.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.ehlo()
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_USER, to_email, msg.as_string())
            return True
        except Exception as e:
            logger.error(f"SMTP send failed: {e}")
            return False

    @staticmethod
    def send_confirmation_email(user_email: str, user_name: str, itinerary_name: str, total_price: float):
        subject = f"SmartTravel Booking Confirmation: {itinerary_name}"
        html_body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h1 style="color: #14b8a6;">SmartTravel</h1>
            <h2>Booking Confirmed!</h2>
            <p>Dear {user_name},</p>
            <p>Your itinerary <strong>{itinerary_name}</strong> is now confirmed.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
                <p><strong>Total Billed:</strong> ${total_price:,.2f}</p>
                <p><strong>Status:</strong> CONFIRMED</p>
            </div>
            <p>Login to your SmartTravel Portal to view, download PDF, and manage your bookings.</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb;" />
            <p style="font-size: 12px; color: #6b7280;">Automated message from SmartTravel AI.</p>
        </div>"""

        sent = EmailService._send_smtp(to_email=user_email, subject=subject, html_body=html_body)
        if not sent:
            logger.info(f"[EMAIL - console fallback] TO: {user_email} | SUBJECT: {subject} | Total: ${total_price:,.2f}")
        return True

    @staticmethod
    def send_price_alert_email(user_email: str, user_name: str, destination: str, new_price: float, target_price: float):
        subject = f"Price Alert: {destination.title()} is now ${new_price:,.2f}!"
        html_body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h1 style="color: #14b8a6;">SmartTravel Price Alert</h1>
            <p>Hi {user_name},</p>
            <p>Great news! The price for <strong>{destination.title()}</strong> has dropped to <strong>${new_price:,.2f}</strong>,
            which is at or below your target of ${target_price:,.2f}.</p>
            <p>Log in now to book before prices change!</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb;" />
            <p style="font-size: 12px; color: #6b7280;">Automated message from SmartTravel AI.</p>
        </div>"""

        sent = EmailService._send_smtp(to_email=user_email, subject=subject, html_body=html_body)
        if not sent:
            logger.info(f"[EMAIL - console fallback] TO: {user_email} | SUBJECT: {subject}")
        return True
