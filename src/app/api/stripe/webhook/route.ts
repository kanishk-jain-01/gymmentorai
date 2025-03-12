import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe-server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') || '';
  
  let event: Stripe.Event;
  
  try {
    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }
    
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }
  
  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get the customer and subscription IDs
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        
        // Get the subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;
        
        // Calculate the subscription end date
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        
        // Update the user's subscription information
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubscriptionId: subscriptionId,
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: currentPeriodEnd,
          },
        });
        
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Only handle subscription invoices
        if (invoice.subscription) {
          const subscriptionId = invoice.subscription as string;
          const customerId = invoice.customer as string;
          
          // Get the subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0].price.id;
          
          // Calculate the subscription end date
          const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
          
          // Update the user's subscription information
          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
              stripePriceId: priceId,
              stripeCurrentPeriodEnd: currentPeriodEnd,
            },
          });
        }
        
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0].price.id;
        
        // Calculate the subscription end date
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        
        // Update the user's subscription information
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: currentPeriodEnd,
          },
        });
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Update the user's subscription information
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeCurrentPeriodEnd: null,
          },
        });
        
        break;
      }
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ 
      error: 'Webhook handler failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Disable body parsing, we need the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}; 