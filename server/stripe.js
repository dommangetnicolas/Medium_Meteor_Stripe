import { Meteor } from "meteor/meteor";
import Stripe from "stripe";

const stripe = Stripe(Meteor.settings.private.stripe_secret);

Meteor.methods({
  preparePayment: async (amount = 0) => {
    const paymentIntents = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "eur",
      metadata: {
        integration_check: "accept_a_payment",
        orderId: Math.random().toString(36).substring(7),
      },
    });

    return paymentIntents?.client_secret ?? null;
  },
  getPayments: async () =>
    await new Promise((resolve, reject) => {
      stripe.paymentIntents.list({ limit: 10 }, (err, paymentIntents) => {
        if (err) return reject(err);

        return resolve(paymentIntents);
      });
    }),
});
