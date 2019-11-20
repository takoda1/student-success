CREATE TABLE classes (
	id SERIAL PRIMARY KEY,
	classname VARCHAR(1000)
);

INSERT INTO classes (classname)
VALUES ('A CLASS');

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
	groupid INTEGER REFERENCES groups(id),
	hidetimer BOOLEAN,
	hidereflection BOOLEAN,
	classid INTEGER REFERENCES classes(id)
);

INSERT INTO users (firstName, lastName, email, groupid, classid)
VALUES ('TEST', 'TEST', 'TEST@TEST.com', 1, 1);

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
	chatdate VARCHAR(1000),
	userid INTEGER REFERENCES users(id),
	username VARCHAR(100)
);

CREATE TABLE forum (
	id SERIAL PRIMARY KEY,
	title VARCHAR(500),
	body VARCHAR(8000),
	userid INTEGER REFERENCES users(id),
	username VARCHAR(200),
	postdate VARCHAR(200)
);

CREATE TABLE forumcomment (
	id SERIAL PRIMARY KEY,
	body VARCHAR(8000),
	userid INTEGER REFERENCES users(id),
	postid INTEGER REFERENCES forum(id),
	username VARCHAR(200),
	commentdate VARCHAR(200)
);

CREATE TABLE notes (
	id SERIAL PRIMARY KEY,
	userid INTEGER REFERENCES users(id),
	notedate VARCHAR(200),
	notetext VARCHAR(8000)
);