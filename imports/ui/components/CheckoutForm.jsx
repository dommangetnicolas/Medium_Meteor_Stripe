import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import React, { useState } from "react";

const CheckoutForm = () => {
  const [amount, setAmount] = useState(0);
  const [metadata, setMetadata] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!stripe) {
      return;
    }

    try {
      const paymentIntent = await new Promise((resolve, reject) =>
        Meteor.call("preparePayment", amount, (error, result) => {
          if (error) {
            return reject(error);
          }
          return resolve(result);
        })
      );

      if (!paymentIntent) {
        return;
      }

      await stripe.confirmCardPayment(paymentIntent, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: 'Jenny Rosen',
          },
        },
      });

      setSucceeded(true);
    } catch (err) {
      alert(`There was an error: ${err.message}`)
    }
  };

  if (succeeded) {
    return (
      <div className="sr-field-success message">
        <h1>Your test payment succeeded</h1>
        <p>View PaymentIntent response:</p>
        <pre className="sr-callout">
          <code>{JSON.stringify(metadata, null, 2)}</code>
        </pre>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="stripe-form">
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <CardElement />
      <button>PAY</button>
    </form>
  );
};

export default CheckoutForm;
