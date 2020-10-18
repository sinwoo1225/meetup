package kr.ac.skuniv.service.impl;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import com.fasterxml.jackson.databind.ObjectMapper;

import kr.ac.skuniv.dao.RoomDao;
import kr.ac.skuniv.dto.RoomDto;
import kr.ac.skuniv.service.RoomService;

@Service
public class RoomServiceImpl implements RoomService {
	@Autowired
	private RoomDao dao;
	private ObjectMapper mapper = new ObjectMapper();
	// sessionId를 제외한 해당 roomCode의 회의방에 존재하는 session에 메세지 전달
	@Override
	public void broadcast(String roomCode, String fromSessionId, TextMessage message) throws IOException {
		RoomDto room = dao.findBy(roomCode);
		if (room == null) {
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

	// 해당 roomCode의 회의방에 존재하는 session에 메세지 전달
	@Override
	public void superBroadcast(String roomCode, TextMessage message) throws IOException {
		RoomDto room = dao.findBy(roomCode);
		if (room == null) {
			throw new RuntimeException("broadcast할 방을 찾을 수 없습니다.");
		}
		Map<String, WebSocketSession> sessions = room.getSessions();
		for (String sessionKey : sessions.keySet()) {
			sessions.get(sessionKey).sendMessage(message);
		}
	}

	// roomCode에 해당하는 회의방내의 특정 session에 메세지 전달
	@Override
	public void sendTo(String roomCode, String sessionId, TextMessage message) throws IOException {
		RoomDto room = dao.findBy(roomCode);
		if (room == null) {
			throw new RuntimeException("send할 방을 찾을 수 없습니다.");
		}
		Map<String, WebSocketSession> sessions = room.getSessions();
		WebSocketSession session = sessions.get(sessionId);
		if (session == null) {
			throw new RuntimeException("send할 참가자를 찾을 수 없습니다.");
		}
		session.sendMessage(message);
	}

	// 회의방 생성
	@Override
	public RoomDto createRoom(String password, boolean isPrivate) {
		return dao.createBy(password, isPrivate);
	}

	// 회의방 인증
	@Override
	public boolean loginRoom(WebSocketSession session, String roomCode, String hostCode, String password) {
		RoomDto room = dao.findBy(roomCode);
		boolean result = false;
		if (room != null) {
			if (hostCode != null) {
				if (hostCode.equals(room.getHostCode())) {
					room.setHost(session);
					result = true;
				}
			} else if (room.isPrivate() && password != null) {
				if (password.equals(room.getPassword())) {
					result = true;
				}
			} else if (!room.isPrivate()) {
				result = true;
			}
			if (result) {
				session.getAttributes().put("roomCode", roomCode);
			}
		}
		return result;
	}

	// 회의방에 세션추가
	@Override
	public void addSession(String roomCode, WebSocketSession session) {
		RoomDto room = dao.findBy(roomCode);
		if (room == null) {
			throw new RuntimeException("세션을 add할 회의방을 찾지 못했습니다.");
		}
		room.getSessions().put(session.getId(), session);
	}

	// 회의방 정보를 반환하는 함수
	@Override
	public RoomDto getRoomInfo(String roomCode) {
		RoomDto room = dao.findBy(roomCode);
		return room;
	}

	// 회의방내에 세션 제거
	@Override
	public void removeSession(String roomCode, WebSocketSession session) throws Exception {
		RoomDto room = dao.findBy(roomCode);
		if (room == null) {
			throw new RuntimeException("세션을 remove할 회의방을 찾지 못했습니다.");
		}
		room.getSessions().remove(session.getId());
		if(room.getSessions().size() <= 0) {
			dao.deleteBy(roomCode);
		} else {
			Map<String, Object> result = new HashMap<>();
			result.put("event", "closedUser");
			result.put("closedUserId", session.getId());
			broadcast(roomCode, session.getId(), new TextMessage(mapper.writeValueAsString(result)));
		}
	}

	// 회의내역 기록 준비
	@Override
	public void readyToSortScript(String roomCode) {
		RoomDto room = dao.findBy(roomCode);
		if (room == null) {
			throw new RuntimeException("스크립트를 기록할 회의방을 찾지 못했습니다.");
		}
		Set<String> sessions = Collections.synchronizedSet(new HashSet<>());
		for (String key : room.getSessions().keySet()) {
			sessions.add(room.getSessions().get(key).getId());
		}
		room.setOriginScript(new ArrayList<>());
		room.setNotSendScriptSessionIds(sessions);
		System.out.println("ready to script" + room.getNotSendScriptSessionIds());
		System.out.println("ready to script" + room.getOriginScript());
	}
	
	// 방폭파
	@Override
	public void breakRoom(String roomCode) throws Exception {
		Map<String,Object> result = new HashMap<>();
		result.put("event", "breakRoom");
		broadcast(roomCode, dao.findBy(roomCode).getHost().getId(), new TextMessage(mapper.writeValueAsString(result)));
		dao.deleteBy(roomCode);
	}

	@Override
	public void collectScript(String roomCode, WebSocketSession session, String script) throws Exception {
		RoomDto room = dao.findBy(roomCode);
		if(room == null) {
			throw new RuntimeException("스크립트를 기록할 회의방을 찾지 못했습니다.");
		}
		System.out.println(roomCode+  " " +session + " " +script);
		List<String> originScripts = room.getOriginScript(); //스크립트 원본(\n포함)
		System.out.println("origin Script : " + originScripts);
		originScripts.add(script);
		Set<String> sessions = room.getNotSendScriptSessionIds();
		sessions.remove(session.getId());
		if(sessions.size() > 0) {
			return;
		}
		
		int numOfCli = originScripts.size(); //클라이언트 수
        int[] index = new int[numOfCli];
        int[] numOfLine = new int[numOfCli];
        String toNLP = "";
        int max = 0, sumOfLine = 0, seconds = 0, min = 86400, minIndex = 0;
        String result = "";

        //가장 행이 많은 스크립트를 기준으로 2차원 배열 생성
        for(int i=0;i<numOfCli;i++){
            String[] temp = originScripts.get(i).split("\\n");
            numOfLine[i] = temp.length;
            sumOfLine+=numOfLine[i];
            if(numOfLine[i]>max) max = temp.length;
        }
        String[][] lineScripts = new String[numOfCli][max];

        //스플릿으로 행으로 나누어 저장
        for(int i=0;i<numOfCli;i++){
            String[] temp = originScripts.get(i).split("\\n");
            for(int j=0;j<temp.length;j++){
                lineScripts[i][j] = temp[j];
            }
        }

        for(int i=0;i<sumOfLine;i++){
            for(int j=0;j<numOfCli;j++){
                if(index[j]<numOfLine[j]) {
                    String[] temp = lineScripts[j][index[j]].split(":");
                    seconds = Integer.parseInt(temp[0].substring(1, 3)) * 3600 + Integer.parseInt(temp[1]) * 60 + Integer.parseInt(temp[2].substring(0,2));
                    if (seconds < min) {
                        min = seconds;
                        minIndex = j;
                    }
                }
            }
            result = result + lineScripts[minIndex][index[minIndex]]+"\n";
            String[] temp = lineScripts[minIndex][index[minIndex]].split(":");
            toNLP = toNLP + temp[3]+"\n";
            index[minIndex]++;
            min = 86400;
        }
        System.out.println(result);
        
        Map<String, String> requestMap = new HashMap<>();
        requestMap.put("script", toNLP);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<String>(mapper.writeValueAsString(requestMap), headers);
        
        RestTemplate restTemplate = new RestTemplate();
        String tags = restTemplate.postForObject("https://3e9c627514cd.ngrok.io", entity, String.class);
        @SuppressWarnings("unchecked")
		Map<String, Object>  tagMap = mapper.readValue(tags, Map.class);
        System.out.println(tags);
        
        Map<String, Object> response = new HashMap<>();
        response.put("event", "tag");
        response.put("tags", tagMap.get("tags"));
        superBroadcast(roomCode, new TextMessage(mapper.writeValueAsString(response)));
	}
}