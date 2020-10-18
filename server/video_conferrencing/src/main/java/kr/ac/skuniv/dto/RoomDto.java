package kr.ac.skuniv.dto;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.web.socket.WebSocketSession;

// 채팅방을 추상화
public class RoomDto {
	private String roomCode;
	private String hostCode;
	private String password;
	private boolean isPrivate; // 비밀번호가 설정 되어있는지의 여부
	private WebSocketSession host;
	private Map<String, WebSocketSession> sessions;
	private Set<String> notSendScriptSessionIds;
	private String script;
	private List<String> originScript;

	
	public RoomDto(String roomCode, String hostCode, String password, boolean isPrivate) {
		this.roomCode = roomCode;
		this.hostCode = hostCode;
		this.password = password;
		this.isPrivate = isPrivate;
		this.sessions = Collections.synchronizedMap(new HashMap<>());
		this.script = null;
		this.notSendScriptSessionIds = null;
		this.originScript = null;
	}
	
	public List<String> getOriginScript() {
		return originScript;
	}

	public void setOriginScript(List<String> originScript) {
		this.originScript = originScript;
	}

	public Set<String> getNotSendScriptSessionIds() {
		return notSendScriptSessionIds;
	}

	public void setNotSendScriptSessionIds(Set<String> notSendScriptSessionIds) {
		this.notSendScriptSessionIds = notSendScriptSessionIds;
	}

	public String getScript() {
		return script;
	}

	public void setScript(String script) {
		this.script = script;
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
		return "RoomDto [roomCode=" + roomCode + ", hostCode=" + hostCode + ", password=" + password + ", isPrivate="
				+ isPrivate + ", host=" + host + ", sessions=" + sessions + "]";
	}

}
