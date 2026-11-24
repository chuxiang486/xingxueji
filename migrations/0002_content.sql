CREATE TABLE IF NOT EXISTS content_changes (
  section TEXT NOT NULL, id TEXT NOT NULL, payload TEXT, revision INTEGER NOT NULL,
  PRIMARY KEY(section,id)
);
