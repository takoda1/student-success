CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	firstName VARCHAR(30),
	lastName VARCHAR(30),
	email VARCHAR(30)
);

INSERT INTO users (firstName, lastName, email)
VALUES ('TEST', 'TEST', 'TEST@TEST.com');

CREATE TABLE goals (
	id SERIAL PRIMARY KEY,
	userId INTEGER REFERENCES users(id),
	goaldate DATE NOT NULL,
	goaltext VARCHAR(70),
	completed BOOLEAN NOT NULL
);

INSERT INTO goals (userId, goalDate, goalText, completed)
VALUES ('1', '2019-09-14', 'TEST', TRUE), ('1', '2019-09-14', 'TEST2', FALSE);