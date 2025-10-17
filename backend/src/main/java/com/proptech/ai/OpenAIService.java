package com.proptech.ai;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.net.ConnectException;
import java.net.UnknownHostException;
import java.net.http.HttpConnectTimeoutException;
import java.net.http.HttpTimeoutException;

import org.jboss.logging.Logger;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class OpenAIService {

	private static final Logger LOG = Logger.getLogger(OpenAIService.class);

	@Inject
	ObjectMapper objectMapper;

	@ConfigProperty(name = "openai.api.key")
	Optional<String> configuredApiKey;

	@ConfigProperty(name = "openai.api.url", defaultValue = "https://api.openai.com/v1/chat/completions")
	String apiUrl;

	@ConfigProperty(name = "openai.model", defaultValue = "gpt-4o-mini")
	String model;

	@ConfigProperty(name = "openai.timeout.seconds", defaultValue = "30")
	int timeoutSeconds;

	public String chatCompletion(String systemPrompt, String userPrompt) {
		String apiKey = resolveApiKey();
		if (apiKey == null || apiKey.isBlank()) {
			throw new IllegalStateException("OPENAI_API_KEY no configurada");
		}
		try {
			HttpClient client = HttpClient.newBuilder()
					.connectTimeout(Duration.ofSeconds(timeoutSeconds))
					.build();

			Map<String, Object> systemMessage = new HashMap<>();
			systemMessage.put("role", "system");
			systemMessage.put("content", systemPrompt);

			Map<String, Object> userMessage = new HashMap<>();
			userMessage.put("role", "user");
			userMessage.put("content", userPrompt);

			Map<String, Object> body = new HashMap<>();
			body.put("model", model);
			body.put("messages", List.of(systemMessage, userMessage));
			body.put("temperature", 0.7);
			body.put("max_tokens", 400);

			String json = objectMapper.writeValueAsString(body);

			HttpRequest request = HttpRequest.newBuilder()
					.uri(URI.create(apiUrl))
					.header("Authorization", "Bearer " + apiKey)
					.header("Content-Type", "application/json")
					.timeout(Duration.ofSeconds(timeoutSeconds))
					.POST(HttpRequest.BodyPublishers.ofString(json))
					.build();

			HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() >= 200 && response.statusCode() < 300) {
				JsonNode root = objectMapper.readTree(response.body());
				JsonNode choices = root.path("choices");
				if (choices.isArray() && choices.size() > 0) {
					JsonNode message = choices.get(0).path("message");
					String content = message.path("content").asText("");
					return content != null ? content.trim() : "";
				}
				return "";
			} else {
				LOG.errorf("OpenAI API error %d: %s", response.statusCode(), response.body());
				throw new RuntimeException("Error en OpenAI API: " + response.statusCode());
			}
		} catch (Exception e) {
			String diagnosis = diagnoseNetworkIssue(e);
			LOG.errorf("Fallo llamando a OpenAI (url=%s, model=%s, keyPresent=%s, timeout=%ds): %s", apiUrl, model, (resolveApiKey() != null), timeoutSeconds, diagnosis);
			LOG.debug("Stacktrace OpenAI", e);
			throw new RuntimeException("No se pudo generar la descripción (" + diagnosis + ")", e);
		}
	}

	private String resolveApiKey() {
		if (configuredApiKey != null && configuredApiKey.isPresent() && !configuredApiKey.get().isBlank()) {
			return configuredApiKey.get();
		}
		String envKey = System.getenv("OPENAI_API_KEY");
		return envKey;
	}

	private String diagnoseNetworkIssue(Throwable e) {
		Throwable root = getRootCause(e);
		if (root instanceof UnknownHostException) {
			return "DNS/hostname no resuelto";
		}
		if (root instanceof ConnectException || root instanceof HttpConnectTimeoutException) {
			return "Conexión rechazada/timeout de conexión";
		}
		if (root instanceof HttpTimeoutException) {
			return "Timeout de la solicitud";
		}
		String msg = root != null && root.getMessage() != null ? root.getMessage() : e.getMessage();
		return msg != null ? msg : "error de red desconocido";
	}

	private Throwable getRootCause(Throwable e) {
		Throwable cause = e;
		while (cause.getCause() != null && cause.getCause() != cause) {
			cause = cause.getCause();
		}
		return cause;
	}
}


