package kr.ac.skuniv.service;

import java.io.IOException;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import kr.ac.skuniv.dto.RoomDto;

public interface RoomService {
	public RoomDto createRoom(String password, boolean isPrivate);
	public boolean loginRoom(WebSocketSession session, String roomCode, String hostCode, String password);
	public RoomDto getRoomInfo(String roomCode);
	public void broadcast(String roomCode, String fromSessionId, TextMessage message)  throws IOException;
	public void sendTo(String roomCode, String sessionId, TextMessage message) throws IOException;
	public void addSession(String roomCode, WebSocketSession session);
	public void removeSession(String roomCode, WebSocketSession session);
}
