package kr.ac.skuniv;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import kr.ac.skuniv.dto.RoomDto;
import kr.ac.skuniv.service.RoomService;

@Component
public class WebSocketHandler extends TextWebSocketHandler {
	@Autowired
	private RoomService service;
	private ObjectMapper mapper = new ObjectMapper();

	// connection이 맺어진 후 실행된다
	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		System.err.println("session connected +=" + session);
	}

	// transport 중 error
	@Override
	public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
		System.err.println("transport error =" + session + ", exception =" + exception);
	}

	// connection close
	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
		System.err.println("session close -=" + session);
		String roomCode = (String) session.getAttributes().get("roomCode");
		if (roomCode != null) {
			RoomDto room = service.getRoomInfo(roomCode);
			if(room == null) {
				return;
			}
			if(room.getHost().getId().equals(session.getId())) {
				service.breakRoom(roomCode);
			}else {
				service.removeSession(roomCode, session);				
			}
		}
	}

	// session에게 메세지를 보내줌
	private void sendTo(WebSocketSession session, TextMessage message) throws IOException {
		session.sendMessage(message);
	}

	// 세션이 회의방에 인증하였는지 검증
	// session의 attribute(Map객체)에 roomCode가 설정되어있다면 인증이 된 세션임
	private boolean isAuthAtRoom(WebSocketSession session) throws IOException {
		String roomCode = (String) session.getAttributes().get("roomCode");
		if (roomCode == null) {
			System.out.println("회의방에 인증되지 않은 세션입니다.");
			session.close();
			return false;
		}
		return true;
	}

	private boolean isHostAtRoom(WebSocketSession session) throws IOException {
		if (!isAuthAtRoom(session)) {
			return false;
		}
		String roomCode = (String) session.getAttributes().get("roomCode");
		RoomDto room = service.getRoomInfo(roomCode);
		if (room.getHost().getId().equals(session.getId())) {
			return true;
		}
		return false;
	}

	// 메세지 수신시 실행하는 함수, 여기서 이벤트를 분기
	@Override
	public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
		@SuppressWarnings("unchecked")
		Map<String, Object> data = mapper.readValue(message.getPayload().toString(), Map.class);

		// 이벤트 분기
		switch ((String) data.get("event")) {
		case "login":
			handleLogin(session, data);
			break;
		case "connectToRoom":
			handleConnectToRoom(session, data);
			break;
		case "watcher":
			handleWatcher(session, data);
			break;
		case "offer":
			handleOffer(session, data);
			break;
		case "answer":
			handleAnswer(session, data);
			break;
		case "candidate":
			handleCandidate(session, data);
			break;
		case "startRecord":
			handleStartRecord(session);
			break;
		case "finishRecord":
			handleFinishRecord(session);
			break;
		case "receiveScript":
			handleReceiveScript(session, data);
			break;
		default:
			break;
		}
	}

	// 인증 처리
	private void handleLogin(WebSocketSession session, Map<String, Object> data)
			throws JsonProcessingException, IOException {
		Map<String, Object> result = new HashMap<>();
		String roomCode = (String) data.get("roomCode");
		String hostCode = (String) data.get("hostCode");
		String password = (String) data.get("password");
		boolean loginSuccess = service.loginRoom(session, roomCode, hostCode, password);

		result.put("event", "auth");
		result.put("isAuth", loginSuccess);
		sendTo(session, new TextMessage(mapper.writeValueAsString(result)));
	}

	// startRecord
	private void handleStartRecord(WebSocketSession session) throws IOException {
		Map<String, Object> result = new HashMap<>();
		System.out.println("Start Record : " + session);
		if (!isHostAtRoom(session)) {
			result.put("event", "invalidHost");
			result.put("message", "호스트에게만 허용된 기능입니다.");
			sendTo(session, new TextMessage(mapper.writeValueAsString(result)));
		} else {
			result.put("event", "startRecord");
			service.readyToSortScript((String)session.getAttributes().get("roomCode"));
			service.superBroadcast((String) session.getAttributes().get("roomCode"),
					new TextMessage(mapper.writeValueAsString(result)));
		}
	}

	// finishRecord
	private void handleFinishRecord(WebSocketSession session) throws IOException {
		Map<String, Object> result = new HashMap<>();
		if (!isHostAtRoom(session)) {
			result.put("event", "invalidHost");
			result.put("message", "호스트에게만 허용된 기능입니다.");
			sendTo(session, new TextMessage(mapper.writeValueAsString(result)));
		} else {
			result.put("event", "finishRecord");
			service.superBroadcast((String) session.getAttributes().get("roomCode"),
					new TextMessage(mapper.writeValueAsString(result)));
		}
	}
	
	// receiveScript 이벤트 핸들링
	private void handleReceiveScript(WebSocketSession session, Map<String, Object> data) throws Exception{ 
		service.collectScript((String)session.getAttributes().get("roomCode"), session, (String) data.get("script"));
	}
	
	// broadcaster 이벤트 핸들링
	private void handleConnectToRoom(WebSocketSession session, Map<String, Object> data) throws Exception {
		if (!isAuthAtRoom(session)) {
			return;
		}
		String roomCode = (String) session.getAttributes().get("roomCode");
		Map<String, Object> result = new HashMap<>();
		result.put("event", "connectToRoom");
		result.put("broadcasterId", session.getId());

		service.addSession(roomCode, session);
		service.broadcast(roomCode, session.getId(), new TextMessage(mapper.writeValueAsString(result)));
	}

	// watcher 이벤트 핸들링
	private void handleWatcher(WebSocketSession session, Map<String, Object> data) throws Exception {
		if (!isAuthAtRoom(session)) {
			return;
		}
		String roomCode = (String) session.getAttributes().get("roomCode");
		Map<String, Object> result = new HashMap<>();
		result.put("event", "watcher");
		result.put("watcherId", session.getId());

		service.sendTo(roomCode, (String) data.get("broadcasterId"),
				new TextMessage(mapper.writeValueAsString(result)));
	}

	// offer 이벤트 핸들링
	private void handleOffer(WebSocketSession session, Map<String, Object> data) throws Exception {
		if (!isAuthAtRoom(session)) {
			return;
		}
		String roomCode = (String) session.getAttributes().get("roomCode");
		Map<String, Object> result = new HashMap<>();
		result.put("event", "offer");
		result.put("broadcasterId", session.getId());
		result.put("sdp", data.get("sdp"));
		service.sendTo(roomCode, (String) data.get("watcherId"), new TextMessage(mapper.writeValueAsString(result)));
	}

	// answer 이벤트 핸들링
	private void handleAnswer(WebSocketSession session, Map<String, Object> data) throws Exception {
		if (!isAuthAtRoom(session)) {
			return;
		}
		String roomCode = (String) session.getAttributes().get("roomCode");
		Map<String, Object> result = new HashMap<>();
		result.put("event", "answer");
		result.put("watcherId", session.getId());
		result.put("sdp", data.get("sdp"));
		service.sendTo(roomCode, (String) data.get("broadcasterId"),
				new TextMessage(mapper.writeValueAsString(result)));
	}

	// candidate 이벤트 핸들링
	private void handleCandidate(WebSocketSession session, Map<String, Object> data) throws Exception {
		if (!isAuthAtRoom(session)) {
			return;
		}
		String roomCode = (String) session.getAttributes().get("roomCode");
		Map<String, Object> result = new HashMap<>();
		result.put("event", "candidate");
		result.put("id", session.getId());
		result.put("candidate", data.get("candidate"));
		service.sendTo(roomCode, (String) data.get("id"), new TextMessage(mapper.writeValueAsString(result)));
	}
}