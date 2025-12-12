import express from 'express';
import prisma from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { createOrder, verifyPaymentSignature } from '../utils/razorpay.js';

const router = express.Router();

// Create payment order
router.post('/create-order', authenticate, async (req, res, next) => {
  try {
    const { amount, currency = 'INR' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Check if Razorpay is configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({
        error: 'Payment gateway not configured',
        message: 'RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set',
      });
    }

    // Create Razorpay order
    const order = await createOrder(amount, currency, `user_${req.user.id}_${Date.now()}`);

    // Save payment record
    const payment = await prisma.payment.create({
      data: {
        userId: req.user.id,
        razorpayOrderId: order.id,
        amount,
        currency,
        status: 'pending',
      },
    });

    res.json({
      orderId: order.id,
      amount: order.amount / 100, // Convert from paise
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      paymentId: payment.id,
    });
  } catch (error) {
    next(error);
  }
});

// Webhook handler (Razorpay sends payment status updates here)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    // TODO: Verify webhook signature from Razorpay
    // const signature = req.headers['x-razorpay-signature'];
    // const isValid = verifyWebhookSignature(req.body, signature);
    // if (!isValid) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    const event = JSON.parse(req.body.toString());
    
    // Handle payment.paid event
    if (event.event === 'payment.captured' || event.event === 'payment.failed') {
      const paymentData = event.payload.payment.entity;
      const orderId = paymentData.order_id;

      // Find payment record
      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId: orderId },
      });

      if (payment) {
        const status = event.event === 'payment.captured' ? 'completed' : 'failed';
        
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status },
        });

        console.log(`Payment ${payment.id} updated to status: ${status}`);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    next(error);
  }
});

export default router;

