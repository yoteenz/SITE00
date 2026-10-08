import { blockedProcessorCall, quotePlatformFee, type PlatformPaymentProvider } from './processor';

/**
 * Stripe Connect boundary. No SDK client, no network, no connected accounts.
 * Production activation is a later founder-approved sprint.
 */
export function createStripeConnectAdapter(): PlatformPaymentProvider {
  return {
    id: 'STRIPE_CONNECT',
    liveMoneyMovement: false,
    calculatePlatformFee: quotePlatformFee,
    createConnectedAccount: blockedProcessorCall,
    createPayment: blockedProcessorCall,
    splitPayment: blockedProcessorCall,
    createTransfer: blockedProcessorCall,
    createPayout: blockedProcessorCall,
    retrieveTransaction: blockedProcessorCall,
    retrieveRefund: blockedProcessorCall,
    retrieveDispute: blockedProcessorCall,
    retrieveApplicationFee: blockedProcessorCall,
    reconcile: blockedProcessorCall,
  };
}
