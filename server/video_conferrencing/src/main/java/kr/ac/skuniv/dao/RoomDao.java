package kr.ac.skuniv.dao;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Repository;

import kr.ac.skuniv.dto.RoomDto;

@Repository
public class RoomDao {
	private Map<String, RoomDto> rooms;

	public RoomDao() {
		this.rooms = new HashMap<>();
	}

	// 6자리 알파벳 대문자로 이루어진 방 코드 생성 (like 어몽어스)
	private String createRoomCode() {
		StringBuilder builder = new StringBuilder();
		String result;
		do {
			for (int i = 0; i < 6; i++) {
				builder.append((char) (Math.random() * 26 + 65));
			}
			result = builder.toString();

		} while (rooms.get(result) != null);
		return result;
	}
	// 호스트를 인증할 수 있는 6자리 알파벳 대문자로 이루어진 코드 생성
	private String createHostCode() {
		StringBuilder builder = new StringBuilder();
		for (int i = 0; i < 6; i++) {
			builder.append((char) (Math.random() * 26 + 65));
		}

		return builder.toString();
	}

	public RoomDto findBy(String roomCode) {
		return rooms.get(roomCode);
	}

	public RoomDto createBy(String password, boolean isPrivate) {
		RoomDto room = new RoomDto(createRoomCode(), createHostCode(), password, isPrivate);
		rooms.put(room.getRoomCode(), room);
		return room;
	}
	
	public boolean deleteBy(String roomCode) {
		return rooms.remove(roomCode) != null? true:false;
	}
	
}
