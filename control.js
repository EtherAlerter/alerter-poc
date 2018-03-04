import {
  randomNumber,
  randomAddress,
  selectRandomContract,
  selectRandomSubscription
} from './testing';

const generateSubscription = ({ selectRandomContract }) => callback => () => {
  if (randomNumber(2) === 0) {
    callback(randomAddress(), randomAddress(), randomNumber(10000));
  } else {
    callback(selectRandomContract(), randomAddress(), randomNumber(10000));
  }
};

const generateUnsubscription = (selectRandomSubscription, callback) => () => {
  callback(...selectRandomSubscription());
};

const subscribeToControlMessages = ({
  selectRandomContract,
  selectRandomSubscription
}) => (state, onSubscribe, onUnsubscribe) => {
  setInterval(generateSubscription(selectRandomContract(state), onSubscribe), randomNumber(5000));
  setInterval(generateUnsubscription(selectRandomSubscription(state), onUnsubscribe), randomNumber(5000));
};

module.exports = {
  subscribeToControlMessages: subscribeToControlMessages({
    selectRandomContract,
    selectRandomSubscription,
    generateSubscription: generateSubscription({ selectRandomContract })
  })
};
