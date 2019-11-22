CREATE TABLE classes (
	id SERIAL PRIMARY KEY,
	classname TEXT
);

INSERT INTO classes (classname)
VALUES ('A CLASS');

CREATE TABLE groups (
	id SERIAL PRIMARY KEY,
	groupname TEXT
);

INSERT INTO groups (groupname)
VALUES ('GROUP FOR EATING EATING EATING');

CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	firstName TEXT,
	lastName TEXT,
	email TEXT UNIQUE,
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
	goaltext TEXT,
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
	reflectiontext TEXT
);

CREATE TABLE groupchat (
	id SERIAL PRIMARY KEY,
	groupid INTEGER REFERENCES groups(id),
	chattext TEXT,
	chatdate TEXT,
	userid INTEGER REFERENCES users(id),
	username TEXT
);

CREATE TABLE forum (
	id SERIAL PRIMARY KEY,
	title TEXT,
	body TEXT,
	userid INTEGER REFERENCES users(id),
	username TEXT,
	postdate TEXT
);

INSERT INTO forum (id, title, body, userid, username, postdate)
VALUES (1, 'a title', 'a body', 1, 'A username', '2019-09-09');

CREATE TABLE forumcomment (
	id SERIAL PRIMARY KEY,
	body TEXT,
	userid INTEGER REFERENCES users(id),
	postid INTEGER REFERENCES forum(id),
	username TEXT,
	commentdate TEXT
);

CREATE TABLE notes (
	id SERIAL PRIMARY KEY,
	userid INTEGER REFERENCES users(id),
	notedate TEXT,
	notetext TEXT
);