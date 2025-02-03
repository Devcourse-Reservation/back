2.2 앱 비밀번호 생성
Gmail에서 SMTP를 사용하려면 앱 비밀번호를 생성해야 할 수 있습니다.

Google 계정으로 이동: https://myaccount.google.com/
2단계 인증 활성화:
"보안" > "2단계 인증"에서 활성화합니다.
앱 비밀번호 생성:
"보안" > "앱 비밀번호"로 이동.
애플리케이션: "Mail"
기기: "Other (Custom)" > 입력.
생성된 앱 비밀번호를 .env 파일의 EMAIL_PASSWORD에 설정합니다.

.env
EMAIL_USER = 이메일
EMAIL_PASSWORD = 비밀번호 ( gmail 시 위 대로 )

관리자 인증 방법

이메일 인증