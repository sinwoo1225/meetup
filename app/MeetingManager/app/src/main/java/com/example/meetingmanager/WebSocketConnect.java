package com.example.meetingmanager;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.widget.Toast;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;

import static android.content.ContentValues.TAG;

public class WebSocketConnect {
    Activity activity;
    Context context;
    ObjectMapper mapper = new ObjectMapper();
    String jsonString, id, pass, email, roomNum;
    Map<String, Object> map = new HashMap<>();
    int type, check;
    final String loginURI = "wss://1a81e5e7ba40.ngrok.io/ws";

    WebSocketClient mWebSocketClient;

    public WebSocketConnect(Activity activity, Context context){
        this.activity = activity;
        this.context = context;
    }

    public void test(String id, String roomNum){
        this.id = id;
        this.roomNum = roomNum;
        Log.i("Websocket", "id : " + id + ", roomNum : " + roomNum);
        connectWebSocket();
    }

    private void connectWebSocket() { //웹소켓 연결
        URI uri;
        try {
            uri = new URI(loginURI);
        } catch (URISyntaxException e) {
            e.printStackTrace(); return;
        }
        Log.i("Websocket", "hik");

        mWebSocketClient = new WebSocketClient(uri) {
            @Override
            public void onOpen(ServerHandshake serverHandshake) {
                Log.i("Websocket", "Opened");
                JSONObject json = new JSONObject();
                try {
                    json.put("event", "echo");
                    json.put("id", id);
                    json.put("roomNum", roomNum);
                    Log.i("Websocket", "C->WSS: " + json.toString());
                    mWebSocketClient.send(json.toString());
                } catch (JSONException e) {
                    e.printStackTrace(); return;
                }
            }
            @Override
            public void onMessage(String s) { //답장받기
                Log.i("Websocket", "OnMessage");
                final String message = s;
                activity.runOnUiThread(new Runnable() {
                    @Override public void run() {
                        try {
                            String rcv = message;
                            map = mapper.readValue(rcv, Map.class);
                            jsonString = mapper.writeValueAsString(map);
                            Log.i("Websocket", jsonString);
                        }catch(IOException e) {
                            e.printStackTrace(); return;
                        }
                    }
                });
            }
            @Override
            public void onClose(int i, String s, boolean b) {
                Log.i("Websocket", "Closed " + s);
            }
            @Override public void onError(Exception e) {
                Log.i("Websocket", "Error " + e.getMessage());
            }
        };
        mWebSocketClient.connect();
    }
}
