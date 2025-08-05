import { Textarea } from '@/components/textarea';
import styles from './styles.module.css';
import { GetServerSideProps } from 'next';
import {getSession, useSession} from 'next-auth/react';
import Head from 'next/head';

export default function Dashboard() {
  const {data: session, status} = useSession();

  return (
    <>
      <Head>
        <title>Tarefas de {session?.user?.name}</title>
      </Head>
      <main className={styles.dashboard}>
        <section className={styles.content}>
          <div className={styles.contentForm}>
            <h1>Qual sua tarefa?</h1>
            <form action="#">
              <Textarea
                placeholder='Digite aqui sua tarefa...'
                required
                autoFocus
              ></Textarea>
              <div className={styles.checkboxArea}>
                <input type="checkbox" id="important" />
                <label htmlFor="important">Marcar como pública</label>
              </div>
              <button type='submit' className={styles.button}>
                Registrar
              </button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({req}) => {
  const session = await getSession({req});
  if (!session?.user) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  return {
    props:{}
  }
}