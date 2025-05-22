
/**
 * Payment utility functions for the application
 */

/**
 * Opens the Paystack payment page for registration payment
 */
export const initiateRegistrationPayment = () => {
  window.open('https://paystack.shop/pay/cjq84w--6d', '_blank');
};

/**
 * Opens the Paystack payment page for subsequent payments
 */
export const initiateSubsequentPayment = () => {
  window.open('https://paystack.shop/pay/cb5bkq1xb5', '_blank');
};
