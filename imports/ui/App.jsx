import { loadStripe } from "@stripe/stripe-js";
import React from "react";
import { Elements, CardElement } from "@stripe/react-stripe-js";
import Index from "./views/Index";

const stripePromise = loadStripe(Meteor.settings.public.stripe_publishable);

export const App = () => {
  return (
    <Elements stripe={stripePromise}>
      <Index />
    </Elements>
  );
};
