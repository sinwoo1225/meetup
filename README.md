# MeetUp 
### WebRTC 기반의 화상회의 및 자연어처리 키워드 도출

학과 동기와 함께 진행한 프로젝트로 WebRTC를 이용해 브라우저(Peer)간의 통신을 통해 p2p기반의 화상회의를 구현하였습니다. 다자간의 회의 그리고 회의코드를 통한 회의방 기능을 위해 Spring WebSocket기반의 시그널링 서버를 구축하였으며 Chrome Speech API를 통해 사용자의 음성을 텍스트로 변환하고 변환된 텍스트를 취합하여 [Koala NLP](https://github.com/koalanlp/koalanlp)기반의 자연어 처리기반의 서버를 통해 회의에서 가장 많은 빈도를 보인 핵심 키워드를 추출해 사용자에게 서비스합니다.

___ 

## 사용기술
* Front-End: html,css,javascript,React
* 시그널링 서버:  Java, Spring Boot, Srping WebSocket
* 자연어 처리 서버 : Javascript, NodeJs

## 개발역할
* [Shinwoo](https://github.com/sinwoo1225) : React App개발, 시그널링 서버개발
* [Mussyan](https://github.com/Mussyan) : 자연어 처리 서버개발

## API 참조
* [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) 
* [WebRTC](https://developer.mozilla.org/ko/docs/Web/API/WebRTC_API)
* [Koala NLP](https://github.com/koalanlp/koalanlp)
---
## 실행화면
![실행화면1](/images/screenshot/screenshot1.PNG)
![실행화면1](/images/screenshot/screenshot2.PNG)
---
## 어려웠던 점 & 극복과정
### 서로 다른 NAT상에서 WebRTC 연결이 이뤄지지 않는 이슈
Peer가 같은 공유기나 같은 사설망 내에 위치해있는 경우 WebRTC연결이 가능했지만 모바일 네트워크와 같이 서로 다른 NAT상에 위치한 Peer간에는 연결이 정상적으로 이루어지지 않아 처음에는 원인을 찾기가 힘들었지만 Turn 서버를 구축하게 되면 서로 다른 NAT 상에서도 Peer간의 연결을 중계해줘 WebRTC 연결이 가능함을 알게 되었고 AWS EC2상에 Turn서버를 구축함으로써 문제를 해결하였습니다.
