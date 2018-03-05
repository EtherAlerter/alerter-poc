import { getSubscriptionInfo as getSubscriptionInfoFromEthereum } from './ethereum';

const getSubscriptionInfo = ({ getSubscriptionInfoFromEthereum }) => ({ state }) => (contractAddress, account) => {
  if (state.byAddress[contractAddress].accounts[account].subscriptionId) {
    return {
      source: 'web',
      id: state.byAddress[contractAddress].accounts[account].subscriptionId,
      type: 'sms',
      number: '555-1212'
    };
  } else {
    return getSubscriptionInfoFromEthereum(contractAddress, account);
  }
};

module.exports = {
  getSubscriptionInfo: getSubscriptionInfo({ getSubscriptionInfoFromEthereum })
};
