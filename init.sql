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

INSERT INTO goals (userId, goalDate, goalText, completed)
VALUES ('1', '2019-09-14', 'TEST', TRUE), ('1', '2019-09-14', 'TEST2', FALSE);

CREATE TABLE timers (
	id SERIAL PRIMARY KEY,
	userid INTEGER REFERENCES users(id),
	timerdate DATE NOT NULL,
	researchtime INT,
	writingtime INT,
	customtime INT
);

INSERT INTO timers (userId, timerdate, researchtime, writingtime, customtime)
VALUES ('1', '2019-09-14', '45', '1000', '11'), ('1', '2019-09-15', '22233', '223', '4454');

CREATE TABLE reflections (
	id SERIAL PRIMARY KEY,
	userid INTEGER REFERENCES users(id),
	reflectiondate DATE NOT NULL,
	reflectiontext VARCHAR(1000)
);

INSERT INTO reflections (userid, reflectiondate, reflectiontext)
VALUES ('1', '2019-09-14', 'I LOVE ESSAYS -- SAID NO ONE EVER');
