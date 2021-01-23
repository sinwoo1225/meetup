package kr.ac.skuniv.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;


public class ScriptDto {

    @Data
    @AllArgsConstructor
    @Builder
    public static class Info {
        private String script;
        private String result;
    }

    @Data
    @AllArgsConstructor
    @Builder
    public static class Response {
        private String tags;
    }
}
