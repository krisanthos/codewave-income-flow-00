
/**
 * Payment utility functions for the application
 */

// Test mode flag - set to true to bypass actual payment
export const TEST_MODE = true;

/**
 * Opens the Paystack payment page for registration payment
 * @param userData User registration data to pass through the URL
 */
export const initiateRegistrationPayment = (userData: {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
}) => {
  // Store user data in sessionStorage for retrieval after payment completion
  sessionStorage.setItem('pendingUserRegistration', JSON.stringify(userData));
  
  if (TEST_MODE) {
    console.log('TEST MODE: Bypassing payment and simulating successful registration');
    // Simulate successful payment by redirecting to the success URL
    window.location.href = window.location.origin + '?payment_success=true';
    return;
  }
  
  window.open('https://paystack.shop/pay/cjq84w--6d', '_blank');
};

/**
 * Opens the Paystack payment page for subsequent payments
 */
export const initiateSubsequentPayment = () => {
  if (TEST_MODE) {
    console.log('TEST MODE: Bypassing payment');
    return;
  }
  window.open('https://paystack.shop/pay/cb5bkq1xb5', '_blank');
};

/**
 * Completes the registration process after payment
 * @returns Promise that resolves to the registration result
 */
export const completeRegistrationAfterPayment = async () => {
  try {
    const userData = sessionStorage.getItem('pendingUserRegistration');
    if (!userData) {
      throw new Error('No pending registration data found');
    }

    const parsedUserData = JSON.parse(userData);
    
    if (TEST_MODE) {
      console.log('TEST MODE: Creating database entry for user in test mode', parsedUserData);
      
      // Make an API call to register the user even in test mode
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...parsedUserData,
          testMode: TEST_MODE // Flag to indicate this is a test mode registration
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Registration failed');
      }
      
      // Store the token
      localStorage.setItem('userToken', data.token);
      
      // Clear the stored data
      sessionStorage.removeItem('pendingUserRegistration');
      
      return { success: true, token: data.token };
    }
    
    // Make an API call to register the user
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsedUserData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || 'Registration failed');
    }

    // Clear the stored data
    sessionStorage.removeItem('pendingUserRegistration');
    
    // Store the token
    localStorage.setItem('userToken', data.token);
    
    return { success: true, token: data.token };
  } catch (error) {
    console.error('Error completing registration:', error);
    return { success: false, error };
  }
};

/**
 * Checks if there's a pending registration to complete
 * @returns boolean indicating if there's pending registration data
 */
export const hasPendingRegistration = () => {
  return !!sessionStorage.getItem('pendingUserRegistration');
};
