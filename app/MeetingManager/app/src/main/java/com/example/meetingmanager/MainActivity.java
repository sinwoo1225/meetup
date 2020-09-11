package com.example.meetingmanager;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import androidx.core.app.ActivityCompat;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;

public class MainActivity extends Activity{
    ObjectMapper mapper = new ObjectMapper();
    String jsonString, msg;
    Map<String, Object> map = new HashMap<>();

    WebSocketClient mWebSocketClient;

    Button createRoom, joinRoom, setting;
    EditText roomID;

    final String serverUri = "ws://videochat.paas-ta.org/ws";

    ConnectActivity ca = new ConnectActivity();

    int PERMISSION_ALL = 1;
    String[] PERMISSIONS = {
            android.Manifest.permission.RECORD_AUDIO,
            android.Manifest.permission.WRITE_EXTERNAL_STORAGE,
            android.Manifest.permission.CAMERA,
            android.Manifest.permission.CHANGE_NETWORK_STATE,
            android.Manifest.permission.MODIFY_AUDIO_SETTINGS,
            android.Manifest.permission.BLUETOOTH,
            android.Manifest.permission.ACCESS_NETWORK_STATE,
            android.Manifest.permission.INTERNET
    };
    public boolean hasPermissions(Context context, String... permissions) {
        if (context != null && permissions != null) {
            for (String permission : permissions) {
                if (ActivityCompat.checkSelfPermission(context, permission) != PackageManager.PERMISSION_GRANTED) {
                    return false;
                }
            }
        }
        return true;
    }

    private void connectWebSocket() {
        URI uri;
        try {
            uri = new URI(serverUri);
        } catch (URISyntaxException e) {
            e.printStackTrace(); return;
        }
        mWebSocketClient = new WebSocketClient(uri) {
            @Override
            public void onOpen(ServerHandshake serverHandshake) {
                Log.i("Websocket", "Opened");

                String hi = "{ \"messages\" : \""+msg+" }";;
                try {
                    map = mapper.readValue(hi, Map.class);
                    jsonString = mapper.writeValueAsString(map);
                }catch(IOException e) {
                    e.printStackTrace(); return;
                }
                mWebSocketClient.send(jsonString);
            }
            @Override
            public void onMessage(String s) {
                Log.i("Websocket", "OnMessage");
                final String message = s;
                runOnUiThread(new Runnable() {
                    @Override public void run() {
                        try {
                            String rcv = message;
                            map = mapper.readValue(rcv, Map.class);
                            jsonString = mapper.writeValueAsString(map);
                        }catch(IOException e) {
                            e.printStackTrace(); return;
                        }

                        TextView textView = (TextView)findViewById(R.id.tv_test);
                        textView.setText(textView.getText() + "\n" + jsonString);
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

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        createRoom = findViewById(R.id.btn_createRoom);
        joinRoom = findViewById(R.id.btn_joinRoom);
        setting = findViewById(R.id.btn_setting);
        roomID = findViewById(R.id.et_roomID);
        createRoom.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                msg="CREATE";
                connectWebSocket();
            }
        });
        joinRoom.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                //Intent intent = new Intent(MainActivity.this, ConnectActivity.class);
                //startActivity(intent);
                ca.connectFromMain(roomID.getText().toString(), this);
                /*msg="JOIN";
                connectWebSocket();*/
            }
        });
        setting.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(MainActivity.this, SettingActivity.class);
                startActivity(intent);
            }
        });
        if(!hasPermissions(this, PERMISSIONS)){
            ActivityCompat.requestPermissions(this, PERMISSIONS, PERMISSION_ALL);
        }

    }

}