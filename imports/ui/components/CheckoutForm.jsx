import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import React, { useState, useEffect } from "react";
import moment from "moment";

const CheckoutForm = () => {
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState(0);
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    Meteor.call("getPayments", amount, (error, result) => {
      if (error) return alert(error.message);
      setPayments(result.data);
    });
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();

    // Verify if Stripe is loaded
    if (!stripe) {
      return;
    }

    try {
      // Get paymentIntent from Meteor Method
      const paymentIntent = await new Promise((resolve, reject) =>
        Meteor.call("preparePayment", amount, (error, result) => {
          if (error) {
            return reject(error);
          }
          return resolve(result);
        })
      );

      // Check if paymentIntent isn't null
      if (!paymentIntent) {
        return;
      }

      // Pay by passing the paymentIntent and CardElement
      const payment = await stripe.confirmCardPayment(paymentIntent, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (payment.error) {
        throw new Error(payment.error.message);
      }

      // Add the payment to the list of latest payments
      setPayments([...payments, payment.paymentIntent]);
    } catch (err) {
      alert(`There was an error: ${err.message}`);
    }
  };

  return (
    <div className="stripe-container">
      {payments.map((payment) => (
        <div className="stripe-payment" key={payment.id}>
          <div className="stripe-payment-info">
            <div>
              <strong>ID: </strong>
              {payment.id.substr(payment.id.length - 5, payment.id.length)}
            </div>
            <div>
              <strong> Amount: </strong>
              {payment.amount / 100}
            </div>
            <div>
              <strong> Status: </strong>
              {payment.status}
            </div>
          </div>

          <div className="stripe-payment-date">
            <strong> Created: </strong>
            {moment.unix(payment.created).format("L").toString()}
          </div>
        </div>
      ))}
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
    </div>
  );
};

export default CheckoutForm;
