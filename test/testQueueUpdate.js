const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000');

ws.on('open', () => {
  console.log('WebSocket 연결됨');
  ws.send(JSON.stringify({ event: 'getQueueStatus' }));
});

ws.on('message', (event) => {
  const data = JSON.parse(event);
  
  if (data.event === 'queueUpdate') {
    console.log(`내 순서: ${data.myPosition}, 뒤에 ${data.usersBehind}명 대기 중`);
  }
});

setInterval(() => {
  ws.send(JSON.stringify({ event: 'getQueueStatus' }));
}, 5000);
