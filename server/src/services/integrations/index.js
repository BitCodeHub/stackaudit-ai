/**
 * Integrations Hub - Central export for all integration services
 * 
 * Usage:
 *   const { integrationManager, StripeConnector, QuickBooksConnector } = require('./services/integrations');
 */

const IntegrationManager = require('./IntegrationManager');
const StripeConnector = require('./StripeConnector');
const QuickBooksConnector = require('./QuickBooksConnector');
const BaseConnector = require('./BaseConnector');

module.exports = {
  // Singleton manager instance
  integrationManager: IntegrationManager,
  
  // Connector classes for direct use
  StripeConnector,
  QuickBooksConnector,
  BaseConnector
};
