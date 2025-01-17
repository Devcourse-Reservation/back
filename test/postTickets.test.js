const axios = require('axios');

describe('Concurrency Tests', () => {
  it('should handle concurrent requests', async () => {
    const request1 = axios.post('http://localhost:3333/tickets', {
      user_id: 1,
      flight_id: 1,
      seat_id: 1,
      reserved_at: new Date(),
    });

    const request2 = axios.post('http://localhost:3333/tickets', {
      user_id: 2,
      flight_id: 1,
      seat_id: 1,
      reserved_at: new Date(),
    });

    const responses = await Promise.allSettled([request1, request2]);
    const firstResponse = responses[0];
    const secondResponse = responses[1];

    console.log('First Request Response:', firstResponse);
    console.log('Second Request Response:', secondResponse);

    expect(firstResponse.status).toBe('fulfilled');
    expect(firstResponse.value.status).toBe(200); // 성공적인 응답 코드

    // 두 번째 요청은 실패해야 한다.
    expect(secondResponse.status).toBe('rejected');
    expect(secondResponse.reason.response.status).toBe(500); // 좌석이 이미 예약되었음을 나타내는 실패 코드

  });
});
