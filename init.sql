CREATE TABLE users (
	ID SERIAL PRIMARY KEY,
	firstName VARCHAR(30),
	lastName VARCHAR(30),
	email VARCHAR(30)
);

INSERT INTO users (firstName, lastName, email)
VALUES ('Yo', 'Yo', 'yo@yo.com'), ('Bruh', 'Bruh', 'Bruh@bruh.com');