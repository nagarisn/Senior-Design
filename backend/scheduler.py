import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from models import SessionLocal, Itinerary, FlightBooking, User, PriceAlert, Notification
from email_service import EmailService
from datetime import datetime

logger = logging.getLogger("price_monitor")
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
ch.setFormatter(logging.Formatter('PRICE-MONITOR: %(message)s'))
logger.addHandler(ch)

def check_price_drops():
    """Background job that checks if prices for draft itineraries have dropped"""
    logger.info(f"Running price drop analysis at {datetime.now().isoformat()}")
    db = SessionLocal()
    try:
        # Get all active draft itineraries
        drafts = db.query(Itinerary).filter(Itinerary.status == "draft").all()
        
        for itinerary in drafts:
            user = db.query(User).filter(User.id == itinerary.user_id).first()
            if not user:
                continue
                
            # Simulate a 10% chance of a major price drop for demonstration
            import random
            if random.random() < 0.10:
                drop_amount = itinerary.total_budget * random.uniform(0.05, 0.15)
                new_price = itinerary.total_budget - drop_amount
                
                # Update budget in DB
                itinerary.total_budget = new_price
                db.commit()
                
                # Trigger an alert email conceptually
                logger.info(f"🚨 PRICE DROP DETECTED for Itinerary #{itinerary.id} ({itinerary.name}). Dropped by ${drop_amount:,.2f}!")
                
                # Create in-app notification
                notif = Notification(
                    user_id=user.id,
                    type="price_drop",
                    message=f"Price drop on '{itinerary.name}'! Saved ${drop_amount:,.2f} — now ${new_price:,.2f}."
                )
                db.add(notif)
                db.commit()

                EmailService.send_confirmation_email(
                    user_email=user.email,
                    user_name=user.name,
                    itinerary_name=f"[PRICE DROP ALERT] {itinerary.name} is now cheaper!",
                    total_price=new_price
                )

        # Check user price alerts
        active_alerts = db.query(PriceAlert).filter(PriceAlert.is_active == True).all()
        for alert in active_alerts:
            import random
            simulated_price = alert.target_price * random.uniform(0.8, 1.2)
            alert.current_price = round(simulated_price, 2)
            if simulated_price <= alert.target_price:
                notif = Notification(
                    user_id=alert.user_id,
                    type="price_alert",
                    message=f"Price alert: {alert.destination.title()} is now ${simulated_price:,.2f} — at or below your target of ${alert.target_price:,.2f}!"
                )
                db.add(notif)
        db.commit()
    except Exception as e:
        logger.error(f"Error checking prices: {e}")
    finally:
        db.close()


def start_scheduler():
    scheduler = BackgroundScheduler()
    # For senior design demo, run it fast (every 2 minutes) to guarantee it fires
    scheduler.add_job(
        check_price_drops,
        trigger=IntervalTrigger(minutes=2),
        id='price_drop_check',
        name='Check flight prices for drafts',
        replace_existing=True
    )
    scheduler.start()
    logger.info("Price monitor scheduler started. Checking every 2 minutes.")
