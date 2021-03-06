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
VALUES ('STANDARD GROUP');

CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	firstName TEXT,
	lastName TEXT,
	email TEXT UNIQUE,
	groupid INTEGER REFERENCES groups(id),
	hidetimer BOOLEAN,
	hidereflection BOOLEAN,
	classid INTEGER REFERENCES classes(id),
	hideweeklygoals BOOLEAN
);

INSERT INTO users (firstName, lastName, email, groupid, classid)
VALUES ('TEST', 'TEST', 'TEST@TEST.com', 1, 1);

CREATE TABLE goals (
	id SERIAL PRIMARY KEY,
	userid INTEGER REFERENCES users(id) ON DELETE CASCADE,
	goaldate DATE NOT NULL,
	goaltext TEXT,
	completed BOOLEAN NOT NULL,
	priority INTEGER
);

CREATE TABLE subgoals (
	id SERIAL PRIMARY KEY,
	userid INTEGER REFERENCES users(id) ON DELETE CASCADE,
	parentgoal INTEGER REFERENCES goals(id) ON DELETE CASCADE,
	goaldate DATE NOT NULL,
	goaltext TEXT,
	completed BOOLEAN NOT NULL
);

CREATE TABLE weeklygoals (
	id SERIAL PRIMARY KEY,
	userid INTEGER REFERENCES users(id) ON DELETE CASCADE,
	goaldate DATE NOT NULL,
	goaltext TEXT,
	completed BOOLEAN NOT NULL,
	completedate DATE,
	priority INTEGER
);

CREATE TABLE weeklysubgoals (
	id SERIAL PRIMARY KEY,
	userid INTEGER REFERENCES users(id) ON DELETE CASCADE,
	parentgoal INTEGER REFERENCES weeklygoals(id) ON DELETE CASCADE,
	goaldate DATE NOT NULL,
	goaltext TEXT,
	completed BOOLEAN NOT NULL
);

CREATE TABLE timers (
	id SERIAL PRIMARY KEY,
	userid INTEGER REFERENCES users(id) ON DELETE CASCADE,
	timerdate DATE NOT NULL,
	researchtime INT,
	writingtime INT,
	customtime INT
);

CREATE TABLE customtimers (
	id SERIAL PRIMARY KEY,
	userid INTEGER REFERENCES users(id) ON DELETE CASCADE,
	timerdate DATE NOT NULL,
	time INT,
	name TEXT
)

CREATE TABLE reflections (
	id SERIAL PRIMARY KEY,
	userid INTEGER REFERENCES users(id) ON DELETE CASCADE,
	reflectiondate DATE NOT NULL,
	reflectiontext TEXT
);

CREATE TABLE groupchat (
	id SERIAL PRIMARY KEY,
	groupid INTEGER REFERENCES groups(id) ON DELETE CASCADE,
	chattext TEXT,
	chatdate TEXT,
	userid INTEGER REFERENCES users(id) ON DELETE CASCADE,
	username TEXT
);

CREATE TABLE grouplinks (
	id SERIAL PRIMARY KEY, 
	groupid INTEGER REFERENCES groups(id) ON DELETE CASCADE, 
	link TEXT, 
	title TEXT,
	linkdate TEXT,
	userid INTEGER REFERENCES users(id) ON DELETE CASCADE,
	username TEXT 
);

CREATE TABLE forum (
	id SERIAL PRIMARY KEY,
	title TEXT,
	body TEXT,
	userid INTEGER REFERENCES users(id) ON DELETE CASCADE,
	username TEXT,
	postdate TEXT,
	classid INTEGER
);

INSERT INTO forum (id, title, body, userid, username, postdate, classid)
VALUES (1, 'a title', 'a body', 1, 'A username', '2019-09-09', 1);

CREATE TABLE forumcomment (
	id SERIAL PRIMARY KEY,
	body TEXT,
	userid INTEGER REFERENCES users(id) ON DELETE CASCADE,
	postid INTEGER REFERENCES forum(id) ON DELETE CASCADE,
	username TEXT,
	commentdate TEXT
);

CREATE TABLE notes (
	id SERIAL PRIMARY KEY,
	userid INTEGER REFERENCES users(id) ON DELETE CASCADE,
	notedate TEXT,
	notetext TEXT
);

CREATE TABLE reflectionquestion (
	id SERIAL PRIMARY KEY,
	classid INTEGER REFERENCES classes(id) ON DELETE CASCADE,
	questionone TEXT,
	questiontwo TEXT,
	questionthree TEXT,
	additionalquestions TEXT ARRAY
);

CREATE TABLE classlinks (
	id SERIAL PRIMARY KEY,
	classid INTEGER REFERENCES classes(id) ON DELETE CASCADE,
	linkname TEXT,
	linkurl TEXT
);

INSERT INTO reflectionquestion (classid, questionone, questiontwo, questionthree, additionalquestions)
VALUES (1, 'What obstacles did you encounter, if any?', 'What are some opportunities for improvement?', 'Any wins for the day worth recording?', '{}');