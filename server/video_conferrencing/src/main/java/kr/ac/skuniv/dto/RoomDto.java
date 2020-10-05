package kr.ac.skuniv.dto;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.springframework.web.socket.WebSocketSession;

public class RoomDto {
	private String roomCode;
	private String hostCode;
	private String password;
	private boolean isPrivate;
	private WebSocketSession host;
	private Map<String,WebSocketSession> sessions;

	public RoomDto(String roomCode, String hostCode, String password, boolean isPrivate) {
		this.roomCode = roomCode;
		this.hostCode = hostCode;
		this.password = password;
		this.isPrivate = isPrivate;
		this.sessions = Collections.synchronizedMap(new HashMap<>());
	}

	public String getHostCode() {
		return hostCode;
	}

	public void setHostCode(String hostCode) {
		this.hostCode = hostCode;
	}

	public WebSocketSession getHost() {
		return host;
	}

	public void setHost(WebSocketSession host) {
		this.host = host;
	}

	public String getRoomCode() {
		return roomCode;
	}

	public void setRoomCode(String roomCode) {
		this.roomCode = roomCode;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public boolean isPrivate() {
		return isPrivate;
	}

	public void setPrivate(boolean isPrivate) {
		this.isPrivate = isPrivate;
	}

	public Map<String,WebSocketSession> getSessions() {
		return sessions;
	}

	public void setSessions(Map<String, WebSocketSession> sessions) {
		this.sessions = sessions;
	}

	@Override
	public String toString() {
		return "RoomDto [roomCode=" + roomCode + ", password=" + password + ", isPrivate=" + isPrivate + ", sessions="
				+ sessions + "]";
	}

}
