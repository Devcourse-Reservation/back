const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'reservation-producer',
  brokers: [process.env.KAFKA_BROKER]
});

const producer = kafka.producer();

const sendToQueue = async (message) => {
  await producer.connect();
  await producer.send({
    topic: 'reservation_queue',
    messages: [
      { value: JSON.stringify(message) }
    ]
  });
  console.log('Message sent to Kafka:', message);
  await producer.disconnect();
};

module.exports = sendToQueue;