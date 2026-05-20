package com.das.skillmatrix.service;

import java.util.Properties;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;

import com.das.skillmatrix.entity.SmtpConfig;

@Component
public class MailSenderFactory {

    public JavaMailSender build(SmtpConfig config) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(config.getHost());
        sender.setPort(config.getPort());
        sender.setUsername(config.getUsername());
        sender.setPassword(config.getPasswordEncrypted());
        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", config.getUsername() != null);
        props.put("mail.smtp.starttls.enable", config.isUseTls());
        return sender;
    }
}
