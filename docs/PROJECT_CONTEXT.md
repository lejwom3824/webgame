# 프로젝트 맥락
게임: 재의 미드가르드. 브라우저 기반 카드 전투 RPG. 실행: index.html 또는 GitHub Pages https://lejwom3824.github.io/webgame/
기획 원문은 소유자가 별도로 제공한다. 이 문서는 요약이며 최신 원문을 대체하지 않는다.
## 핵심 디자인
카드를 많이 수집하고 보관함에서 손패 한도에 맞춰 빌드를 구성한다. 무기 호환성, 숙련도와 자세, 합성, 제압/살해 및 레벨 성장, 공방별 자원과 효과가 핵심이다. 기획상 1장은 제압 중심, 2장은 제압/살해 선택, 이후 살해 중심. 첫 살해와 숙련도 성장의 관계는 중요한 검증 대상이다. 9장 구상 중 현재 코드는 2장 종료 및 3장 준비 안내까지 확인되었다. 실제 완주 여부는 미검증.
## 코드 지도
index.html은 일반 script를 번호 순으로 로드한다. 01-utils 공용 도구, 02-cards 카드/장비, 03-enemies 적, 04-scene 화면, 05-run-map 1장, 06-combat 전투/공식/보상, 07-rest-shop-event 상점/사건, 08-ch2-data 2장 데이터, 09-title 시작/종료, 10-patch-notes 패치, 11-tutorial-training 튜토리얼/훈련장, 12-render UI, 13-fx 연출, 14-combat-ext 다중 적/공방, 15-ch2 지도/경제/동료/서사, 16-combat-aux 보조, 17-boot 시작, 18-save-menu 저장/메뉴. css/에 스타일. python3 tools/bundle.py 로 단일 HTML 생성.
## 기술적 주의
S.run, S.C, S.screen 전역 상태 및 스크립트 순서 의존. C.E 임시 변경을 사용하는 다중 적 처리. localStorage 최대 20개 저장 슬롯. 15-ch2.js에 다수 기능 집중. 기존 코드 전체를 한꺼번에 분리하지 않는다.
