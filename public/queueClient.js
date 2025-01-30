const ws = new WebSocket('ws://localhost:3000');

let userId = null;

// WebSocket 연결 성공 시 실행
ws.onopen = () => {
  console.log('WebSocket 연결됨');
  ws.send(JSON.stringify({ event: 'getQueueStatus' }));
};

// WebSocket 메시지 수신
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('WebSocket 메시지 수신:', data);

  if (data.event === 'userIdAssigned') {
    userId = data.userId;
    console.log(`사용자 ID 할당됨: ${userId}`);
    return;
  }

  if (!data.data) {
    console.warn('queueStatus 데이터 없음 (무시 가능):', data);
    return;
  }

  if (data.event === 'queueUpdate' || data.event === 'queuePositionsUpdated') {
    console.log('updateQueueDisplay 호출됨:', {
      queueStatus: data.data,
      myPosition: data.myPosition,
      usersBehind: data.usersBehind
    });

    updateQueueDisplay(data.data, data.myPosition, data.usersBehind);
  } else if (data.event === 'queueExpired') {
    updateQueueDisplayExpired(Array.isArray(data.data) ? data.data : [data.data]);
  }
};

// WebSocket 오류 처리
ws.onerror = (error) => {
  console.error('WebSocket 오류 발생:', error);
};

// WebSocket 연결 종료 처리
ws.onclose = () => {
  console.warn('WebSocket 연결 종료');
};

// 대기열 상태를 화면에 표시하는 함수
function updateQueueDisplay(queueStatus, myPosition, usersBehind) {
  if (!Array.isArray(queueStatus)) {
    console.error('queueStatus가 배열이 아님:', queueStatus);
    return;
  }

  console.log('updateQueueDisplay 실행 중:', { queueStatus, myPosition, usersBehind });

  const queueDisplay = document.getElementById('queueDisplay');
  const queueList = document.getElementById('queueList');

  if (!userId) {
    queueDisplay.innerHTML = `<strong>사용자 정보를 가져올 수 없습니다.</strong>`;
    return;
  }

  // 내 현재 위치 찾기
  const myQueueItem = queueStatus.find(item => item.userId === userId);
  const myPositionUpdated = myQueueItem ? myQueueItem.queuePosition : null;
  const usersBehindUpdated = myPositionUpdated ? queueStatus.length - myPositionUpdated : 0;

  // 내 순서 및 대기자 수 업데이트
  let queueText = `<h2>현재 대기 중입니다.</h2>`;

  if (myPositionUpdated) {
    queueText += `<p><strong>📌 고객님은 <span class="highlight">${myPositionUpdated}번째</span> 입니다.</strong></p>`;
    queueText += `<p><strong>뒤에 <span style="color: #007bff; font-size: 1.2em;">${usersBehindUpdated}</span>명이 기다리고 있습니다.</strong></p>`;
  } else {
    queueText += `<p><strong>현재 대기열에 없습니다.</strong></p>`;
  }

  queueDisplay.innerHTML = queueText;

  // 실시간 대기열 목록 업데이트 (UI 성능 최적화)
  queueList.innerHTML = `<h3>실시간 대기열 현황</h3><ul id="queueItems"></ul>`;
  const queueItemsContainer = document.getElementById('queueItems');

  queueStatus.forEach(item => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<strong>${item.queuePosition}번째</strong> - 사용자 <span style="color: #28a745;">${item.userId}</span>`;
    queueItemsContainer.appendChild(listItem);
  });

  console.log('updateQueueDisplay 실행 완료, 현재 내 순서:', myPositionUpdated);
   // 3초마다 최신 대기열 상태 요청 (자동 업데이트)
   setTimeout(() => {
    ws.send(JSON.stringify({ event: 'getQueueStatus' }));
  }, 3000);
}

// 만료된 대기열 항목을 화면에 표시하는 함수
function updateQueueDisplayExpired(expiredItems) {
  const expiredList = document.getElementById('expiredList');
  let expiredText = `<h3>🚨 만료된 대기열 항목</h3><ul>`;

  expiredItems.forEach(item => {
    expiredText += `<li class="fade-out"><strong>${item.queuePosition}번째</strong> - 사용자 <span style="color: #dc3545;">${item.userId}</span></li>`;
  });
  expiredText += `</ul>`;

  expiredList.innerHTML = expiredText;

  // 3초 후에 사라지는 효과 추가
  setTimeout(() => {
    expiredList.innerHTML = `<h3>🚨 만료된 대기열 항목</h3><ul></ul>`;
  }, 3000);
}
