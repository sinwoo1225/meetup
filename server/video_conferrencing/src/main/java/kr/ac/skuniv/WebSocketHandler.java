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

import kr.ac.skuniv.service.RoomService;

@Component
public class WebSocketHandler extends TextWebSocketHandler {
	@Autowired
	private RoomService service;
//	private List<WebSocketSession> sessions = Collections.synchronizedList(new ArrayList<>());
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
		if(roomCode != null) {
			service.removeSession(roomCode, session);
		}
	}
	
	private void sendTo(WebSocketSession session, TextMessage message) throws IOException {
		session.sendMessage(message);
	}
	
	private boolean isAuthAtRoom(WebSocketSession session) throws IOException {
		String roomCode = (String) session.getAttributes().get("roomCode");
		if(roomCode == null) {
			System.out.println("회의방에 인증되지 않은 세션입니다.");
			session.close();
			return false;
		}
		return true;
	}
	// 메세지 수신
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
			handleConnectToRoom(session,data);
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
		default:
			break;
		}
	}

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

	// broadcaster 이벤트 핸들링
	private void handleConnectToRoom(WebSocketSession session, Map<String, Object> data) throws Exception {
		if(!isAuthAtRoom(session)) {
			return;
		}
		String roomCode = (String) session.getAttributes().get("roomCode");
		Map<String, Object> result = new HashMap<>();
		result.put("event", "connectToRoom");
		result.put("broadcasterId", session.getId());
		
		service.addSession(roomCode, session);
		service.broadcast(roomCode, session.getId(), new TextMessage(mapper.writeValueAsString(result)));
		//sessions.add(session);
		//broadcast(session, new TextMessage(mapper.writeValueAsString(map)));
	}

	// watcher 이벤트 핸들링
	private void handleWatcher(WebSocketSession session, Map<String, Object> data) throws Exception {
		if(!isAuthAtRoom(session)) {
			return;
		}
		String roomCode = (String) session.getAttributes().get("roomCode");
		Map<String, Object> result = new HashMap<>();
		result.put("event", "watcher");
		result.put("watcherId", session.getId());
		
		service.sendTo(roomCode,(String) data.get("broadcasterId"), new TextMessage(mapper.writeValueAsString(result)));
//		sendTo(searchSessionBy((String) data.get("broadcasterId")), new TextMessage(mapper.writeValueAsString(map)));
	}

	// offer 이벤트 핸들링
	private void handleOffer(WebSocketSession session, Map<String, Object> data) throws Exception {
		if(!isAuthAtRoom(session)) {
			return;
		}
		String roomCode = (String) session.getAttributes().get("roomCode");
		Map<String, Object> result = new HashMap<>();
		result.put("event", "offer");
		result.put("broadcasterId", session.getId());
		result.put("sdp", data.get("sdp"));
		service.sendTo(roomCode, (String) data.get("watcherId"),  new TextMessage(mapper.writeValueAsString(result)));
		//		WebSocketSession watcher = searchSessionBy((String) data.get("watcherId"));
//
//		if (watcher != null) {
//			Map<String, Object> map = new HashMap<>();
//			map.put("event", "offer");
//			map.put("broadcasterId", session.getId());
//			map.put("sdp", data.get("sdp"));
//			//sendTo(watcher, new TextMessage(mapper.writeValueAsString(map)));
//		}
	}

	// answer 이벤트 핸들링
	private void handleAnswer(WebSocketSession session, Map<String, Object> data) throws Exception {
		if(!isAuthAtRoom(session)) {
			return;
		}
		String roomCode = (String) session.getAttributes().get("roomCode");
		Map<String, Object> result = new HashMap<>();
		result.put("event", "answer");
		result.put("watcherId", session.getId());
		result.put("sdp", data.get("sdp"));
		service.sendTo(roomCode, (String) data.get("broadcasterId"),  new TextMessage(mapper.writeValueAsString(result)));
//		WebSocketSession broadcaster = searchSessionBy((String) data.get("broadcasterId"));

//		if (broadcaster != null) {
//			Map<String, Object> map = new HashMap<>();
//			map.put("event", "answer");
//			map.put("watcherId", session.getId());
//			map.put("sdp", data.get("sdp"));
//			sendTo(broadcaster, new TextMessage(mapper.writeValueAsString(map)));
//		}
	}

	// candidate 이벤트 핸들링
	private void handleCandidate(WebSocketSession session, Map<String, Object> data) throws Exception {
		if(!isAuthAtRoom(session)) {
			return;
		}
		String roomCode = (String) session.getAttributes().get("roomCode");
		Map<String, Object> result = new HashMap<>();
		result.put("event", "candidate");
		result.put("id", session.getId());
		result.put("candidate", data.get("candidate"));
		service.sendTo(roomCode, (String) data.get("id"),  new TextMessage(mapper.writeValueAsString(result)));
//		WebSocketSession receiver = searchSessionBy((String) data.get("id"));
//
//		if (receiver != null) {
//			Map<String, Object> map = new HashMap<>();
//			map.put("event", "candidate");
//			map.put("id", session.getId());
//			map.put("candidate", data.get("candidate"));
//			//sendTo(receiver, new TextMessage(mapper.writeValueAsString(map)));
//		}
	}
}
