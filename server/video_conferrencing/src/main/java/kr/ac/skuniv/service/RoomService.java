package kr.ac.skuniv.service;

import java.io.IOException;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import kr.ac.skuniv.dto.RoomDto;

public interface RoomService {
	RoomDto createRoom(String password, boolean isPrivate);
	boolean loginRoom(WebSocketSession session, String roomCode, String hostCode, String password);
	RoomDto getRoomInfo(String roomCode);
	void broadcast(String roomCode, String fromSessionId, TextMessage message)  throws IOException;
	void sendTo(String roomCode, String sessionId, TextMessage message) throws IOException;
	void addSession(String roomCode, WebSocketSession session);
	void removeSession(String roomCode, WebSocketSession session) throws Exception;
	void superBroadcast(String roomCode, TextMessage message)  throws IOException;
	void readyToSortScript(String roomCode);
	void collectScript(String roomCode, WebSocketSession session, String script) throws Exception;
	void breakRoom(String roomCode) throws Exception;
}
	