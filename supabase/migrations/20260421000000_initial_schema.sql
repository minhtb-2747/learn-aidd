-- =============================================================================
-- Initial schema — Sun* Annual Awards / Kudos
-- =============================================================================
-- Recovered from the previously-running local stack (project `ssa-2025-ex`),
-- whose source migrations were never committed to this repository. The full
-- reference dump is kept at
--   plans/260730-1458-google-oauth-and-supabase-data/research/live-schema-dump.sql
--
-- This file is a faithful transcription of that schema with three deliberate,
-- documented deviations (nothing else is invented):
--
--   1. `CREATE SCHEMA public` is omitted — Supabase provisions it already.
--   2. `public.handle_new_user()` and its `auth.users` trigger live in
--      20260421000002_auth_user_trigger.sql, because they reach into the
--      `auth` schema and deserve their own reviewable unit.
--   3. `public.update_kudo_like_count()` gains `SET search_path = public` and
--      schema-qualified table references. The recovered original was
--      SECURITY DEFINER with a mutable search_path and an unqualified
--      `UPDATE kudos`, which is a privilege-escalation vector (a caller
--      controlling search_path could shadow `kudos`). Behaviour is unchanged.
--
-- Ownership/ACL statements are omitted so the migration is portable across
-- local and hosted environments.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Functions
-- -----------------------------------------------------------------------------

-- Maintains `kudos.like_count` as hearts are added/removed. `heart_value` is
-- carried on each like row so campaign multipliers (e.g. x2 weeks) are honored
-- without re-reading the campaign at aggregation time.
--
-- IMPORTANT: this trigger is the sole writer of `kudos.like_count`. Application
-- code must never hand-update that column.
CREATE FUNCTION public.update_kudo_like_count() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path = public
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.kudos SET like_count = like_count + NEW.heart_value WHERE id = NEW.kudo_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.kudos SET like_count = like_count - OLD.heart_value WHERE id = OLD.kudo_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: award_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.award_categories (
    id bigint NOT NULL,
    name character varying NOT NULL,
    slug character varying NOT NULL,
    description text,
    quantity integer DEFAULT 1 NOT NULL,
    unit_type character varying DEFAULT 'individual'::character varying NOT NULL,
    prize_value numeric(12,0) DEFAULT 0 NOT NULL,
    image_url character varying,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT award_categories_unit_type_check CHECK (((unit_type)::text = ANY ((ARRAY['individual'::character varying, 'team'::character varying, 'unit'::character varying])::text[])))
);


--
-- Name: award_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.award_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: award_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.award_categories_id_seq OWNED BY public.award_categories.id;


--
-- Name: badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.badges (
    id bigint NOT NULL,
    name character varying NOT NULL,
    description text,
    image_url character varying,
    drop_rate numeric(5,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT badges_drop_rate_check CHECK (((drop_rate >= (0)::numeric) AND (drop_rate <= (100)::numeric)))
);


--
-- Name: badges_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.badges_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: badges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.badges_id_seq OWNED BY public.badges.id;


--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaigns (
    id bigint NOT NULL,
    name character varying NOT NULL,
    description text,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    heart_multiplier integer DEFAULT 2 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT chk_campaign_dates CHECK ((start_date < end_date))
);


--
-- Name: campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.campaigns_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.campaigns_id_seq OWNED BY public.campaigns.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id bigint NOT NULL,
    name character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.departments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: hashtags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hashtags (
    id bigint NOT NULL,
    name character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: hashtags_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hashtags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hashtags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hashtags_id_seq OWNED BY public.hashtags.id;


--
-- Name: kudo_hashtags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kudo_hashtags (
    id bigint NOT NULL,
    kudo_id bigint NOT NULL,
    hashtag_id bigint NOT NULL
);


--
-- Name: kudo_hashtags_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.kudo_hashtags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: kudo_hashtags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.kudo_hashtags_id_seq OWNED BY public.kudo_hashtags.id;


--
-- Name: kudo_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kudo_images (
    id bigint NOT NULL,
    kudo_id bigint NOT NULL,
    image_url character varying NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: kudo_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.kudo_images_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: kudo_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.kudo_images_id_seq OWNED BY public.kudo_images.id;


--
-- Name: kudo_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kudo_likes (
    id bigint NOT NULL,
    kudo_id bigint NOT NULL,
    user_id uuid NOT NULL,
    is_special_day boolean DEFAULT false NOT NULL,
    heart_value integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: kudo_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.kudo_likes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: kudo_likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.kudo_likes_id_seq OWNED BY public.kudo_likes.id;


--
-- Name: kudo_mentions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kudo_mentions (
    id bigint NOT NULL,
    kudo_id bigint NOT NULL,
    mentioned_user_id uuid NOT NULL
);


--
-- Name: kudo_mentions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.kudo_mentions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: kudo_mentions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.kudo_mentions_id_seq OWNED BY public.kudo_mentions.id;


--
-- Name: kudos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kudos (
    id bigint NOT NULL,
    sender_id uuid NOT NULL,
    receiver_id uuid NOT NULL,
    title character varying NOT NULL,
    content text NOT NULL,
    is_anonymous boolean DEFAULT false NOT NULL,
    anonymous_name character varying,
    status character varying DEFAULT 'published'::character varying NOT NULL,
    like_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT kudos_status_check CHECK (((status)::text = ANY ((ARRAY['published'::character varying, 'spam'::character varying, 'hidden'::character varying])::text[])))
);


--
-- Name: kudos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.kudos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: kudos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.kudos_id_seq OWNED BY public.kudos.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    type character varying NOT NULL,
    title character varying NOT NULL,
    content text,
    reference_type character varying,
    reference_id bigint,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT notifications_type_check CHECK (((type)::text = ANY ((ARRAY['kudo_received'::character varying, 'like_received'::character varying, 'box_received'::character varying, 'mention'::character varying, 'system'::character varying])::text[])))
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name character varying NOT NULL,
    avatar_url character varying,
    department_id bigint,
    role character varying DEFAULT 'user'::character varying NOT NULL,
    locale character varying DEFAULT 'vi'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT profiles_locale_check CHECK (((locale)::text = ANY ((ARRAY['vi'::character varying, 'en'::character varying])::text[]))),
    CONSTRAINT profiles_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[])))
);


--
-- Name: secret_boxes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.secret_boxes (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    badge_id bigint,
    is_opened boolean DEFAULT false NOT NULL,
    opened_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: secret_boxes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.secret_boxes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: secret_boxes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.secret_boxes_id_seq OWNED BY public.secret_boxes.id;


--
-- Name: award_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.award_categories ALTER COLUMN id SET DEFAULT nextval('public.award_categories_id_seq'::regclass);


--
-- Name: badges id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.badges ALTER COLUMN id SET DEFAULT nextval('public.badges_id_seq'::regclass);


--
-- Name: campaigns id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns ALTER COLUMN id SET DEFAULT nextval('public.campaigns_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: hashtags id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hashtags ALTER COLUMN id SET DEFAULT nextval('public.hashtags_id_seq'::regclass);


--
-- Name: kudo_hashtags id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudo_hashtags ALTER COLUMN id SET DEFAULT nextval('public.kudo_hashtags_id_seq'::regclass);


--
-- Name: kudo_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudo_images ALTER COLUMN id SET DEFAULT nextval('public.kudo_images_id_seq'::regclass);


--
-- Name: kudo_likes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudo_likes ALTER COLUMN id SET DEFAULT nextval('public.kudo_likes_id_seq'::regclass);


--
-- Name: kudo_mentions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudo_mentions ALTER COLUMN id SET DEFAULT nextval('public.kudo_mentions_id_seq'::regclass);


--
-- Name: kudos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudos ALTER COLUMN id SET DEFAULT nextval('public.kudos_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: secret_boxes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.secret_boxes ALTER COLUMN id SET DEFAULT nextval('public.secret_boxes_id_seq'::regclass);


--
-- Name: award_categories award_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.award_categories
    ADD CONSTRAINT award_categories_pkey PRIMARY KEY (id);


--
-- Name: award_categories award_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.award_categories
    ADD CONSTRAINT award_categories_slug_key UNIQUE (slug);


--
-- Name: badges badges_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_name_key UNIQUE (name);


--
-- Name: badges badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: hashtags hashtags_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hashtags
    ADD CONSTRAINT hashtags_name_key UNIQUE (name);


--
-- Name: hashtags hashtags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hashtags
    ADD CONSTRAINT hashtags_pkey PRIMARY KEY (id);


--
-- Name: kudo_hashtags kudo_hashtags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudo_hashtags
    ADD CONSTRAINT kudo_hashtags_pkey PRIMARY KEY (id);


--
-- Name: kudo_images kudo_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudo_images
    ADD CONSTRAINT kudo_images_pkey PRIMARY KEY (id);


--
-- Name: kudo_likes kudo_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudo_likes
    ADD CONSTRAINT kudo_likes_pkey PRIMARY KEY (id);


--
-- Name: kudo_mentions kudo_mentions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudo_mentions
    ADD CONSTRAINT kudo_mentions_pkey PRIMARY KEY (id);


--
-- Name: kudos kudos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudos
    ADD CONSTRAINT kudos_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: secret_boxes secret_boxes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.secret_boxes
    ADD CONSTRAINT secret_boxes_pkey PRIMARY KEY (id);


--
-- Name: kudo_hashtags uq_kudo_hashtag; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudo_hashtags
    ADD CONSTRAINT uq_kudo_hashtag UNIQUE (kudo_id, hashtag_id);


--
-- Name: kudo_likes uq_kudo_like; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudo_likes
    ADD CONSTRAINT uq_kudo_like UNIQUE (kudo_id, user_id);


--
-- Name: kudo_mentions uq_kudo_mention; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudo_mentions
    ADD CONSTRAINT uq_kudo_mention UNIQUE (kudo_id, mentioned_user_id);


--
-- Name: idx_award_categories_display_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_award_categories_display_order ON public.award_categories USING btree (display_order);


--
-- Name: idx_award_categories_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_award_categories_slug ON public.award_categories USING btree (slug);


--
-- Name: idx_campaigns_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_campaigns_active ON public.campaigns USING btree (is_active) WHERE (is_active = true);


--
-- Name: idx_campaigns_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_campaigns_dates ON public.campaigns USING btree (start_date, end_date);


--
-- Name: idx_hashtags_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hashtags_name ON public.hashtags USING btree (name);


--
-- Name: idx_kudo_hashtags_hashtag_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kudo_hashtags_hashtag_id ON public.kudo_hashtags USING btree (hashtag_id);


--
-- Name: idx_kudo_hashtags_kudo_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kudo_hashtags_kudo_id ON public.kudo_hashtags USING btree (kudo_id);


--
-- Name: idx_kudo_images_kudo_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kudo_images_kudo_id ON public.kudo_images USING btree (kudo_id);


--
-- Name: idx_kudo_likes_kudo_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kudo_likes_kudo_id ON public.kudo_likes USING btree (kudo_id);


--
-- Name: idx_kudo_likes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kudo_likes_user_id ON public.kudo_likes USING btree (user_id);


--
-- Name: idx_kudo_mentions_kudo_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kudo_mentions_kudo_id ON public.kudo_mentions USING btree (kudo_id);


--
-- Name: idx_kudo_mentions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kudo_mentions_user_id ON public.kudo_mentions USING btree (mentioned_user_id);


--
-- Name: idx_kudos_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kudos_created_at ON public.kudos USING btree (created_at DESC);


--
-- Name: idx_kudos_like_count; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kudos_like_count ON public.kudos USING btree (like_count DESC);


--
-- Name: idx_kudos_receiver_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kudos_receiver_id ON public.kudos USING btree (receiver_id);


--
-- Name: idx_kudos_sender_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kudos_sender_id ON public.kudos USING btree (sender_id);


--
-- Name: idx_kudos_status_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kudos_status_created ON public.kudos USING btree (status, created_at DESC);


--
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at DESC);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_notifications_user_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id, is_read) WHERE (is_read = false);


--
-- Name: idx_profiles_department_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_department_id ON public.profiles USING btree (department_id);


--
-- Name: idx_profiles_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_role ON public.profiles USING btree (role);


--
-- Name: idx_secret_boxes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_secret_boxes_user_id ON public.secret_boxes USING btree (user_id);


--
-- Name: idx_secret_boxes_user_opened; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_secret_boxes_user_opened ON public.secret_boxes USING btree (user_id, is_opened);


--
-- Name: kudo_likes trg_update_like_count; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_update_like_count AFTER INSERT OR DELETE ON public.kudo_likes FOR EACH ROW EXECUTE FUNCTION public.update_kudo_like_count();


--
-- Name: kudo_hashtags kudo_hashtags_hashtag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudo_hashtags
    ADD CONSTRAINT kudo_hashtags_hashtag_id_fkey FOREIGN KEY (hashtag_id) REFERENCES public.hashtags(id) ON DELETE CASCADE;


--
-- Name: kudo_hashtags kudo_hashtags_kudo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudo_hashtags
    ADD CONSTRAINT kudo_hashtags_kudo_id_fkey FOREIGN KEY (kudo_id) REFERENCES public.kudos(id) ON DELETE CASCADE;


--
-- Name: kudo_images kudo_images_kudo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudo_images
    ADD CONSTRAINT kudo_images_kudo_id_fkey FOREIGN KEY (kudo_id) REFERENCES public.kudos(id) ON DELETE CASCADE;


--
-- Name: kudo_likes kudo_likes_kudo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudo_likes
    ADD CONSTRAINT kudo_likes_kudo_id_fkey FOREIGN KEY (kudo_id) REFERENCES public.kudos(id) ON DELETE CASCADE;


--
-- Name: kudo_likes kudo_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudo_likes
    ADD CONSTRAINT kudo_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- Name: kudo_mentions kudo_mentions_kudo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudo_mentions
    ADD CONSTRAINT kudo_mentions_kudo_id_fkey FOREIGN KEY (kudo_id) REFERENCES public.kudos(id) ON DELETE CASCADE;


--
-- Name: kudo_mentions kudo_mentions_mentioned_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudo_mentions
    ADD CONSTRAINT kudo_mentions_mentioned_user_id_fkey FOREIGN KEY (mentioned_user_id) REFERENCES public.profiles(id);


--
-- Name: kudos kudos_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudos
    ADD CONSTRAINT kudos_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.profiles(id);


--
-- Name: kudos kudos_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kudos
    ADD CONSTRAINT kudos_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- Name: profiles profiles_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: secret_boxes secret_boxes_badge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.secret_boxes
    ADD CONSTRAINT secret_boxes_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.badges(id);


--
-- Name: secret_boxes secret_boxes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.secret_boxes
    ADD CONSTRAINT secret_boxes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- Name: award_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.award_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: award_categories award_categories_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY award_categories_select ON public.award_categories FOR SELECT USING (true);


--
-- Name: badges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

--
-- Name: badges badges_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY badges_select ON public.badges FOR SELECT USING (true);


--
-- Name: campaigns; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

--
-- Name: campaigns campaigns_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY campaigns_select ON public.campaigns FOR SELECT USING (true);


--
-- Name: departments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

--
-- Name: departments departments_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY departments_select ON public.departments FOR SELECT USING (true);


--
-- Name: hashtags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;

--
-- Name: hashtags hashtags_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY hashtags_insert ON public.hashtags FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: hashtags hashtags_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY hashtags_select ON public.hashtags FOR SELECT USING (true);


--
-- Name: kudo_hashtags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.kudo_hashtags ENABLE ROW LEVEL SECURITY;

--
-- Name: kudo_hashtags kudo_hashtags_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY kudo_hashtags_insert ON public.kudo_hashtags FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: kudo_hashtags kudo_hashtags_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY kudo_hashtags_select ON public.kudo_hashtags FOR SELECT USING (true);


--
-- Name: kudo_images; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.kudo_images ENABLE ROW LEVEL SECURITY;

--
-- Name: kudo_images kudo_images_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY kudo_images_insert ON public.kudo_images FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: kudo_images kudo_images_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY kudo_images_select ON public.kudo_images FOR SELECT USING (true);


--
-- Name: kudo_likes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.kudo_likes ENABLE ROW LEVEL SECURITY;

--
-- Name: kudo_likes kudo_likes_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY kudo_likes_delete ON public.kudo_likes FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: kudo_likes kudo_likes_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY kudo_likes_insert ON public.kudo_likes FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: kudo_likes kudo_likes_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY kudo_likes_select ON public.kudo_likes FOR SELECT USING (true);


--
-- Name: kudo_mentions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.kudo_mentions ENABLE ROW LEVEL SECURITY;

--
-- Name: kudo_mentions kudo_mentions_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY kudo_mentions_insert ON public.kudo_mentions FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: kudo_mentions kudo_mentions_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY kudo_mentions_select ON public.kudo_mentions FOR SELECT USING (true);


--
-- Name: kudos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.kudos ENABLE ROW LEVEL SECURITY;

--
-- Name: kudos kudos_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY kudos_insert ON public.kudos FOR INSERT WITH CHECK ((sender_id = auth.uid()));


--
-- Name: kudos kudos_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY kudos_select ON public.kudos FOR SELECT USING ((((status)::text = 'published'::text) OR (sender_id = auth.uid())));


--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications notifications_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notifications_select ON public.notifications FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: notifications notifications_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notifications_update ON public.notifications FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles profiles_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_select ON public.profiles FOR SELECT USING (true);


--
-- Name: profiles profiles_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_update ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: secret_boxes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.secret_boxes ENABLE ROW LEVEL SECURITY;

--
-- Name: secret_boxes secret_boxes_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY secret_boxes_select ON public.secret_boxes FOR SELECT USING ((user_id = auth.uid()));


--
-- PostgreSQL database dump complete
--

