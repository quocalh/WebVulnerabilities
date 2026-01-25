CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    password VARCHAR(50),
    role VARCHAR(10),
    email VARCHAR(100)
);

INSERT INTO users (username, password, role, email) VALUES 
('admin', 'secret_admin_pass', 'admin', 'admin@fcode.org'),
('developer', 'dev_master_key', 'admin', 'dev@fcode.org'),
('tuannv', '123456', 'user', 'tuan@fcode.org'),
('mod', 'modpass', 'user', 'mod@fcode.org'),
('bacon', 'ba123', 'user', 'bacon@roblox.com'),
('longle', 'longdz', 'user', 'long@fcode.org'),
('alice', 'wonderland', 'user', 'alice@example.com'),
('test_account', '12345678', 'user', 'test@test.com'),
('bob', 'builder', 'guest', 'bob@construction.com');