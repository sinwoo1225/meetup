package com.example.meetingmanager;

import android.app.Activity;
import android.content.Context;
import android.widget.CheckBox;
import android.widget.TextView;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

public class FileIO {
    Activity activity;
    Context context;
    TextView id, pass;
    CheckBox remember;

    public FileIO(Activity activity, Context context){
        this.activity = activity;
        this.context = context;
    }

    public void loginFileRead(){ //자동완성 확인
        id = activity.findViewById(R.id.et_id);
        pass = activity.findViewById(R.id.et_pass);
        remember = activity.findViewById(R.id.cb_remember);

        try{
            int i = 0;
            BufferedReader br = new BufferedReader(new FileReader(context.getFilesDir()+"login.txt"));
            String str = null;
            while(((str = br.readLine()) != null)){
                if(i==0){
                    if(str=="0")
                        break;
                }
                else if(i==1) id.setText(str);
                else id.setText(str);
                remember.setChecked(true);
                i++;
            }
            br.close();
        }catch (FileNotFoundException e){
            try{ //최초 실행이라 파일 없을 시
                BufferedWriter bw = new BufferedWriter(new FileWriter(context.getFilesDir() + "login.txt", false));
                bw.close();
            }catch (Exception e2){
                e2.printStackTrace();
            }
            e.printStackTrace();
        }catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void loginInfoWrite(){ //자동완성 체크 시 정보 저장
        id = activity.findViewById(R.id.et_id);
        pass = activity.findViewById(R.id.et_pass);
        remember = activity.findViewById(R.id.cb_remember);
        try{
            BufferedWriter bw = new BufferedWriter(new FileWriter(context.getFilesDir() + "login.txt", false));
            if(remember.isChecked()) {
                bw.write("1\n");
                bw.write(id.getText()+"\n");
                bw.write(pass.getText()+"\n");
            }
            else bw.write("0\n");
            bw.close();
        }catch (Exception e){
            e.printStackTrace();
        }
    }
}
