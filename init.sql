CREATE TABLE groups (
	id SERIAL PRIMARY KEY,
	groupname VARCHAR(1000)
);

INSERT INTO groups (groupname)
VALUES ('GROUP FOR EATING EATING EATING');

CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	firstName VARCHAR(30),
	lastName VARCHAR(30),
	email VARCHAR(30),
	groupid INTEGER REFERENCES groups(id)
);

INSERT INTO users (firstName, lastName, email, groupid)
VALUES ('TEST', 'TEST', 'TEST@TEST.com', 1);

CREATE TABLE goals (
	id SERIAL PRIMARY KEY,
	userid INTEGER REFERENCES users(id),
	goaldate DATE NOT NULL,
	goaltext VARCHAR(70),
	completed BOOLEAN NOT NULL
);

CREATE TABLE timers (
	id SERIAL PRIMARY KEY,
	userid INTEGER REFERENCES users(id),
	timerdate DATE NOT NULL,
	researchtime INT,
	writingtime INT,
	customtime INT
);

CREATE TABLE reflections (
	id SERIAL PRIMARY KEY,
	userid INTEGER REFERENCES users(id),
	reflectiondate DATE NOT NULL,
	reflectiontext VARCHAR(1000)
);

CREATE TABLE groupchat (
	id SERIAL PRIMARY KEY,
	groupid INTEGER REFERENCES groups(id),
	chattext VARCHAR(1000),
	chatdate VARCHAR(1000)
);