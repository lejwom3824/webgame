# 재의 미드가르드

index.html을 열면 게임이 시작됩니다. index.html은 css/와 js/의 파일을 순서대로 불러오므로 세 곳이 같은 폴더 구조로 함께 있어야 합니다.

## 파일 하나로 합치기
python3 tools/bundle.py 를 실행하면 dist/midgard.html 하나로 합쳐집니다. 이 파일은 혼자서도 실행됩니다.

## 파일 구성
화면 모양 (css)
- 1-base.css: 기본 화면, UI 크기
- 2-card-glow.css: 카드 종류별 후광
- 3-shop.css: 상점, 보관함, 각종 창
- 4-main.css: 전투 화면, 카드, 연출 등 대부분의 모양
- 5-save-slots.css: 저장 기록 목록
- 6-grades-menu.css: 등급 색, 게임 중 메뉴

동작과 데이터 (js, 번호 순서대로 불러옴)
- 00-bg-image.js: 배경 그림 자리
- 01-utils.js: 공용 도구, 주사위
- 02-cards.js: 카드 데이터, 장비 칸
- 03-enemies.js: 적, 특성, 적 그림
- 04-scene.js: 화면 배치, 배경, 시작 화면
- 05-run-map.js: 등반 진행, 1장 지도
- 06-combat.js: 전투 준비, 데미지 계산, 내 턴, 적 카드, 궁극기, 키워드, 적 턴, 전투 끝
- 07-rest-shop-event.js: 휴식, 상점, 사건, 판정
- 08-ch2-data.js: 2장 데이터, 2장 적, 니다벨리르 사건
- 09-title.js: 시작 화면, 끝 화면
- 10-patch-notes.js: 패치 내역
- 11-tutorial-training.js: 튜토리얼, 훈련장
- 12-render.js: 전투 화면 그리기, 패, 목록 창
- 13-fx.js: 타격감, 카드 모션과 소리, 궁극기 연출, 전환 팁
- 14-combat-ext.js: 여러 적 전투, 공방 키워드, 전투 훅, 도망, 난이도
- 15-ch2.js: 2장 진행과 지도, 동료, 지역 필드, 상점 반응, 자명종, 기입관, 대련장
- 16-combat-aux.js: 전투 보조
- 17-boot.js: 시작
- 18-save-menu.js: 저장 기록, 게임 중 메뉴
