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

public class LoginActivity extends Activity {
    EditText id;
    Button login;

    WebSocketConnect wsc = new WebSocketConnect(this, this);

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        id = findViewById(R.id.et_id);
        login = findViewById(R.id.btn_login);

        login.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if(id.getText().toString().length()>0) {
                    Intent intent = new Intent(LoginActivity.this, ConnectActivity.class);
                    intent.putExtra("name", id.getText().toString());
                    startActivity(intent);
                }
                else
                    Toast.makeText(getApplicationContext(), "닉네임을 입력해주세요.", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
