package com.das.skillmatrix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "smtp_config")
@Getter
@Setter
@NoArgsConstructor
public class SmtpConfig extends BaseEntity {

    public static final Long SINGLETON_ID = 1L;

    @Id
    private Long id;

    @Column(nullable = false, length = 255)
    private String host;

    @Column(nullable = false)
    private int port;

    @Column(length = 255)
    private String username;

    @Column(name = "password_encrypted", length = 1024)
    private String passwordEncrypted;

    @Column(name = "from_email", nullable = false, length = 255)
    private String fromEmail;

    @Column(name = "from_name", length = 255)
    private String fromName;

    @Column(name = "use_tls", nullable = false)
    private boolean useTls = true;
}
