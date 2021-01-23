package kr.ac.skuniv.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.socket.WebSocketSession;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Data
@AllArgsConstructor
@Builder
public class RoomDto {
	private String roomCode;
	private String hostCode;
	private String password;
	private boolean isPrivate; // 비밀번호가 설정 되어있는지의 여부
	private WebSocketSession host;
	private Map<String, WebSocketSession> sessions;
	private Set<String> notSendScriptSessionIds; // 스크립트를 안보낸 유저 Set
	private String script;
	private List<String> originScript;

}
