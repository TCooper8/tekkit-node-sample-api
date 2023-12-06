create database accounts_db;
create user accounts with encrypted password 'accounts-password';
grant all privileges on database accounts_db to accounts;

\c accounts_db;
grant all on schema public to accounts;