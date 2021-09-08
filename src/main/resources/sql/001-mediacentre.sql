CREATE SCHEMA mediacentre;
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE TABLE mediacentre.scripts (
    filename character varying(255) NOT NULL,
    passed timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT scripts_pkey PRIMARY KEY (filename)
);

CREATE TABLE mediacentre.signet (
    id serial NOT NULL,
    resource_id character varying NOT NULL,
    discipline_label character varying[],
    level_label character varying[],
    key_words character varying[],
    title character varying,
    imageurl character varying,
    owner_name character varying,
    owner_id character varying,
    url character varying,
    favorite boolean DEFAULT false,
    collab boolean NOT NULL DEFAULT FALSE,
    archived boolean NOT NULL DEFAULT FALSE,
    date_creation timestamp with time zone,
    date_modification timestamp with time zone
);

CREATE TABLE mediacentre.disciplines (
    id bigint NOT NULL,
    label character varying NOT NULL
);

INSERT INTO mediacentre.disciplines VALUES (1, 'activités pluridisciplinaires');
INSERT INTO mediacentre.disciplines VALUES (2, 'agroéquipements');
INSERT INTO mediacentre.disciplines VALUES (3, 'agronomie');
INSERT INTO mediacentre.disciplines VALUES (4, 'aide individuelle en français');
INSERT INTO mediacentre.disciplines VALUES (5, 'aide individuelle en mathématiques');
INSERT INTO mediacentre.disciplines VALUES (6, 'aménagement paysager');
INSERT INTO mediacentre.disciplines VALUES (7, 'aménagements des espaces naturels');
INSERT INTO mediacentre.disciplines VALUES (8, 'animalerie');
INSERT INTO mediacentre.disciplines VALUES (9, 'aquaculture');
INSERT INTO mediacentre.disciplines VALUES (10, 'arts');
INSERT INTO mediacentre.disciplines VALUES (11, 'biochimie');
INSERT INTO mediacentre.disciplines VALUES (12, 'biochimie-microbiologie-biotechnologie');
INSERT INTO mediacentre.disciplines VALUES (13, 'biochimie-microbiologie');
INSERT INTO mediacentre.disciplines VALUES (14, 'biologie animale');
INSERT INTO mediacentre.disciplines VALUES (15, 'biologie-écologie');
INSERT INTO mediacentre.disciplines VALUES (16, 'biologie');
INSERT INTO mediacentre.disciplines VALUES (17, 'biologie végétale');
INSERT INTO mediacentre.disciplines VALUES (18, 'chimie');
INSERT INTO mediacentre.disciplines VALUES (19, 'comptabilité-bureautique');
INSERT INTO mediacentre.disciplines VALUES (20, 'documentation');
INSERT INTO mediacentre.disciplines VALUES (21, 'écologie, agronomie, territoire et développement durable');
INSERT INTO mediacentre.disciplines VALUES (22, 'écologie');
INSERT INTO mediacentre.disciplines VALUES (23, 'économie d''entreprise');
INSERT INTO mediacentre.disciplines VALUES (24, 'économie-droit');
INSERT INTO mediacentre.disciplines VALUES (25, 'économie sociale et familiale');
INSERT INTO mediacentre.disciplines VALUES (26, 'éducation civique, juridique et sociale');
INSERT INTO mediacentre.disciplines VALUES (27, 'éducation socioculturelle');
INSERT INTO mediacentre.disciplines VALUES (28, 'enseignement technologique et professionnel');
INSERT INTO mediacentre.disciplines VALUES (29, 'E.P.S.');
INSERT INTO mediacentre.disciplines VALUES (30, 'équipements agroalimentaires');
INSERT INTO mediacentre.disciplines VALUES (31, 'équipements hydrauliques');
INSERT INTO mediacentre.disciplines VALUES (32, 'équitation');
INSERT INTO mediacentre.disciplines VALUES (33, 'français-documentation');
INSERT INTO mediacentre.disciplines VALUES (34, 'français');
INSERT INTO mediacentre.disciplines VALUES (35, 'français-philosophie');
INSERT INTO mediacentre.disciplines VALUES (36, 'génie alimentaire');
INSERT INTO mediacentre.disciplines VALUES (37, 'génie des procédés (IAA)');
INSERT INTO mediacentre.disciplines VALUES (38, 'génie industriel');
INSERT INTO mediacentre.disciplines VALUES (39, 'géographie');
INSERT INTO mediacentre.disciplines VALUES (40, 'gestion');
INSERT INTO mediacentre.disciplines VALUES (41, 'grec');
INSERT INTO mediacentre.disciplines VALUES (42, 'heures de vie de classe');
INSERT INTO mediacentre.disciplines VALUES (43, 'hippologie-équitation');
INSERT INTO mediacentre.disciplines VALUES (44, 'hippologie');
INSERT INTO mediacentre.disciplines VALUES (45, 'histoire-géographie-éducation civique');
INSERT INTO mediacentre.disciplines VALUES (46, 'histoire-géographie');
INSERT INTO mediacentre.disciplines VALUES (47, 'histoire, géographie, instruction civique');
INSERT INTO mediacentre.disciplines VALUES (48, 'hygiène-prévention-secourisme');
INSERT INTO mediacentre.disciplines VALUES (49, 'informatique');
INSERT INTO mediacentre.disciplines VALUES (50, 'langues vivantes de l''enseignement agricole');
INSERT INTO mediacentre.disciplines VALUES (51, 'latin');
INSERT INTO mediacentre.disciplines VALUES (52, 'machinisme');
INSERT INTO mediacentre.disciplines VALUES (53, 'maréchalerie');
INSERT INTO mediacentre.disciplines VALUES (54, 'mathématiques');
INSERT INTO mediacentre.disciplines VALUES (55, 'mathématiques-informatique');
INSERT INTO mediacentre.disciplines VALUES (56, 'mercatique');
INSERT INTO mediacentre.disciplines VALUES (57, 'microbiologie');
INSERT INTO mediacentre.disciplines VALUES (58, 'œnologie');
INSERT INTO mediacentre.disciplines VALUES (59, 'philosophie');
INSERT INTO mediacentre.disciplines VALUES (60, 'physique appliquée');
INSERT INTO mediacentre.disciplines VALUES (61, 'physique-chimie');
INSERT INTO mediacentre.disciplines VALUES (62, 'physique');
INSERT INTO mediacentre.disciplines VALUES (63, 'pratiques professionnelles');
INSERT INTO mediacentre.disciplines VALUES (64, 'pratiques sociales et culturelles');
INSERT INTO mediacentre.disciplines VALUES (65, 'prévention santé environnementale');
INSERT INTO mediacentre.disciplines VALUES (66, 'productions animales');
INSERT INTO mediacentre.disciplines VALUES (67, 'productions horticoles');
INSERT INTO mediacentre.disciplines VALUES (68, 'productions végétales');
INSERT INTO mediacentre.disciplines VALUES (69, 'projet professionnel');
INSERT INTO mediacentre.disciplines VALUES (70, 'sciences économiques et humaines');
INSERT INTO mediacentre.disciplines VALUES (71, 'sciences économiques et sociales, gestion');
INSERT INTO mediacentre.disciplines VALUES (72, 'sciences économiques et sociales');
INSERT INTO mediacentre.disciplines VALUES (73, 'sciences économiques');
INSERT INTO mediacentre.disciplines VALUES (74, 'sciences et techniques aquacoles');
INSERT INTO mediacentre.disciplines VALUES (75, 'sciences et techniques des agroéquipements');
INSERT INTO mediacentre.disciplines VALUES (76, 'sciences et techniques horticoles');
INSERT INTO mediacentre.disciplines VALUES (77, 'sciences et techniques');
INSERT INTO mediacentre.disciplines VALUES (78, 'sciences et technologie des équipements');
INSERT INTO mediacentre.disciplines VALUES (79, 'secrétariat-bureautique');
INSERT INTO mediacentre.disciplines VALUES (80, 'statistiques');
INSERT INTO mediacentre.disciplines VALUES (81, 'SVT');
INSERT INTO mediacentre.disciplines VALUES (82, 'techniques animalières');
INSERT INTO mediacentre.disciplines VALUES (83, 'techniques commerciales');
INSERT INTO mediacentre.disciplines VALUES (84, 'techniques de communication');
INSERT INTO mediacentre.disciplines VALUES (85, 'techniques de documentation');
INSERT INTO mediacentre.disciplines VALUES (86, 'techniques économiques');
INSERT INTO mediacentre.disciplines VALUES (87, 'techniques forestières');
INSERT INTO mediacentre.disciplines VALUES (88, 'technologie aquacole');
INSERT INTO mediacentre.disciplines VALUES (89, 'technologie informatique et de communication');
INSERT INTO mediacentre.disciplines VALUES (90, 'tourisme innovation management (TIM)');
INSERT INTO mediacentre.disciplines VALUES (91, 'viticulture');
INSERT INTO mediacentre.disciplines VALUES (92, 'viticulture-œnologie');
INSERT INTO mediacentre.disciplines VALUES (93, 'zootechnie-hippologie');
INSERT INTO mediacentre.disciplines VALUES (94, 'zootechnie');

CREATE TABLE mediacentre.levels (
    id bigint NOT NULL,
    label character varying NOT NULL
);


INSERT INTO mediacentre.levels VALUES (1, '2de générale et technologique');
INSERT INTO mediacentre.levels VALUES (2, '2de professionnelle');
INSERT INTO mediacentre.levels VALUES (3, '1re générale et technologique');
INSERT INTO mediacentre.levels VALUES (4, '1re professionnelle');
INSERT INTO mediacentre.levels VALUES (5, 'terminale générale et technologique');
INSERT INTO mediacentre.levels VALUES (6, 'terminale professionnelle');
INSERT INTO mediacentre.levels VALUES (7, 'voie BEP');
INSERT INTO mediacentre.levels VALUES (8, 'voie BMA');
INSERT INTO mediacentre.levels VALUES (9, 'voie BP');
INSERT INTO mediacentre.levels VALUES (10, 'voie BT');
INSERT INTO mediacentre.levels VALUES (11, 'voie BTM');
INSERT INTO mediacentre.levels VALUES (12, 'voie CAP');
INSERT INTO mediacentre.levels VALUES (13, 'voie FC');
INSERT INTO mediacentre.levels VALUES (14, 'voie MC');

