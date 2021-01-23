package kr.ac.skuniv;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

@Configuration
@EnableWebSocket
@EnableAsync
public class WebSocketConfig implements WebSocketConfigurer {
    private final TextWebSocketHandler webSocketHandler;
    private final HttpSessionHandshakeInterceptor interceptor;

    public WebSocketConfig(TextWebSocketHandler webSocketHandler, HttpSessionHandshakeInterceptor interceptor) {
        this.webSocketHandler = webSocketHandler;
        this.interceptor = interceptor;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(webSocketHandler, "/ws").addInterceptors(interceptor).setAllowedOrigins("*");
    }

}