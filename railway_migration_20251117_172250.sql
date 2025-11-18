--
-- PostgreSQL database dump
--

\restrict hYMhf5g4VO666VQhAQmToJB1DIbgvlxXekzvu07CePBpEiUfnklE1cUFthfjb9E

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_occupation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_municipality_id_fkey;
ALTER TABLE IF EXISTS ONLY public.contacts DROP CONSTRAINT IF EXISTS contacts_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.contacts DROP CONSTRAINT IF EXISTS contacts_occupation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.contacts DROP CONSTRAINT IF EXISTS contacts_municipality_id_fkey;
DROP INDEX IF EXISTS public.users_email_idx;
DROP INDEX IF EXISTS public.idx_users_phone;
DROP INDEX IF EXISTS public.idx_users_name;
DROP INDEX IF EXISTS public.idx_users_cedula;
DROP INDEX IF EXISTS public.idx_contacts_phone;
DROP INDEX IF EXISTS public.idx_contacts_name;
DROP INDEX IF EXISTS public.idx_contacts_email;
DROP INDEX IF EXISTS public.idx_contacts_cedula;
DROP INDEX IF EXISTS public.contacts_user_id_idx;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_cedula_unique;
ALTER TABLE IF EXISTS ONLY public.occupations DROP CONSTRAINT IF EXISTS occupations_pkey;
ALTER TABLE IF EXISTS ONLY public.occupations DROP CONSTRAINT IF EXISTS occupations_name_key;
ALTER TABLE IF EXISTS ONLY public.municipalities DROP CONSTRAINT IF EXISTS municipalities_pkey;
ALTER TABLE IF EXISTS ONLY public.municipalities DROP CONSTRAINT IF EXISTS municipalities_name_key;
ALTER TABLE IF EXISTS ONLY public.contacts DROP CONSTRAINT IF EXISTS contacts_pkey;
ALTER TABLE IF EXISTS ONLY public.contacts DROP CONSTRAINT IF EXISTS contacts_cedula_unique;
ALTER TABLE IF EXISTS public.occupations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.municipalities ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.occupations_id_seq;
DROP TABLE IF EXISTS public.occupations;
DROP SEQUENCE IF EXISTS public.municipalities_id_seq;
DROP TABLE IF EXISTS public.municipalities;
DROP TABLE IF EXISTS public.contacts;
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255),
    phone character varying(20),
    address character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid NOT NULL,
    municipality_id integer,
    occupation_id integer,
    is_active boolean DEFAULT true NOT NULL,
    mdv character varying(255),
    cedula character varying(20)
);


--
-- Name: municipalities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.municipalities (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    department character varying(100) DEFAULT 'Norte de Santander'::character varying NOT NULL
);


--
-- Name: municipalities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.municipalities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: municipalities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.municipalities_id_seq OWNED BY public.municipalities.id;


--
-- Name: occupations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.occupations (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


--
-- Name: occupations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.occupations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: occupations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.occupations_id_seq OWNED BY public.occupations.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255),
    password_hash text NOT NULL,
    phone character varying(20),
    role character varying(20) NOT NULL,
    address character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    municipality_id integer,
    occupation_id integer,
    is_active boolean DEFAULT true NOT NULL,
    mdv character varying(255),
    cedula character varying(20),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('superadmin'::character varying)::text, ('admin'::character varying)::text, ('lider'::character varying)::text])))
);


--
-- Name: municipalities id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.municipalities ALTER COLUMN id SET DEFAULT nextval('public.municipalities_id_seq'::regclass);


--
-- Name: occupations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occupations ALTER COLUMN id SET DEFAULT nextval('public.occupations_id_seq'::regclass);


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contacts (id, first_name, last_name, email, phone, address, created_at, user_id, municipality_id, occupation_id, is_active, mdv, cedula) FROM stdin;
e48c7d29-35fe-450e-8a87-b2a474078467	Juan	Pérez	juan.perez@example.com	3001234567	Calle 123 #45-67	2025-11-17 04:30:34.507591+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	1	t	REF-001	1234567890
9b410f9a-cb31-4c75-8f58-9189eb928fdd	Maureen Carrillo	Carrillo	\N	375754848	\N	2025-11-17 04:33:10.779098+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
d39ecbcb-9df3-4b7e-b162-5cbaf63eab6a	Yisely Chinome	Chinome	\N	1090175029	\N	2025-11-17 04:33:10.79251+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
6a4c26de-2278-4213-abe6-6745fbe57e75	Centro Inyeccion	Inyeccion	\N	3002050258	\N	2025-11-17 04:33:10.819472+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
7b1ac2ad-ead1-4371-9c28-312fd502c6f7	Alex Don	Don	\N	3002115402	\N	2025-11-17 04:33:10.84349+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
9d541e15-ab7f-47b9-94b2-3f754f76af79	Merced Cda	Cda	\N	3002131137	\N	2025-11-17 04:33:10.856253+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
dc2eee0a-2f27-4287-beed-f44a081556cd	Karen Rodriguez	Rodriguez	\N	3002165723	\N	2025-11-17 04:33:10.867851+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
4f42ef1e-f992-4bf8-ae9f-603baebcb102	Gabriel Fernandez	Fernandez	\N	3002233060	\N	2025-11-17 04:33:10.878688+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
ea2c358e-3d3e-46c3-9883-e3188fab6f5f	Elizabeth Parada	Xx	\N	3002392251	\N	2025-11-17 04:33:10.889019+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
435fa6bf-20f2-4b49-91e4-695143e4ba1a	Maryeth Constanza	Xx	\N	3002464434	\N	2025-11-17 04:33:10.901546+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
08177f84-e855-4c01-9748-f0a9307eced7	Jesus Gomez	Gomez	\N	3002634982	\N	2025-11-17 04:33:10.915904+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	7	\N	t	\N	\N
b884ca6f-ff4d-4669-8609-574e7c2561ea	Javier Pabon	Pabon	\N	3002669726	\N	2025-11-17 04:33:10.928149+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	8	\N	t	\N	\N
110cd30d-53c5-4ce9-9256-bdd5eb6729d2	Marcela Caro	Caro	\N	3002962884	\N	2025-11-17 04:33:10.940337+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
5efa5cd8-b990-42c5-ba1b-d43dfe3658a5	Belkis Gutierrez	Gutierrez	\N	3003080002	\N	2025-11-17 04:33:10.951465+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
7757513c-3401-4a0f-bf19-0f0fb0a661b1	Jose Angeles	Angeles	\N	3003234948	\N	2025-11-17 04:33:10.964159+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
607a4792-742a-49b5-ad7c-c41cf25ab80e	Estefania Chinacota	Chinacota	\N	3003460272	\N	2025-11-17 04:33:10.973752+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
0ee7440c-b061-412e-ba7d-5b3466737d85	Dora Isabel	Xx	\N	3003552819	\N	2025-11-17 04:33:10.982339+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
2e689e58-d236-4ed9-b141-431b0637bc23	Marcela Pradilla	Pradilla	\N	3003686474	\N	2025-11-17 04:33:10.99135+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	8	\N	t	\N	\N
1cc8a6ce-1d68-4249-a745-953d3c4317c5	Wilson Amaya	Amaya	\N	3003777049	\N	2025-11-17 04:33:11.000166+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
1d9ffe70-6eb4-4b4f-80a7-722aeef7d723	Hector Perozo	Perozo	\N	3004002430	\N	2025-11-17 04:33:11.012194+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
e7e098d7-f4d0-4444-9580-7c44875efb57	Jc Jc	Jc	\N	3004249689	\N	2025-11-17 04:33:11.02466+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
71b15a5d-70bf-44df-b89a-8dda706ebc6a	Paola Paola	Paola	\N	3004810159	\N	2025-11-17 04:33:11.034563+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
a2c2f90a-19f4-4659-af0f-7f459fcfb457	Juan Borriqueros	Borriqueros	\N	3004881674	\N	2025-11-17 04:33:11.044978+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
2b350798-7a62-480c-97df-04bbcade3fc4	Arturo Jaimes	Jaimes	\N	3005160622	\N	2025-11-17 04:33:11.055172+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
f2511fb9-7f0c-4344-9791-42cffce16c42	Carlos Mauricio	Xx	\N	3005322590	\N	2025-11-17 04:33:11.06574+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
6c998412-3ef8-4782-9c34-8e5d0d549e80	Maria Perez	Perez	\N	3005474496	\N	2025-11-17 04:33:11.077101+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
08de7793-c899-415a-bd59-4d71485ffe82	Mario Castellanos	Castellanos	\N	3005576653	\N	2025-11-17 04:33:11.089129+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
3f752978-2ea8-45bb-90da-584bef055586	Carmen Elena	Xx	\N	3005633441	\N	2025-11-17 04:33:11.101832+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
2996f9cb-986d-49f2-b218-6ab857c7b726	Profe Profe	Profe	\N	3005720254	\N	2025-11-17 04:33:11.114268+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
b77cf518-ad23-474a-aa2f-1a54ea9fae6a	Alexander Bladimir	Bladimir	\N	3006109431	\N	2025-11-17 04:33:11.128667+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
1764622f-7510-4573-8c81-f06a9a6da2c3	Andres Leal	Leal	\N	3006204412	\N	2025-11-17 04:33:11.142908+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
c7e671cc-88f9-431d-a2b4-8ff50c871793	Jairo Jaramillo	Jaramillo	\N	3006495365	\N	2025-11-17 04:33:11.154149+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
846c85d2-76ef-45cc-877a-e04ca10cbb80	Carlos	Rodríguez	carlos.rodriguez@example.com	3003456789	Carrera 50 #30-20	2025-11-17 04:33:10.760019+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	\N	\N	t	REF-003	34567890120
921081a3-d433-45fc-a7a3-2e5a0f0f9f32	Yessica Gamboa	Gamboa Cely	\N	1118553305	\N	2025-11-17 04:33:10.807966+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	3	t	\N	12342212
8ee092dd-fff7-424a-b51f-d228a51a2990	Ana	Martínez	ana.martinez@example.com	3004567890	Transversal 10 #5-10	2025-11-17 04:30:34.606375+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	\N	3	f	REF-004	4567890123
c8b04843-1930-4070-8872-4b5184563494	Diana Moreno	Moreno Figueredo	\N	3002071555	\N	2025-11-17 04:33:10.831218+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	f	\N	\N
1af4bc75-0da5-49cd-9668-ceb6841d6ea8	Sutano 	perencejo	perencejo@gmail.com	320987654	Villa antigua 	2025-10-10 00:48:26.255908+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	8	5	t	\N	TEMP0000000003
dddb5862-d8f8-41ee-a976-fdaf2dabb585	Amigos	Betua saber	amigos@gmail.com	3298765432	atalaya	2025-10-10 15:46:10.480114+00	eac9a815-876e-4e85-be44-8646f8d75eec	142	2	t	\N	TEMP0000000020
f4f3e518-a127-4ede-97a5-36bde22366ec	Javier	Meneses	menesistajavier12@gmail.com	3227947251	El Escobal	2025-09-29 16:56:41.165073+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	4	t	\N	TEMP0000000021
fc73c34d-f854-45db-a7e1-3649e1f215b3	Delly Teresa	Gomez	delly19@gmail.com	3040303030	Quintas de tamarindo	2025-09-29 21:26:08.975247+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	8	2	t	\N	TEMP0000000022
44fc57dd-0597-47a1-9db1-c920e9001132	María	González	maria.gonzalez@example.com	3002345678	Avenida Principal 89	2025-11-17 04:30:34.570317+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	2	t	REF-002	2345678901
5a208176-798e-4a5a-ab9a-9aa1fd0b69dd	María	González	maria.gonzalez@example.com	3002345678	Avenida Principal 89	2025-11-17 04:33:10.751348+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	2	t	REF-002	23456789010
35ffdec7-1f23-4c14-b0b2-0722c299d439	Wilton Hernando	Moncada	\N	88216858	\N	2025-11-17 04:33:10.771012+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
6b4ae601-f867-44fb-af77-e6aaaca30231	Juliana Carreño	Xx	\N	1007387752	\N	2025-11-17 04:33:10.787023+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	7	\N	t	\N	\N
f452d94d-9b9f-40ee-ba58-c4bb09ca1647	Marco Tulio	Torres	\N	1092254092	\N	2025-11-17 04:33:10.800892+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	162	\N	t	\N	\N
87cbe593-4a75-409c-81e0-176a5d053081	Daniel Torrado	Torrado	\N	3002042327	\N	2025-11-17 04:33:10.815338+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
e1dd4565-d621-4cef-83c0-ab6ec0de3c77	Jose Vicente	Yañez Gutierrez	\N	3002052215	\N	2025-11-17 04:33:10.827581+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
ecdb8059-43bb-4362-bb39-42f78fed12f7	Maria Elena	Elena	\N	3002095941	\N	2025-11-17 04:33:10.839517+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	9	\N	t	\N	\N
e4520824-e408-4972-be24-637aac23665c	Monica Ochoa	Ochoa	\N	3002129665	\N	2025-11-17 04:33:10.851233+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
b0decd69-daa2-481f-9fbc-c8495eeb7864	Angela Lam	Xx	\N	3002146374	\N	2025-11-17 04:33:10.863661+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	140	\N	t	\N	\N
ce1f1c1a-c1ab-40b1-b813-817028895003	Jose Rodriguez	Rodriguez	\N	3002188887	\N	2025-11-17 04:33:10.875362+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
196d3760-408d-4307-b86d-1abf853dbc22	Ingrid Ramirez	Ramirez	\N	3002368993	\N	2025-11-17 04:33:10.885877+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
52dfbc88-621a-40dd-8da1-aceb5b90addc	Carlos Rios	Rios	\N	3002444420	\N	2025-11-17 04:33:10.896837+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
13aff408-cf02-4b35-9dbd-c7d5a96c2199	Alicia Cera	Cera	\N	3002625492	\N	2025-11-17 04:33:10.910764+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	8	\N	t	\N	\N
619cfb9d-112c-44c5-bdb8-5d0a925d0b19	Maria Maria	Maria	\N	3002665505	\N	2025-11-17 04:33:10.924202+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
c06b6c45-ad6d-4118-97d3-df8f0dcadd59	Yuleisy Turno	Turno	\N	3002917682	\N	2025-11-17 04:33:10.936283+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
5dfeed6b-8946-489e-a345-191fcdb565ad	Jose Licencia	Licencia	\N	3003006789	\N	2025-11-17 04:33:10.947624+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
981d6f60-a3b6-47fd-aa80-ce71999f8e08	Marly Rodriguez	Rodriguez	\N	3003218534	\N	2025-11-17 04:33:10.960435+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	7	\N	t	\N	\N
1e652edb-9f6d-4373-a986-d2cbb3f3de42	Juli Hija	Hija	\N	3003413887	\N	2025-11-17 04:33:10.970538+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
0804f14a-653a-46e2-92c8-a5206170c95f	Maria Esap	Esap	\N	3003484177	\N	2025-11-17 04:33:10.979224+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
04884f70-03bf-48bd-ad2c-16016e680aaa	John Olivares	Olivares	\N	3003679656	\N	2025-11-17 04:33:10.98742+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
71a98a46-d31e-400a-af70-bc3edecdb607	Conductor Elegido	Elegido	\N	3003754820	\N	2025-11-17 04:33:10.997074+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
7c75f660-1c72-4f3a-b1f7-95ca264681dc	Yorman Local	Local	\N	3003890111	\N	2025-11-17 04:33:11.009041+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
2825c92c-82ed-463a-90b4-f225b26d71b9	Lina Galaviz	Galaviz	\N	3004241562	\N	2025-11-17 04:33:11.02013+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
d8bde25e-9266-4103-ba06-37f02e244a2b	Mauro Mauro	Mauro	\N	3004774625	\N	2025-11-17 04:33:11.031331+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
71b5db92-a66a-4de4-9246-f87594819126	Ferreteria Santa	Santa	\N	3004859202	\N	2025-11-17 04:33:11.041699+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
1e3a0bab-da68-4c04-8c9b-119ef38bd183	Jenner Sepulveda	Sepulveda	\N	3005074253	\N	2025-11-17 04:33:11.051837+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	9	\N	t	\N	\N
4bc3b517-6775-480a-8e8d-b70cb721690e	Jennifer Moreno	Moreno	\N	3005257218	\N	2025-11-17 04:33:11.062421+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
5b21000e-7a6a-47a2-ab42-1397fdc65af1	Paula Farfan	Farfan	\N	3005368618	\N	2025-11-17 04:33:11.072176+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
e271b6f3-45dc-4329-9c8a-d03fb192dc63	Fabio Ramirez	Ramirez	\N	3005524245	\N	2025-11-17 04:33:11.084783+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
18877d5c-9278-4f24-b2cb-600005821174	Profesor Matajira	Matajira	\N	3005622011	\N	2025-11-17 04:33:11.097872+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
1d6fb6ee-893f-4993-9e48-2ae38e160dec	Esteban Gonzalez	Gonzalez	\N	3005649163	\N	2025-11-17 04:33:11.109876+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
6cd80058-15ce-4ba9-9b45-9de784f988a6	Julian Niño	Niño	\N	3005767493	\N	2025-11-17 04:33:11.124467+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
b1f039fb-a639-49d4-9853-67c6c91ee68b	Jorge Silva	Silva	\N	3006159077	\N	2025-11-17 04:33:11.136976+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
231c844f-9234-4294-926e-75e9b08c9c50	Legionaria Mercedes	Mercedes	\N	3006411192	\N	2025-11-17 04:33:11.149952+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
c764d50b-cd94-4b4d-b758-f2cf3f98eca4	Carlos	Rodríguez	carlos.rodriguez@example.com	3003456789	Carrera 50 #30-20	2025-11-17 04:30:34.591835+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	REF-003	3456789012
954b0636-923d-47f8-9dca-c80734fca977	Juan	Pérez	juan.perez@example.com	3001234567	Calle 123 #45-67	2025-11-17 04:33:10.690662+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	1	t	REF-001	12345678900
44422560-a0e4-45c6-bf24-d488076faf97	Ana	Martínez	ana.martinez@example.com	3004567890	Transversal 10 #5-10	2025-11-17 04:33:10.765505+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	\N	3	t	REF-004	45678901230
4bbaa7b1-379d-4969-b7a3-eff2ad64a763	Mario Garofalo	Garofalo	\N	424838928	\N	2025-11-17 04:33:10.783191+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
2eaf1935-9328-4deb-9505-a4d5777083a2	Luz Angelica	Jaimes	\N	1090507101	\N	2025-11-17 04:33:10.796857+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
6545fab0-9da5-408e-885c-b36b393faa91	Delfin Veloza	Veloza	\N	3001115550	\N	2025-11-17 04:33:10.811527+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
be4bf4d7-e53e-4a24-88d9-d526f11433b3	Diego Yanez	Yanez	\N	3002052165	\N	2025-11-17 04:33:10.823869+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
69361d80-ce25-4051-9018-0ccb59d307f7	Juan Pablo	Celis	\N	3002091386	\N	2025-11-17 04:33:10.835378+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
8cc1fdb9-bfb7-4a53-82f9-f522185c1a16	Rosa Barba	Barba	\N	3002123033	\N	2025-11-17 04:33:10.847163+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
ffdedb02-f5bc-435e-847a-69af42016850	Belcy Almeida	Almeida	\N	3002137780	\N	2025-11-17 04:33:10.860351+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	8	\N	t	\N	\N
23bd7330-4351-45c9-8f62-5d851035c064	July Marquez	Marquez	\N	3002175173	\N	2025-11-17 04:33:10.87118+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
e228d735-bde8-4296-b62c-f20eacb4e4cb	Luis Cordero	Cordero	\N	3002368404	\N	2025-11-17 04:33:10.882187+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
f6404b2e-13de-4172-8908-8ae6172c8743	Internet Unipamplona	Unipamplona	\N	3002413916	\N	2025-11-17 04:33:10.892825+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
dd086e5d-62af-410f-a6ba-1fa6fde05127	David Planeacion	Planeacion	\N	3002609938	\N	2025-11-17 04:33:10.907223+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	8	\N	t	\N	\N
f810601f-3507-499b-89c7-c6b6d36c10c2	Dario Repuestos	Repuestos	\N	3002661826	\N	2025-11-17 04:33:10.919314+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
224b3cf9-fbf2-443d-9909-c1563f8bfe9c	Quesudos Quesudos	Quesudos	\N	3002713537	\N	2025-11-17 04:33:10.932283+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
3c316818-9d59-4d15-b1f6-04faa3230c00	Erika Lilinana	Duran	\N	3002979102	\N	2025-11-17 04:33:10.94384+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
a9b28084-7853-4365-b42e-df2f0fe622da	Andrea Amiga	Amiga	\N	3003211505	\N	2025-11-17 04:33:10.955345+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
b8c2858e-27af-4038-9e14-4ef44a2ca994	German Berbesi	Berbesi	\N	3003237074	\N	2025-11-17 04:33:10.967732+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
249112c8-a116-4d89-ae0a-912678ff7c76	Andrea Carolina	Castro	\N	3003464939	\N	2025-11-17 04:33:10.976663+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
59004e9c-9d40-4815-8c63-dcf0e4ccb76f	Luis Pamplona	Pamplona	\N	3003560127	\N	2025-11-17 04:33:10.985133+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
92cb8fb4-c1a0-47ef-8a7e-e6bfa199c9dc	Alexander Moreno	Moreno	\N	3003723454	\N	2025-11-17 04:33:10.994127+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
1fcc717f-ae7a-4efc-b29a-c104952ac350	Maria Angelica	Xx	\N	3003779166	\N	2025-11-17 04:33:11.003055+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	9	\N	t	\N	\N
86f8d346-a0b3-4453-a284-a3a9724a3c6d	Jenifer Gabriela	Xx	\N	3004130811	\N	2025-11-17 04:33:11.015843+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
c1cd8a9a-5732-413b-a535-1e46102c8594	Juan Valencia	Valencia	\N	3004398742	\N	2025-11-17 04:33:11.02788+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
32110a84-d679-46f3-9ad7-98a08756e8ae	Mauricio Chacon	Chacon	\N	3004847971	\N	2025-11-17 04:33:11.037583+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
05446d18-fcee-44e8-b62f-8a0dfe040d10	Laurent Enard	Enard	\N	3004927633	\N	2025-11-17 04:33:11.048451+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
3ce7e30f-8a5c-4bfa-8523-2b9f4c1bcfe3	Juan Cartagena	Cartagena	\N	3005167366	\N	2025-11-17 04:33:11.059217+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
fbb66272-51ea-4aaf-8542-0dc66431200d	Heiner Chaparro	Chaparro	\N	3005340490	\N	2025-11-17 04:33:11.068825+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
d9ba6ba6-ed74-4902-b612-7ec30e65206b	Jesus Jaraba	Jaraba	\N	3005507818	\N	2025-11-17 04:33:11.080852+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	134	\N	t	\N	\N
97f1868f-cb88-4bcf-ac8f-a5863532a297	Guajiro Cesar	Cesar	\N	3005619044	\N	2025-11-17 04:33:11.093264+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
e89d3971-34ea-4a9d-849d-9b11d93cf11d	Maria Elisa	Elisa	\N	3005648657	\N	2025-11-17 04:33:11.105924+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	9	\N	t	\N	\N
45775550-eb29-40bc-a6ce-834ad7571d62	Juan Francisco	Xx	\N	3005759613	\N	2025-11-17 04:33:11.118948+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
9b9b0032-0f45-4711-9d2e-8bcc1ff7e546	Jefferson Jair	Xx	\N	3006131512	\N	2025-11-17 04:33:11.132982+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
e4d04d80-d914-4e04-aeaa-add305126b66	Diana Vargas	Vargas	\N	3006210147	\N	2025-11-17 04:33:11.146344+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
0627b68a-7603-46b6-9751-42bcfdd63425	Edgar Consa	Consa	\N	3006503641	\N	2025-11-17 04:33:11.159225+00	db5f04d8-5fa9-4364-b0e2-6954a0535105	3	\N	t	\N	\N
6f25dd1d-3e13-464c-a8b6-d89b8f9f9f2c	Clarita Ines	Ines	\N	3006529865	\N	2025-11-17 05:04:10.673754+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
e244ba38-a3d0-4a5e-a894-2e5582e69067	Insumos Pasteleria	Pasteleria	\N	3006740935	\N	2025-11-17 05:04:10.76646+00	efa58738-7046-46f3-a10d-fd81caf22af9	9	\N	t	\N	\N
5fd8eeae-d0a3-428d-923c-aede9e3ba9cf	Rafael Alvarado	Alvarado	\N	3007125788	\N	2025-11-17 05:04:10.786134+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
e24be9df-8a90-4775-9837-e2560ffa2f36	Luis Fernando	Xx	\N	3007430024	\N	2025-11-17 05:04:10.807958+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
d786701c-197a-4096-a40c-70d527468a55	Domicilios Angel'S	Angel'S	\N	3007598141	\N	2025-11-17 05:04:10.847235+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
147f8080-bc1f-40d4-9a23-ab8bb59080ad	Keyle Caceres	Caceres	\N	3008356086	\N	2025-11-17 05:04:10.869001+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
f52f32c3-aa9b-413f-bbb4-80bb6f9accda	Mauricio Torres	Torres	\N	3008632020	\N	2025-11-17 05:04:10.887724+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
e5a646c5-3d86-4f29-b7ab-6708f41a812d	German Barranquilla	Barranquilla	\N	3012084203	\N	2025-11-17 05:04:10.906421+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
b4dee732-1a99-42f1-b8e0-fd67517bcca7	Elkin Rodriguez	Rodriguez	\N	3012323698	\N	2025-11-17 05:04:10.92899+00	efa58738-7046-46f3-a10d-fd81caf22af9	8	\N	t	\N	\N
9d6dfcbc-b70c-4ab2-ac26-a69f51ae5649	Leonel Doctor	Doctor	\N	3012627436	\N	2025-11-17 05:04:10.950816+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
ff68a315-07f9-4e61-b8d0-808c00357d98	Leidy Cliente	Cliente	\N	3012890224	\N	2025-11-17 05:04:10.971497+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
e7a03a8c-5a9f-4c26-91d2-b8ab49f71ab1	Jasbleiddy Nathalia	Xx	\N	3013085775	\N	2025-11-17 05:04:10.989913+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
49a38f9a-3a77-4aa6-bf56-82eea2f9affe	Maria Nella	Nella	\N	3013434059	\N	2025-11-17 05:04:11.00675+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
693b70bd-c096-4f48-8444-c2e3dcd75b13	Gicela Nieto	Nieto	\N	3013707900	\N	2025-11-17 05:04:11.020158+00	efa58738-7046-46f3-a10d-fd81caf22af9	9	\N	t	\N	\N
734b705f-b205-4453-8663-b735c3194772	Viviana Paisa	Paisa	\N	3013813135	\N	2025-11-17 05:04:11.035347+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
55f30bc2-aa9e-460b-b569-fef9629273dc	Morelia Morelia	Morelia	\N	3014271480	\N	2025-11-17 05:04:11.051165+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
65c76a18-46d1-4d18-b851-b6b69cd06ea1	Yesid Roa	Roa	\N	3014495053	\N	2025-11-17 05:04:11.066505+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
66dd65f7-3a87-4859-b69a-b2b7687488db	Jairo Sofwate	Sofwate	\N	3014694242	\N	2025-11-17 05:04:11.08312+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
3a143bd0-c329-4cdb-82cc-1df0a1f43923	Yeraldin Lam	Lam	\N	3014782406	\N	2025-11-17 05:04:11.098617+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
8fb429d4-3526-4084-8eab-13a94274073e	Maria Ramirez	Xx	\N	3015461942	\N	2025-11-17 05:04:11.116549+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
7e9506ef-628b-46d0-93b4-967ae1a0e05b	Joseph	Rodriguez	joseph@outlook.com	321988765	EL Cuji	2025-11-15 19:52:06.525722+00	efa58738-7046-46f3-a10d-fd81caf22af9	8	6	t	Salesiano	88909876
ef09e5c8-5c6b-4881-ac00-2b3e3736ef22	Jose Forero	Forero	\N	3006540642	\N	2025-11-17 05:04:10.710932+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
5efc4e74-4ffb-4fdf-afc7-1d2b9a2e0cc9	Claudia Patricia	Xx	\N	3006934750	\N	2025-11-17 05:04:10.771247+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
b709db34-40b0-46f6-b149-c23cbb2c5eb0	La Va¿K	La Va¿K	\N	3007321560	\N	2025-11-17 05:04:10.790192+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
c2a8ae82-b13a-4249-8f53-3116d79fb325	Jose Jovel	Xx	\N	3007435189	\N	2025-11-17 05:04:10.81201+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
25955c21-3674-4978-bcb2-1d4d1765bc7c	Andrea Villan	Villan	\N	3007708710	\N	2025-11-17 05:04:10.852174+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
9ece8788-3a4d-4b26-831e-c833337ba3a1	Ismael Cambrera	Cambrera	\N	3008358331	\N	2025-11-17 05:04:10.872943+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
47957002-5c87-4945-a9b2-df2aeba475e0	John Freddy	Alvarez	\N	3008789491	\N	2025-11-17 05:04:10.891225+00	efa58738-7046-46f3-a10d-fd81caf22af9	7	\N	t	\N	\N
87fa04cd-4ad0-401c-b99d-b89fac0c0a7d	Diego Consa	Consa	\N	3012161010	\N	2025-11-17 05:04:10.911013+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
1370f70e-bcca-4367-8aff-347ceeffeb1f	Lucy Muños	Muños	\N	3012408745	\N	2025-11-17 05:04:10.932518+00	efa58738-7046-46f3-a10d-fd81caf22af9	134	\N	t	\N	\N
22e7fb63-56fe-4784-99d6-58a7a383025a	Javier Leon	Leon	\N	3012638055	\N	2025-11-17 05:04:10.954723+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
b243b1e1-7940-4b98-95f3-3d2cad481e94	Maria Lisa	Lisa	\N	3012960711	\N	2025-11-17 05:04:10.975382+00	efa58738-7046-46f3-a10d-fd81caf22af9	9	\N	t	\N	\N
31360061-e38e-46c1-95e5-d9c91e86bf37	Daniela Velandia	Velandia	\N	3013163428	\N	2025-11-17 05:04:10.994816+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
b21dd114-9bf3-450f-9467-bda92b73b4b1	Hernan Cartagena	Cartagena	\N	3013507781	\N	2025-11-17 05:04:11.009131+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
0729d82a-61a5-4fc5-9ef2-6e78b62f0ca3	Jose Mora	Mora	\N	3013713872	\N	2025-11-17 05:04:11.023382+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
e41ccdbc-2a7b-4112-b3c7-dec1bbe2202f	Gregorio Herrera	Herrera	\N	3013877731	\N	2025-11-17 05:04:11.038769+00	efa58738-7046-46f3-a10d-fd81caf22af9	9	\N	t	\N	\N
1b6869de-f3f2-4d0a-890e-8f211fb23218	Johan Rangel	Rangel	\N	3014277448	\N	2025-11-17 05:04:11.05443+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
faf005b0-0e3a-4b9b-94b4-b7e530b8398a	Carlos Mora	Mora	\N	3014523671	\N	2025-11-17 05:04:11.069425+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
a08f5bb9-e43a-4ea9-bd1d-58e1445caa3f	Henrry Minka	Minka	\N	3014699207	\N	2025-11-17 05:04:11.086015+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
7ee2909a-460a-4c53-b754-6183ab97290d	Denis Cuello	Cuello	\N	3015011740	\N	2025-11-17 05:04:11.101569+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
e4c99eed-cb20-43e6-bd29-74710bbe6ca9	Rita Amelia	Amelia	\N	3015469616	\N	2025-11-17 05:04:11.119582+00	efa58738-7046-46f3-a10d-fd81caf22af9	9	\N	t	\N	\N
333aa268-6c2d-40ef-b38c-adaad8804b7e	Mayerling Infinity	Infinity	\N	3006541763	\N	2025-11-17 05:04:10.735246+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
64118b60-0807-4b85-af78-72b89a534912	Jefferson Ropero	Ropero	\N	3007026268	\N	2025-11-17 05:04:10.775564+00	efa58738-7046-46f3-a10d-fd81caf22af9	9	\N	t	\N	\N
af7eba6b-0d5f-4b0d-a45e-374a85a2b8e9	Anabel Soranyi	Xx	\N	3007356321	\N	2025-11-17 05:04:10.795803+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
9e8c597a-4392-4364-8aed-bb0c055e19f3	Juan Felipe	Felipe	\N	3007517854	\N	2025-11-17 05:04:10.815983+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
6f2c1502-f836-4949-9bc8-9328363c55cb	Hector Fabio	Chaves Millan	\N	3007823252	\N	2025-11-17 05:04:10.856694+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
609a9d01-df53-42e0-a764-1c3692cc7d7c	Agente Claro	Claro	\N	3008501830	\N	2025-11-17 05:04:10.876766+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
f5fe634f-d892-4c9f-94c8-73c3341d747c	Adolfo Salcedo	Salcedo	\N	3008830139	\N	2025-11-17 05:04:10.894523+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
135867c1-b704-47a5-9a01-c7f5cb86354b	Natalia Rodriguez	Rodriguez	\N	3012175034	\N	2025-11-17 05:04:10.915619+00	efa58738-7046-46f3-a10d-fd81caf22af9	7	\N	t	\N	\N
449f8e2c-b9aa-4c7a-9114-e2e49e663bf2	Carlos Eduardo	Coronel	\N	3012478961	\N	2025-11-17 05:04:10.936386+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
3656c017-0ff6-4141-b822-0241f5858359	Erasmo Xx	Xx	\N	3012650448	\N	2025-11-17 05:04:10.958817+00	efa58738-7046-46f3-a10d-fd81caf22af9	9	\N	t	\N	\N
cd67e655-72ba-4f09-aefb-778c1fc1e6f8	Alexis Castro	Castro	\N	3012962242	\N	2025-11-17 05:04:10.979789+00	efa58738-7046-46f3-a10d-fd81caf22af9	134	\N	t	\N	\N
2b8dda97-5c0e-4fd8-80f5-5a29df0efa40	Cesar Andres	Xx	\N	3013209563	\N	2025-11-17 05:04:10.997612+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
fd93e7ed-5021-45e4-b27b-92138b3f9f87	Gerardo Sanchez	Xx	\N	3013580315	\N	2025-11-17 05:04:11.011274+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
66ac838c-d946-4b6b-b4ce-387d64a55474	Natalia Bedoya	Bedoya	\N	3013765220	\N	2025-11-17 05:04:11.026288+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
a38652c6-cef6-4072-960e-df51d6444500	Camilo Camilo	Camilo	\N	3013979527	\N	2025-11-17 05:04:11.041851+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
406476e6-373c-45df-9fb1-d245d1689a33	Rosa Maria	Estupiñan	\N	3014317533	\N	2025-11-17 05:04:11.057444+00	efa58738-7046-46f3-a10d-fd81caf22af9	8	\N	t	\N	\N
80b2a2b9-d4c3-4a76-bb32-1e389ef67506	Ivan Sandoval	Sandoval	\N	3014539274	\N	2025-11-17 05:04:11.073053+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
1ddd90de-db5a-452e-8ab9-c4aed0247e9e	Luisa Mendoza	Mendoza	\N	3014749544	\N	2025-11-17 05:04:11.089097+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
fd08eea2-8d86-4be0-aab8-282a2a7ce187	Zulvey Fartega	Fartega	\N	3015151007	\N	2025-11-17 05:04:11.104855+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
2f1332e8-0698-4a7a-bf25-4dbc181d8677	Yarley Barbosa	Barbosa	\N	3015492136	\N	2025-11-17 05:04:11.12309+00	efa58738-7046-46f3-a10d-fd81caf22af9	7	\N	t	\N	\N
fe48b8fb-0e4e-4306-97f4-e04b5bab0ecb	Camilo Montes	Montes	\N	3006548470	\N	2025-11-17 05:04:10.741844+00	efa58738-7046-46f3-a10d-fd81caf22af9	8	\N	t	\N	\N
f4bb035e-b93a-4c62-bfd7-f6bd796bb49b	Sebastian Caro	Caro	\N	3007094260	\N	2025-11-17 05:04:10.779193+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
88c4de64-1122-4abe-8313-5e9e762c6bb9	Claudia Montañez	Xx	\N	3007381499	\N	2025-11-17 05:04:10.798839+00	efa58738-7046-46f3-a10d-fd81caf22af9	140	\N	t	\N	\N
e7c2c418-7313-4469-b952-a5d636499b7f	Carolina Alarcon	Alarcon	\N	3007534550	\N	2025-11-17 05:04:10.819422+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
3f5af84a-f823-4e34-b526-a7e470f6f4ba	Maria Del	Xx	\N	3007887750	\N	2025-11-17 05:04:10.860596+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
d4bbebd6-52ac-41bb-8065-00a1f7265c93	Somefyr Terapias	Terapias	\N	3008521200	\N	2025-11-17 05:04:10.880234+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
97e4ae60-0240-43e3-8c5a-3aa02afb99cc	Carolina Martinez	Martinez Buitrago	\N	3008934288	\N	2025-11-17 05:04:10.898543+00	efa58738-7046-46f3-a10d-fd81caf22af9	7	\N	t	\N	\N
d06752bf-63b0-45b5-9089-c43a18d2cb3b	Cereza Cosmeticos	Cosmeticos	\N	3012220715	\N	2025-11-17 05:04:10.919983+00	efa58738-7046-46f3-a10d-fd81caf22af9	9	\N	t	\N	\N
5ace357b-3676-4067-9205-c1163b4f533f	Diany Pedroza	Pedroza	\N	3012553776	\N	2025-11-17 05:04:10.941174+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
43c43c38-d76b-4c3d-8544-dad3a9acd399	Marve Suarez	Suarez	\N	3012733432	\N	2025-11-17 05:04:10.963499+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
50add744-6c7c-4c63-9231-564989e4d688	Juan David	David	\N	3013007903	\N	2025-11-17 05:04:10.983006+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
3925a1ed-c84d-497b-89c8-b7242392a689	James Aristizabal	Aristizabal	\N	3013233801	\N	2025-11-17 05:04:10.999773+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
00517b34-e4a4-4186-bf93-97957295ba12	Keyla Vargas	Vargas	\N	3013632014	\N	2025-11-17 05:04:11.013762+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
980c98b0-3787-48c9-a132-e874ce3850f5	Juan Capacho	Capacho	\N	3013781524	\N	2025-11-17 05:04:11.029908+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
13e463b2-3ef8-4f2e-a5c8-00bb4584e258	Thony Camilo	Xx	\N	3014012646	\N	2025-11-17 05:04:11.045214+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
4d326a5f-c9f1-4aab-8d07-3c88332d47f6	Crisitian Quintero	Quintero	\N	3014374632	\N	2025-11-17 05:04:11.060828+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
706e399b-2506-4262-84ff-653e398ea7b4	Felipe Escalante	Escalante	\N	3014574578	\N	2025-11-17 05:04:11.07668+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
be2cabf5-68bf-41b6-909b-76ded39540ca	Sonia Vega	Vega	\N	3014755471	\N	2025-11-17 05:04:11.092647+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
1ed8378f-07f8-48cd-96a0-fa30356c7e85	James James	James	\N	3015191274	\N	2025-11-17 05:04:11.108485+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
0f05280c-5e54-4789-ab71-067e1cc58cd9	Vladimir Montoya	Montoya	\N	3015537715	\N	2025-11-17 05:04:11.126934+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
3476c26f-33fb-441f-b53a-9719016dd2f1	Daniel Julian	Xx	\N	3006720644	\N	2025-11-17 05:04:10.751465+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
8d9e7f51-c1bc-43ba-9052-1d0602f32f20	Lorena Cardenas	Cardenas	\N	3007120477	\N	2025-11-17 05:04:10.782592+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
953ebc2c-d14c-40a9-b8b7-9a426c915851	Diana Diana	Diana	\N	3007412898	\N	2025-11-17 05:04:10.80415+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
e611f4d1-2a48-4a80-ad78-a3827a0f5836	Silvana Escalante	Escalante	\N	3007597656	\N	2025-11-17 05:04:10.823001+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
e0847d03-14a3-47d7-a060-ce72bea1d563	Christian Camacho	Camacho	\N	3008346835	\N	2025-11-17 05:04:10.865266+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
69789cb3-4aa4-4e63-a09d-1cb0a01a4d1e	Ana Acevedo	Acevedo	\N	3008563909	\N	2025-11-17 05:04:10.883775+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
29cda1d6-e461-4fb8-80d5-82d8b528b81d	Claudia Pabon	Pabon	\N	3008957677	\N	2025-11-17 05:04:10.902034+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
9ac79749-5266-4df4-8c48-f8b5b6b828de	Britany Valentina	Valentina	\N	3012305183	\N	2025-11-17 05:04:10.92452+00	efa58738-7046-46f3-a10d-fd81caf22af9	8	\N	t	\N	\N
9fd4b0e2-7cc6-4ef0-9e7a-89721f6ea327	Fernando Mogollon	Mogollon	\N	3012610238	\N	2025-11-17 05:04:10.946205+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
2e8589a0-5c98-451e-8e13-12313eecd1d8	Alvaro Gil	Gil	\N	3012877350	\N	2025-11-17 05:04:10.967303+00	efa58738-7046-46f3-a10d-fd81caf22af9	140	\N	t	\N	\N
9919cc38-ca0a-4500-b93d-aed13f76678c	Lina F	Lina F	\N	3013083721	\N	2025-11-17 05:04:10.987186+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
9c52a463-ba59-49e2-ba69-3be0529404f7	Omaira Leonor	Ortega	\N	3013381785	\N	2025-11-17 05:04:11.004307+00	efa58738-7046-46f3-a10d-fd81caf22af9	9	\N	t	\N	\N
71844336-a1b9-49e8-a487-8ab6039026da	Monica Beltran	Beltran	\N	3013638353	\N	2025-11-17 05:04:11.017017+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
ed875fe5-ca16-4c32-82cc-d57a7214c620	Nataly Nataly	Nataly	\N	3013788521	\N	2025-11-17 05:04:11.032687+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
640d225f-d802-4273-a9ba-c3811da0cd25	Paula Vargas	Vargas	\N	3014199157	\N	2025-11-17 05:04:11.048197+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
9436918f-927f-4dc0-9c73-c7e9f19c5919	Marce Upa	Marce Upa	\N	3014465077	\N	2025-11-17 05:04:11.063839+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
0e39899d-216c-48d9-bc57-25f95c738fb9	Elizabeth Redondo	Redondo	\N	3014581690	\N	2025-11-17 05:04:11.079827+00	efa58738-7046-46f3-a10d-fd81caf22af9	9	\N	t	\N	\N
2d068a41-fe5d-43f0-886a-9e5d06aed69b	Jairo Movil	Movil	\N	3014773734	\N	2025-11-17 05:04:11.095782+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
8c6b9c74-3254-480e-b60c-07ef56cfac39	Natalie Sanchez	Sanchez	\N	3015200535	\N	2025-11-17 05:04:11.113228+00	efa58738-7046-46f3-a10d-fd81caf22af9	3	\N	t	\N	\N
c235b93d-42db-4418-8101-7864a662d21f	Fabian Betancour	Betancour	\N	3015573231	\N	2025-11-17 05:05:36.546358+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
c1511363-d5c2-4a4f-bfdb-6bb1ea186fc4	Gloria Navarro	Navarro	\N	3015730375	\N	2025-11-17 05:05:36.61601+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
b68910fb-039a-4c4b-b51e-59d7a4a114f8	John Bermudez	Bermudez	\N	3015916069	\N	2025-11-17 05:05:36.637478+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
e96cf7e5-87db-44fc-a478-c79eb9d3de0a	Milena Arquitectura	Arquitectura	\N	3016426061	\N	2025-11-17 05:05:36.655277+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
bd4f049a-8bd8-49c6-a903-79d666da5e1a	David Mecanico	Mecanico	\N	3016588523	\N	2025-11-17 05:05:36.671707+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
64ee1843-8215-48e4-b1ab-584b139852da	Carolina Alfonso	Alfonso	\N	3017054114	\N	2025-11-17 05:05:36.689736+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
e8202a03-6031-44fa-85ef-5d885080eb15	Almaderas Almaderas	Almaderas	\N	3017470249	\N	2025-11-17 05:05:36.708455+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
5e584f3a-77ca-4bae-8253-55438ba1fd83	Helver Valderama	Xx	\N	3017773367	\N	2025-11-17 05:05:36.726263+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
eab0286a-3c8c-4a1f-984a-1fbbe9f95a3d	Andres Leon	Leon	\N	3017841791	\N	2025-11-17 05:05:36.743502+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
fd5aac0c-0b35-4f38-8b36-56d2b33f8a74	Padre Bermudez	Bermudez	\N	3022253019	\N	2025-11-17 05:05:36.760883+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
7b4e42fa-1095-4d4d-a1ef-508d112edd8c	Esensi Envases	Envases	\N	3022830035	\N	2025-11-17 05:05:36.779737+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
21d1a7a8-0edc-4052-a859-0f90826ff188	Cartera Plaza	Plaza	\N	3023170879	\N	2025-11-17 05:05:36.799059+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
420dc9b9-e590-4389-b2b2-ae2406ee8ece	Daniel Gamboa	Gamboa	\N	3023499317	\N	2025-11-17 05:05:36.818142+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
2489b152-8b48-45c9-bc2b-2dccc7629b28	Adriana Gil	Gil	\N	3023750093	\N	2025-11-17 05:05:36.836943+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
e24f872a-2eb2-439f-9626-99d3664018cb	Nelly Contreras	Contreras	\N	3023895298	\N	2025-11-17 05:05:36.857556+00	eac9a815-876e-4e85-be44-8646f8d75eec	9	\N	t	\N	\N
c3e01ac3-11ca-42c6-a004-1e43ef033d55	Inbabe Sas	Inbabe Sas	\N	3024613544	\N	2025-11-17 05:05:36.878253+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
afb72e5d-661d-422d-8e1a-69c5c862905d	Nora Vecina	Vecina Maribel	\N	3025905852	\N	2025-11-17 05:05:36.898997+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
bce5adcd-8c0e-42c0-a28e-dc1afafcb942	Maria Bayona	Bayona	\N	3028493375	\N	2025-11-17 05:05:36.919366+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
60f638fc-af7b-40f1-824a-4b36d0964ec6	Eduardo Aparicio	Aparicio	\N	3042061338	\N	2025-11-17 05:05:36.942943+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
65d5d242-24a6-4761-bc56-ff98129bfd65	Christian Castro	Castro	\N	3042285834	\N	2025-11-17 05:05:36.963791+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
50260c62-6f42-4c1f-8849-a880173f20be	Tienda Grafica	Grafica	\N	3015585180	\N	2025-11-17 05:05:36.57779+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
88904956-6e51-405b-918f-6297e6d1adc2	Sandra Cardenas	Cardenas	\N	3015788060	\N	2025-11-17 05:05:36.621468+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
19f63706-9b22-402a-8275-132abc96f81f	Blademir Mercado	Mercado	\N	3015958113	\N	2025-11-17 05:05:36.641661+00	eac9a815-876e-4e85-be44-8646f8d75eec	7	\N	t	\N	\N
01d2f232-7748-4751-a9cd-3662bf219341	Valentina Sanguino	Sanguino	\N	3016433253	\N	2025-11-17 05:05:36.658216+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
becce85c-f14d-4f65-8ed1-0a2a1f1940b7	Omaida Trigos	Xx	\N	3016709669	\N	2025-11-17 05:05:36.674966+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
0f3ff3d0-7af4-4845-93b5-02d29a312e34	Ivan Carrascal	Carrascal	\N	3017054520	\N	2025-11-17 05:05:36.693499+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
79136784-4829-4974-b0f6-e10e9368b138	Maxicambio Oficina	Oficina	\N	3017475035	\N	2025-11-17 05:05:36.711926+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
86d3363b-5c85-4d56-a5d8-bd8258b905b6	Diana Montes	Montes	\N	3017775275	\N	2025-11-17 05:05:36.72962+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
2f0465cc-2aad-4027-9752-3dd69fe7d2b9	Ivan Libertadores	Libertadores	\N	3017893708	\N	2025-11-17 05:05:36.747106+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
f6ea1ac4-db4f-46e3-9aa4-e528e640de9e	Julio Duran	Duran	\N	3022283512	\N	2025-11-17 05:05:36.764612+00	eac9a815-876e-4e85-be44-8646f8d75eec	8	\N	t	\N	\N
4bda8e6f-d163-4105-8575-906fbe136a0b	Dalia Marcela	Xx	\N	3022846695	\N	2025-11-17 05:05:36.783752+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
f118a054-3255-470c-876d-4a355afc0446	Juliana Alvarado	Alvarado	\N	3023411974	\N	2025-11-17 05:05:36.802552+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
9718db9d-290d-4281-ba35-dc7daef647ea	Contreras Contreras	Contreras	\N	3023551960	\N	2025-11-17 05:05:36.82155+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
eec73ed7-c136-4923-9e2e-5fcfbe67eb43	Camila Duran	Duran	\N	3023767740	\N	2025-11-17 05:05:36.841369+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
415c4ba7-0692-4a06-b7cc-39686d5d7708	Merchan Traumaticas	Traumaticas	\N	3024265015	\N	2025-11-17 05:05:36.861503+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
844f762a-e2ee-4f70-ba15-de4f82e2d850	Juan Picon	Picon	\N	3025199382	\N	2025-11-17 05:05:36.882468+00	eac9a815-876e-4e85-be44-8646f8d75eec	7	\N	t	\N	\N
b3ea1958-f464-428e-bb77-f5642ca6005b	Beiton Sepulveda	Sepulveda	\N	3025976832	\N	2025-11-17 05:05:36.903016+00	eac9a815-876e-4e85-be44-8646f8d75eec	8	\N	t	\N	\N
80cd1b5b-8dd3-4476-be53-60345a2af54f	Abelardo Abelardo	Abelardo	\N	3028637256	\N	2025-11-17 05:05:36.92365+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
63b51e45-24c4-480c-a109-926adbd7e903	Jairo Tocallo	Tocallo	\N	3042079043	\N	2025-11-17 05:05:36.947547+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
df529b3c-1a08-436b-8392-e719d474fde8	Alonzo Cardona	Cardona	\N	3042451618	\N	2025-11-17 05:05:36.967499+00	eac9a815-876e-4e85-be44-8646f8d75eec	9	\N	t	\N	\N
e3383779-4264-4e84-8488-0c8cb083bbda	Alejandra Veloza	Xx	\N	3015592351	\N	2025-11-17 05:05:36.590012+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
2217c11f-9677-4580-9dd3-309e7eb11f1f	Papeleria Laureles	Laureles	\N	3015810093	\N	2025-11-17 05:05:36.625086+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
45a78933-0486-41a3-a72e-e7dbd5cfef79	Martina Martina	Martina	\N	3016032312	\N	2025-11-17 05:05:36.645318+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
cf8a7c4e-330e-4411-a242-8777ab0d4b42	Mayra Alejandra	Paniagua	\N	3016436740	\N	2025-11-17 05:05:36.662054+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
a8478dac-404d-4c3a-951b-2cc38c724f9b	Xiomara Hernandez	Hernandez	\N	3016883399	\N	2025-11-17 05:05:36.678756+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
9617dbca-ec93-4c80-a682-f9c4ae3dad94	Julieth Rueda	Rueda	\N	3017200377	\N	2025-11-17 05:05:36.697498+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
57fa186a-e434-4aaa-9c25-39f2092296af	Jhon Nuñez	Nuñez	\N	3017556315	\N	2025-11-17 05:05:36.715714+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
cd0117e3-4665-41d6-818a-e12f25ed4c44	John Jairo	Cristancho Martinez	\N	3017798158	\N	2025-11-17 05:05:36.732957+00	eac9a815-876e-4e85-be44-8646f8d75eec	9	\N	t	\N	\N
37262a09-9267-4c05-b85d-3ff1bbc01b9e	Mayra Mejia	Mejia	\N	3017926693	\N	2025-11-17 05:05:36.750603+00	eac9a815-876e-4e85-be44-8646f8d75eec	8	\N	t	\N	\N
b209a8f4-da46-48fa-90fb-9101ee1020e4	Nelly Gomez	Gomez	\N	3022393622	\N	2025-11-17 05:05:36.768373+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
1dbf8c6b-62e8-4177-a055-8af8f9939824	Omar Andres	Labrador Pinto	\N	3022863831	\N	2025-11-17 05:05:36.787256+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
e28bb058-f533-4e4d-a4ab-74ee3b3888eb	Irelia Electro	Electro	\N	3023412989	\N	2025-11-17 05:05:36.806195+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
9c56f40f-17bc-419d-bd99-f1d05a80a467	Brosty Pollo	Pollo	\N	3023560539	\N	2025-11-17 05:05:36.824856+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
9f2b4269-a4d8-49b3-a4fb-69e49919ca3f	Viviam Viviam	Viviam	\N	3023768837	\N	2025-11-17 05:05:36.845367+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
57ea70f1-da28-488b-82ae-533d7a742e75	Pablo Andres	Xx	\N	3024435895	\N	2025-11-17 05:05:36.866298+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
73b1f6a0-de9c-40f5-bdf8-60c36d942c84	Yuli Ramirez	Xx	\N	3025250158	\N	2025-11-17 05:05:36.886553+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
c5d05931-fbc7-4893-be30-7f92699949b2	Ruby Prueba	Prueba	\N	3025983519	\N	2025-11-17 05:05:36.907187+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
b38e761c-c701-4143-9f75-e08c7b72b46c	Karina Llamadas	Llamadas	\N	3041027982	\N	2025-11-17 05:05:36.92801+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
0ccf060e-b809-4fb2-85e5-eeca6e9d10fb	Danna Danna	Danna	\N	3042083371	\N	2025-11-17 05:05:36.951303+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
41880363-acc0-4fae-bd25-38620bf5cd1d	Paola Andrea	Quesada	\N	3043015568	\N	2025-11-17 05:05:36.971763+00	eac9a815-876e-4e85-be44-8646f8d75eec	7	\N	t	\N	\N
faf81ac9-824b-478d-91dc-9e1d82590abe	Leydi Leydi	Leydi	\N	3015666050	\N	2025-11-17 05:05:36.599299+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
18ae6b4f-dcc9-4aa7-a8ee-97ddeee54b10	Leidy Vera	Vera	\N	3015871885	\N	2025-11-17 05:05:36.62876+00	eac9a815-876e-4e85-be44-8646f8d75eec	162	\N	t	\N	\N
17210f35-dcb6-47ac-af09-4987815efde8	Diego Jaimes	Jaimes	\N	3016097386	\N	2025-11-17 05:05:36.648616+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
a6a85ca9-a2e9-42b3-b87f-e0343f92c41c	Clara Sierra	Sierra	\N	3016462826	\N	2025-11-17 05:05:36.665162+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
78bee909-3949-4f48-a97b-010114064681	Jair Gomez	Gomez	\N	3016950438	\N	2025-11-17 05:05:36.682275+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
515ec418-e4a5-46ba-8dc2-7250a5faa405	Patricia Chacaltana	Chacaltana	\N	3017328604	\N	2025-11-17 05:05:36.701349+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
cafa4bd6-7a1f-44b6-9553-026f3f039992	Danny Torres	Torres	\N	3017601156	\N	2025-11-17 05:05:36.719355+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
1836849f-b593-4418-9f4c-004aa114bec5	Jessy Liliana	Xx	\N	3017799158	\N	2025-11-17 05:05:36.736596+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
bd2e36d2-a7f1-4dbd-8695-f91981f82f98	Martha Morelia	Morelia	\N	3017938588	\N	2025-11-17 05:05:36.754095+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
9103787e-1b64-466b-8054-efb425b174ee	Alexander Gonzalez	Gonzalez	\N	3022407966	\N	2025-11-17 05:05:36.772049+00	eac9a815-876e-4e85-be44-8646f8d75eec	7	\N	t	\N	\N
e0b06873-6c3d-4add-8bc3-a3cef3ce2af2	Vannesa Etiqueta	Etiqueta	\N	3022895031	\N	2025-11-17 05:05:36.790941+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
45adca73-9248-4449-9e48-f67a382c1470	Shirley Johana	Xx	\N	3023430801	\N	2025-11-17 05:05:36.80997+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
da4f0bd6-218a-4087-96d7-2b2e68167fb6	Torcoroma Monroy	Monroy	\N	3023616774	\N	2025-11-17 05:05:36.828781+00	eac9a815-876e-4e85-be44-8646f8d75eec	134	\N	t	\N	\N
da655ec1-8115-4781-9df4-2cb3e12c3166	Paola Bohorquez	Bohorquez	\N	3023834214	\N	2025-11-17 05:05:36.849328+00	eac9a815-876e-4e85-be44-8646f8d75eec	162	\N	t	\N	\N
b6fcb4b3-564b-4356-902a-8947149f979d	Papeleria Ciudad	Ciudad	\N	3024461568	\N	2025-11-17 05:05:36.87027+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
2cb6fe2f-127e-4979-a4c3-5506519cd416	Luz Bayona	Bayona	\N	3025587343	\N	2025-11-17 05:05:36.89066+00	eac9a815-876e-4e85-be44-8646f8d75eec	7	\N	t	\N	\N
cb1da17b-ae8f-4c4b-a196-7d84e496ba4d	Edgar Galvis	Galvis	\N	3027137617	\N	2025-11-17 05:05:36.911331+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
b8832767-898c-4e99-b913-1eba649fdf64	David Movil	Movil	\N	3041601042	\N	2025-11-17 05:05:36.934709+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
73e0cc04-c1f4-4d7e-9c59-c1f243b4dec6	Laura Ossa	Ossa	\N	3042099761	\N	2025-11-17 05:05:36.955637+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
e1c41738-632c-41da-a71e-928a66b72736	Maira Judith	Carrillo Lizcano	\N	3043176383	\N	2025-11-17 05:05:36.976488+00	eac9a815-876e-4e85-be44-8646f8d75eec	9	\N	t	\N	\N
04303c27-e0b5-41c0-9bac-5751335005f2	Karla Soto	Soto	\N	3015679686	\N	2025-11-17 05:05:36.607553+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
0868cdbc-fc2d-4b02-9a7f-bac057167930	Jose Jose	Jose	\N	3015907338	\N	2025-11-17 05:05:36.633717+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
a3544981-d519-41fb-a7fd-269d6776072a	Cristina Perez	Perez	\N	3016324106	\N	2025-11-17 05:05:36.651999+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
94d92e78-5329-4c10-a3fd-0e7578cedb61	Luis Florez	Florez	\N	3016484886	\N	2025-11-17 05:05:36.668471+00	eac9a815-876e-4e85-be44-8646f8d75eec	9	\N	t	\N	\N
18c88180-9e0a-487f-ad53-d0a5f197a8b8	Maria Camila	Camila	\N	3017025453	\N	2025-11-17 05:05:36.686043+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
58a0fb01-6c0a-48db-bba7-75c2c56f5cb2	Apartamento Antigua	Antigua	\N	3017391872	\N	2025-11-17 05:05:36.704989+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
c7a69aa7-ef8d-4024-b511-1131981b33b6	Julio Villamarin	Villamarin	\N	3017666358	\N	2025-11-17 05:05:36.722912+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
c3b00dc5-b8ee-4d4e-8dd3-26fffd27d15e	Jhan Navarro	Navarro	\N	3017823803	\N	2025-11-17 05:05:36.739912+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
34798367-46d2-4b17-a169-f55370122ec3	Diana Marcela	Xx	\N	3022234216	\N	2025-11-17 05:05:36.757383+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
05705296-be86-4ce5-9327-32808c61180c	Maria Teresa	Teresa	\N	3022671984	\N	2025-11-17 05:05:36.775805+00	eac9a815-876e-4e85-be44-8646f8d75eec	9	\N	t	\N	\N
3902e294-45c5-40d5-bd60-bebefaa2b1b1	Julieth Orozco	Orozco	\N	3022903838	\N	2025-11-17 05:05:36.795321+00	eac9a815-876e-4e85-be44-8646f8d75eec	7	\N	t	\N	\N
e9dfa06d-c81b-4706-924f-5f5dcd8d13ac	Juan Luis	Rinconada	\N	3023489225	\N	2025-11-17 05:05:36.814217+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
27aeb782-87e3-4b88-845f-fa797e5644d7	Elkin De	Xx	\N	3023736687	\N	2025-11-17 05:05:36.83275+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
0b390801-53c3-4141-aa44-509d79f21334	Alejandra Caballero	Caballero	\N	3023893501	\N	2025-11-17 05:05:36.853359+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
3a0604bc-d5bc-432f-b9be-543914fdc3c2	Ibeth Paola	Santiago	\N	3024557045	\N	2025-11-17 05:05:36.874421+00	eac9a815-876e-4e85-be44-8646f8d75eec	142	\N	t	\N	\N
0cab1132-4fdb-4d45-8f45-f7e6f5c3b668	Yenny Ortega	Xx	\N	3025603879	\N	2025-11-17 05:05:36.895074+00	eac9a815-876e-4e85-be44-8646f8d75eec	9	\N	t	\N	\N
262419d7-b5ba-4601-b4e4-062f28b53e35	Belcy Wilches	Wilches	\N	3028432179	\N	2025-11-17 05:05:36.915522+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
9e984de1-b5fb-4003-8c23-fc969446b9ab	Camilo Rodriguez	Rodriguez	\N	3042045589	\N	2025-11-17 05:05:36.938955+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
933f1d95-3220-45cd-8114-431450a4b6c2	Natalia Acosta	Acosta	\N	3042189967	\N	2025-11-17 05:05:36.959644+00	eac9a815-876e-4e85-be44-8646f8d75eec	7	\N	t	\N	\N
0016c90a-9ea1-4873-8811-8fa7edcf755b	Teresa Gomez	Gomez	\N	3043278808	\N	2025-11-17 05:05:36.981295+00	eac9a815-876e-4e85-be44-8646f8d75eec	3	\N	t	\N	\N
46a06c3a-2c0e-4d25-b3c0-0b19f8f5430b	Milena Calderon	Calderon	\N	3043329891	\N	2025-11-17 05:08:17.126775+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
c904ac84-799f-43d1-92a7-1d92d6afafaf	Hernan Giraldo	Giraldo	\N	3043763314	\N	2025-11-17 05:08:17.190657+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
6897b76a-c0f0-46c3-89e8-4288c9315066	Carmen Abrego	Abrego	\N	3043829417	\N	2025-11-17 05:08:17.212792+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
c4334ca0-a913-4591-93a4-07efdb16ea47	Danny Turnero	Turnero	\N	3044616190	\N	2025-11-17 05:08:17.232473+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
df2bccf2-1b00-4d09-85a3-a174bbaaa2ab	Wuilian Villareal	Villareal	\N	3045339075	\N	2025-11-17 05:08:17.25564+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	7	\N	t	\N	\N
46de6698-fc22-4046-9366-3af8a052c73c	Valery Valery	Valery	\N	3045693043	\N	2025-11-17 05:08:17.2748+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
8a4cfa4c-5ba8-4f49-bf02-a8399ac77d1b	Nelson Enrique	Enrique	\N	3045897913	\N	2025-11-17 05:08:17.295566+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
dcc20e19-7056-4b55-b7c7-b7707498457a	Eliu Sanchez	Sanchez	\N	3046257299	\N	2025-11-17 05:08:17.319335+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
8b228c0a-aa79-4597-aa1d-c4ea01ba62f9	Leonel Sanchez	Sanchez	\N	3046522917	\N	2025-11-17 05:08:17.34049+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
a15eaba8-7757-4a03-abad-9ad8631c0b8a	Lisbeth Yurani	Xx	\N	3046775544	\N	2025-11-17 05:08:17.361606+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
d52ee444-ed21-4685-9647-fec7a3b62112	Pilar Ortiz	Ortiz	\N	3052270016	\N	2025-11-17 05:08:17.388648+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
5d8c72f0-6515-43ab-8287-9dea204279c3	Sandra Ramirez	Ramirez	\N	3043363667	\N	2025-11-17 05:08:17.162933+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
bc9256cf-a5ae-4441-8c03-7cc52ec3f245	Diego Zuluaga	Zuluaga	\N	3043764031	\N	2025-11-17 05:08:17.195742+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	8	\N	t	\N	\N
465ea9da-c3b4-4d28-93c4-c82128ba2f7f	Deiby Rodrigue	Rodrigue	\N	3043868692	\N	2025-11-17 05:08:17.216573+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
61fd1856-fa8f-418c-9fa3-92b552493c29	Miguel Leonardo	Xx	\N	3044661014	\N	2025-11-17 05:08:17.239342+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	7	\N	t	\N	\N
1c2bb3d5-0a1b-4be1-8aaa-68dfce163642	Emeli Emeli	Emeli	\N	3045404400	\N	2025-11-17 05:08:17.259506+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
b173d065-435e-4d45-a696-975f9862d210	Vane Maria	Maria	\N	3045697486	\N	2025-11-17 05:08:17.278808+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
5f6fe1ce-7327-4f7b-b1c7-0f34d2bb29f1	Michell Barrientos	Barrientos	\N	3045903822	\N	2025-11-17 05:08:17.299414+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	8	\N	t	\N	\N
eeb1bcc1-f677-41db-968f-faab353eae03	Miguel Antonio	Bayona	\N	3046421751	\N	2025-11-17 05:08:17.323224+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	7	\N	t	\N	\N
94b505fc-5179-4bf2-be63-e1b072e77155	Cristina Ganoderma	Ganoderma	\N	3046582300	\N	2025-11-17 05:08:17.344489+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	9	\N	t	\N	\N
fc5d26fe-8a0c-4995-a85d-37437c28d23e	Valentina Yepes	Yepes	\N	3046791777	\N	2025-11-17 05:08:17.366376+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
2153fed3-e497-42ec-b6a4-9329c35ecb20	Jazmin Martinez	Xx	\N	3043384353	\N	2025-11-17 05:08:17.170139+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
336c3e19-d8bd-4a11-b9d7-afe2a8416d9f	Adriana Perez	Perez Tarazona	\N	3043768322	\N	2025-11-17 05:08:17.200073+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	7	\N	t	\N	\N
826d3432-0ce9-4506-a4f3-4cbc10715018	Arabe Libertsdores	Libertsdores	\N	3043922300	\N	2025-11-17 05:08:17.221466+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
91b0182d-20f7-4bf3-80d0-5da5c8248246	Angely Angely	Angely	\N	3044848486	\N	2025-11-17 05:08:17.24345+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
9438b634-2a47-47d7-a679-1fa99f25fb97	Juliana Campos	Campos	\N	3045420809	\N	2025-11-17 05:08:17.263155+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
4e9b6cd4-632b-420f-8897-797c61f07117	Andrea Torres	Torres	\N	3045718086	\N	2025-11-17 05:08:17.282766+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
8502a9ba-6ce1-4a8e-a651-9638aa23fb1f	Andrea Alvarez	Alvarez	\N	3045990732	\N	2025-11-17 05:08:17.305461+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	7	\N	t	\N	\N
53c56b1b-a191-4ebe-a9c3-30cb0fd59b52	Jesus Alberto	Xx	\N	3046478813	\N	2025-11-17 05:08:17.327065+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
99fc1008-9563-42df-babd-833b66498ce2	German Villa	German Villa	\N	3046597717	\N	2025-11-17 05:08:17.348556+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
1728c772-a5bf-4d45-8665-de0c0d5aa1af	Ginner Ginner	Ginner	\N	3046812314	\N	2025-11-17 05:08:17.372175+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
87485d06-8b6d-4168-9fc9-211bceef97af	Liliana Carchuelo	Xx	\N	3043501133	\N	2025-11-17 05:08:17.180044+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	9	\N	t	\N	\N
c9e5f6d8-6fdb-478b-93ed-00ffd214ddc6	Ingrid Paola	Ramirez	\N	3043770071	\N	2025-11-17 05:08:17.204251+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	9	\N	t	\N	\N
7c4a80ea-0a63-46fd-ac2b-b127f7aa868a	Fernando Ramirez	Ramirez	\N	3044508533	\N	2025-11-17 05:08:17.224936+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	140	\N	t	\N	\N
e6f9b229-3e54-41e1-a166-5288b7fc9175	Eliana Afanador	Afanador	\N	3044972729	\N	2025-11-17 05:08:17.24717+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
f5a4f769-bc19-45e9-ad77-b2ea67ab5e97	Andrey Fuentes	Fuentes	\N	3045455235	\N	2025-11-17 05:08:17.267074+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
a638e76f-ae76-4934-baee-cd0b52e6401e	Juan Pablo	Guerrero	\N	3045841553	\N	2025-11-17 05:08:17.28754+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
ed137ff0-c9d0-41f6-b996-a8716d20ae3d	Estadistica Estadistica	Estadistica	\N	3046049790	\N	2025-11-17 05:08:17.309658+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
e4564f73-17df-44e1-8b06-d188951cf02a	Marcela Ortiz	Xx	\N	3046491965	\N	2025-11-17 05:08:17.331582+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	7	\N	t	\N	\N
d109f144-e192-4e69-b57a-5aa1e577e33b	Diego Duran	Duran	\N	3046684677	\N	2025-11-17 05:08:17.353136+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
73217a14-8861-4c22-9810-de9a171f6735	Yonatan Monterrey	Monterrey	\N	3046830998	\N	2025-11-17 05:08:17.37665+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
265d8856-5de9-41a9-842a-36321a1a960e	Samuel Castellanos	Castellanos	\N	3043740307	\N	2025-11-17 05:08:17.186081+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
ea696d0a-a255-4daf-8729-32a36b164f98	Camila Barriga	Barriga	\N	3043817397	\N	2025-11-17 05:08:17.207856+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
acbe6dfa-b5d6-4cc5-a47d-9cd47c72a795	Caren Barrera	Barrera	\N	3044600655	\N	2025-11-17 05:08:17.228941+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
e30d687c-bb8c-454f-86b4-fd928d5b4030	Castipan Castipan	Castipan	\N	3045314495	\N	2025-11-17 05:08:17.251864+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
e9b21e89-9b0b-4058-b5bd-82c95ef5ab92	Viviam Morantes	Morantes	\N	3045573866	\N	2025-11-17 05:08:17.271185+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
9d3666dd-a22b-4fa9-9d94-2ddc994d118d	Pipe Lam	Lam	\N	3045897912	\N	2025-11-17 05:08:17.291224+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
8642762a-b93d-4024-82cd-9e3de6c3f00e	Dilia Panqueo	Xx	\N	3046119044	\N	2025-11-17 05:08:17.313866+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	9	\N	t	\N	\N
ae079064-2290-4d87-b6d8-bbe698a68482	Edith Edith	Edith	\N	3046503961	\N	2025-11-17 05:08:17.33681+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
9fe032c5-416a-4ba5-a6ea-22a1e7fb2e58	Carlos Pasteles	Pasteles	\N	3046694042	\N	2025-11-17 05:08:17.356968+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
829b15c1-629b-479f-a735-e8287961ab15	Maria Isabel	Nieto Meza	\N	3052133312	\N	2025-11-17 05:08:17.381561+00	73d29b31-2ddc-4cad-a2b4-cf58d597b56c	3	\N	t	\N	\N
01b1a275-96c2-43d1-803d-5a480bf05fe3	Gabriela 	Toro	\N	\N	\N	2025-11-16 19:30:29.502767+00	efa58738-7046-46f3-a10d-fd81caf22af9	\N	\N	t	\N	836352748
\.


--
-- Data for Name: municipalities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.municipalities (id, name, department) FROM stdin;
3	Cúcuta	Norte de Santander
6	Pamplona	Norte de Santander
7	Ocaña	Norte de Santander
8	Villa del Rosario	Norte de Santander
9	Los Patios	Norte de Santander
10	El Zulia	Norte de Santander
134	Ábrego	Norte de Santander
135	Arboledas	Norte de Santander
136	Bochalema	Norte de Santander
137	Bucarasica	Norte de Santander
138	Cachirá	Norte de Santander
139	Cácota	Norte de Santander
140	Chinácota	Norte de Santander
141	Chitagá	Norte de Santander
142	Convención	Norte de Santander
143	Cucutilla	Norte de Santander
144	Durania	Norte de Santander
145	El Carmen	Norte de Santander
146	El Tarra	Norte de Santander
147	Gramalote	Norte de Santander
148	Hacarí	Norte de Santander
149	Herrán	Norte de Santander
150	La Esperanza	Norte de Santander
151	La Playa de Belén	Norte de Santander
152	Labateca	Norte de Santander
153	Lourdes	Norte de Santander
154	Mutiscua	Norte de Santander
155	Pamplonita	Norte de Santander
156	Puerto Santander	Norte de Santander
157	Ragonvalia	Norte de Santander
158	Salazar de Las Palmas	Norte de Santander
159	San Calixto	Norte de Santander
160	San Cayetano	Norte de Santander
161	Santiago	Norte de Santander
162	Sardinata	Norte de Santander
163	Silos	Norte de Santander
164	Teorama	Norte de Santander
165	Tibú	Norte de Santander
166	Toledo	Norte de Santander
167	Villa Caro	Norte de Santander
\.


--
-- Data for Name: occupations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.occupations (id, name) FROM stdin;
1	Medicina, enfermería o afines
2	Psicología, terapeuta o afines
3	Ingeniería, tecnología o afines
4	Administrativo, contador o afines
5	Abogado o afines
6	Periodismo, comunicador social o afines
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, first_name, last_name, email, password_hash, phone, role, address, created_at, municipality_id, occupation_id, is_active, mdv, cedula) FROM stdin;
4cdf63f7-c4bc-4429-b21b-c25e4d7b6b62	Ricardo	Suarez	ricardo.suarez1983@gmail.com	$2b$12$65YSFUzYPJDtcHQIw1ov1utmwj7wQxB2rjL56p.LcIAJEiKCPyEbG	3208032130	superadmin	\N	2025-09-27 21:01:16.429171+00	3	\N	t	\N	TEMP0000000001
73d29b31-2ddc-4cad-a2b4-cf58d597b56c	Sutano	Perenceja	sutano@gmail.com	$2b$12$CoRbP3BfjmNkMygiLpso0uSnkI5vgz6wndogmdXt.tMFNZ5Py0yIe	3049878990	lider	tasajero	2025-10-01 15:14:29.59295+00	141	1	t	\N	TEMP0000000002
eac9a815-876e-4e85-be44-8646f8d75eec	beto	Asaber	suago.ia2025@gmail.com	$2b$12$5dO.ov2WPuf1f4f8tSiHFew3fpX5uJWocStqsC22NOIJVR9bkO1qW	3109876567	lider	niza	2025-10-03 20:39:06.85281+00	141	1	t	seminario	123456
db5f04d8-5fa9-4364-b0e2-6954a0535105	Jose	Gomez Y	suago.col@gmail.com	$2b$12$kK9QchBQwPIxCOor8lIBIuAVFxvens4gXgoIxfYZ0eL2KafyEu/lq	3019872345	lider	Niza	2025-09-29 03:43:18.589955+00	142	2	t	seminario menor 	88765456
efa58738-7046-46f3-a10d-fd81caf22af9	Jonnathan	Rodriguez	jonnathanrodri@outlook.com	$2b$12$Q1H.aVWNnh2t.BAdNhRQFe9peCe4eSW/Kd3qdTf74xcKoOOvc6voO	3138864623	admin	El Cuji casa J14	2025-11-15 19:50:11.124747+00	8	4	t	Salesiano	1090482985
\.


--
-- Name: municipalities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.municipalities_id_seq', 167, true);


--
-- Name: occupations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.occupations_id_seq', 7, true);


--
-- Name: contacts contacts_cedula_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_cedula_unique UNIQUE (cedula);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: municipalities municipalities_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.municipalities
    ADD CONSTRAINT municipalities_name_key UNIQUE (name);


--
-- Name: municipalities municipalities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.municipalities
    ADD CONSTRAINT municipalities_pkey PRIMARY KEY (id);


--
-- Name: occupations occupations_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occupations
    ADD CONSTRAINT occupations_name_key UNIQUE (name);


--
-- Name: occupations occupations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occupations
    ADD CONSTRAINT occupations_pkey PRIMARY KEY (id);


--
-- Name: users users_cedula_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_cedula_unique UNIQUE (cedula);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: contacts_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX contacts_user_id_idx ON public.contacts USING btree (user_id);


--
-- Name: idx_contacts_cedula; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contacts_cedula ON public.contacts USING btree (cedula);


--
-- Name: idx_contacts_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contacts_email ON public.contacts USING btree (email);


--
-- Name: idx_contacts_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contacts_name ON public.contacts USING btree (last_name, first_name);


--
-- Name: idx_contacts_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contacts_phone ON public.contacts USING btree (phone);


--
-- Name: idx_users_cedula; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_cedula ON public.users USING btree (cedula);


--
-- Name: idx_users_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_name ON public.users USING btree (last_name, first_name);


--
-- Name: idx_users_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_phone ON public.users USING btree (phone);


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: contacts contacts_municipality_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_municipality_id_fkey FOREIGN KEY (municipality_id) REFERENCES public.municipalities(id);


--
-- Name: contacts contacts_occupation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_occupation_id_fkey FOREIGN KEY (occupation_id) REFERENCES public.occupations(id);


--
-- Name: contacts contacts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_municipality_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_municipality_id_fkey FOREIGN KEY (municipality_id) REFERENCES public.municipalities(id);


--
-- Name: users users_occupation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_occupation_id_fkey FOREIGN KEY (occupation_id) REFERENCES public.occupations(id);


--
-- PostgreSQL database dump complete
--

\unrestrict hYMhf5g4VO666VQhAQmToJB1DIbgvlxXekzvu07CePBpEiUfnklE1cUFthfjb9E

