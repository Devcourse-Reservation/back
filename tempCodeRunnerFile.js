consumeQueue()
  .then(() => {
    console.log("Kafka Consumer started successfully.");
  })
  .catch((err) => {
    console.error("Error starting Kafka Consumer:", err);
    process.exit(1); // 필요한 경우 프로세스 종료
  });