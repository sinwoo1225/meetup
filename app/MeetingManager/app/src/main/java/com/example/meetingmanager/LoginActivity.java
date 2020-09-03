package com.example.meetingmanager;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;

public class LoginActivity extends Activity {
    ObjectMapper mapper = new ObjectMapper();
    String jsonString;
    Map<String, Object> map = new HashMap<>();
    EditText id, pass, email;
    Button login, register;
    CheckBox remember;
    TextView forget;
    FileIO fileio = new FileIO(this, this);
    int mode=0; //0이면 로그인, 1이면 회원가입
    final String loginURI = "ws://videochat.paas-ta.org/ws";

    WebSocketClient mWebSocketClient;

    @Override
    public void onContentChanged() { //자동완성 확인
        super.onContentChanged();
        fileio.loginFileRead();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        id = findViewById(R.id.et_id);
        pass = findViewById(R.id.et_pass);
        email = findViewById(R.id.et_email);
        login = findViewById(R.id.btn_login);
        register = findViewById(R.id.btn_register);
        remember = findViewById(R.id.cb_remember);
        forget = findViewById(R.id.tv_forget);

        login.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if(mode==0) { //로그인 시도
                    connectWebSocket();
                }
                else{ //회원가입 시도
                    connectWebSocket();
                    remember.setVisibility(View.VISIBLE);
                    email.setVisibility(View.INVISIBLE);
                    login.setText("sign in");
                    register.setText("sign up");
                    mode=0;
                }
            }
        });
        register.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) { //로그인-회원가입 모드 변경
                if(mode==0) {
                    remember.setVisibility(View.INVISIBLE);
                    email.setVisibility(View.VISIBLE);
                    login.setText("CONFIRM");
                    register.setText("CANCEL");
                    mode=1;
                }
                else{
                    remember.setVisibility(View.VISIBLE);
                    email.setVisibility(View.INVISIBLE);
                    login.setText("sign in");
                    register.setText("sign up");
                    mode=0;
                }
            }
        });
        forget.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(LoginActivity.this, MainActivity.class);
                startActivity(intent);
            }
        });
    }

    private void connectWebSocket() { //웹소켓 연결
        id = findViewById(R.id.et_id);
        pass = findViewById(R.id.et_pass);
        email = findViewById(R.id.et_email);
        URI uri;
        try {
            uri = new URI(loginURI);
        } catch (URISyntaxException e) {
            e.printStackTrace(); return;
        }
        mWebSocketClient = new WebSocketClient(uri) {
            @Override
            public void onOpen(ServerHandshake serverHandshake) {
                Log.i("Websocket", "Opened");
                String hi;
                if(mode==0) //로그인이면 1(로그인 타입코드), ID, password 전송
                    hi = "{ \"type\" : 1, \"ID\" : \""+id.getText()+"\" , \"pass\" : \""+pass.getText()+"\" }";
                else //회원가입이면 2(회원가입 타입코드), ID, password, email 전송
                    hi = "{ \"type\" : 2, \"ID\" : \""+id.getText()+"\" , \"pass\" : \""+pass.getText()+"\" , \"email\" : \""+email.getText()+"\" }";
                try {
                    map = mapper.readValue(hi, Map.class);
                    jsonString = mapper.writeValueAsString(map);
                }catch(IOException e) {
                    e.printStackTrace(); return;
                }
                mWebSocketClient.send(jsonString);
            }
            @Override
            public void onMessage(String s) { //답장받기
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
                        //TextView textView = (TextView)findViewById(R.id.messages);
                        //textView.setText(textView.getText() + "\n" + jsonString);
                        if(jsonString=="Success"){
                            if(mode==0) {
                                //fileio.loginInfoWrite();
                                Intent intent = new Intent(LoginActivity.this, MainActivity.class);
                                startActivity(intent);
                            }
                            else
                                Toast.makeText(getApplicationContext(),"Signed up successfully.", Toast.LENGTH_SHORT).show();
                        }
                        else{
                            Toast.makeText(getApplicationContext(),"Wrong Information. Try again.", Toast.LENGTH_SHORT).show();
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
