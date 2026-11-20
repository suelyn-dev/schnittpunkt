CREATE SCHEMA `friseur`;

USE friseur;

CREATE TABLE kunden (
    kunden_id INT AUTO_INCREMENT,
    vorname   VARCHAR(100) NOT NULL,
    nachname  VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    telefon VARCHAR(30) NOT NULL UNIQUE,
    PRIMARY KEY (kunden_id)
);

CREATE TABLE leistung (
	leistung_id INT AUTO_INCREMENT,
    bezeichnung VARCHAR(100) NOT NULL,
    dauer INT NOT NULL,
	preis DECIMAL(7, 2) NOT NULL,
	PRIMARY KEY (leistung_id)
);

CREATE TABLE mitarbeiter (
	mitarbeiter_id INT AUTO_INCREMENT,
    vorname   VARCHAR(100) NOT NULL,
    nachname  VARCHAR(100),
    status_verfuegbar BOOLEAN DEFAULT 1,
    PRIMARY KEY (mitarbeiter_id)
);

ALTER TABLE mitarbeiter ADD COLUMN passwort VARCHAR(50);
ALTER TABLE mitarbeiter MODIFY COLUMN passwort VARCHAR(255);

ALTER TABLE mitarbeiter
	MODIFY status_verfuegbar ENUM("verfügbar", "urlaub", "inaktiv") NOT NULL DEFAULT "verfügbar";
    
CREATE TABLE mitarbeiter_leistung (
    mitarbeiter_id INT NOT NULL,
    leistung_id INT NOT NULL,
    PRIMARY KEY (mitarbeiter_id, leistung_id),
    FOREIGN KEY (mitarbeiter_id) REFERENCES mitarbeiter(mitarbeiter_id) ON DELETE CASCADE,
    FOREIGN KEY (leistung_id) REFERENCES leistung(leistung_id) ON DELETE CASCADE
);

CREATE TABLE termin (
	termin_id INT AUTO_INCREMENT,
	datum DATE NOT NULL,
    startzeit TIME NOT NULL,
    endzeit TIME NOT NULL,
    kunden_id INT NOT NULL,
    mitarbeiter_id INT NOT NULL,
    leistung_id INT NOT NULL,
    abgeschlossen BOOLEAN DEFAULT 0,
    status_aktiv BOOLEAN DEFAULT 1,
    PRIMARY KEY (termin_id),
    UNIQUE (mitarbeiter_id, datum, startzeit),
    FOREIGN KEY (kunden_id) REFERENCES kunden (kunden_id),
	FOREIGN KEY (mitarbeiter_id, leistung_id) 
        REFERENCES mitarbeiter_leistung (mitarbeiter_id, leistung_id)
);
ALTER TABLE termin 
	MODIFY startzeit DATETIME,
    MODIFY endzeit DATETIME;

ALTER TABLE termin
	DROP COLUMN abgeschlossen,
    DROP COLUMN status_aktiv,
    ADD COLUMN status ENUM("offen", "erledigt", "storniert") NOT NULL DEFAULT "offen";

ALTER TABLE termin
    MODIFY COLUMN status ENUM("offen", "erledigt", "no-show", "storniert") NOT NULL DEFAULT "offen";

-- stornierungen
ALTER TABLE termin 
ADD COLUMN storno_token VARCHAR(64) UNIQUE;

-- Dateneingabe
INSERT INTO leistung (bezeichnung, dauer, preis) VALUES
	("Herrenschnitt", 30, 28),
    ("Damenschnitt", 45, 42),
    ("Waschen & Föhnen", 30, 22),
    ("Kinderschnitt", 20, 16),
    ("Bartpflege", 15, 12),
    ("Färben", 90, 75);
    
INSERT INTO mitarbeiter (vorname) VALUES ("Sabine"), ("Mara"), ("Jonas"), ("Lena");
UPDATE mitarbeiter SET nachname = "Kowalski" WHERE mitarbeiter_id = 1; 
UPDATE mitarbeiter SET status_verfuegbar = "inaktiv" WHERE mitarbeiter_id = 4;

INSERT INTO mitarbeiter_leistung (mitarbeiter_id, leistung_id) VALUES
	(1,1),(1,2),(1,3),(1,4),(1,5),(1,6),
    (2,1),(2,2),(2,3),(2,4),(2,5),(2,6),
    (3,1),(3,3),(3,4),(3,5),
    (4,1),(4,2),(4,3),(4,4),(4,5),(4,6);
    
-- Datenausgaben
-- Übersicht alle Leistungen
SELECT 
    l.bezeichnung AS LEISTUNG,
    CONCAT(l.dauer, ' Min') AS DAUER,
    CONCAT(REPLACE(l.preis, '.', ','), ' €') AS PREIS,
    GROUP_CONCAT(m.vorname ORDER BY m.mitarbeiter_id SEPARATOR ', ') AS PERSONEN
FROM leistung l
LEFT JOIN mitarbeiter_leistung ml ON l.leistung_id = ml.leistung_id
LEFT JOIN mitarbeiter m ON ml.mitarbeiter_id = m.mitarbeiter_id 
    AND m.status_verfuegbar = "verfügbar"
GROUP BY l.leistung_id, l.bezeichnung, l.dauer, l.preis
ORDER BY l.leistung_id;

SELECT m.vorname AS MITARBEITER, l.bezeichnung AS LEISTUNG
FROM mitarbeiter m
LEFT JOIN mitarbeiter_leistung ml ON m.mitarbeiter_id = ml.mitarbeiter_id
LEFT JOIN leistung l ON ml.leistung_id = l.leistung_id
WHERE m.status_verfuegbar = 'verfügbar';

SELECT startzeit, endzeit 
FROM termin 
WHERE mitarbeiter_id = 1 
  AND datum = '2026-11-19' 
  AND status != 'storniert';

-- Dauer der Leistung id=1 --> Herrenschnitt
SELECT bezeichnung, dauer FROM leistung WHERE leistung_id = 1;

-- Mitarbeiter, die Herrenschnitt anbieten
SELECT m.mitarbeiter_id, m.vorname, m.nachname
     FROM mitarbeiter m
     INNER JOIN mitarbeiter_leistung ml ON m.mitarbeiter_id = ml.mitarbeiter_id
     WHERE ml.leistung_id = 1
       AND m.status_verfuegbar = 'verfügbar';

-- Freie Termine in den nächsten 3 Monaten       
SELECT mitarbeiter_id, datum, startzeit, endzeit
     FROM termin
     WHERE datum BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 MONTH)
       AND status != 'storniert';
       
-- Bestandskunden checken
SELECT kunden_id FROM kunden WHERE telefon = 01701111111;

-- Kunde anlegen
INSERT INTO kunden (vorname, nachname, email, telefon) VALUES ("Test", "Kunde", "testkunde@gmail.com", "0800900900");

-- Termin anlegen
INSERT INTO termin (datum, startzeit, endzeit, kunden_id, mitarbeiter_id, leistung_id, storno_token)
SELECT 
    '2026-11-25', 
    '2026-11-25 14:00:00', 
    DATE_ADD('2026-11-25 14:00:00', INTERVAL dauer MINUTE), 
    1, 
    2, 
    1, 
    '550e8400-e29b-41d4-a716-446655440000'
FROM leistung 
WHERE leistung_id = 1;

-- Termin absagen
UPDATE termin 
     SET status = 'storniert' 
     WHERE storno_token = '550e8400-e29b-41d4-a716-446655440000' 
       AND status != 'storniert' 
       AND startzeit > NOW() + INTERVAL 24 HOUR;

-- Alle Termine von heute pro Mitarbeiter mit Zeit, Leistung, Kunde und Telefonnummer
SELECT 
  t.startzeit,
  t.endzeit,
  l.bezeichnung AS leistung,
  k.vorname AS kunde_vorname,
  k.nachname AS kunde_nachname,
  k.telefon
FROM termin t
LEFT JOIN kunden k ON t.kunden_id = k.kunden_id
LEFT JOIN leistung l ON t.leistung_id = l.leistung_id
WHERE t.mitarbeiter_id = 1
  AND t.datum = current_date()
  AND t.status = 'offen'
ORDER BY t.startzeit;

-- Alle gebuchten Termine
SELECT 
  m.vorname AS mitarbeiter,
  t.startzeit,
  t.endzeit,
  t.termin_id,
  l.bezeichnung AS leistung,
  k.vorname AS kunde_vorname,
  k.nachname AS kunde_nachname,
  k.telefon
FROM termin t
LEFT JOIN kunden k ON t.kunden_id = k.kunden_id
LEFT JOIN leistung l ON t.leistung_id = l.leistung_id
LEFT JOIN mitarbeiter m ON m.mitarbeiter_id = t.mitarbeiter_id
WHERE t.status = 'offen'
ORDER BY t.startzeit;

-- Termin löschen anhand der ID
DELETE FROM termin WHERE termin_id = 11;

-- Alle Tagesansichten
SELECT 
      m.mitarbeiter_id,
      m.vorname AS mitarbeiter,
      t.termin_id,
      t.startzeit,
      t.endzeit,
      l.bezeichnung AS leistung,
      k.vorname AS kunde_vorname,
      k.nachname AS kunde_nachname,
      k.telefon
    FROM termin t
    LEFT JOIN kunden k ON t.kunden_id = k.kunden_id
    LEFT JOIN leistung l ON t.leistung_id = l.leistung_id
    LEFT JOIN mitarbeiter m ON m.mitarbeiter_id = t.mitarbeiter_id
    WHERE t.datum = CURRENT_DATE()
      AND t.status = 'offen'
    ORDER BY m.vorname, t.startzeit;
    
select * from kunden;
select * from mitarbeiter;
select * from termin;
select * from leistung;
