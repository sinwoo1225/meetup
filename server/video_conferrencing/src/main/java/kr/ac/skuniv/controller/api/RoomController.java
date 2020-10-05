package kr.ac.skuniv.controller.api;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.ac.skuniv.dto.RoomDto;
import kr.ac.skuniv.service.RoomService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping(path = "/api")
public class RoomController {
	@Autowired
	private RoomService service;
	
	@GetMapping(path = "/room/{roomCode}")
	public Map<String, Object> getRoom(@PathVariable(name="roomCode")String roomCode){
		Map<String, Object> result = new HashMap<>();
		RoomDto room = service.getRoomInfo(roomCode);
		if(room != null) {
			result.put("roomCode", room.getRoomCode());
			result.put("isExistRoom", true);
			result.put("isPrivate", room.isPrivate());			
		}else {
			result.put("roomCode", null);
			result.put("isExistRoom", false);
			result.put("isPrivate", false);
		}
		return result;
	}
	
	@PostMapping(path = "/room")
	public Map<String, Object> createRoom(@RequestBody Map<String, Object> params){
		Map<String, Object> result = new HashMap<>();
		String password = (String)params.get("password");
		// password 검증
		if(password != null) {
			password = password.trim();
			if(password.length() == 0) {
				password = null;
			}
		}
		result.put("room", service.createRoom(password, password != null));
		return result;
	}
}
