package com.mayorista.saas.shared.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SaaS Mayorista API")
                        .description("API REST del sistema SaaS multitenant para mayoristas.\n\n"
                                + "Endpoints de autenticación, productos, usuarios y ventas.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("SaaS Mayorista")
                                .email("dev@mayorista.local"))
                        .license(new License()
                                .name("Propietaria")
                                .url("https://mayorista.local")))
                .addSecurityItem(new SecurityRequirement().addList(SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SCHEME_NAME, new SecurityScheme()
                                .name(SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Token JWT de acceso. Se obtiene mediante POST /api/v1/auth/login")));
    }
}
