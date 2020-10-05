package kr.ac.skuniv.service.impl;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import kr.ac.skuniv.dao.RoomDao;
import kr.ac.skuniv.dto.RoomDto;
import kr.ac.skuniv.service.RoomService;

@Service
public class RoomServiceImpl implements RoomService{
	@Autowired
	private RoomDao dao;
	
	// sessionId를 제외한 해당 roomCode의 회의방에 메세지 전달
	@Override
	public void broadcast(String roomCode, String fromSessionId, TextMessage message)  throws IOException{
		RoomDto room = dao.findBy(roomCode);
		if(room == null) {
			throw new RuntimeException("broadcast할 방을 찾을 수 없습니다.");
		}
		Map<String, WebSocketSession> sessions = room.getSessions();
		for (String sessionKey : sessions.keySet()) {
			if (sessions.get(sessionKey).getId().equals(fromSessionId)) {
				continue;
			}
			sessions.get(sessionKey).sendMessage(message);
		}
	}
	
	@Override
	public void sendTo(String roomCode, String sessionId, TextMessage message) throws IOException {
		RoomDto room = dao.findBy(roomCode);
		if(room == null) {
			throw new RuntimeException("send할 방을 찾을 수 없습니다.");
		}
		Map<String, WebSocketSession> sessions = room.getSessions();
		WebSocketSession session = sessions.get(sessionId);
		if(session == null) {
			throw new RuntimeException("send할 참가자를 찾을 수 없습니다.");
		}
		session.sendMessage(message);
	}

	@Override
	public RoomDto createRoom(String password, boolean isPrivate) {
		return dao.createBy(password, isPrivate);
	}
	
	@Override
	public boolean loginRoom(WebSocketSession session, String roomCode, String hostCode, String password) {
		RoomDto room = dao.findBy(roomCode);
		boolean result = false;
		if(room != null) {
			if(hostCode != null) {
				if(hostCode.equals(room.getHostCode())) {
					room.setHost(session);
					result = true;
				} 
			} else if(room.isPrivate() && password != null) {
				if(password.equals(room.getPassword())) {
					result = true;
				}
			} else if(!room.isPrivate()){
				result = true;
			}
			if(result) {
				session.getAttributes().put("roomCode", roomCode);
			}
		}
		return result;
	}
	
	@Override
	public void addSession(String roomCode, WebSocketSession session) {
		RoomDto room = dao.findBy(roomCode);
		if(room == null) {
			throw new RuntimeException("세션을 add할 회의방을 찾지 못했습니다.");
		}
		room.getSessions().put(session.getId(), session);
	}
	
	@Override
	public RoomDto getRoomInfo(String roomCode) {
		RoomDto room = dao.findBy(roomCode);
		return room;
	}

	@Override
	public void removeSession(String roomCode, WebSocketSession session) {
		RoomDto room = dao.findBy(roomCode);
		if(room == null) {
			throw new RuntimeException("세션을 remove할 회의방을 찾지 못했습니다.");
		}
		room.getSessions().remove(session.getId());
	}
}
