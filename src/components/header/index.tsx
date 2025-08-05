import Link from 'next/link';
import {useSession, signIn, signOut} from 'next-auth/react';
import styles from './styles.module.css';

export function Header() {

  const {data: session, status} = useSession();
  return (
    <header className={styles.header}>
      <section className={styles.content}>
        <nav className={styles.nav}>
          <Link href="/">
            <h1 className={styles.logo}>
              Tarefas<span>+</span>
            </h1>
          </Link>
          {session && (
            <Link className={styles.loginButton} href="/dashboard">
              Minhas Tarefas
            </Link>
          )}
        </nav>
        {status === "loading" ? (
          <></>
        ) : session ? (
          <button className={styles.loginButton} onClick={() => signOut()}>
            Desconectar {session.user?.name}
          </button>
        ) : (
          <button className={styles.loginButton} onClick={() => signIn("google")}>
            Acessar
          </button>
        )}
      </section>
    </header>
  );
}